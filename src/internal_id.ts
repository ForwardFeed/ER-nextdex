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