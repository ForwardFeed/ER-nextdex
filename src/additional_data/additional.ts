import { Ability } from '../abilities'

import * as SkillSwap from './banned_skillswap'
import * as RolePlay from './banned_roleplay'
import * as WorrySeed from './banned_worry_seed'
import * as GastroAcid from './banned_gastro_acid'
import * as Entrainement from './banned_entrainment'
import { GameData } from '../main'
import { getFileData } from '../utils'
import { writeFile } from 'fs'
import { join } from 'path'

export interface AdditionalData{
    banSkillSwap: string[],
    banRoleplay: string[],
    banWorrySeed: string[],
    banGastroAcid: string[],
    banEntrainement: string[],
}

export function parse(fileData: string): AdditionalData{
    const lines = fileData.split('\n')

    const SkillSwapResult = SkillSwap.parse(lines, 0)
    const RolePlayResult = RolePlay.parse(lines, SkillSwapResult.fileIterator)
    const WorrySeedResult = WorrySeed.parse(lines, RolePlayResult.fileIterator)
    const GastroAcidResult = GastroAcid.parse(lines, WorrySeedResult.fileIterator)
    const EntrainementResult = Entrainement.parse(lines, GastroAcidResult.fileIterator)

    return {
        banSkillSwap: SkillSwapResult.data,
        banRoleplay: RolePlayResult.data,
        banWorrySeed: WorrySeedResult.data,
        banGastroAcid: GastroAcidResult.data,
        banEntrainement: EntrainementResult.data,
    }
}
function replaceWithName(data: AdditionalData, abilities: Map<string, Ability>): AdditionalData{
    const keys = Object.keys(data)
    for( const key of keys){
        const fields = data[key as keyof AdditionalData]
        const newField: string[] = []
        for (const ability of fields){
            if (abilities.has(ability)){
                newField.push(abilities.get(ability).name)
            }
        }
        data[key as keyof AdditionalData] = newField
    }
    return data
}

export function getAdditionnalData(ROOT_PRJ: string, outputFile: string, gameData: GameData): Promise<undefined>{
    return new Promise((resolved, rejected)=>{
        getFileData(join(ROOT_PRJ, 'src/battle_util.c'), {filterComments: true, filterMacros: true, macros: new Map()})
        .then((filedata)=>{
            const data = replaceWithName(parse(filedata.data), gameData.abilities)
            const dataTowrite = JSON.stringify(data)
            writeFile(outputFile, dataTowrite , (err_exist)=>{
                if (err_exist){
                    rejected(`couldn't write the gamedata output to ${outputFile}`)
                } else {
                    resolved(null)
                }
            })
        })
        .catch((x)=>{
            rejected(x)
        })
    })
    
}