import { regexGrabNum, regexGrabStr, upperCaseFirst } from "./parse_utils"

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
