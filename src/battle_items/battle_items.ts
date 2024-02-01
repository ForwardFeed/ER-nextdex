import { FileDataOptions, getMulFilesData, autojoinFilePath } from '../utils'
import { GameData } from '../main'

export interface BattleItem {
    NAME: string,
    name: string,
    desc: string,

}
/*
function parse(pokeData: string): BattleItem[]{
    const lines = pokeData.split('\n')
    const speciesNamesResult = SpeciesNames.parse(lines,0)
    const baseStatsResult = BaseStats.parse(lines, speciesNamesResult.fileIterator)

    const Species: BattleItem[] = []
    baseStatsResult.baseStats.forEach((BaseStats, key)=>{
        Species.push({
            NAME: key,
            name: speciesNamesResult.names.get(key) || "undefined",
            baseStats: BaseStats,
            evolutions: evolutionsResult.evolutions.get(key) || [],
            eggMoves: eggMovesResult.eggMoves.get(key) || [],
            levelUpMoves: levelUpLearnsetsResult.levelLearnsets.get(key) || [],
            TMHMMoves: TMHMLearnsetsResult.tmhmLearnsets.get(key) || [],
            tutorMoves: TutorMovesResult.tutorMoves.get(key) || [],
            forms: formsResult.forms.get(key) || [],
        })
    })
    return Species
}

export function getSpecies(ROOT_PRJ: string, optionsGlobal_h: FileDataOptions, gameData: GameData): Promise<void>{
    return new Promise((resolve: ()=>void, reject)=>{
        getMulFilesData(autojoinFilePath(ROOT_PRJ, [//'src/data/pokemon/pokedex_entries.h', //will do later
                                                //'src/data/pokemon/pokedex_text.h', //both goes together with entries
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
        .then((pokeData)=>{
            gameData.species = parse(pokeData)
            resolve()
        })
        .catch((reason)=>{
            const err = 'Failed at gettings species reason: ' + reason
            reject(err)
        })
    })
}


export function getItems(){
    /** './data/text/item_descriptions.h'
     * sDummyDesc
     * const u8 .description^
     * 
     */
    /** 'src/data/items.h' 
     * gItems
     * => .name
     * => .holdEffect //if this isn't set then it's not a battle item
     * => .description
     * ;
     */

    /** 'src/data/item_icon_table.h'
     * gItemIconTable
     *  => gItemIcon
     * ;
     * ./data/graphics/items.h
     *  gItemIcon_Item => INBIN graphics/items/icons/ item.png
}
*/