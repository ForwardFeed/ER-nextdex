import * as SpeciesNames from './species_names'
import * as BaseStats from './base_stats'
import * as Evolutions from './evolutions'
import * as EggMoves from './egg_moves'
import * as LevelUpLearnSets from './level_up_learnsets'
import * as TMHMLearnsets from './tmhm_learnsets'
import * as FormsSpecies from './form_species'

export interface Specie {
    NAME: string,
    name: string,
    baseStats: BaseStats.BaseStats,
    evolutions: Evolutions.Evolution[],
    eggMoves: string[],
    levelUpMoves: LevelUpLearnSets.LevelUpMove[],
    TMHMMoves: string[],
    forms: string[],
}

export function parse(pokeData: string): Specie[]{
    const lines = pokeData.split('\n')
    const speciesNamesResult = SpeciesNames.parse(lines,0)
    const baseStatsResult = BaseStats.parse(lines, speciesNamesResult.fileIterator)
    const evolutionsResult = Evolutions.parse(lines, baseStatsResult.fileIterator)
    const eggMovesResult = EggMoves.parse(lines, evolutionsResult.fileIterator)
    const levelUpLearnsetsResult = LevelUpLearnSets.parse(lines, eggMovesResult.fileIterator)
    const TMHMLearnsetsResult = TMHMLearnsets.parse(lines, levelUpLearnsetsResult.fileIterator)
    const formsResult = FormsSpecies.parse(lines, TMHMLearnsetsResult.fileIterator)

    const Species: Specie[] = []
    baseStatsResult.baseStats.forEach((BaseStats, key)=>{
        Species.push({
            NAME: key,
            name: speciesNamesResult.names.get(key) || "undefined",
            baseStats: BaseStats,
            evolutions: evolutionsResult.evolutions.get(key) || [],
            eggMoves: eggMovesResult.eggMoves.get(key) || [],
            levelUpMoves: levelUpLearnsetsResult.levelLearnsets.get(key) || [],
            TMHMMoves: TMHMLearnsetsResult.tmhmLearnsets.get(key) || [],
            forms: formsResult.forms.get(key) || [],
        })
    })
    return Species
}