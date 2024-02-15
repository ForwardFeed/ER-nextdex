import {join} from 'path'
import { GameData } from './main'
import { FileDataOptions, getFileData } from './utils'

export function getSpeciesInternalID(ROOT_PRJ: string, gamedata: GameData): Promise<void>{
    return new Promise((resolved, rejected) => {
        getFileData(join(ROOT_PRJ, 'include/constants/species.h'),
     {filterComments: true, filterMacros:true, macros: new Map()})
        .then((filedata)=>{
            const internalIDSpecies: Map<string, number> = new Map()
            filedata.macros.forEach((val, key)=>{
                if (key.match('SPECIES_')){
                    internalIDSpecies.set(key, +val)
                }
            })
            gamedata.speciesInternalID = internalIDSpecies
            resolved()
        })
        .catch((e)=>{
            rejected(e)
        })
    })
    
}

export function getMovesInternalID(ROOT_PRJ: string, gamedata: GameData): Promise<void>{
    return new Promise((resolved, rejected) => {
        getFileData(join(ROOT_PRJ, 'include/constants/moves.h'),
     {filterComments: true, filterMacros:true, macros: new Map()})
        .then((filedata)=>{
            const internalIDMoves: Map<string, number> = new Map()
            filedata.macros.forEach((val, key)=>{
                if (key.match('MOVE_')){
                    internalIDMoves.set(key, +val)
                }
            })
            gamedata.movesInternalID = internalIDMoves
            resolved()
        })
        .catch((e)=>{
            rejected(e)
        })
    })
    
}