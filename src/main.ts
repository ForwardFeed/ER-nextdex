import * as FS from 'fs'
import * as Path from 'path'

import {getFileData, getMulFilesData,autojoinFilePath, FileDataOptions} from './utils';
import * as Moves from './moves'
import * as Species from './species/species'
import * as Abilities from './abilities'
import * as Sprites from './sprites'
import * as Locations from './locations'
import * as Trainers from './trainers/trainers'
import * as ScriptedData from './scripted_data'
import * as BattleItems from './battle_items/battle_items'
import * as Additionnal from './additional_data/additional'
import * as InternalID from './internal_id'
import { CompactGameData, compactify } from './compactify';
import * as Configuration from './configuration';
import { comparify } from './comparify';


export interface GameData {
    species: Species.Specie[]
    abilities: Map<string, Abilities.Ability>
    moves:Map<string, Moves.Move>,
    locations: Locations.Locations
    trainers: Map<string, Trainers.Trainer>
    speciesScripted: Map<string, ScriptedData.SpeciesScripted[]>
    trainersScripted: Map<string, ScriptedData.TrainersScriped>
    mapTable: string[], 
    battleItems: Map<string, BattleItems.BattleItem>
    speciesInternalID: Map<string, number>,
    movesInternalID: Map<string, number>,
}

const gameData: GameData = {
    species: [] as Species.Specie[],
    abilities: new Map(),
    moves: new Map(),
    locations: {} as Locations.Locations,
    trainers: new Map(),
    speciesScripted: new Map(),
    trainersScripted: new Map(),
    mapTable: [],
    battleItems: new Map(),
    speciesInternalID: new Map(),
    movesInternalID: new Map(),
}

function main(configuration: Configuration.Configuration){
    const ROOT_PRJ = configuration.project_root
    const OUTPUT_VERSION = process.argv[2] ? "V" + process.argv[2] : ""
    const OUTPUT = `./out/gameData${OUTPUT_VERSION}.json`
    const OUTPUT_ADDITIONNAL = `./out/additional${OUTPUT_VERSION}.json`
    comparify('./out/gameDataVAlpha.json', './out/gameDataV1.6.1.json')
        .then((x)=>{console.log(JSON.stringify(x))})
        .catch((e)=>{console.error(e)})
    return
    getFileData(Path.join(ROOT_PRJ, 'include/global.h'), {filterComments: true, filterMacros: true, macros: new Map()})
    .then((global_h) => {
        const optionsGlobal_h = {
            filterComments: true,
            filterMacros: true,
            macros: global_h.macros
        }
        if (process.argv[2] === "sprites"){
            const OUTPUT_SPRITES = Path.join("./out", "sprites/")
            const OUTPUT_PALETTES  = "./out/palettes/"
            if (!FS.existsSync(OUTPUT_SPRITES))FS.mkdirSync(OUTPUT_SPRITES)
            if (!FS.existsSync(OUTPUT_PALETTES))FS.mkdirSync(OUTPUT_PALETTES)
            
            Sprites.getSprites(ROOT_PRJ, optionsGlobal_h, OUTPUT_SPRITES, OUTPUT_PALETTES)
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
            promiseArray.push(ScriptedData.parse(ROOT_PRJ, gameData))
            promiseArray.push(BattleItems.getItems(ROOT_PRJ, gameData))
            promiseArray.push(InternalID.getSpeciesInternalID(ROOT_PRJ, gameData))
            promiseArray.push(InternalID.getMovesInternalID(ROOT_PRJ, gameData))
            //promiseArray.push()
            Promise.allSettled(promiseArray)
                .then((values)=>{
                    values.map((x)=>{
                        if (x.status !== "fulfilled") {
                            console.error(`Something went wrong parsing the data: ${x.reason}`)
                            return
                        }
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




let configuration = Configuration.getConfiguration()
if (!configuration){
    configuration = Configuration.writeDefaultConfiguration()
}
if (!configuration.verified){
    Configuration.verifyConfiguration(configuration)
        .then(()=>{
            configuration.verified = true
            Configuration.saveConfigFile(configuration)
            main(configuration)
        })
        .catch(()=>{
            console.error('Please verify the configuration')
        })
} else {
    main(configuration)
}
