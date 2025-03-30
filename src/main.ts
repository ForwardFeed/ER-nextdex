import * as FS from 'fs'
import * as Path from 'path'

import {getFileData} from './utils';
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
import { getTrainerOrder } from './trainers/trainer_ordering';
import { parseArguments, ParsedValues } from './arguments';
import { comparifyMultiple } from './comparify';
//import { comparify } from './comparify';


export interface GameData {
    species: Species.Specie[]
    abilities: Map<string, Abilities.Ability>
    moves:Map<string, Moves.Move>,
    locations: Locations.Locations
    trainers: Map<string, Trainers.Trainer>
    dataScripted: ScriptedData.Result[]
    mapTable: string[], 
    battleItems: Map<string, BattleItems.BattleItem>
    speciesInternalID: Map<string, number>,
    movesInternalID: Map<string, number>,
    trainerOrder: string[]
}

const gameData: GameData = {
    species: [] as Species.Specie[],
    abilities: new Map(),
    moves: new Map(),
    locations: {} as Locations.Locations,
    trainers: new Map(),
    dataScripted: [],
    mapTable: [],
    battleItems: new Map(),
    speciesInternalID: new Map(),
    movesInternalID: new Map(),
    trainerOrder: [],
}
/**Because code structure can change, the way of parsing it is thus 
 * mutable
 * There is no safeguard whatsoever on how what version correspond to what
 * which i understand isn't ideal yet it work sufficiently for now and the near future
 */
export let VERSION_STRUCTURE = 0

export function main(configuration: Configuration.Configuration, optionsValues: ParsedValues){
    const rootPrj = optionsValues.inputPath ? optionsValues.inputPath : configuration.project_root
    const outputDir = optionsValues.redirectData ? Path.join("./static/js/data/") : Path.join("./out/")
    const outputVersion = optionsValues.output ? "V" + optionsValues.output : ""
    VERSION_STRUCTURE = optionsValues.structureVersion
    const outputPath = Path.join(outputDir, `gameData${outputVersion}.json`)
    const outputAdditionnal = Path.join(outputDir, `additional${outputVersion}.json`)
    getFileData(Path.join(rootPrj, 'include/global.h'), {filterComments: true, filterMacros: true, macros: new Map()})
    .then((global_h) => {
        const optionsGlobal_h = {
            filterComments: true,
            filterMacros: true,
            macros: global_h.macros
        }
        if (optionsValues.comparify.length){
            comparifyMultiple(optionsValues.comparify, optionsValues, optionsValues.comparifyAdditional)
        }
        else if (optionsValues.spritesOnly){
            const OUTPUT_SPRITES = Path.join(outputDir, "sprites/")
            const OUTPUT_PALETTES  =  Path.join(outputDir, "palettes/")
            if (!FS.existsSync(OUTPUT_SPRITES))FS.mkdirSync(OUTPUT_SPRITES)
            if (!FS.existsSync(OUTPUT_PALETTES))FS.mkdirSync(OUTPUT_PALETTES)
            Sprites.getSprites(rootPrj, optionsGlobal_h, OUTPUT_SPRITES, OUTPUT_PALETTES)
                .then(()=>{
                    console.log('Successfully copied the sprites')
                })
                .catch((err)=>{
                    console.error('error while trying to catch sprites ' + err)
                })
        } else {
            const promiseArray: Array<Promise<unknown>> = []
            promiseArray.push(Species.getSpecies(rootPrj, optionsGlobal_h, gameData))
            promiseArray.push(Moves.getMoves(gameData))
            promiseArray.push(Abilities.getAbilities(rootPrj, optionsGlobal_h, gameData))
            promiseArray.push(Locations.getLocations(rootPrj, gameData))
            promiseArray.push(Trainers.getTrainers(rootPrj, gameData))
            promiseArray.push(ScriptedData.parse(rootPrj, gameData))
            promiseArray.push(BattleItems.getItems(rootPrj, gameData))
            promiseArray.push(InternalID.getSpeciesInternalID(rootPrj, gameData))
            promiseArray.push(InternalID.getMovesInternalID(rootPrj, gameData))
            promiseArray.push(getTrainerOrder(gameData))
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
                    Additionnal.getAdditionnalData(rootPrj, outputAdditionnal, gameData)
                    outputGameData(compactify(gameData), outputPath)
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
const parsedValues = parseArguments(process.argv)
if (!parsedValues.noConfig && !configuration.verified){
    Configuration.verifyConfiguration(configuration)
        .then(()=>{
            configuration.verified = true
            Configuration.saveConfigFile(configuration)
            main(configuration, parsedValues)
        })
        .catch(()=>{
            console.error('Please verify the configuration')
        })
} else {
    main(configuration, parsedValues)
}
