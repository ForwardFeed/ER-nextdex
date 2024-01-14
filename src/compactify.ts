import { GameData } from "./main";
import { Ability } from "./abilities";
import { NAMEtoName, Xtox } from "./parse_utils";

interface CompactLocations{
    maps: CompactLocation[],
    landRate: number[],
    waterRate: number[],
    fishRate: number[],
    honeyRate: number[],
    rockRate: number[],
    hiddenRate: number[],
    rodGrade: number[],
}

interface CompactLocation{
    name: string,
    land: CompactEncounter[] | undefined,
    landR: number | undefined,
    water: CompactEncounter[] | undefined,
    waterR: number | undefined,
    fish: CompactEncounter[] | undefined,
    fishR: number | undefined,
    honey: CompactEncounter[] | undefined,
    honeyR: number | undefined,
    rock: CompactEncounter[] | undefined,
    rockR: number | undefined,
    hidden: CompactEncounter[] | undefined,
    hiddenR: number | undefined,
}

type CompactEncounter = [
    number, //min
    number, //max
    number, //specie ID
]

interface CompactEvolution{
    kd: number,
    rs: string,
    in: number,
}

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
    eff: number,
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
    evolutions: CompactEvolution[],
    eggMoves: number[],
    levelUpMoves: CompactLevelUpMove[],
    TMHMMoves: number[],
    tutor: number[],
    forms: number[],
}

export interface CompactTrainers{
    name: string,
    db: boolean,
    team: CompactTrainerPokemon[]
}

interface CompactTrainerPokemon{
    spc: number,
    abi: number,
    ivs: number[],
    evs: number[],
    item: number,
    nature: number,
    moves: number[]
}

export interface CompactGameData{
    abilities: Ability[],
    moves: compactMove[],
    species: CompactSpecie[],
    locations: CompactLocations,
    trainers: CompactTrainers[],
    typeT: string[], //types tabes
    targetT: string[], //targets table
    flagsT: string[],
    effT: string[], // effect table
    splitT: string[],
    eggT: string[], // egg group table
    growT: string[]; // Growth Table
    colT: string[], //color table
    evoKindT: string[],
    itemT: string[],
    natureT: string[],
}
function initCompactGameData(): CompactGameData{
    return {
        abilities: [],
        moves: [],
        species: [],
        locations: {} as CompactLocations,
        trainers: [],
        typeT: [],
        targetT: [],
        flagsT: [],
        effT: [],
        splitT: [],
        eggT: [],
        growT: [],
        colT: [],
        evoKindT: [],
        itemT: [],
        natureT: [],
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
            eff: ((x) => {
                if (!compacted.effT.includes(x)) compacted.effT.push(x)
                return compacted.effT.indexOf(x)
            })(move.effect.replace(/^EFFECT_/, '')),
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
    const NAMET: string[] = []
    gameData.species.forEach((val)=>{
        NAMET.push(val.NAME)
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
                grow: ((gr)=>{
                    if (!compacted.growT.includes(gr)) compacted.growT.push(gr)
                    return compacted.growT.indexOf(gr)
                })(bs.growthRate), 
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
            evolutions: val.evolutions.map((x)=>{
                const evo = {} as CompactEvolution
                if (!compacted.evoKindT.includes(x.kind)) compacted.evoKindT.push(x.kind)
                evo.kd = compacted.evoKindT.indexOf(x.kind)
                evo.rs = x.specifier
                evo.in = NAMET.indexOf(x.into)
                return evo
            }),
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
            tutor: val.tutorMoves.map((x) => {
                if (!movesT.includes(x)) {
                    console.warn(`couldn't figure out ${x} TMHM move`)
                }
                return movesT.indexOf(x)
            }),
            forms: val.forms.map((x)=>{
                return NAMET.indexOf(x)
            }),
        })
    })
    compacted.locations = {
        landRate: gameData.locations.landRate,
        waterRate: gameData.locations.waterRate,
        fishRate:gameData.locations.fishRate,
        honeyRate: gameData.locations.honeyRate,
        rockRate: gameData.locations.rockRate,
        hiddenRate: gameData.locations.hiddenRate,
        rodGrade: gameData.locations.rodGrade,
        maps: gameData.locations.maps.map((map)=>{
            return {
                name: map.name,
                land: map.land ? map.land.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                landR: map.landR,
                water: map.water ? map.water.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                waterR: map.waterR,
                fish: map.fish ? map.fish.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                fishR: map.fishR,
                honey: map.honey ? map.honey.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                honeyR: map.honeyR,
                rock: map.rock ? map.rock.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                rockR: map.rockR,
                hidden: map.hidden ? map.hidden.map((x)=>{
                    return [x.min, x.max, NAMET.indexOf(x.specie)]
                }) : undefined,
                hiddenR: map.hiddenR,
            }
        })
    }
    for (const trainer of gameData.trainers){
        compacted.trainers.push({
            name: trainer.name,
            db: trainer.double,
            team: trainer.team.map((poke)=>{
                return {
                    spc: NAMET.indexOf(poke.specie),
                    abi: poke.ability,
                    ivs: poke.ivs,
                    evs: poke.evs,
                    item: ((item)=>{
                        item = Xtox('ITEM_', item)
                        if (!compacted.itemT.includes(item))compacted.itemT.push(item)
                        return compacted.itemT.indexOf(item)
                    })(poke.item),
                    nature: ((nat)=>{
                        nat = Xtox('NATURE_', nat)
                        if (!compacted.natureT.includes(nat))compacted.natureT.push(nat)
                        return compacted.natureT.indexOf(nat)
                    })(poke.nature),
                    moves: poke.moves.map((mv)=>{
                        if (!movesT.includes(mv))movesT.push(mv)
                        return movesT.indexOf(mv)
                    })
                }
            })
        })
    }
    return compacted
}