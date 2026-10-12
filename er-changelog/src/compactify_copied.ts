
// copied from the project, it sucks, but it is what it is.

interface PokePokedex {
    id: number,
    desc: string,
    hw: [number, number]
    
}

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
  id: number;
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

export interface compactMove {
  name: string;
  NAME: string; 
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
  id: number;
  usesHpType: boolean;
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
  dex: PokePokedex;
  id: number;
}

export interface CompactTrainers {
  name: string;
  tclass: number;
  db: boolean;
  party: CompactTrainerPokemon[];
  insane: CompactTrainerPokemon[];
  hell: CompactTrainerPokemon[];
  rem: CompactTrainerRematch[];
  map: number;
  id: number,
}

interface CompactTrainerPokemon {
  spc: number;
  abi: number;
  ivs: number[];
  evs: number[];
  item: number;
  nature: number;
  moves: number[];
  hpType: number;
}

interface CompactTrainerRematch {
  db: boolean;
  party: CompactTrainerPokemon[];
}

interface CompactBattleItems {
  name: string;
  NAME: string;
  id: number;
  
}

export interface CompactAbility {
  name: string;
  desc: string;
  id: number;
}

export interface CompactGameData {
  abilities: CompactAbility[];
  moves: compactMove[];
  species: CompactSpecie[];
  locations: CompactLocations;
  trainers: CompactTrainers[];
  items: CompactBattleItems[];
  typeT: string[]; 
  targetT: string[]; 
  flagsT: string[];
  effT: string[]; 
  splitT: string[];
  eggT: string[]; 
  growT: string[]; 
  colT: string[]; 
  evoKindT: string[];
  natureT: string[];
  scriptedEncoutersHowT: string[];
  mapsT: string[];
  MAPST: string[];
  tclassT: string[];
  creationDate: number;
}