import { gameData } from "./data_version.js"
import defensiveAbilities from "./defensiveAbilities.js";


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
    ],
    "Stellar": [[],
        [],
        ["Stellar"]    
    ],
    "Mystery": [[],
        [],
        ["Mystery"]    
    ],
    "None": [
        [],
        [],
        []
    ]
}

export function abilitiesToAddedType(abis){
    for (const abi of abis){
        const abi_name = gameData.abilities[abi].name
        const abi_defensive_data = defensiveAbilities["effects"][abi_name]
        if (abi_defensive_data === undefined){
            continue
        }
        const added_type = abi_defensive_data["addedType"]
        if (added_type) return gameData.typeT.indexOf(added_type)
    }
    return undefined
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

function hasAbility(abilities_string_array, ability_string){
    return !!~abilities_string_array.findIndex((x)=>x === ability_string)
}

function hasType(types_string_array, type_string){
    return !!~types_string_array.findIndex((x)=>x === type_string)
}

/**
 * 
 * @param {import('../../src/compactify.js').CompactSpecie} specie 
 * @param {number} abiID 
 * @returns 
 */
export function getDefensiveCoverage(specie, abiID){
    const abisID            = [specie.stats.abis[abiID], ...specie.stats.inns].filter(x => x)
    const abiNames          = abisID.map(x => gameData.abilities[x].name)
    const defTypes          = [...new Set([...specie.stats.types, abilitiesToAddedType(abisID)])]
    .filter(x => x != undefined)
    .map(x => gameData.typeT[x])
    .filter(x => x)
    const has_ripen_ability = hasAbility(abiNames, "Ripen")
    const has_steelworker   = hasAbility(abiNames, "Steelworker") && hasType(defTypes, "Steel")
    const isWonderGuard     = abiNames.indexOf('Wonder Guard') != -1
    const isPrimalArmor     = abiNames.indexOf('Primal Armor') != -1
    const modifiers         = abilityModifiesTypeChart(abiNames, specie)
    const defensiveCoverage = []
    for (const atkT of gameData.typeT){
        let typeEffectiveness = modifiers[atkT] === undefined
            ? 1
            : modifiers[atkT]
        for (const defT of defTypes){
            let effectiveness  = getTypeEffectiveness(atkT, defT)
            if (has_ripen_ability && effectiveness == 0.5){
                typeEffectiveness = 0.25
            }
            typeEffectiveness *= effectiveness
        }
        if (isWonderGuard && typeEffectiveness <= 1) {
            typeEffectiveness = 0 
        }
        defensiveCoverage.push(typeEffectiveness)
    }
    const defensiveCoverageSorted = {}

    gameData.typeT.forEach((type, index)=>{
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
 * @param {string[]} abis 
 * @param {import('../../src/compactify.js').CompactSpecie} specie 
 * @returns 
 */

function abilityModifiesTypeChart(abis, specie){

    const modifiers = {}
    for (const abi of abis){
        const abi_def = defensiveAbilities["effects"][abi]
        if (abi_def === undefined){
            continue
        }
        const resists = abi_def["resists"] || []
        const conditionnal_resistances = abi_def["conditionalResistances"] || []
        for(const cond_resis of conditionnal_resistances){
            const cond = cond_resis["condition"]
            if (cond === undefined){
                continue
            }
            if (cond["type"] === "type"){
                if (specie.stats.types.indexOf(gameData.typeT.indexOf(cond["value"])) !== -1 ){
                    resists.push(...cond_resis["resistance"])
                }
            }
        }
        
        if (resists !== undefined){
            for (const resist of resists){
                const poke_type = resist["damageSource"]
                const mul = resist["multiplier"]
                if (modifiers[poke_type] === undefined){
                    modifiers[poke_type] = mul
                } else {
                    modifiers[poke_type] *= mul
                }
                
            }
        }
       
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