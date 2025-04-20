import { copyFileSync, existsSync, mkdirSync } from "fs"
import { regexGrabStr } from "./parse_utils"
import { FileDataOptions, getMulFilesData, autojoinFilePath } from "./utils"
import { join } from "path"
import { Species, Species_RandomizeBanned } from "./gen/SpeciesList_pb.js"
import { SpeciesEnum } from "./gen/SpeciesEnum_pb.js"
import { readSpecies } from "./proto_utils.js"
import { toSpeciesMap } from "./species/species.js"

export interface Result {
    fileIterator: number,
    spritesPath: Map<string, string>
}



interface Context {
    sprites: Map<string, string>, // species -> ptr
    spritesPtr: Map<string, string> // ptr -> path
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context {
    return {
        sprites: new Map(),
        spritesPtr: new Map(),
        execFlag: "ptr",
        stopRead: false,
    }
}

const executionMap: { [key: string]: (line: string, context: Context) => void } = {
    "ptr": (line, context) => {
        if (line.match('u32 gMonFrontPic')) {
            const ptr = regexGrabStr(line, /\w+(?=\[)/)
            const path = regexGrabStr(line, /(?<=")[^"]+/).replace(/[^/]+lz/, 'front.png')
            context.spritesPtr.set(ptr, path)
        } else if (line.match('gMonFrontPicTable')) {
            context.execFlag = "species"
        }
    },
    "species": (line, context) => {
        if (line.match(/SPECIES_/)) {
            const specie = "SPECIES_" + regexGrabStr(line, /(?<=\()\w+/)
            const ptr = regexGrabStr(line, /gMonFrontPic\w+/)
            if (!context.spritesPtr.has(ptr)) return
            const path = context.spritesPtr.get(ptr)
            context.sprites.set(specie, path)
        } else if (line.match('};')) {
            context.stopRead = true
        }
    },
}

export function parse(lines: string[], fileIterator: number): Result {
    const lineLen = lines.length
    const context = initContext()
    for (; fileIterator < lineLen; fileIterator++) {
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
    }
    return {
        fileIterator: fileIterator,
        spritesPath: context.sprites
    }
}

interface Graphics {
    "front": string
    "pal": string
    "shiny": string
}

function getSprite(species: Species, speciesMap: Map<SpeciesEnum, Species>): Graphics {
    if (species.visualsOr.case === "reuseVisuals") {
        return getSprite(speciesMap.get(species.visualsOr.value)!!, speciesMap)
    }

    if (!species.visualsOr.value) return { "front": "", "pal": "", "shiny": "" }
    if (species.visualsOr.value.front) return {
        "front": "graphics/pokemon/" + species.visualsOr.value.front.path.replace("anim_front", "front") + ".png",
        "pal": "graphics/pokemon/" + species.visualsOr.value.palette + ".pal",
        "shiny": "graphics/pokemon/" + species.visualsOr.value.shiny + ".pal",
    }
}

function copyFile(from: string, to: string) {
    try {
        if (existsSync(from)) {
            copyFileSync(from, to)
        } else {
            throw `${from} or ${to} does not exist`
        }
    } catch (e) {
        console.warn(`Tried to copy ${from} to ${to} error: ${e}`)
    }
}

export function getSprites(ROOT_PRJ: string, output_dir: string, output_dir_palette: string) {
    const speciesList = readSpecies()
    const speciesMap = toSpeciesMap(speciesList)
    for (const species of speciesList.species) {
        if (!species.id || species.id === SpeciesEnum.SPECIES_EGG || species.randomizerBanned === Species_RandomizeBanned.SPECIES_HIDDEN) continue

        const gfx = getSprite(species, speciesMap)

        const outFileRoot = SpeciesEnum[species.id].replace(/^SPECIES_/, '')

        const outFilePath = join(output_dir, outFileRoot + ".png")
        copyFile(join(ROOT_PRJ, gfx.front), outFilePath)

        const outPalPath = join(output_dir_palette, outFileRoot + ".pal")
        const outShinyPalPath = join(output_dir_palette, outFileRoot + "_shiny.pal")
        copyFile(join(ROOT_PRJ, gfx.pal), outPalPath)
        copyFile(join(ROOT_PRJ, gfx.shiny), outShinyPalPath)
    }
}

export function getLegacySprites(ROOT_PRJ: string, optionsGlobal_h: FileDataOptions, output_dir: string, output_dir_palette: string) {
    return new Promise((resolve: (undefined: undefined) => void, reject) => {
        if (!existsSync(output_dir)) {
            try {
                mkdirSync(output_dir)
            } catch {
                reject(`Failed to create output directory for sprites : ${output_dir}`)
            }
        }
        getMulFilesData(autojoinFilePath(ROOT_PRJ, ['src/data/graphics/pokemon.h',
            'src/data/pokemon_graphics/front_pic_table.h',
        ]), optionsGlobal_h)
            .then((spriteData) => {
                const lines = spriteData.split('\n')
                const spriteResult = parse(lines, 0)

                spriteResult.spritesPath.forEach((val, key) => {
                    const inFilePath = join(ROOT_PRJ, val)
                    const inFileSubstitutePath = inFilePath.replace('front.png', 'anim_front.png')
                    const outFileName = key.replace(/^SPECIES_/, '') + ".png"
                    let outFilePath = join(output_dir, outFileName)
                    try {
                        if (existsSync(inFilePath)) {
                            copyFileSync(inFilePath, outFilePath)
                        } else if (existsSync(inFileSubstitutePath)) {
                            copyFileSync(inFileSubstitutePath, outFilePath)
                        } else {
                            throw `${inFilePath} or ${outFilePath} does not exist`
                        }
                    } catch (e) {
                        console.warn(`Tried to copy ${inFilePath} to ${outFilePath} error: ${e}`)
                    }
                    // copy the normal palette to get the right indices
                    const paletteFile = inFilePath.replace("front.png", "normal.pal")
                    const outPaletteFile = outFileName.replace('png', 'pal')
                    try {
                        if (existsSync(paletteFile)) {
                            copyFileSync(paletteFile, join(output_dir_palette, outPaletteFile))
                        } else {
                            let end: string | RegExpMatchArray = paletteFile.match(/(?<=pokemon\/).*/)
                            if (!end) {
                                throw `${paletteFile} does not exist`
                            } else {
                                // ugly fix because i was tired
                                end = end[0]
                                let pareng = end.replace(/\/[^/]+/, '')
                                let replacedWithPareng = paletteFile.replace(end, pareng)
                                if (existsSync(replacedWithPareng)) {
                                    copyFileSync(replacedWithPareng, join(output_dir_palette, outPaletteFile))
                                } else {
                                    throw `${replacedWithPareng} does not exist`
                                }
                            }
                        }
                    } catch (e) {
                        console.warn(`Tried to copy ${paletteFile} to ${outPaletteFile} error: ${e}`)
                    }
                    // copy the shiny palette too
                    const paletteFileShiny = inFilePath.replace("front.png", "shiny.pal")
                    const outPaletteFileShiny = 'shiny_' + outFileName.replace('png', 'pal')
                    try {
                        if (existsSync(paletteFileShiny)) {
                            copyFileSync(paletteFileShiny, join(output_dir_palette, outPaletteFileShiny))
                        } else {
                            let end: string | RegExpMatchArray = paletteFileShiny.match(/(?<=pokemon\/).*/)
                            if (!end) {
                                throw `${paletteFileShiny} does not exist`
                            } else {
                                end = end[0]
                                let pareng = end.replace(/\/[^/]+/, '')
                                let replacedWithPareng = paletteFileShiny.replace(end, pareng)
                                if (existsSync(replacedWithPareng)) {
                                    copyFileSync(replacedWithPareng, join(output_dir_palette, outPaletteFileShiny))
                                } else {
                                    throw `${replacedWithPareng} does not exist`
                                }
                            }
                        }
                    } catch (e) {
                        console.warn(`Tried to copy ${paletteFileShiny} to ${paletteFileShiny} error: ${e}`)
                    }
                })
                resolve(null)
            })
            .catch((reason) => {
                const err = 'Failed at gettings species reason: ' + reason
                reject(err)
            })
    })
}