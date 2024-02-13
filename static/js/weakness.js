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
const IMMUNE = 0
const RESIST = 1
const WEAK = 2

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
/**
 * 
 * @param {string[]} defTypes 
 * @param {string[]} abilities 
 */
export function getDefensiveCoverage(defTypes, abis){
    const modifiers = abilityModifiesTypeChart(abis)
    const defensiveCoverage = []
    for (const AtkT of gameData.typeT){
        let typeEffectiveness = 1
        if (modifiers[0].indexOf(AtkT) != -1) {
            typeEffectiveness = 0
            defensiveCoverage.push(typeEffectiveness)
            continue
        }
        if (modifiers[1].indexOf(AtkT) != -1) {
            typeEffectiveness = 1
        }
        if (modifiers[2].indexOf(AtkT) != -1) {
            typeEffectiveness = 0.5
        }
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

const abilityThatAddsImmunity = {
    "Flash Fire": ["Fire"],
    "Sap Sipper": ["Grass"],
    "Volt Absorb": ["Electric"],
    "Water Absorb": ["Water"],
    "Immunity": ["Poison"],
    "Wonder Guard": [], //Find a way to put it
    "Lightning Rod": ["Electric"]
}

const abilityThatAddsNormal = {
    "Gifted Mind": typeChart.Psychic[WEAK],
}

const abilityThatAddsResist = {
    "Sea Weed": ["Fire"],
    "Thick Fat": ["Fire", "Ice"],

}

function abilityModifiesTypeChart(abis){
    abis = abis.map(x => gameData.abilities[x].name)
    const modifiers = [
        [],
        [],
        [],
    ]
    for (const abi of abis){
        const addedImunity = abilityThatAddsImmunity[abi]
        if (addedImunity) modifiers[0].push(...addedImunity)
        const addedNormal = abilityThatAddsNormal[abi]
        if (addedNormal) modifiers[1].push(...addedNormal)
        const addedResist = abilityThatAddsResist[abi]
        if (addedResist) modifiers[2].push(...addedResist)
    }
    return modifiers
}

/**
 * 
 */
export function getOffensiveCoverage(){

}