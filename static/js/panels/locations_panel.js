import { createSpeciesBlock, redirectSpecie } from "./species_panel.js"
import { search } from "../search.js"
import { queryFilter} from "../filters.js"
import { gameData } from "../data_version.js"
import { AisInB } from "../utils.js"

export function feedPanelLocations(mapID){
    const map = gameData.locations.maps[mapID]
    const xrateTable = [
        "land",
        "water",
        "fish",
        "honey",
        "rock",
        "hidden",
    ]
    for (const rateName of xrateTable){
        const rates = map[rateName]
        const node = $('#locations-' + rateName)
        if (!rates) {
            node.parent().hide()
            continue
        }
        node.parent().show()
        for (const i in rates){
            const rate = rates[i]
            const specie = node.find('.location-specie').eq(i)
            specie.empty().append(createSpeciesBlock(rate[2]))
            node.children().find('.location-lvl').eq(i).text(rate[0] + "-" + rate[1])
        }
    }
    $('#locations-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#locations-list').children().eq(mapID).addClass("sel-active").removeClass("sel-n-active")
}

export function redirectLocation(mapId)
{
    search.callbackAfterFilters = () =>{
        const location = $('#locations-list').children().eq(mapId)
        location.click()[0].scrollIntoView({behavior:"smooth"})
    }
    $("#btn-locations").click()
   

}

export const queryMapLocations = {
    "name": (queryData, map) => {
        if (AisInB(queryData, map.name.toLowerCase())){
            return map.name
        }
        return false
    },
    "specie": (queryData, map) => {
        for (const specie of map.speciesSet){
            if (AisInB(queryData, specie)) return specie
        }
        return false
    }
}
export function updateLocations(searchQuery){
    const maps = gameData.locations.maps
    const nodeList = $('#locations-list').children()
    let validID;
    
    for (const i in maps){
        const map = maps[i]
        const node = nodeList.eq(i)
        if (queryFilter(searchQuery, map, queryMapLocations))
        {
                if (!validID) validID = i
                node.show()
                
        } else {
                node.hide()
        }
    }
    if (validID) feedPanelLocations(validID)
}