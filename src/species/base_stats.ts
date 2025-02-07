import { regexGrabNum, regexGrabStr, Xtox } from "../parse_utils"


export interface BaseStats {
    baseHP: number,
    baseAttack: number,
    baseDefense: number,
    baseSpeed: number,
    baseSpAttack: number,
    baseSpDefense: number,
    types: string[],
    catchRate: number,
    expYield: number,
    evYield_HP: number,
    evYield_Attack: number,
    evYield_Defense: number,
    evYield_Speed: number,
    evYield_SpAttack: number,
    evYield_SpDefense: number,
    items: string[],
    genderRatio: number,
    eggCycles: number,
    friendship: number,
    growthRate: string, 
    eggGroup: string[],
    abilities: string[],
    innates: string[],
    bodyColor: string,
    noFlip: boolean,
    flags: string,
}

function initBaseStats(): BaseStats{
    return {
        baseHP: -1,
        baseAttack: -1,
        baseDefense: -1,
        baseSpeed: -1,
        baseSpAttack: -1,
        baseSpDefense: -1,
        types: [],
        catchRate: -1,
        expYield: -1,
        evYield_HP: 0,
        evYield_Attack: 0,
        evYield_Defense: 0,
        evYield_Speed: 0,
        evYield_SpAttack: 0,
        evYield_SpDefense: 0,
        items: [],
        genderRatio: -1,
        eggCycles: -1,
        friendship: -1,
        growthRate: "", 
        eggGroup: [],
        abilities: [],
        innates: [],
        bodyColor: "",
        noFlip: false,
        flags: "",
    }
}

export interface Result{
    fileIterator: number,
    baseStats: Map<string, BaseStats>,
}

interface Context{
    current: BaseStats,
    currKey: string,
    baseStats: Map<string, BaseStats>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        current: initBaseStats(),
        currKey: "",
        baseStats: new Map(),
        execFlag: "awaitForStart",
        stopRead: false
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitForStart": (line, context) => {
        if (line.match('gBaseStats')){
            context.execFlag = "main"
        }
    },
    "main": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (!line) return
        if (line.match(/^\[SPECIES/)){
            if (context.currKey){
                if (context.current.baseSpeed != 0){
                    // having a base speed of 0 means it don't have to be set in
                    context.baseStats.set(context.currKey, context.current)
                }
                context.current = initBaseStats()
            }
            context.currKey = regexGrabStr(line, /(?<=^\[)\w+/)
            return
        } else if (line.match(/\.((base)|(evYield)|(eggCycles)|(friendship)|(catchRate)|(expYield))/)){
            const stats = regexGrabStr(line, /(?<=\.)\w+/) as keyof BaseStats
            const value = regexGrabNum(line, /(?<==)\d+/, 0)
            Object.assign(context.current, {[stats]: value})
        } else if (line.match(/\.((growthRate)|(bodyColor)|(flags))/)) {
            const stats = regexGrabStr(line, /(?<=\.)\w+/) as keyof BaseStats
            const value = regexGrabStr(line, /(?<==)\w+/)
            Object.assign(context.current, {[stats]: value})
        } else if (line.match('genderRatio')){
            const value = regexGrabStr(line, /(?<==)\w+/)
            if (value === "MON_FEMALE"){
                context.current.genderRatio = 254
            } else if (value === "PERCENT_FEMALE"){
                context.current.genderRatio = regexGrabNum(line, /(?<=\()\d+/, 0)
            } else if (value === "MON_MALE"){
                context.current.genderRatio = 0
            } else if (value === "MON_GENDERLESS"){
                context.current.genderRatio = 255
            }
        } else if (line.match('.type')){
            context.current.types.push(Xtox('TYPE_',regexGrabStr(line, /(?<==)\w+/)))
        } else if (line.match('.egg')){
            context.current.eggGroup.push(regexGrabStr(line, /(?<==)\w+/))
        } else if (line.match('.item')){
            context.current.items.push(regexGrabStr(line, /(?<==)\w+/))
        } else if (line.match(/\.abilities/)){
            context.current.abilities = regexGrabStr(line, /(?<=={)[\w,]+/).split(',')
        } else if (line.match(/\.innates/)){
            context.current.innates = regexGrabStr(line, /(?<=={)[\w,]+/).split(',')
        } else if (line.match('.noFlip')){
            context.current.noFlip = regexGrabStr(line, /(?<==)\w+/) === "TRUE"
        } else if (line.match('};')){
            if (context.current.baseSpeed != 0){
                context.baseStats.set(context.currKey, context.current)
            }
            context.stopRead = true
        }
    }
}

export function parse(lines: string[], fileIterator: number): Result{
    const lineLen = lines.length
    const context = initContext()
    for (;fileIterator<lineLen; fileIterator++){
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
    }
    return {
        fileIterator: fileIterator,
        baseStats: context.baseStats
    }
}