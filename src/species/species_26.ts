import { GameData } from "../main";
import { autojoinFilePath, FileDataOptions, getMulFilesData } from "../utils";
import { Specie } from "./species";

import { regexGrabStr } from "../parse_utils"

export interface Result {
    fileIterator: number,
    data: Map<string, Specie>,  //SPECIE_ as key
}


function initPokedata(): Specie {
    const _x: Specie = {
        NAME: "",
        name: "",
        baseStats: {
            baseHP: 0,
            baseAttack: 0,
            baseDefense: 0,
            baseSpeed: 0,
            baseSpAttack: 0,
            baseSpDefense: 0,
            types: [],
            catchRate: 0,
            expYield: 0,
            evYield_HP: 0,
            evYield_Attack: 0,
            evYield_Defense: 0,
            evYield_Speed: 0,
            evYield_SpAttack: 0,
            evYield_SpDefense: 0,
            items: [],
            genderRatio: 0,
            eggCycles: 0,
            friendship: 0,
            growthRate: "",
            eggGroup: [],
            abilities: [],
            innates: [],
            bodyColor: "",
            noFlip: false,
            flags: ""
        },
        evolutions: [],
        eggMoves: [],
        levelUpMoves: [],
        tutorMoves: [],
        TMHMMoves: [],
        forms: [],
        dex: {
            id: 0,
            desc: "",
            hw: [0, 0]
        },
    }
    return _x
}
interface Context {
    dataCollection: Map<string, Specie>
    dexID: number,
    current: Specie,
    currentKey: string,
    execFlag: string,
    stopRead: boolean,
}
function initContext(): Context {
    return {
        dataCollection: new Map(),
        dexID: 0,
        current: initPokedata(),
        currentKey: "",
        execFlag: "looking",
        stopRead: false
    }
}
/**
 * const u8 *const name;
    const u8 *const longName;
    const u8 *const icon;
    const u8 *const femaleIcon;
    const Evolution *const evos; // TODO
    const Evolution *const formShifts; // TODO
    const u16 *const forms; // TODO
    const LevelUpMove *const levelUpMoves;
    const TutorUnion tutors; // TODO
    const MonCoords frontCoords;
    const MonCoords backCoords;
    const CompressedSpriteSheet frontPic;
    const CompressedSpriteSheet frontPicFemale;
    const AnimCmd *const *const frontAnim; // TODO
    const CompressedSpriteSheet backPic;
    const CompressedSpriteSheet backPicFemale;
    const CompressedSpritePalette palette;
    const CompressedSpritePalette paletteFemale;
    const CompressedSpritePalette shinyPalette;
    const CompressedSpritePalette shinyPaletteFemale;
    const CompressedSpritePalette shinyPaletteRare;
    const CompressedSpritePalette shinyPaletteLegendary;
    u16 abilities[NUM_ABILITY_SLOTS];
    u16 innates[NUM_INNATE_PER_SPECIES];
    u16 expYield;
    u16 item1;
    u16 item2;
    u16 shopPrice;
    u16 tier;
    u16 hoennDexNum;
    u16 nationalDexNum;
    u16 evYield_HP:2;
    u16 evYield_Attack:2;
    u16 evYield_Defense:2;
    u16 evYield_Speed:2;
    u16 evYield_SpAttack:2;
    u16 evYield_SpDefense:2;
    u16 numShinies:2;  // 1 if it has a rare, 2 if it has legendary, 3 if it has both
    NumHeads heads:2;
    u16 bodyColor:7;
    u16 noFlip:1;
    u16 isLegendary:1;
    u16 randomizerBanned:1;
    u16 hasWildVariants:1;
    MegaType mega:3;
    VariantType variant:3;
    u8 genderRatio;
    u8 baseHP;
    u8 baseAttack;
    u8 baseDefense;
    u8 baseSpeed;
    u8 baseSpAttack;
    u8 baseSpDefense;
    u8 type1;
    u8 type2;
    u8 catchRate;
    u8 eggCycles;
    u8 friendship;
    u8 growthRate;
    u8 eggGroup1;
    u8 eggGroup2;
    u8 safariZoneFleeRate;
    u8 iconPalette;
    u8 femaleIconPalette;
    u8 frontAnimId;
    u8 backAnimId;
 */
const executionMap: { [key: string]: (line: string, context: Context) => void } = {
    "looking": (line, context) => {
        if (line.match("SPECIES_DATA_STRUCT")) {
            context.execFlag = "start"
            if (context.currentKey) {
                context.dataCollection.set(context.currentKey, context.current)
                context.current = initPokedata()
            }
            context.currentKey = regexGrabStr(line.replace(/\s/g, ''), /(?<=SPECIES_DATA_STRUCT\()\w+/)
        }
    },
    "start": (line, context) => {
        line = line.replace(/\s/g, '')
        if (!line) return
        if (line.match(";")) {
            context.execFlag = "looking"
            return
        }
        // grab some data
        if (line.match(".name"))
            console.log(line)
        if (line.match(/\.name(\s=)/)) {
            console.log(line)
            context.current.name = regexGrabStr(line, /(?<=$\(\")[^\"]+/)
        }
    },

}


function parse(lines: string[], fileIterator: number): Result {
    const lineLen = lines.length
    const context = initContext()
    for (; fileIterator < lineLen; fileIterator++) {
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
    }
    return {
        fileIterator: fileIterator,
        data: context.dataCollection
    }
}



export function getSpecies26(ROOT_PRJ: string, optionsGlobal_h: FileDataOptions, gameData: GameData): Promise<void> {
    return new Promise((resolve: () => void, reject) => {
        getMulFilesData(autojoinFilePath(ROOT_PRJ, [
            'src/data/pokemon/species_data_gen1.h',
            'src/data/pokemon/species_data_gen2.h',
            'src/data/pokemon/species_data_gen3.h',
            'src/data/pokemon/species_data_gen4.h',
            'src/data/pokemon/species_data_gen5.h',
            'src/data/pokemon/species_data_gen6.h',
            'src/data/pokemon/species_data_gen7.h',
            'src/data/pokemon/species_data_gen8.h',
            'src/data/pokemon/species_data_gen9.h',
        ]), optionsGlobal_h)
            .then((pokeData) => {
                const data = parse(pokeData.split('\n'), 0).data
                gameData.species = []
                data.forEach((pdata, key) => {
                    console.log(key, pdata.name)
                })
                resolve()
            })
            .catch((reason) => {
                const err = 'Failed at gettings species reason: ' + reason
                reject(err)
            })
    })
}