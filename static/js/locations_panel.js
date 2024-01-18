import { createSpeciesBlock, redirectSpecie } from "./species_panel.js"
import { query } from "./search.js"
import { gameData } from "./data_version.js"

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
    const mainSearch = document.getElementById("search-bar")
    mainSearch.value = gameData.locations.maps[mapId].name
    $("#btn-locations").click()
    const location = $('#locations-list').children().eq(mapId)
    location.click()[0].scrollIntoView({behavior:"smooth"})

}

export function updateLocations(searchQuery){
    const maps = gameData.locations.maps
    const nodeList = $('#locations-list').children()
    let validID;
    const queryMap = {
        "name": (queryData, map) => {
            return map.name.toLowerCase().indexOf(queryData) >= 0 ? true : false
        }
    }
    for (const i in maps){
        const map = maps[i]
        const node = nodeList.eq(i)
        if (query(searchQuery, map, queryMap))
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    if (validID) feedPanelLocations(validID)
}