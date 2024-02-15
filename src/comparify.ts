import {readFileSync, writeFileSync, existsSync, stat, Stats} from 'fs'
import { CompactGameData, compactMove} from "./compactify";
import { Ability } from './abilities';

export type CmpAbi = [
    boolean, // is a new ability
    boolean, // has the desc changed
]

export type CmpMove = {
    eff: number | undefined,
    pwr: number | undefined,
    types: Array<number | undefined>,
    acc: number | undefined,
    pp: number | undefined,
    chance: number | undefined,
    target: number | undefined,
    prio: number | undefined,
    flags: Array<number | undefined>,
    split: number | undefined,
    arg: string | undefined,
    desc: string | undefined,
    lDesc: string | undefined,
}

export interface ComparifyGameData {
    abilities: CmpAbi[]
}

function getFileAsJson(filePath: string): CompactGameData | string{
    if (!existsSync(filePath)) return(`Couldn't find ${filePath}`)
    try{ 
        const jsonData = JSON.parse(readFileSync(filePath, 'utf-8')) as CompactGameData
        return jsonData
    } catch(e){
        return(`Couldn't read or parse as JSON: ${filePath}`)
    }
}

function compareObjects(cmp: Object, asCmp: Object): Object | unknown{
    const rootObj: Object = {}
    const keys = Object.keys(cmp) as Array<keyof Object>
    for (const key of keys ){
        const cmpData = cmp[key]
        const asCmpData = asCmp[key]
        if (!cmpData || !asCmpData) continue
        if (typeof cmpData === "object"){
            Object.assign(rootObj, {[key]: compareObjects(cmpData, asCmpData)})
        } else {
            Object.assign(rootObj, {[key]: cmpData == asCmpData ? undefined : asCmpData})
        }
    }
    return rootObj
}


function mapArrayObjWithKey<Type, TypeOut>(arr: Type[], key: keyof Type, transform: {(inT: Type): TypeOut} ){
    const keyedMap: Map<string, TypeOut> = new Map()
    arr.forEach((val)=> {
        keyedMap.set(val[key] as string, transform(val))
    })  
    return keyedMap
}

function compareAbilities(cmp: Ability[], asCmp: Ability[]): CmpAbi[]{
    const asCmpMap: Map<string, string> = mapArrayObjWithKey<Ability, string>(asCmp, "name", x => x.desc)
    return cmp.map((val)=>{
        const asCmpDesc = asCmpMap.get(val.name)
        if (!asCmpDesc) return [true, false] // new ability
        if (asCmpDesc === val.desc) return [false, false] // didn't changed
        return [false, true] //
    })
}

function compareMoves(cmp: compactMove[], asCmp: compactMove[]){
    const asCmpMap: Map<string, CmpMove> = mapArrayObjWithKey<compactMove, compactMove>(asCmp, "NAME", x =>x)
    /*
    return cmp.map((val)=>{
        const asCmpDesc = asCmpMap.get(val.name)
        if (!asCmpDesc) return [true, false] // new ability
        if (asCmpDesc === val.desc) return [false, false] // didn't changed
        return [false, true] //
    })*/
}

/**
 * Compare two compact gameData, and result of  compact gamedata that only includes differences
 */
export function comparify(filepathToBeCompared: string, filepathToCompareWith: string): Promise<ComparifyGameData>{
    return new Promise((resolved, rejected)=>{
        const beCompared = getFileAsJson(filepathToBeCompared)
        const compareWith = getFileAsJson(filepathToCompareWith)

        if (typeof beCompared === "string") return rejected(beCompared)
        if (typeof compareWith === "string") return rejected(compareWith)
        //!TODO, compare if both tables of compression are identicals
        const final = {} as ComparifyGameData
        final.abilities = compareAbilities(beCompared.abilities, compareWith.abilities)
        resolved(final)
    })
    
    
}