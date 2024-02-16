import {readFileSync, writeFileSync, existsSync, stat, Stats} from 'fs'
import { CompactGameData, compactMove} from "./compactify";
import { Ability } from './abilities';
import { types } from 'util';

export type CmpAbi = [
    boolean, // is a new ability
    boolean, // has the desc changed
] | boolean

export type CmpMove = {
    //eff: number | undefined,
    pwr: number | boolean,
    types: Array<number | boolean>,
    acc: number | boolean,
    pp: number | boolean,
    chance: number | boolean,
    target: number | boolean,
    prio: number | boolean,
    flags: Array<number | boolean>,
    split: number | boolean,
    //arg: string | undefined,
    //desc: string | undefined,
    //lDesc: string | undefined,
} | boolean

export type CmpSpecie = {

} | boolean

export interface ComparifyGameData {
    abilities: CmpAbi[],
    moves: CmpMove[],
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
/**
 * reindex right if two indexes aren't indentical
 */
function translationTableIndex<Type>(tCalled: Type[], tTarget: Type[]): number[]{
    const transTableI = new Array(tCalled.length) //if some index don't exist?
    tCalled.forEach((value, index)=>{
        //front the index
        transTableI[index] = tTarget.indexOf(value)
    })
    return transTableI
}

function mapArrayObjWithKey<Type, TypeOut>(arr: Type[], key: keyof Type, transform: {(inT: Type): TypeOut}){
    const keyedMap: Map<string, TypeOut> = new Map()
    arr.forEach((val)=> {
        keyedMap.set(val[key] as string, transform(val))
    })  
    return keyedMap
}

function newOrHasChanged<Type, OutType>(
            cmp: Type,
            asCmp: Type,
            transform: (x:unknown)=>OutType = (x)=>{return x as OutType}
        ): boolean | OutType{
    if (asCmp === undefined || asCmp === null) return true //brand new
    if (cmp === asCmp) return false // didn't changed
    return transform(asCmp) //this was the change
}

function compareAbilities(cmp: Ability[], asCmp: Ability[]): CmpAbi[]{
    const asCmpMap: Map<string, string> = mapArrayObjWithKey<Ability, string>(asCmp, "name", x => x.desc)
    return cmp.map((val)=>{
        return  newOrHasChanged(val.desc, asCmpMap.get(val.name), ()=>{return [false, true]})
    })
}



function compareMoves(cmpD: CompactGameData, asCmpD: CompactGameData): Array<CmpMove | null>{
    //const effTtras = translationTableIndex(asCmpD.effT, cmpD.effT)
    const targetTrans =  translationTableIndex(asCmpD.targetT, cmpD.targetT)
    const flagsTrans = translationTableIndex(asCmpD.flagsT, cmpD.flagsT)
    const typeTrans = translationTableIndex(asCmpD.typeT, cmpD.typeT)
    const splitTrans = translationTableIndex(asCmpD.splitT, cmpD.splitT)

    const cmp = cmpD.moves
    const asCmp = asCmpD.moves
    const asCmpMap: Map<string, compactMove> = mapArrayObjWithKey<compactMove, compactMove>(asCmp, "NAME", x =>x)
    return cmp.map((cmpVal)=>{
        // this is because sometimes the orders gets changed, cannot trust the index
        const asCmpVal = asCmpMap.get(cmpVal.NAME)
        if (!asCmpVal) return true
        return {
            prio: newOrHasChanged(cmpVal.prio, asCmpVal.prio),
            pwr: newOrHasChanged(cmpVal.pwr, asCmpVal.pwr),
            chance: newOrHasChanged(cmpVal.chance, asCmpVal.chance),
            target: newOrHasChanged(cmpVal.target, targetTrans[asCmpVal.target]),
            types: cmpVal.types.map((type, ti) => {
                return newOrHasChanged(type, typeTrans[asCmpVal.types[ti]])
            }),
            acc: newOrHasChanged(cmpVal.acc, asCmpVal.acc),
            pp: newOrHasChanged(cmpVal.pp, asCmpVal.pp),
            flags: cmpVal.flags.map((flag, fi) => {
                return newOrHasChanged(flag, flagsTrans[asCmpVal.flags[fi]])
            }),
            split: newOrHasChanged(cmpVal.split, splitTrans[asCmpVal.split]),
        } as CmpMove
    }).map((x)=>{
        if (typeof x === "boolean") return x
        if (x.prio || x.pwr || x.chance || x.target || x.types.filter(x => x).length || 
            x.acc || x.pp || x.flags.filter(x => x).length || x.split) return x
        return null
        
    })
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
        final.moves = compareMoves(beCompared, compareWith)
        resolved(final)
    })   
}