import {readFileSync, writeFileSync, existsSync, stat, Stats, writeFile} from 'fs'
import { CompactGameData, CompactSpecie, compactMove} from "./compactify";
import { Ability } from './abilities';
import { types } from 'util';
import { ParsedValues } from './arguments';

export type CmpAbi = string | boolean //if the desc changed

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
    stats: CmpBaseStats | boolean,
} | boolean

export type CmpBaseStats = {
    base: Array<number | boolean>,
    types: Array<number | boolean>,
    abis: Array<number | boolean>,
    inns: Array<number | boolean>,
} | boolean

export interface ComparifyGameData {
    abilities: CmpAbi[],
    moves: CmpMove[],
    species: CmpSpecie[],
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

function translationTableIndexByKey<Type>(tCalled: Type[], tTarget: Type[], key: keyof Type): number[]{
    const reorderMapRef = new Map()

    tCalled.forEach((value, index)=>{
        //front the index
        reorderMapRef.set(value[key], index)
    })
    const transTableI = new Array(tCalled.length) //if some index don't exist?
    tTarget.forEach((value)=>{
        if (!reorderMapRef.has(value[key])) return
        transTableI.push(reorderMapRef.get(value[key]))
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
    if (asCmp == undefined || asCmp == null) return true //brand new
    if (cmp == asCmp) return false // didn't changed
    return transform(asCmp) //this was the change
}

function compareAbilities(cmp: Ability[], asCmp: Ability[]): CmpAbi[]{
    const asCmpMap: Map<string, string> = mapArrayObjWithKey<Ability, string>(asCmp, "name", x => x.desc)
    return cmp.map((val)=>{
        return  newOrHasChanged(val.desc, asCmpMap.get(val.name), ()=>{return true})
    })
}

function compareMoves(cmpD: CompactGameData, asCmpD: CompactGameData): Array<CmpMove | null>{
    //const effTtras = translationTableIndex(asCmpD.effT, cmpD.effT)
    // this is because sometimes the orders gets changed, cannot trust the index
    const targetTrans =  translationTableIndex(asCmpD.targetT, cmpD.targetT)
    const flagsTrans = translationTableIndex(asCmpD.flagsT, cmpD.flagsT)
    const typeTrans = translationTableIndex(asCmpD.typeT, cmpD.typeT)
    const splitTrans = translationTableIndex(asCmpD.splitT, cmpD.splitT)

    const cmp = cmpD.moves
    const asCmp = asCmpD.moves
    const asCmpMap: Map<string, compactMove> = mapArrayObjWithKey<compactMove, compactMove>(asCmp, "NAME", x =>x)
    return cmp.map((cmpVal)=>{
        const asCmpVal = asCmpMap.get(cmpVal.NAME)
        if (!asCmpVal) return true
        try{
        return {
            prio: newOrHasChanged(cmpVal.prio, asCmpVal.prio),
            pwr: newOrHasChanged(cmpVal.pwr, asCmpVal.pwr),
            chance: newOrHasChanged(cmpVal.chance, asCmpVal.chance),
            target: newOrHasChanged(cmpVal.target, targetTrans[asCmpVal.target]),
            types: cmpVal.types.map((type, tI) => {
                return newOrHasChanged(type, typeTrans[asCmpVal.types[tI]])
            }),
            acc: newOrHasChanged(cmpVal.acc, asCmpVal.acc),
            pp: newOrHasChanged(cmpVal.pp, asCmpVal.pp),
            flags: cmpVal.flags.map((flag, fI) => {
                return newOrHasChanged(flag, flagsTrans[asCmpVal.flags[fI]])
            }),
            split: newOrHasChanged(cmpVal.split, splitTrans[asCmpVal.split]),
        } as CmpMove} catch{
            return {
                pwr: false,
                types: [false],
                acc: false,
                pp: false,
                chance: false,
                target: false,
                prio: false,
                flags: [false],
                split: false,

            } as CmpMove
        }
    }).map((x)=>{
        if (typeof x === "boolean") return x
        if (x.prio || x.pwr || x.chance || x.target || x.types.filter(x => x).length || 
            x.acc || x.pp || x.flags.filter(x => x).length || x.split) return x
        return null
        
    })
}

function compareSpecies(cmpD: CompactGameData, asCmpD: CompactGameData): Array<CmpSpecie | null>{
    const abiTrans = translationTableIndexByKey(cmpD.abilities, asCmpD.abilities, "name") //failure of a function
    const typeTrans = translationTableIndex(asCmpD.typeT, cmpD.typeT)

    const cmp = cmpD.species
    const asCmp = asCmpD.species
    const asCmpMap: Map<string, CompactSpecie> = mapArrayObjWithKey<CompactSpecie, CompactSpecie>(asCmp, "NAME", x =>x)
    return cmp.map((cmpVal)=>{
        const asCmpVal = asCmpMap.get(cmpVal.NAME)
        if (!asCmpVal) {
            return true
        }
        return {
            stats: {
                base: cmpVal.stats.base.map((statVal, sI) => {
                    return newOrHasChanged(statVal, asCmpVal.stats.base[sI])
                }),
                types: cmpVal.stats.types.map((type, tI) => {
                    return newOrHasChanged(type, typeTrans[asCmpVal.stats.types[tI]])
                }),
                abis: cmpVal.stats.abis.map((ability, aI) => {
                    try{
                        return newOrHasChanged(cmpD.abilities[ability].name, asCmpD.abilities[asCmpVal.stats.abis[aI]].name,
                            ()=>{return ability}
                        )
                    } catch{
                        return ability
                    }
                    
                }),
                inns: cmpVal.stats.inns.map((innate, iI) => {
                    try{
                        return newOrHasChanged(cmpD.abilities[innate].name, asCmpD.abilities[asCmpVal.stats.abis[iI]].name,
                            ()=>{return innate}
                        )
                    }catch{
                        return innate
                    }
                    
                }),
            }
        } as CmpSpecie
    }).map((x)=>{
        if (typeof x === "boolean" || typeof x.stats === "boolean") return x
        if (x.stats.base.filter(x => x).length || x.stats.types.filter(x => x).length ||
        x.stats.abis.filter(x => x).length || x.stats.inns.filter(x => x).length) return x
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
        final.species = compareSpecies(beCompared, compareWith)
        resolved(final)
    })   
}

function getFileNameFromFilePath(filepath: string): string | undefined{
    const fileMatch = filepath.match(/(?<=gameDataV)[^\/]+(?=.json)/)
    if (!fileMatch){
        return undefined
    }
    return fileMatch[0]
}

function comparifyTwoToFile(filepathToBeCompared: string, filepathToCompareWith: string, outputPath: string){
    comparify(filepathToBeCompared, filepathToCompareWith)
        .then((x)=>{
            writeFile(outputPath, JSON.stringify(x) , (err_exist)=>{
                if (err_exist){
                    console.error(`couldn't write the gamedata output to ${outputPath}`)
                } else {
                    console.log("successfully written to " + outputPath)
                }
                
            })
        })
        .catch((e)=>{
            console.error(`error when comparify two files: ${e}`)
        })
}

export function comparifyMultiple(entryFiles: string[], parsedArguments: ParsedValues ,additionnalFiles: string[]){
    const entryFilesLen = entryFiles.length
    for (let i = 0; i < entryFilesLen; i++){
        const file = entryFiles[i]
        const fileName = getFileNameFromFilePath(file)
        if (!fileName) {
            console.warn(`couldn't extract file name for ${file}, ignoring`)
            continue
        }

        for (const additionnal of additionnalFiles){
            const additionalName = getFileNameFromFilePath(additionnal)
            if (!additionalName) {
                console.warn(`couldn't extract file name for ${additionnal}, ignoring`)
                continue
            }
            const outFileName = `comparify${fileName}${additionalName}.json`
            const outputPath = parsedArguments.redirectData ? 
                `./static/js/data/${outFileName}` :
                `./out/${outFileName}`

            comparifyTwoToFile(file, additionnal, outputPath)
        }
        for (let j = 0; j < entryFilesLen; j++){
            const comparingFile = entryFiles[j]
            if (file === comparingFile) continue
            const comparingFileName = getFileNameFromFilePath(comparingFile)
            if (!comparingFileName) continue
            const outFileName = `comparify${fileName}${comparingFileName}.json`
            const outputPath = parsedArguments.redirectData ?
                `./static/js/data/${outFileName}` :
                `./out/${outFileName}`
            console.log(file, comparingFile, outputPath)
            comparifyTwoToFile(file, comparingFile, outputPath)
        }
    } 
}
