
import { gameData } from "../data_version.js"
import { restoreSave, setupOffensiveTeam } from "../panels/team_builder.js"

import { load } from "../loading.js"
import { initFormatShowdown } from "../format_showdown.js"
import { getCommunitySetsFromStorage, setUpComSets } from "../panels/species/community_sets.js"
import { hydrateTrainers } from "./trainers.js"
import { hydrateAbilities } from "./abilities.js"

import { hydrateMoves } from "./moves.js"
import { hydrateSpecies } from "./species.js"
import { hydrateLocation } from "./locations.js"
import { addAllOtherEveeMoves } from "./moves.js"
import { takeMovesFromPreEvolution } from "./moves.js"
import { hydrateSpeciesList } from "./list_species.js"

export const nodeLists = {
    species: [],
    abilities: [],
    moves: [],
    locations: [],
    trainers: [],
}

export function hydrate(firstLoad=false) {
    if (!gameData) {
        return console.warn("couldn't find gameData")
    }
    // add some reconstitution data for ease of use here
    gameData.minMaxBaseStats = new Array(6).fill(0)
    gameData.speciesStats = {
        result: {
            top5: new Array(6).fill(0),
            top20: new Array(6).fill(0),
            median: new Array(6).fill(0),
            min20: new Array(6).fill(0),
            min5: new Array(6).fill(0),
            maxBST: 0,
        },
        data: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ],
    }

    // hydrate the UI with the data
    const steps = [
        [getCommunitySetsFromStorage, "community sets"],
        [setupOffensiveTeam, "builder panel"],
        [initFormatShowdown, "showdown data"],
        [setUpComSets, "Import Community sets"],
        [hydrateAbilities, "abilities data"],
        [hydrateMoves, "moves data"],
        [hydrateSpecies, "species data"],
        [hydrateSpeciesList, "list layout species data"],
        [hydrateLocation, "locations data"],
        [hydrateTrainers, "trainers data"],
        [restoreSave, "save"], // also restore the save of the team builder
        [setLists, "init some lists"],
        [takeMovesFromPreEvolution, "take moves from evo"],
        [addAllOtherEveeMoves, "adding ER eevees moves"],
    ]
    const stepLen = steps.length
    for (let i = 0; i < stepLen; i++){
        const step = steps[i]
        if (firstLoad){
            load(step[0], step[1], i == stepLen - 1)
        } else {
            step[0]()
        }
    } 
}

export let itemList = []
function setLists(){
    itemList = gameData.items.map(x => x.name)
    
}




export default hydrate