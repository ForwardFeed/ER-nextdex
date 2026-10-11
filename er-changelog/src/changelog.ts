import { ref, type Ref } from "vue"
import { source_data, target_data } from "./download_data"
import type { CompactSpecie } from "./compactify_copied"


type ChangelogRow = {
    name: string,
    change_type: string,
    from: string,
    to: string
}

export const changelog_species: Ref<ChangelogRow[]> = ref([])

export  function start_the_changelog(){
    species_changelog()
    console.log(changelog_species.value)
}

const STATS_ORDER = [
    "hp",
    "atk.",
    "def.",
    "spe.atk.",
    "spe.def.",
    "speed",
] as const

function species_changelog(){
    if (source_data === null) throw `source data is null`
    if (target_data === null) throw `target data is null`
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
                from: '--',
                to: '--'
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
                change_type: `${STATS_ORDER[i]} changes`,
                from: `${from} ${STATS_ORDER[i]}`,
                to: `${to} ${STATS_ORDER[i]}`
            })
        }
        
    }
}