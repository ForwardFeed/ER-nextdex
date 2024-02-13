/**
 * this file will be to calculate the weaknesses of pokemon
 * I need to add this before i create the team builder tab (I will create a behind the back tab with the species)
 */

import { gameData } from "./data_version.js"

/**
 * {
 * "Type": [
 *      string[] => types No effect
 *      string[] => types resist
 *      string[] => types vulnerability
 * ]
 * }
 */
const typeChart = {
    "Normal": [["Ghost"],
        [],
        ["Fighting"]
    ],
    "Fighting": [[],
        ["Bug", "Rock", "Dark"],
        ["Flying", "Psychic", "Fairy"]
    ],
    "Fire": [[],
        ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"],
        ["Water", "Ground", "Rock"]
    ],
    "Ice": [[],
        ["Ice"],
        ["Fire", "Fighting", "Rock", "Steel"]
    ],
    "Electric": [[],
        ["Electric", "Flying", "Steel"],
        ["Ground"]
    ],
    "Bug": [[],
        ["Grass", "Fighting", "Ground"],
        ["Fire", "Rock", "Flying"]
    ],
    "Flying": [["Ground"],
        ["Grass", "Fighting", "Bug"],
        ["Electric", "Ice", "Rock"]
    ],
    "Steel": [["Poison"],
        ["Normal", "Grass", "Ice", "Flying", "Psychic", "Bug", "Rock", "Dragon", "Steel", "Fairy"],
        ["Fire", "Fighting", "Ground"]
    ],
    "Grass": [[],
        ["Water", "Electric", "Grass", "Ground"],
        ["Fire", "Ice", "Poison", "Flying", "Bug"]
    ],
    "Ground": [["Electric"],
        ["Poison", "Rock"],
        ["Water", "Grass", "Ice"]
    ],
    "Poison": [[],
        ["Grass", "Fighting", "Poison", "Bug", "Fairy"],
        ["Ground", "Psychic"]
    ],
    "Dark": [["Psychic"],
        ["Ghost", "Dark"],
        ["Fighting", "Bug", "Fairy"]
    ],
    "Water": [[],
        ["Fire", "Water", "Ice", "Steel"],
        ["Electric", "Grass"]
    ],
    "Psychic": [[],
        ["Fighting", "Psychic"],
        ["Ghost", "Bug", "Dark"]
    ],
    "Rock": [[],
        ["Normal", "Fire", "Poison", "Flying"],
        ["Water", "Grass", "Fighting", "Ground", "Steel"]
    ],
    "Dragon": [[],
        ["Fire", "Water", "Electric", "Grass"],
        ["Ice", "Dragon", "Fairy"]
    ],
    "Ghost": [["Normal", "Fighting"],
        ["Bug", "Poison"],
        ["Dark", "Ghost"]
    ],
    "Fairy": [["Dragon"],
        ["Fighting", "Bug", "Dark"],
        ["Poison", "Steel"]
    ]
}
export function getTypeEffectiveness(attackerT, defT){
    let xRange = [0,0.5,2]
    let i = 0
    for (const typeDef of typeChart[defT]){
        if (typeDef.indexOf(attackerT) != -1) return xRange[i]
        i++
    }
    return 1
}

export function checkTypos(types){
    const keys = Object.keys(typeChart)
    for (const key of keys){
        for (const weaknesses of typeChart[key]){
            for (const type of weaknesses){
                if (types.indexOf(type) == -1){
                    console.warn(`Detected Typo in ${key}, as ${type}`)
                }
            }
        }
    }
}
const abilityAddingType = {
    "Phantom": "Ghost",
    "Metallic": "Steel",
    "Dragonfly": "Dragon",
    "Half Drake": "Dragon",
    "Ice Age": "Ice",
    "Grounded": "Ground",
    "Aquatic": "Water",
    "Turboblaze": "Fire",
    "Teravolt": "Electric",
}

export function abilitiesToAddedType(abis){
    for (const abi of abis){
        const addedType = abilityAddingType[gameData.abilities[abi].name]
        if (addedType) return gameData.typeT.indexOf(addedType)
    }
    return undefined
}

const abiltyModifyTypeChart = {
    "Gifted Mind" : (atkT, defT) => {
        if (defT === "Psychic"  && typeChart[Psychic][2].indexOf(atkT) !== 1){
            return 1
        }
    },
    "Flash Fire": (atkT, defT) => {
        if (atkT === "Fire") return 0
    },
    "Sea Weed": (atkT, defT) => {
        if (atkT === "Fire") return 0.5
    },
    /*
    "Overwhelm": (atkT, defT) => {
        if (atkT === "Dragon") return 0.5
    },*/
    /*
    "Raw Wood": (atkT, defT) => {
        if (atkT === "Grass") return 0.5
    },*/
    /*"Molten Down": (atkT, defT) => {
        if (defT)
    }*/
}

/**
 * 
 * @param {string[]} defTypes 
 * @param {string[]} abilities 
 */
export function getDefensiveCoverage(defTypes){
    const defensiveCoverage = []
    for (const AtkT of gameData.typeT){
        let typeEffectiveness = 1
        for (const defT of defTypes){
            typeEffectiveness *= getTypeEffectiveness(AtkT, defT)
        }
        defensiveCoverage.push(typeEffectiveness)
    }
    
    const defensiveCoverageSorted = {}

    gameData.typeT.forEach((type, index)=>{
        //console.log(`${type} has effectiveness : ${defensiveCoverage[index]}`)
        const eff = defensiveCoverage[index]
        if (defensiveCoverageSorted[eff]){
            defensiveCoverageSorted[eff].push(type)
        } else {
            defensiveCoverageSorted[eff] = [type]
        }
    })
    return defensiveCoverageSorted
}

/**
 * 
 */
export function getOffensiveCoverage(){

}