import { FileDataOptions, getMulFilesData, autojoinFilePath } from '../utils'
import { GameData } from '../main'

import * as ItemData from './items_data'
import * as ItemDesc from './items_descriptions'

export interface BattleItem {
    name: string,
    desc: string,
}

function parse(pokeData: string): Map<string, BattleItem>{
    const lines = pokeData.split('\n')
    const itemDataResult = ItemData.parse(lines,0)
    const itemDescResult = ItemDesc.parse(lines, itemDataResult.fileIterator)
    const items: Map<string, BattleItem> = new Map()
    itemDataResult.data.forEach((item, key)=>{
        items.set(key, {
            name: item.name,
            desc: itemDescResult.data.get(item.descPtr) || "No description?"
        })
    })
    return items
}



export function getItems(ROOT_PRJ: string, gameData: GameData): Promise<void>{
    return new Promise((resolve: ()=>void, reject)=>{
        getMulFilesData(autojoinFilePath(ROOT_PRJ, [
            'src/data/items.h',
            'src/data/text/item_descriptions.h',
        ])).then((itemsData)=>{
            gameData.battleItems = parse(itemsData)
            resolve()
        })
        .catch((reason)=>{
            const err = 'Failed at gettings species reason: ' + reason
            reject(err)
        })
    })
}
        
