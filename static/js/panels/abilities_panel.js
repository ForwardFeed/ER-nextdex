import { queryFilter } from "../filters.js"
import { gameData } from "../data_version.js"
import { AisInB } from "../utils.js"

export const queryMapAbilities = {
    "name": (queryData, ability) => {
        if ((AisInB(queryData, ability.name.toLowerCase())) ||
        (AisInB(queryData, ability.desc.toLowerCase()))){
            return ability.name
        }  else {
            return false
        }
    },
    "ability": (queryData, ability) => {
        if ((AisInB(queryData, ability.name.toLowerCase())) ||
        (AisInB(queryData, ability.desc.toLowerCase()))){
            return ability.name
        }  else {
            return false
        }
    }
}

export function updateAbilities(searchQuery){
    const abis = gameData.abilities
    const nodeList = $('#abis-list').children()
    
    if (!searchQuery) return
    let colorID = 0 //to continue to repeat good color pattern
    for (const i in abis){
        if (i == 0 ) continue
        const abi = abis[i]
        const node = nodeList.eq(i - 1)
        if (queryFilter(searchQuery, abi, queryMapAbilities)){
                node.children().eq(0)[0].className = "abi-name color" + (colorID % 2 ? "A" : "B")
                node.children().eq(1)[0].className = "abi-desc color" + (colorID % 2 ? "C" : "D")
                colorID++
                node.show()
        } else {
                node.hide()
        }
    }
}