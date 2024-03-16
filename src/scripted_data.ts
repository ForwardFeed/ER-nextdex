import { readdirSync, access, readFile, readFileSync} from 'fs'
import { join } from 'path'

import { regexGrabStr, regexGrabAllStr} from './parse_utils'
import { GameData } from './main'
/**
 * collection of data found only in maps scripting file due to scripting
 * in /data/maps/[MAPNAME]/script.pory
 */
function fetchAllMapFile(rootFolder: string): string[]{
    const folderPath = join(rootFolder, '/data/maps/')
    return readdirSync(folderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

function readAllFiles(rootFolder: string, subPaths: string[]): Promise<PromiseSettledResult<Result>[]>{
    const promises: Promise<Result>[] = []
    subPaths.forEach((subpath) => {
        const folderPath = join(rootFolder, '/data/maps/', subpath)
        promises.push(readPoryFile(folderPath))
    })
    return Promise.allSettled(promises)
}

function readPoryFile(filepath: string): Promise<Result>{ 
    const poryPath = join(filepath, 'scripts.pory')
    return new Promise((resolved: (data: Result) => void, rejected)=>{
        access(poryPath, (err_exist)=>{
            if (err_exist){
                const err = `file: ${poryPath} has not been found`
                rejected(err)
            } else{
                readFile(poryPath, 'utf8', (err_exist, data: string) => {
                    if (err_exist){
                        const err = `couldn't read pory file: ${poryPath}, reason: ${err_exist}`
                        return rejected(err)
                    }
                    const mapData = JSON.parse(readFileSync(join(filepath, 'map.json'), {encoding: 'utf-8', flag: 'r'}))
                    const dataAvailable = fetchDataAvailable(data)
                    resolved({
                        id: mapData.id,
                        name: mapData.name,
                        trainers: dataAvailable.trainers,
                        species: dataAvailable.species
                    })
                })
            }    
        });
    })
}


export interface Result{
    id: string,
    name: string,
    trainers: string[],
    species: SpeciesScripted[],
}

interface DataAvailable{
    trainers: string[],
    species: SpeciesScripted[],
}

export interface SpeciesScripted{
    spc: string
    how: string
}

const reasonMap: [string, string][] = [
    ["givecustommon", "given with custom moves"], // SPECIES_HELIOLISK, 25, ITEM_CHOICE_SPECS, ITEM_PREMIER_BALL, NATURE_TIMID, 2, 0, 0, 0, 252, 252, 4, 0, 0, 0, 0, 0, 0, MOVE_THUNDERBOLT, MOVE_VOLT_SWITCH, MOVE_GRASS_KNOT, MOVE_FOCUS_BLAST, TRUE
    ["givemon", "given"], // SPECIES_TOXEL, 10, ITEM_NONE
    ["setvar", "scripted not wild"],
    ["setwildbattle", "scripted wild"] // SPECIES_SANDSLASH, 50, ITEM_NONE, ITEM_CHERISH_BALL, NATURE_JOLLY, 2, 252, 252, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, MOVE_FISSURE, MOVE_STONE_EDGE, MOVE_POISON_JAB, MOVE_KNOCK_OFF, TRUE

]
function fetchDataAvailable(data: string): DataAvailable{
    const speciesList: SpeciesScripted[] = []
    const trainerList: string[] = []
    const lines = data.split('\n')
    for (const line of lines){
        if (line.match('SPECIES_')){
            for (const reason of reasonMap){
                if (line.match(reason[0])){
                    const specie = regexGrabStr(line, /SPECIES_\w+/)
                    speciesList.push({
                        spc: specie,
                        how: reason[1]
                    })                    
                }
            }
        }
        if (line.match('TRAINER_')){
            const trainer = regexGrabAllStr(line, /TRAINER_\w+/g)
            trainerList.push(...trainer)
        }
    }
    return {
        species: [...new Set(speciesList)],
        trainers: trainerList,
    }
}

export function parse(rootFolder: string, gameData: GameData): Promise<void>{
    const folders = fetchAllMapFile(rootFolder)
    return new Promise((resolved, rejected)=>{
        readAllFiles(rootFolder,folders)
            .then((values)=>{
                values.map((x)=>{
                    if (x.status === "fulfilled"){
                        gameData.dataScripted.push(x.value)
                    } else {
                        //console.log(x.reason)
                        // it's not important to not which one works which one does not
                    }
                })
                // sorting Alphabethically the maps
                // mapTable.sort((a, b)=>a.localeCompare(b))
                resolved()
            })
            .catch((reason)=>{
                rejected(reason)
            })
    })
}