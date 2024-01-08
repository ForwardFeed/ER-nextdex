import { GameData } from "./main";
import { Ability } from "./abilities";
import { Evolution } from "./species/evolutions";
import { NAMEtoName } from "./parse_utils";

interface CompactLevelUpMove{
    lv: number,
    id: number,
}

interface CompactBaseStats{
    base: number[]
    types: number[],
    catchR: number,
    exp: number,
    EVY: number[],
    items: string[] | undefined,
    gender: number,
    eggC: number,
    fren: number,
    grow: number, 
    eggG: number[],
    abis: number[],
    inns: number[],
    col: number,
    noFlip: boolean,
    flags: string,
}

interface compactMove {
    name: string,
    sName: string,
    eff: string,
    pwr: number,
    types: number[],
    acc: number,
    pp: number,
    chance: number,
    target: number,
    prio: number,
    flags: number[],
    split: number,
    arg: string,
    desc: string,
    lDesc: string,
}
export interface CompactSpecie{
    NAME: string,
    name: string,
    stats: CompactBaseStats,
    evolutions: Evolution[],
    eggMoves: number[],
    levelUpMoves: CompactLevelUpMove[],
    TMHMMoves: number[],
    forms: string[],
}

export interface CompactGameData{
    abilities: Ability[],
    moves: compactMove[],
    species: CompactSpecie[],
    typeT: string[], //types tabes
    targetT: string[], //targets table
    flagsT: string[],
    splitT: string[],
    eggT: string[], // egg group table
    colT: string[], //color table
}
function initCompactGameData(): CompactGameData{
    return {
        abilities: [],
        moves: [],
        species: [],
        typeT: [],
        targetT: [],
        flagsT: [],
        splitT: [],
        eggT: [],
        colT: [],
    }
}


export function compactify(gameData: GameData): CompactGameData{
    const compacted = initCompactGameData()
    const abiT: string[] = []
    gameData.abilities.forEach((val)=>{
        abiT.push(val[0])
        compacted.abilities.push(val[1])
    })
    const movesT: string[] = []
    gameData.moves.forEach((val)=>{
        movesT.push(val[0])
        const move = val[1]
        compacted.moves.push({
            name: move.name,
            sName: move.shortName,
            eff: move.effect.replace(/^EFFECT_/, ''),
            pwr: move.power,
            types: move.types.map((x) => {
                if (!compacted.typeT.includes(x)) compacted.typeT.push(x)
                return compacted.typeT.indexOf(x)
            }),
            acc: move.acc,
            pp: move.pp,
            chance: move.chance,
            target: ((x) => {
                if (!compacted.targetT.includes(x)) compacted.targetT.push(x)
                return compacted.targetT.indexOf(x)
            })(move.target),
            prio: move.priority,
            split: ((x) => {
                if (!compacted.splitT.includes(x)) compacted.splitT.push(x)
                return compacted.splitT.indexOf(x)
            })(move.split),
            flags: move.flags.map((x) => {
                if (!compacted.flagsT.includes(x)) compacted.flagsT.push(x)
                return compacted.flagsT.indexOf(x)
            }),
            arg: move.argument,
            desc: move.desc,
            lDesc: move.longDesc
        })
    })
    const nameT: string[] = []
    gameData.species.forEach((val)=>{
        const bs = val.baseStats
        compacted.species.push({
            name: ((x, X)=>{
                if (nameT.includes(x)){
                    x = NAMEtoName(X)
                }
                nameT.push(x)
                return x
            })(val.name, val.NAME),
            NAME: val.NAME,
            stats: {
                base:[  bs.baseHP,
                        bs.baseAttack,
                        bs.baseDefense,
                        bs.baseSpAttack,
                        bs.baseSpDefense,
                        bs.baseSpeed,
                    ],
                types: bs.types.map((x) => {
                    if (!compacted.typeT.includes(x)) compacted.typeT.push(x)
                    return compacted.typeT.indexOf(x)
                }),
                catchR: bs.catchRate,
                exp: bs.expYield,
                EVY: [bs.evYield_HP, bs.evYield_Attack, bs.evYield_Defense, bs.evYield_SpAttack, bs.evYield_SpDefense, bs.evYield_Speed],
                items: ((x)=>{
                    if (!x.length){
                        return undefined
                    } else {
                        return x
                    }
                })(bs.items),
                gender: bs.genderRatio,
                eggC: bs.eggCycles,
                fren: bs.friendship,
                grow: bs.growthRate, 
                eggG: bs.eggGroup.map((x) => {
                    if (!compacted.eggT.includes(x)) compacted.eggT.push(x)
                    return compacted.eggT.indexOf(x)
                }),
                abis: bs.abilities.map((x) => {
                    if (!abiT.includes(x)) return 0
                    return abiT.indexOf(x)
                }),
                inns: bs.innates.map((x) => {
                    if (!abiT.includes(x)) return 0
                    return abiT.indexOf(x)
                }),
                col: ((x) => {
                    if (!compacted.colT.includes(x)) compacted.colT.push(x)
                    return compacted.colT.indexOf(x)
                })(bs.bodyColor),
                noFlip: bs.noFlip,
                flags: bs.flags, 
            },
            evolutions: val.evolutions,
            eggMoves: val.eggMoves.map((x) => {
                if (!movesT.includes(x)) return 0
                    return movesT.indexOf(x)
            }),
            levelUpMoves: val.levelUpMoves.map((x) => {
                return {
                    id: ((y)=>{
                        if (!movesT.includes(y)) return 0
                        return movesT.indexOf(y)
                    })(x.move),
                    lv: x.level
                }
            }),
            TMHMMoves: val.TMHMMoves.map((x) => {
                x = x.replace(/((TM)|(HM))[^_]+/, 'MOVE')
                if (x === "MOVE_SOLARBEAM") x = "MOVE_SOLAR_BEAM"
                if (!movesT.includes(x)) {
                    console.warn(`couldn't figure out ${x} TMHM move`)
                }
                return movesT.indexOf(x)
            }),
            forms: val.forms,
        })
    })
    return compacted
}