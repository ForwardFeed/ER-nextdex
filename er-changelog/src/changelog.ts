import { ref, type Ref } from "vue"
import { source_data, target_data } from "./download_data"
import type { CompactAbility, compactMove, CompactSpecie, CompactTrainers } from "./compactify_copied"
import type { PanelID } from "./panels"


export type ChangelogRow = {
    name: string,
    change_type: string,
    from: string,
    to: string
}

export type ChangelogTable = Ref<ChangelogRow[]>

const changelog_species: ChangelogTable = ref([])
const changelog_abilities: ChangelogTable = ref([])
const changelog_moves: ChangelogTable = ref([])
const changelog_trainers: ChangelogTable = ref([])

export const changelog_data: Record<PanelID, ChangelogTable> = {
    species: changelog_species,
    abilities: changelog_abilities,
    moves: changelog_moves,
    trainers: changelog_trainers
}

export  function start_the_changelog(){
    species_changelog()
    abilities_changelog()
    moves_changelog()
    trainers_changelog()
}

const STATS_ORDER = [
    "hp",
    "atk.",
    "def.",
    "spe.atk.",
    "spe.def.",
    "speed",
] as const

type PropertyCheck<T> = {
    prop: keyof T,
    change_type: string
}[]

function species_changelog(){
    if (source_data === null) throw `source data is null`
    if (target_data === null) throw `target data is null`

    changelog_species.value.length = 0
    const source_as_dictionary: Record<string, CompactSpecie> = {}

    for (const specie of source_data.species){
        source_as_dictionary[specie.NAME] = specie
    }

    for (const target of target_data.species){
        const source = source_as_dictionary[target.NAME]
        if (source === undefined){
            changelog_species.value.push({
                name: target.name,
                change_type: 'new specie',
                from: '',
                to: ''
            })

            continue
        }

        const stats_len = STATS_ORDER.length
        for (let i = 0; i < stats_len; i += 1){
            const from = source.stats.base[i]
            const to   = target.stats.base[i]
            if (from === to){
                continue
            }
            changelog_species.value.push({
                name: target.name,
                change_type: `${STATS_ORDER[i]}`,
                from: from + "",
                to: to + ""
            })
        }
        
        const abilities_source = [...new Set(source.stats.abis)].map(x => source_data!.abilities[x].name)
        const abilities_target = [...new Set(target.stats.abis)].map(x => target_data!.abilities[x].name)

        for (let i = 0; i < abilities_source.length; i += 1){
            const abi_source = abilities_source[i]
            if (abilities_target.indexOf(abi_source) === -1){
                changelog_species.value.push({
                    name: target.name,
                    change_type: `ability ${i + 1}`,
                    from: abi_source,
                    to: abilities_target[i]
                })
            }
        }

        const innates_source = [...new Set(source.stats.inns)].map(x => source_data!.abilities[x].name)
        const innates_target = [...new Set(target.stats.inns)].map(x => target_data!.abilities[x].name)

        for (let i = 0; i < innates_target.length; i += 1){
            const inn_target = innates_target[i]
            if (innates_source.indexOf(inn_target) === -1){
                changelog_species.value.push({
                    name: target.name,
                    change_type: `innate ${i + 1}`,
                    from: innates_source[i] || "",
                    to: inn_target
                })
            }
        }

        const types_sources = [...new Set(source.stats.types)].map(x => source_data!.typeT[x])
        const types_target = [...new Set(target.stats.types)].map(x => target_data!.typeT[x])

        for (let i = 0; i < types_target.length; i += 1){
            const type_target = types_target[i]
            if (types_sources.indexOf(type_target) === -1){
                changelog_species.value.push({
                    name: target.name,
                    change_type: `type ${i + 1}`,
                    from: types_sources[i] || "",
                    to: type_target
                })
            }
        }

        for (let i = 0; i < target.levelUpMoves.length; i += 1){
            const target_move = target.levelUpMoves[i]
            const source_move = source.levelUpMoves.find(x => x.id == target_move.id)
            if (source_move === undefined){
                changelog_species.value.push({
                    name: target.name,
                    change_type: "new levelup move",
                    from: "",
                    to: `${target_data.moves[target_move.id].name} at lv. ${target_move.lv}`
                })
                continue
            }
            if (target_move.lv !== source_move.lv){
                changelog_species.value.push({
                    name: target.name,
                    change_type: "move level change",
                    from: `${target_data.moves[target_move.id].name} at lv. ${source_move.lv}`,
                    to: target_move.lv + ""
                })
            }
        }

        for (let i = 0; i < source.levelUpMoves.length; i += 1){
            const source_move = source.levelUpMoves[i]
            const target_move = target.levelUpMoves.find(x => x.id == source_move.id)
            
            if (target_move === undefined){
                changelog_species.value.push({
                    name: target.name,
                    change_type: "removed levelup move",
                    from: `${target_data.moves[source_move.id].name} at lv. ${source_move.lv}`,
                    to: ""
                })
                continue
            }
        }

        for (let i = 0; i < target.tutor.length; i += 1){
            const target_move = target.tutor[i]
            const source_move = source.tutor.find(x => x == target_move)

            if (source_move === undefined){
                changelog_species.value.push({
                    name: target.name,
                    change_type: "new tutor move",
                    from: "",
                    to: `${target_data.moves[target_move].name}`
                })
                continue
            }
        }

        for (let i = 0; i < source.tutor.length; i += 1){
            const source_move = source.tutor[i]
            const target_move = target.tutor.find(x => x == source_move)
            

            if (target_move === undefined){
                changelog_species.value.push({
                    name: target.name,
                    change_type: "removed tutor move",
                    from: "",
                    to: `${target_data.moves[source_move].name}`
                })
                continue
            }
        }


    }
}

function abilities_changelog(){
    if (source_data === null) throw `source data is null`
    if (target_data === null) throw `target data is null`

    changelog_abilities.value.length = 0
    const source_as_dictionary: Record<string, CompactAbility> = {}

    for (const ability of source_data.abilities){
        source_as_dictionary[ability.name] = ability
    }

    for (const target of target_data.abilities){
        const source = source_as_dictionary[target.name]
        if (source === undefined){
            changelog_abilities.value.push({
                name: target.name,
                change_type: "new",
                from: "--",
                to: target.desc
            })
            continue
        }
        if (target.desc !== source.desc){
            changelog_abilities.value.push({
                name: target.name,
                change_type: "description",
                from: source.desc,
                to: target.desc
            })
        }
    }
}


function moves_changelog(){
    if (source_data === null) throw `source data is null`
    if (target_data === null) throw `target data is null`

    changelog_moves.value.length = 0
    const source_as_dictionary: Record<string, compactMove> = {}

    for (const move of source_data.moves){
        source_as_dictionary[move.NAME] = move
    }
    
    for (const target of target_data.moves){
        const source = source_as_dictionary[target.NAME]

        if (source === undefined){
            changelog_moves.value.push({
                name: target.name,
                change_type: "new",
                from: "",
                to: ""
            })
            continue
        }
        const property_checks: PropertyCheck<compactMove> = [
            {
                prop: "acc",
                change_type: "Accuracy"
            },
            {
                prop: "chance",
                change_type: "Chance"
            },
            {
                prop: "desc",
                change_type: "Description"
            },
            {
                prop: "pp",
                change_type: "PowerPoints"
            },
            {
                prop: "prio",
                change_type: "Priority"
            },
            {
                prop: "pwr",
                change_type: "Power"
            },
            {
                prop: "desc",
                change_type: "Description"
            },
            {
                prop: "lDesc",
                change_type: "Long description"
            }
        ]
        for (const check of property_checks){
            if (source[check.prop] !== target[check.prop]){
                changelog_moves.value.push({
                    name: target.name,
                    change_type: check.change_type,
                    from: source[check.prop] + "",
                    to: target[check.prop] + ""
                })
            }
        }
    }
}

function trainers_changelog(){
    if (source_data === null) throw `source data is null`
    if (target_data === null) throw `target data is null`

    changelog_trainers.value.length = 0
    const source_as_dictionary: Record<string, CompactTrainers> = {}

    for (const trainer of source_data.trainers){
        source_as_dictionary[trainer.name] = trainer
    }


    for (const target of target_data.trainers){
        const source = source_as_dictionary[target.name]
        if (source === undefined){
            changelog_trainers.value.push({
                name: target.name,
                change_type: "new",
                from: "",
                to: ""
            })
            continue
        }
    }
}