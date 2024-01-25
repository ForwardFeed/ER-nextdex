interface CompactedScripted {
    how: number;
    map: number;
}
interface CompactLocations {
    maps: CompactLocation[];
    landRate: number[];
    waterRate: number[];
    fishRate: number[];
    honeyRate: number[];
    rockRate: number[];
    hiddenRate: number[];
    rodGrade: number[];
}
interface CompactLocation {
    name: string;
    land: CompactEncounter[] | undefined;
    landR: number | undefined;
    water: CompactEncounter[] | undefined;
    waterR: number | undefined;
    fish: CompactEncounter[] | undefined;
    fishR: number | undefined;
    honey: CompactEncounter[] | undefined;
    honeyR: number | undefined;
    rock: CompactEncounter[] | undefined;
    rockR: number | undefined;
    hidden: CompactEncounter[] | undefined;
    hiddenR: number | undefined;
}
type CompactEncounter = [
    number,
    number,
    number
];
interface CompactEvolution {
    kd: number;
    rs: string;
    in: number;
}
interface CompactLevelUpMove {
    lv: number;
    id: number;
}
interface CompactBaseStats {
    base: number[];
    types: number[];
    catchR: number;
    exp: number;
    EVY: number[];
    items: string[] | undefined;
    gender: number;
    eggC: number;
    fren: number;
    grow: number;
    eggG: number[];
    abis: number[];
    inns: number[];
    col: number;
    noFlip: boolean;
    flags: string;
}
interface compactMove {
    name: string;
    sName: string;
    eff: number;
    pwr: number;
    types: number[];
    acc: number;
    pp: number;
    chance: number;
    target: number;
    prio: number;
    flags: number[];
    split: number;
    arg: string;
    desc: string;
    lDesc: string;
}
export interface CompactSpecie {
    NAME: string;
    name: string;
    stats: CompactBaseStats;
    evolutions: CompactEvolution[];
    eggMoves: number[];
    levelUpMoves: CompactLevelUpMove[];
    TMHMMoves: number[];
    tutor: number[];
    forms: number[];
    SEnc: CompactedScripted[];
}
export interface CompactTrainers {
    name: string;
    db: boolean;
    party: CompactTrainerPokemon[];
    insane: CompactTrainerPokemon[];
    rem: CompactTrainerRematch[];
    map: number;
}
interface CompactTrainerPokemon {
    spc: number;
    abi: number;
    ivs: number[];
    evs: number[];
    item: number;
    nature: number;
    moves: number[];
}
interface CompactTrainerRematch {
    db: boolean;
    party: CompactTrainerPokemon[];
}
export interface CompactGameData {
    abilities: Ability[];
    moves: compactMove[];
    species: CompactSpecie[];
    locations: CompactLocations;
    trainers: CompactTrainers[];
    typeT: string[];
    targetT: string[];
    flagsT: string[];
    effT: string[];
    splitT: string[];
    eggT: string[];
    growT: string[];
    colT: string[];
    evoKindT: string[];
    itemT: string[];
    natureT: string[];
    scriptedEncoutersHowT: string[];
    mapsT: string[];
}


interface Ability {
    name: string,
    desc: string,
}

