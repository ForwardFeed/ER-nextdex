import { copyFileSync, existsSync, mkdirSync } from "fs"
import { regexGrabNum, regexGrabStr } from "./parse_utils"
import { FileDataOptions, getMulFilesData, autojoinFilePath } from "./utils"
import { join } from "path"

export interface Result{
    fileIterator: number,
    spritesPath: Map<string, string>
}



interface Context {
    sprites: Map<string, string>, // species -> ptr
    spritesPtr: Map<string, string> // ptr -> path
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        sprites: new Map(),
        spritesPtr: new Map(),
        execFlag: "ptr",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "ptr": (line, context) =>{
        if (line.match('u32 gMonFrontPic')){
            const ptr = regexGrabStr(line, /\w+(?=\[)/)
            const path = regexGrabStr(line, /(?<=")[^"]+/).replace(/[^/]+lz/, 'front.png')
            context.spritesPtr.set(ptr, path)
        } else if (line.match('gMonFrontPicTable')){
            context.execFlag = "species"
        }
    },
    "species": (line, context) => {
        if (line.match(/SPECIES_/)){
            const specie = "SPECIES_" + regexGrabStr(line, /(?<=\()\w+/)
            const ptr = regexGrabStr(line, /gMonFrontPic\w+/)
            if (!context.spritesPtr.has(ptr)) return
            const path = context.spritesPtr.get(ptr)
            context.sprites.set(specie, path)
        } else if (line.match('};')){
            context.stopRead = true
        }
    },
}

export function parse(lines: string[], fileIterator: number): Result{
    const lineLen = lines.length
    const context = initContext()
    for (;fileIterator<lineLen; fileIterator++){
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
    }
    return {
        fileIterator: fileIterator,
        spritesPath: context.sprites 
    }
}

export function getSprites(ROOT_PRJ: string, optionsGlobal_h: FileDataOptions, output_dir: string, output_dir_palette: string){
    return new Promise((resolve: (undefined: undefined)=>void, reject)=>{
        if (!existsSync(output_dir)) {
            try {
                mkdirSync(output_dir)
            } catch{
                reject(`Failed to create output directory for sprites : ${output_dir}`)
            }
        }
        getMulFilesData(autojoinFilePath(ROOT_PRJ, ['src/data/graphics/pokemon.h',
                                                'src/data/pokemon_graphics/front_pic_table.h',
                                            ]), optionsGlobal_h)
        .then((spriteData)=>{
            const lines = spriteData.split('\n')
            const spriteResult = parse(lines, 0)
            
            spriteResult.spritesPath.forEach((val, key)=>{
                const inFilePath = join(ROOT_PRJ, val)
                const outFileName = key.replace(/^SPECIES_/, '') + ".png"
                const outFilePath = join(output_dir, outFileName)
                try{
                    if (existsSync(inFilePath)){
                        copyFileSync(inFilePath, outFilePath)
                    } else {
                        throw `${inFilePath} does not exist`
                    }
                    // copy the normal palette to get the right indices
                    const paletteFile = inFilePath.replace("front.png", "normal.pal")
                    const outPaletteFile = outFileName.replace('png', 'pal')
                    if (existsSync(paletteFile)){
                        copyFileSync(paletteFile, join(output_dir_palette, outPaletteFile))
                    } else {
                        throw `${inFilePath} does not exist`
                    }
                    // copy the shiny palette too
                    const paletteFileShiny = inFilePath.replace("front.png", "shiny.pal")
                    const outPaletteFileShiny = 'shiny_' + outFileName.replace('png', 'pal')
                    if (existsSync(paletteFileShiny)){
                        copyFileSync(paletteFileShiny, join(output_dir_palette, outPaletteFileShiny))
                    } else {
                        throw `${inFilePath} does not exist`
                    }
                    
                } catch(e){
                    console.warn(`Tried to copy ${inFilePath} to ${outFilePath} error: ${e}`)
                }
                
            })
            resolve(null)
        })
        .catch((reason)=>{
            const err = 'Failed at gettings species reason: ' + reason
            reject(err)
        })
    })
}