import { query } from "./search.js"

export function updateAbilities(searchQuery){
    const abis = gameData.abilities
    const nodeList = $('#abis-list').children()
    const queryMap = {
        "name": (queryData, ability) => {
            return ability.name.toLowerCase().indexOf(queryData) >= 0 ? true : false
        }
    }
    for (const i in abis){
        if (i == 0 ) continue
        const abi = abis[i]
        const node = nodeList.eq(i - 1)
        if (query(searchQuery, abi, queryMap)){
                node.show()
        } else {
                node.hide()
        }
    }
}