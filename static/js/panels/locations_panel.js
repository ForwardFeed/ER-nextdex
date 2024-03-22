import { createSpeciesBlock, redirectSpecie } from "./species/species_panel.js"
import { search } from "../search.js"
import { queryFilter2, queryFilter3 } from "../filters.js"
import { gameData } from "../data_version.js"
import { AisInB } from "../utils.js"
import { settings } from "../settings.js"

export let currentLocID = 0
const xrateTable = [
    "land",
    "water",
    "fish",
    "honey",
    "rock",
    "hidden",
    "given",
]
export function feedPanelLocations(mapID){
    currentLocID = mapID
    const map = gameData.locations.maps[mapID]
    for (const rateName of xrateTable){
        const rates = map[rateName]
        const node = $('#locations-' + rateName)
        if (!rates) {
            node.parent().hide()
            continue
        }
        node.parent().show()
        if (rateName === "given") node.empty()
        for (const i in rates){
            const rate = rates[i]
            const specie = node.find('.location-specie').eq(i)
            const specieNode = createSpeciesBlock(rate[2])
            specie.empty().append(specieNode)
            node.children().find('.location-lvl').eq(i).text(rate[0] + "-" + rate[1])
            if (rateName === "given") node.append(specieNode)
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
const prefixTree = {
    treeId: "location"
}

export function buildlocationPrefixTrees(){
    prefixTree.specie = {}
    prefixTree.name = {}
    gameData.locations.maps.forEach((x, i)=>{
        for (const specie of x.speciesSet){
            const prefix = specie.name.charAt(0).toLowerCase()
            if (!prefixTree.specie[prefix]) prefixTree.specie[prefix] = []
            prefixTree.specie[prefix].push(i)
        }
        const prefix = gameData.mapsT[x.id].charAt(0).toLowerCase()
        if (!prefixTree.name[prefix]) prefixTree.name[prefix] = []
        prefixTree.name[prefix].push(i)
    })
}


export const queryMapLocations = {
    "name": (queryData, map) => {
        const mapName = gameData.mapsT[map.id].toLowerCase()
        if (AisInB(queryData, mapName)){
            return mapName
        }
        return false
    },
    "specie": (queryData, map) => {
        for (let specie of map.speciesSet){
            specie = specie?.name.toLowerCase()
            if (AisInB(queryData, specie)) return specie
        }
        return false
    },
    "type": (queryData, map) => {
        for (const specie of map.speciesSet){
            const types = [...specie.typeEvosSet].map((x) => gameData.typeT[x].toLowerCase())
            if (settings.monotype && types[0]) return AisInB(queryData, types[0]) && types[0] == types[1]
            for (const type of types){
                if (AisInB(queryData, type)) return type
            }
        }
        return false
    }
}
export function updateLocations(searchQuery){
    const maps = gameData.locations.maps
    const nodeList = $('#locations-list').children()
    const matched = queryFilter3(searchQuery, maps, queryMapLocations)
    let validID;
    const mapsLen = maps.length
    for (let i  = 0; i < mapsLen; i++) {
        const node = nodeList.eq(i)
        if (!matched || matched.indexOf(i) != -1)
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    //if the current selection isn't in the list then change
    if (matched && matched.indexOf(currentLocID) == -1 && validID) feedPanelLocations(validID)
}