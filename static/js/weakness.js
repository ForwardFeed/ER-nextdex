import { gameData } from "./data_version.js"

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

function checkTypos(types){
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
    "Fairy Tale": "Fairy", //TODO ADD IT TO THE CALC TOO
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
export function getDefensiveCoverage(specie, abiID){
    const abisID = [specie.stats.abis[abiID], ...specie.stats.inns].filter(x => x)
    const abiNames = abisID.map(x => gameData.abilities[x].name)
    const defTypes = [...new Set(specie.stats.types), abilitiesToAddedType(abisID)]
        .filter(x => x != undefined)
        .map(x => gameData.typeT[x])
        .filter(x => x)
    const isWonderGuard = abiNames.indexOf('Wonder Guard') != -1

    const modifiers = abilityModifiesTypeChart(abiNames, specie)
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
        if (modifiers[3].indexOf(AtkT) != -1) {
            typeEffectiveness = 2
        }
        for (const defT of defTypes){
            typeEffectiveness *= getTypeEffectiveness(AtkT, defT)
        }
        if (isWonderGuard && typeEffectiveness <= 1) typeEffectiveness = 0 
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
    "Lightning Rod": ["Electric"],
    "Motor Drive": ["Electric"],
    "Water Absorb": ["Water"],
    "Dry Skin": ["Water"],
    "Storm Drain": ["Water"],
    "Evaporate": ["Water"],
    "Levitate": ["Ground"],
    "Dragonfly": ["Ground"],
    "Mountaineer": ["Rock"],
    "Poison Absorb": ["Poison"],
    "Aerodynamics": ["Flying"],
}

const abilityThatAddsNormal = {
    "Gifted Mind": typeChart.Psychic[WEAK],
}

const abilityThatAddsResist = {
    "Well Baked Body": ["Fire"],
    "Water Bubble": ["Fire"],
    "Seaweed": ["Fire"],
    "Heatproof": ["Fire"],
    "Thick Fat": ["Fire", "Ice"],
    "Immunity": ["Poison"],
    "Fossilized": ["Rock"],
    "Raw Wood": ["Grass"],
}

const abilityThatAddsWeakness = {
    "Fluffy": ["Fire"],
    "Liquified": ["Water"],
}
// misses things like Magma Armor or others that reduce by 35% like Filter
// or Ice Scales or Fluffy for Physical or other damage

function abilityModifiesTypeChart(abis){
    const modifiers = [
        [],
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
        const addedWeak = abilityThatAddsWeakness[abi]
        if (addedWeak) modifiers[3].push(...addedWeak)
    }
    return modifiers
}

/**
 * 
 */
export function getOffensiveCoverage(moves, abis){
    const typesLen = gameData.typeT.length
    const offensiveCoverage = new Array(typesLen).fill(0)
    for (let i = 0; i < typesLen; i++){
        const defT = gameData.typeT[i]
        moves.forEach((moveTypes)=>{
            moveTypes.forEach((atkT)=>{
                const typeEffectiveness = getTypeEffectiveness(atkT, defT)
                if (typeEffectiveness >= 1) offensiveCoverage[i]++
            })
        })
    }
    return offensiveCoverage
}

/**
 * 
 * @param {string[]} defTs 
 * @param {string[]} offTs 
 * @returns {number}
 */
export function getMoveEffectiveness(defTs, offTs){
    let typeEff = 1
    for (const defT of defTs){
        for (const offT of offTs){
            
            typeEff *= getTypeEffectiveness(offT, defT)
        }
    }
    return typeEff
}