import { gameData } from "./data_version.js"


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

const abilityAddingType = {
    "Phantom"    : "Ghost",
    "Metallic"   : "Steel",
    "Dragonfly"  : "Dragon",
    "Half Drake" : "Dragon",
    "Ice Age"    : "Ice",
    "Grounded"   : "Ground",
    "Aquatic"    : "Water",
    "Turboblaze" : "Fire",
    "Teravolt"   : "Electric",
    "Fairy Tale" : "Fairy",
    "Aquatic Dweller": "Water",
    "Metallic Jaw"   : "Steel",
    "Bruiser"    : "Fighting",
    "Rocky Exterior" : "Rock",
    "Lightning Born" : "Electric",
    "Komodo"     : "Dragon",
    "Fey Flight" : "Fairy",
    "Dead Bark"  : "Ghost",
    "Lightsaber" : "Fire",
    "Hover"      : "Psychic",
}



const abilityThatAddsImmunity = {
    "Flash Fire"      : ["Fire"],
    "Sap Sipper"      : ["Grass"],
    "Volt Absorb"     : ["Electric"],
    "Lightning Rod"   : ["Electric"],
    "Motor Drive"     : ["Electric"],
    "Water Absorb"    : ["Water"],
    "Dry Skin"        : ["Water"],
    "Storm Drain"     : ["Water"],
    "Evaporate"       : ["Water"],
    "Levitate"        : ["Ground"],
    "Dragonfly"       : ["Ground"],
    "Mountaineer"     : ["Rock"],
    "Poison Absorb"   : ["Poison"],
    "Aerodynamics"    : ["Flying"],
    "Well Baked Body" : ["Fire"],
    "Elemental Vortex": ["Fire", "Water"],
    "Justified"       : ["Dark"],
    "Ice Dew"         : ["Ice"],
    "Earth Eater"     : ["Ground"],
    "Hover"           : ["Ground"],
    "Aerialist"       : ["Ground"],
    "Imposing Wings"  : ["Ground"],
    "Desolate Sun"    : ["Ground", "Water"],
    "Reservoir"       : ["Water"],
    "Desolate Land"   : ["Water"],
    "Primordial Sea"  : ["Fire"],
    "Fey Flight"      : ["Ground"],
    "Cryo Architect"  : ["Water", "Ice"],
    "Gifted Mind"     : ["Ghost", "Bug", "Dark"],
    "Radiance"        : ["Dark"],
    "Hover"           : ["Ground"],
    "Heat Sink"       : ["Fire"]
}

const abilityThatAddsResist = {
    "Water Bubble"    : ["Fire"],
    "Seaweed"         : ["Fire"],
    "Heatproof"       : ["Fire"],
    "Iron Giant"      : ["Fire"],
    "Thick Fat"       : ["Fire", "Ice"],
    "Immunity"        : ["Poison"],
    "Fossilized"      : ["Rock"],
    "Raw Wood"        : ["Grass"],
    "Water Compaction": ["Water"],
    "Old Mariner"     : ["Fire"],
    "Flame Bubble"    : ["Fire"],
    "Deep Freeze"     : ["Fire"],
    "Iron Giant"      : ["Fire"],
    "Strong foundation": ["Water", "Ground"],
    "Droideka"        : ["Fire"],
    "Thermal Entropy" : ["Fire"],
}

const abilityThatAddsQuadResist = {
    "Thick Blubber": ["Fire", "Ice"]
}

const abilityThatAddsWeakness = {
    "Fluffy": ["Fire"],
    "Puffy": ["Fire"],
    "Liquified": ["Water"],
    "Dry Skin": ["Fire"],
    
}

const abilityThatAdds4TimesWeakness = {
    "Fluffiest": ["Fire"],
}

export function abilitiesToAddedType(abis){
    for (const abi of abis){
        const addedType = abilityAddingType[gameData.abilities[abi].name]
        if (addedType) return gameData.typeT.indexOf(addedType)
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
 * @param {string[]} defTypes 
 * @param {string[]} abilities 
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
        let typeEffectiveness = 1
        if (modifiers[IMMUNE].indexOf(atkT) != -1) {
            typeEffectiveness = 0
            defensiveCoverage.push(typeEffectiveness)
            continue
        }
        if (modifiers[NORMAL].indexOf(atkT) != -1) {
            typeEffectiveness = 1 
        }
        if (modifiers[RESIST].indexOf(atkT) != -1) {
            typeEffectiveness = 0.5
        }
        if (modifiers[WEAK].indexOf(atkT) != -1) {
            typeEffectiveness = isPrimalArmor ? 1 : 2
        }
        if (modifiers[WEAK4X].indexOf(atkT) != -1){
            // I have no clue how primal armor handles that, so I'll ignore it for now
            typeEffectiveness = 4
        }
        if (has_steelworker){
            if (atkT === "Ghost" || atkT === "Dark"){
                typeEffectiveness = 0.5
            }
        }
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

// misses things like Magma Armor or others that reduce by 35% like Filter
// or Ice Scales or Fluffy for Physical or other damage
const IMMUNE = 0
const NORMAL = 1
const RESIST = 2
const WEAK   = 3
const WEAK4X = 4

function abilityModifiesTypeChart(abis){
    const modifiers = [
        [], // immunity
        [], // normal
        [], // resist
        [], // weak
        [] // weak 4X
    ]
    for (const abi of abis){
        const addedImunity = abilityThatAddsImmunity[abi]
        if (addedImunity) modifiers[IMMUNE].push(...addedImunity)
        const addedResist = abilityThatAddsResist[abi]
        if (addedResist) modifiers[RESIST].push(...addedResist)
        const addedWeak = abilityThatAddsWeakness[abi]
        if (addedWeak) modifiers[WEAK].push(...addedWeak)
        const added4XWeak = abilityThatAdds4TimesWeakness[abi]
        if (added4XWeak) modifiers[WEAK4X].push(...added4XWeak)
        const added4XResist = abilityThatAddsQuadResist[abi]
        if (added4XResist) modifiers[RESIST].push(...added4XResist)
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