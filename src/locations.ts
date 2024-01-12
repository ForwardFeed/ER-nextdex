import * as FS from 'fs'
import * as Path from 'path'

import { Xtox } from './parse_utils'

export interface Locations{
    maps: Location[],
    landRate: number[],
    waterRate: number[],
    fishRate: number[],
    honeyRate: number[],
    rockRate: number[],
    hiddenRate: number[],
    rodGrade: number[],

}
export interface Location {
    name: string,
    land: Encounter[] | undefined,
    landR: number | undefined,
    water: Encounter[] | undefined,
    waterR: number | undefined,
    fish: Encounter[] | undefined,
    fishR: number | undefined,
    honey: Encounter[] | undefined,
    honeyR: number | undefined,
    rock: Encounter[] | undefined,
    rockR: number | undefined,
    hidden: Encounter[] | undefined,
    hiddenR: number | undefined,
}

export interface Encounter{
    min: number,
    max: number,
    specie: string
}

export function parse(data: string): Locations{
    const obj = JSON.parse(data)
    
    const locations = {} as Locations
    const locationsFieldJSON = obj.wild_encounter_groups[0].fields
    const xmapMap: { [key: string]: string } = {
        "land_mons": "land",
        "water_mons": "water",
        "rock_smash_mons": "rock",
        "fishing_mons": "fish",
        "honey_mons": "honey",
        "hidden_mons": "hidden"
    }
    for(const field of locationsFieldJSON){
        const JSONF = field.type
        const F = xmapMap[JSONF] + "Rate" as keyof Locations
        Object.assign(locations, {[F]:field.encounter_rates as number || -1})
        if (JSONF === "fishing_mons") {
            const group = field.groups
            locations.rodGrade = [
                group.old_rod[group.old_rod.length - 1],
                group.good_rod[group.good_rod.length - 1],
                group.super_rod[group.super_rod.length - 1],
            ]
        }
    }
    const xmapFields = [
        ["land_mons", "land"],
        ["water_mons", "water"],
        ["rock_smash_mons", "rock"],
        ["fishing_mons", "fish"],
        ["honey_mons", "honey"],
        ["hidden_mons", "hidden"]
    ]
    const locationsEncountersJSON = obj.wild_encounter_groups[0].encounters
    const maps = []
    for (const locationJSON of locationsEncountersJSON){
        const location = {} as Location 
        location.name = Xtox('MAP_', locationJSON.map)
        for(const field of xmapFields){
            const JSONF = field[0]
            const F = field[1] as keyof Location
            const FR = F + "R" as keyof Location
            if (locationJSON[JSONF]){
                Object.assign(location, {[FR]:locationJSON[JSONF].encounter_rate as number || -1})
                const listEncounters = []
                for(const mon of locationJSON[JSONF].mons){
                    listEncounters.push({
                        specie: mon.species || "SPECIES_NONE",
                        min: mon.min_level || 1,
                        max: mon.max_level || 100,
                    })
                }
                Object.assign(location, {[F]:listEncounters})
            }
        }
        maps.push(location)
    }
    locations.maps = maps
    return locations
}
