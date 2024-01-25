import { readdirSync, access, readFile} from 'fs'
import { join, resolve } from 'path'

import { Xtox, regexGrabStr } from './parse_utils'
import { rejects } from 'assert'
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
    return Promise.allSettled(
    subPaths.map((subpath)=>{
        const path = join(rootFolder, '/data/maps/', subpath, 'scripts.pory')
        return readPoryFile(path, subpath)
    }))
}

function readPoryFile(filepath: string, subpath: string): Promise<Result>{
    return new Promise((resolved: (data: Result) => void, rejected)=>{
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

export interface Result{
    trainers: Map<string, TrainersScriped>,
    species: Map<string, SpeciesScripted[]>,
}

export interface TrainersScriped{
    map: string,
}

export interface SpeciesScripted{
    map: string,
    how: string
}

const reasonMap: [string, string][] = [
    ["givecustommon", "given with custom moves"], // SPECIES_HELIOLISK, 25, ITEM_CHOICE_SPECS, ITEM_PREMIER_BALL, NATURE_TIMID, 2, 0, 0, 0, 252, 252, 4, 0, 0, 0, 0, 0, 0, MOVE_THUNDERBOLT, MOVE_VOLT_SWITCH, MOVE_GRASS_KNOT, MOVE_FOCUS_BLAST, TRUE
    ["givemon", "given"], // SPECIES_TOXEL, 10, ITEM_NONE
    ["setvar", "scripted not wild"],
    ["setwildbattle", "scripted wild"] // SPECIES_SANDSLASH, 50, ITEM_NONE, ITEM_CHERISH_BALL, NATURE_JOLLY, 2, 252, 252, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, MOVE_FISSURE, MOVE_STONE_EDGE, MOVE_POISON_JAB, MOVE_KNOCK_OFF, TRUE

]
function fetchSpeciesAvailable(data: string, subpath: string): Result{
    const speciesList: Map<string, SpeciesScripted[]> = new Map()
    const trainerList: Map<string, TrainersScriped> = new Map()
    const lines = data.split('\n')
    for (const line of lines){
        if (line.match('SPECIES_')){
            for (const reason of reasonMap){
                if (line.match(reason[0])){
                    const specie = regexGrabStr(line, /SPECIES_\w+/)
                    if (speciesList.has(specie)){
                        const previous = speciesList.get(specie)
                        speciesList.set(specie,[{
                            map: Xtox('', subpath),
                            how: reason[1]
                        }].concat(previous))
                    } else {
                        speciesList.set(specie,[{
                            map: Xtox('', subpath),
                            how: reason[1]
                        }])
                    }
                    
                }
            }
        }
        if (line.match('TRAINER_')){
            const trainer = regexGrabStr(line, /TRAINER_\w+/)
            trainerList.set(trainer, {
                map: Xtox('', subpath),
            })
        }
    }
    return {
        species: speciesList,
        trainers: trainerList,
    }
}

export function parse(rootFolder: string, gameData: GameData): Promise<void>{
    const folders = fetchAllMapFile(rootFolder)
    return new Promise((resolved, rejected)=>{
        readAllFiles(rootFolder,folders)
            .then((values)=>{
                let speciesScripted: Map<string, SpeciesScripted[]> = new Map()
                let trainersScripted: Map<string, TrainersScriped> = new Map()
                let mapTable: string[] = []
                values.map((x)=>{
                    if (x.status === "fulfilled"){
                        x.value.species.forEach((value, key)=>{
                            if (mapTable.indexOf(value[0].map) == -1){
                                mapTable.push(value[0].map)
                            }
                            if (speciesScripted.has(key)){
                                const previous = speciesScripted.get(key)
                                speciesScripted.set(key, value.concat(previous))
                            } else {
                                speciesScripted.set(key, value)
                            }
                        })
                        x.value.trainers.forEach((value, key)=>{
                            if (mapTable.indexOf(value.map) == -1){
                                mapTable.push(value.map)
                            }
                            trainersScripted.set(key, value)
                        })
                    } else {
                        // it's not important to not which one works which one does not
                    }
                })
                // sorting Alphabethically the maps
                mapTable.sort((a, b)=>a.localeCompare(b))
                gameData.mapTable = mapTable
                gameData.speciesScripted = speciesScripted
                gameData.trainersScripted = trainersScripted
                resolved()
            })
    })
}