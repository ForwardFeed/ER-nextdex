import * as FS from 'fs'
import * as Path from 'path'

import {getFileData, getMulFilesData,autojoinFilePath, FileDataOptions} from './utils';
import * as Moves from './moves'
import * as Species from './species/species'
import * as Abilities from './abilities'
import * as Sprites from './sprites'
import * as Locations from './locations'
import * as Trainers from './trainers/trainers'
import * as SpeciesScripted from './species_scripted'

import * as Additionnal from './additional_data/additional'

import { CompactGameData, compactify } from './compactify';

const ROOT_PRJ = "/media/notalinux/_dev_sdb3/Website/reduxelite" // you already know how well organized i am

export interface GameData {
    species: Species.Specie[]
    abilities: Map<string, Abilities.Ability>
    moves:Map<string, Moves.Move>,
    locations: Locations.Locations
    trainers: Trainers.Trainer[]
    speciesScripted: SpeciesScripted.SpeciesScripted[]
}

const gameData: GameData = {
    species: [] as Species.Specie[],
    abilities: new Map(),
    moves: new Map(),
    locations: {} as Locations.Locations,
    trainers: [] as Trainers.Trainer[],
    speciesScripted: [] as SpeciesScripted.SpeciesScripted[],
}

function main(){
    const OUTPUT_VERSION = process.argv[2] ? "V" + process.argv[2] : ""
    const OUTPUT = `./dist/gameData${OUTPUT_VERSION}.json`
    const OUTPUT_ADDITIONNAL = `./dist/additional${OUTPUT_VERSION}.json`
    getFileData(Path.join(ROOT_PRJ, 'include/global.h'), {filterComments: true, filterMacros: true, macros: new Map()})
    .then((global_h) => {
        const optionsGlobal_h = {
            filterComments: true,
            filterMacros: true,
            macros: global_h.macros
        }
        if (process.argv[2] === "sprites"){
            const OUTPUT_SPRITES = Path.join(__dirname, "sprites/")
            Sprites.getSprites(ROOT_PRJ, optionsGlobal_h, OUTPUT_SPRITES)
                .then(()=>{
                    console.log('Successfully copied the sprites')
                })
                .catch((err)=>{
                    console.error('error while trying to catch sprites ' + err)
                })
        } else {
            const promiseArray: Array<Promise<unknown>> = []
            promiseArray.push(Species.getSpecies(ROOT_PRJ, optionsGlobal_h, gameData))
            promiseArray.push(Moves.getMoves(ROOT_PRJ, optionsGlobal_h, gameData))
            promiseArray.push(Abilities.getAbilities(ROOT_PRJ, optionsGlobal_h, gameData))
            promiseArray.push(Locations.getLocations(ROOT_PRJ, gameData))
            promiseArray.push(Trainers.getTrainers(ROOT_PRJ, gameData))
            promiseArray.push(SpeciesScripted.parse(ROOT_PRJ, gameData))
            //promiseArray.push()
            Promise.allSettled(promiseArray)
                .then((values)=>{
                    values.map((x)=>{
                        if (x.status !== "fulfilled") return
                        const result = x.value
                        if (typeof result !== "object") return

                    })
                    Additionnal.getAdditionnalData(ROOT_PRJ, OUTPUT_ADDITIONNAL, gameData)
                    outputGameData(compactify(gameData), OUTPUT)
                })
                .catch((err)=>{
                    console.error(`Something went wrong parsing the data: ${err}`)
                })
        }
        
    })
    .catch((reason) => {
        const err = 'Failed at gettings global.h reason: ' + reason
        console.error(err)
    })
}

function outputGameData(gameData: GameData | CompactGameData, output: string){
    const dataTowrite = JSON.stringify(gameData)
    FS.writeFile(output, dataTowrite , (err_exist)=>{
        if (err_exist){
            console.error(`couldn't write the gamedata output to ${output}`)
        }
    })
}





main()

/**
size list of all read files in bash
    BASE="/media/notalinux/_dev_sdb3/Website/reduxelite/"
    a=("include/global.h"
    "src/data/graphics/pokemon.h"
    "src/data/pokemon_graphics/front_pic_table.h"
    "src/data/text/abilities.h"
    "src/data/text/species_names.h"
    "src/data/pokemon/base_stats.h"
    "src/data/pokemon/evolution.h"
    "src/data/pokemon/egg_moves.h"
    "src/data/pokemon/level_up_learnsets.h"
    "src/data/pokemon/level_up_learnset_pointers.h"
    "src/data/pokemon/tmhm_learnsets.h"
    "src/data/pokemon/tutor_learnsets.h"
    "src/data/pokemon/form_species_tables.h"
    "src/data/pokemon/form_species_table_pointers.h"
    "src/data/graphics/pokemon.h"
    "src/data/pokemon_graphics/front_pic_table.h"
    "src/data/wild_encounters.json"
    "include/constants/battle_config.h"
    "src/data/battle_moves.h"
    "src/data/text/move_descriptions.h"
    "src/data/text/move_names.h",
    "src/data/trainer_parties.h")
    b=()
    for x in ${a[@]}; do b+=($(du -c ${BASE}${x} | tail -1 | cut -f 1)); done
    sum=0
    for x in ${b[@]}; do sum=$((sum + x)) ;done
    echo "Total size is ${sum} KB"
*/