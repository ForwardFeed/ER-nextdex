import * as SpeciesNames from './species_names'
import * as BaseStats from './base_stats'
import * as Evolutions from './evolutions'
import * as EggMoves from './egg_moves'
import * as LevelUpLearnSets from './level_up_learnsets'
import * as TMHMLearnsets from './tmhm_learnsets'
import * as TutorMoves from './tutor_learnsets'
import * as FormsSpecies from './form_species'
import * as PokePokedex from './pokedex'

import { FileDataOptions, getMulFilesData, autojoinFilePath } from '../utils'
import { GameData, VERSION_STRUCTURE } from '../main'
import { getSpecies26 } from './species_26'
import { Evolution } from './evolutions'
import { SpeciesEnum } from '../gen/SpeciesEnum_pb.js'
import { BodyColor, EggGroup, Species, Species_Gender, Species_Learnset, Species_Learnset_UniversalTutors, Species_LearnsetSchema, Species_MegaEvolution_MegaType, Species_PrimalEvolution_PrimalType, Species_RandomizeBanned, Species_SpeciesDexInfo, Species_SpeciesDexInfoSchema, SpeciesList } from '../gen/SpeciesList_pb.js'
import { create } from "@bufbuild/protobuf"
import { readSpecies } from '../proto_utils.js'
import { MoveEnum } from '../gen/MoveEnum_pb.js'
import { Xtox } from '../parse_utils.js'
import { Type } from '../gen/Types_pb.js'
import { AbilityEnum } from '../gen/AbilityEnum_pb.js'
import { ItemEnum } from '../gen/ItemEnum_pb.js'

export interface Specie {
  NAME: string,
  name: string,
  baseStats: BaseStats.BaseStats,
  evolutions: Evolution[],
  eggMoves: string[],
  levelUpMoves: LevelUpLearnSets.LevelUpMove[],
  tutorMoves: string[],
  TMHMMoves: string[],
  forms: string[],
  dex: PokePokedex.PokePokedex,
}

function parse(pokeData: string): Specie[] {
  const lines = pokeData.split('\n')
  const pokePokedexResult = PokePokedex.parse(lines, 0)
  const speciesNamesResult = SpeciesNames.parse(lines, pokePokedexResult.fileIterator)
  const baseStatsResult = BaseStats.parse(lines, speciesNamesResult.fileIterator)
  const evolutionsResult = Evolutions.parse(lines, baseStatsResult.fileIterator)
  const eggMovesResult = EggMoves.parse(lines, evolutionsResult.fileIterator)
  const levelUpLearnsetsResult = LevelUpLearnSets.parse(lines, eggMovesResult.fileIterator)
  const TMHMLearnsetsResult = TMHMLearnsets.parse(lines, levelUpLearnsetsResult.fileIterator)
  const TutorMovesResult = TutorMoves.parse(lines, TMHMLearnsetsResult.fileIterator)
  const formsResult = FormsSpecies.parse(lines, TutorMovesResult.fileIterator)

  const species: Specie[] = []
  baseStatsResult.baseStats.forEach((BaseStats, key) => {
    species.push({
      NAME: key,
      name: speciesNamesResult.names.get(key) || "undefined",
      baseStats: BaseStats,
      evolutions: evolutionsResult.evolutions.get(key) || [],
      eggMoves: eggMovesResult.eggMoves.get(key) || [],
      levelUpMoves: levelUpLearnsetsResult.levelLearnsets.get(key) || [],
      TMHMMoves: TMHMLearnsetsResult.tmhmLearnsets.get(key) || [],
      tutorMoves: TutorMovesResult.tutorMoves.get(key) || [],
      forms: formsResult.forms.get(key) || [],
      dex: pokePokedexResult.data.get(key) || {} as PokePokedex.PokePokedex,
    })
  })
  return species
}

export function getLegacySpecies(ROOT_PRJ: string, optionsGlobal_h: FileDataOptions, gameData: GameData): Promise<void> {
  if (VERSION_STRUCTURE == 3) {
    return getSpecies26(ROOT_PRJ, optionsGlobal_h, gameData)
  }

  return new Promise((resolve: () => void, reject) => {
    getMulFilesData(autojoinFilePath(ROOT_PRJ, [
      'src/data/pokemon/pokedex_text.h', //both goes together with entries
      'src/data/pokemon/pokedex_entries.h',
      'src/data/text/species_names.h',
      'src/data/pokemon/base_stats.h',
      'src/data/pokemon/evolution.h',
      'src/data/pokemon/egg_moves.h',
      'src/data/pokemon/level_up_learnsets.h', // order with pointers is important
      'src/data/pokemon/level_up_learnset_pointers.h',
      'src/data/pokemon/tmhm_learnsets.h',
      'src/data/pokemon/tutor_learnsets.h',
      'src/data/pokemon/form_species_tables.h',
      'src/data/pokemon/form_species_table_pointers.h',
      'src/data/graphics/pokemon.h',
      'src/data/pokemon_graphics/front_pic_table.h',
    ]), optionsGlobal_h)
      .then((pokeData) => {
        gameData.species = parse(pokeData)
        resolve()
      })
      .catch((reason) => {
        const err = 'Failed at gettings species reason: ' + reason
        reject(err)
      })
  })
}

function createEvoMapping(speciesList: SpeciesList): Map<SpeciesEnum, [Evolution[], string[]]> {
  const evoMap = new Map<SpeciesEnum, [Evolution[], string[]]>(speciesList.species.map<[SpeciesEnum, [Evolution[], string[]]]>(it => [it.id, [[], []]]))

  for (const species of speciesList.species) {
    const evos = evoMap.get(species.id)!![0]
    for (const evo of species.evo) {
      evos.push({
        kind: evo.gender ? "EVO_LEVEL_" + Species_Gender[evo.gender] : "EVO_LEVEL",
        specifier: evo.level.toString(),
        into: SpeciesEnum[evo.to],
      })
    }

    for (const mega of species.mega) {
      evoMap.get(mega.from)!![0].push({
        kind: mega.evoUsing.case === "move" ? "EVO_MOVE_MEGA_EVOLUTION" : "EVO_MEGA_EVOLUTION",
        specifier: mega.evoUsing.case === "move" ? MoveEnum[mega.evoUsing.value] : ItemEnum[mega.evoUsing.value || ItemEnum.ITEM_NONE],
        into: SpeciesEnum[species.id]
      })
    }

    for (const primal of species.primal) {
      evoMap.get(primal.from)!![0].push({
        kind: "EVO_PRIMAL_REVERSION",
        specifier: ItemEnum[primal.item],
        into: SpeciesEnum[species.id]
      })
    }

    if (species.formShiftOf) {
      evoMap.get(species.formShiftOf)!![1].push(SpeciesEnum[species.id])
    }
  }
  return evoMap
}

function getBaseSpecies(species: Species, speciesMap: Map<SpeciesEnum, Species>): Species_SpeciesDexInfo {
  if (!species.id) return create(Species_SpeciesDexInfoSchema)

  switch (species.baseSpeciesInfo.case) {
    case "dex":
      return species.baseSpeciesInfo.value
    case "formOf":
      return getBaseSpecies(speciesMap.get(species.baseSpeciesInfo.value)!!, speciesMap)
    default:
      throw `Species ${species.id} missing base species info`
  }
}

function getLearnsetMon(species: Species, speciesMap: Map<SpeciesEnum, Species>): Species {
  if (species.id === SpeciesEnum.SPECIES_NONE) return species
  if (species.learnsetOrRef.case === "learnset") return species
  if (species.learnsetOrRef.value) return getLearnsetMon(speciesMap.get(species.learnsetOrRef.value)!!, speciesMap)
  if (species.formShiftOf) return getLearnsetMon(speciesMap.get(species.formShiftOf)!!, speciesMap)
  if (species.mega.length) return getLearnsetMon(speciesMap.get(species.mega[0].from)!!, speciesMap)
  if (species.primal.length) return getLearnsetMon(speciesMap.get(species.primal[0].from)!!, speciesMap)
  if (!species.learnsetOrRef.value) return species
  return getLearnsetMon(speciesMap.get(species.learnsetOrRef.value)!!, speciesMap)
}

function getUniversalTutors(type: Species_Learnset_UniversalTutors, isGenderless: boolean): string[] {
  const tutors = ["MOVE_ENDURE", "MOVE_HELPING_HAND", "MOVE_PROTECT", "MOVE_REST", "MOVE_SLEEP_TALK", "MOVE_SUBSTITUTE"]
  if (type !== Species_Learnset_UniversalTutors.NO_ATTACKS) {
    tutors.push("MOVE_HIDDEN_POWER", "MOVE_SECRET_POWER", "MOVE_RETURN")
  }
  if (!isGenderless) {
    tutors.push("MOVE_ATTRACT")
  }
  return tutors
}

export function toSpeciesMap(speciesList: SpeciesList): Map<SpeciesEnum, Species> {
  return new Map(speciesList.species.map(it => [it.id, it]))
}

export function getSpecies(gameData: GameData) {
  const speciesList = readSpecies()
  const evoMap = createEvoMapping(speciesList)
  const speciesMap = toSpeciesMap(speciesList)

  gameData.species = []
  for (const species of speciesList.species) {
    if (!species.id || species.id === SpeciesEnum.SPECIES_EGG || species.randomizerBanned === Species_RandomizeBanned.SPECIES_HIDDEN) continue

    const baseSpeciesInfo = getBaseSpecies(species, speciesMap)

    const learnsetSpecies = getLearnsetMon(species, speciesMap)
    const learnset = learnsetSpecies.learnsetOrRef.value as Species_Learnset || create(Species_LearnsetSchema)

    let name = species.baseSpeciesInfo.case === "dex" ? species.baseSpeciesInfo.value.name : ""
    name = name || species.longName
    if (!name && species.mega.length) {
      name = `${baseSpeciesInfo.name} ${Xtox("", Species_MegaEvolution_MegaType[species.mega[0].type].replace("_UNSPECIFIED", ""))}`
    }
    if (!name && species.primal.length) {
      name = `${baseSpeciesInfo.name} ${Xtox("", Species_PrimalEvolution_PrimalType[species.primal[0].type])}`
    }
    if (!name) name = Xtox("SPECIES_", SpeciesEnum[species.id])

    gameData.species.push({
      NAME: SpeciesEnum[species.id],
      name: name,
      baseStats: {
        baseHP: species.hp,
        baseAttack: species.atk,
        baseDefense: species.def,
        baseSpeed: species.spe,
        baseSpAttack: species.spatk,
        baseSpDefense: species.spdef,
        types: [Xtox('', Type[species.type]), Xtox('', Type[species.type2 ? species.type2 : species.type])],
        catchRate: 0,
        expYield: 0,
        evYield_HP: 0,
        evYield_Attack: 0,
        evYield_Defense: 0,
        evYield_Speed: 0,
        evYield_SpAttack: 0,
        evYield_SpDefense: 0,
        items: [],
        genderRatio: species.gender.case === "genderless" ? 255 : Math.floor(254 * (species.gender.value || 0)),
        eggCycles: 0,
        friendship: 0,
        growthRate: '',
        eggGroup: [baseSpeciesInfo.eggGroup, baseSpeciesInfo.eggGroup2].filter(it => it != EggGroup.EGG_GROUP_NONE).map(it => "EGG_GROUP_" + EggGroup[it]),
        abilities: species.ability.map(it => AbilityEnum[it]),
        innates: species.innate.map(it => AbilityEnum[it]),
        bodyColor: BodyColor[baseSpeciesInfo.bodyColor || BodyColor.RED],
        noFlip: species.noFlip,
        flags: species.heads === 3 ? "F_THREE_HEADED" : species.heads === 2 ? "F_TWO_HEADED" : ""
      },
      evolutions: evoMap.get(species.id)!![0],
      eggMoves: [],
      levelUpMoves: learnset.level.flatMap(levelGroup => levelGroup.move.map<LevelUpLearnSets.LevelUpMove>(it => { return { level: levelGroup.level, move: MoveEnum[it] } })),
      tutorMoves: learnset.tutor.map(it => MoveEnum[it]).concat(...getUniversalTutors(learnset.universalTutors, species.gender.case === "genderless")),
      TMHMMoves: [],
      forms: evoMap.get(species.id)!![1],
      dex: {
        id: baseSpeciesInfo.nationalDexNum,
        desc: baseSpeciesInfo.description,
        hw: [baseSpeciesInfo.height, baseSpeciesInfo.weight]
      },
    })

    gameData.species[gameData.species.length - 1].tutorMoves.sort()
  }
}
