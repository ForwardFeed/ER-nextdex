import { queryFilter } from "./search.js"
import { gameData } from "./data_version.js"

export function updateAbilities(searchQuery){
    const abis = gameData.abilities
    const nodeList = $('#abis-list').children()
    const queryMap = {
        "name": (queryData, ability) => {
            return ability.name.toLowerCase().indexOf(queryData) >= 0 ? true : false
        },
        "ability": (queryData, ability) => {
            return ability.name.includes(queryData) 
        }
    }
    if (!searchQuery) return
    for (const i in abis){
        if (i == 0 ) continue
        const abi = abis[i]
        const node = nodeList.eq(i - 1)
        if (queryFilter(searchQuery, abi, queryMap)){
                node.show()
        } else {
                node.hide()
        }
    }
}