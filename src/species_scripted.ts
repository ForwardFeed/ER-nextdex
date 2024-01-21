import { readdirSync, access, readFile} from 'fs'
import { join, resolve } from 'path'

import { Xtox, regexGrabStr } from './parse_utils'
import { rejects } from 'assert'
import { GameData } from './main'
/**
 * collection of pokemon found in other locations due to scripting
 * in /data/maps/[MAPNAME]/script.pory
 */
function fetchAllMapFile(rootFolder: string): string[]{
    const folderPath = join(rootFolder, '/data/maps/')
    return readdirSync(folderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

function readAllFiles(rootFolder: string, subPaths: string[]): Promise<PromiseSettledResult<SpeciesScripted[]>[]>{
    return Promise.allSettled(
    subPaths.map((subpath)=>{
        const path = join(rootFolder, '/data/maps/', subpath, 'scripts.pory')
        return readPoryFile(path, subpath)
    }))
}

function readPoryFile(filepath: string, subpath: string): Promise<SpeciesScripted[]>{
    return new Promise((resolved: (data: SpeciesScripted[]) => void, rejected)=>{
        access(filepath, (err_exist: NodeJS.ErrnoException)=>{
            if (err_exist){
                const err = `file: ${filepath} has not been found`
                rejected(err)
            } else{
                readFile(filepath, 'utf8', (err_exist: NodeJS.ErrnoException, data: string) => {
                    if (err_exist){
                        const err = `couldn't read pory file: ${filepath}, reason: ${err_exist}`
                        return rejected(err)
                    }
                    resolved(fetchSpeciesAvailable(data, subpath))
                })
            }    
        });
    })
}

export interface SpeciesScripted{
    map: string,
    specie: string,
    how: string
}

const reasonMap: [string, string][] = [
    ["givecustommon", "given with custom moves"], // SPECIES_HELIOLISK, 25, ITEM_CHOICE_SPECS, ITEM_PREMIER_BALL, NATURE_TIMID, 2, 0, 0, 0, 252, 252, 4, 0, 0, 0, 0, 0, 0, MOVE_THUNDERBOLT, MOVE_VOLT_SWITCH, MOVE_GRASS_KNOT, MOVE_FOCUS_BLAST, TRUE
    ["givemon", "given"], // SPECIES_TOXEL, 10, ITEM_NONE
    ["setvar", "scripted not wild"],
    ["setwildbattle", "scripted wild"] // SPECIES_SANDSLASH, 50, ITEM_NONE, ITEM_CHERISH_BALL, NATURE_JOLLY, 2, 252, 252, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, MOVE_FISSURE, MOVE_STONE_EDGE, MOVE_POISON_JAB, MOVE_KNOCK_OFF, TRUE

]
function fetchSpeciesAvailable(data: string, subpath: string): SpeciesScripted[]{
    const speciesList: SpeciesScripted[] = []
    const lines = data.split('\n')
    for (const line of lines){
        if (line.match('SPECIES_')){
            for (const reason of reasonMap){
                if (line.match(reason[0])){
                    const specie = regexGrabStr(line, /SPECIES_\w+/)
                    speciesList.push({
                        map: Xtox('', subpath),
                        specie: specie,
                        how: reason[1]
                    })
                }
            }
        }
    }
    return speciesList
}

export function parse(rootFolder: string, gameData: GameData): Promise<void>{
    const folders = fetchAllMapFile(rootFolder)
    return new Promise((resolved, rejected)=>{
        readAllFiles(rootFolder,folders)
            .then((values)=>{
                let speciesScripted: SpeciesScripted[] = []
                values.map((x)=>{
                    if (x.status === "fulfilled"){
                        speciesScripted = speciesScripted.concat(x.value)
                    } else {
                        // it's not important to not which one works which one does not
                    }
                })
                gameData.speciesScripted = speciesScripted
                resolved()
            })
    })
}