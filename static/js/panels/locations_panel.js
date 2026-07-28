import { createSpeciesBlock, redirectSpecie } from "./species/species_panel.js"
import { search } from "../search.js"
import { longClickToFilter, queryFilter2, queryFilter3 } from "../filters.js"
import { gameData } from "../data_version.js"
import { AisInB, e, JSHAC } from "../utils.js"
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
    currentLocID = +mapID
    const map = gameData.locations.maps[mapID]
    const general_data = {
        pkms: []
    }
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
            if (rateName === "given") 
                node.append(specieNode)
            if (! general_data.pkms.includes(rate[2]))
                general_data.pkms.push(rate[2])
        }
    }
    $('#locations-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#locations-list').children().eq(mapID).addClass("sel-active").removeClass("sel-n-active")
    feedLocationGeneralData(general_data)
}


function locationTypeSelectionGenerate(data_type){
    const type_text = gameData.typeT[data_type.id]
    const clickeable_element = e('div', `location-types-selection ${type_text.toLowerCase()}-t`, undefined, {
        onmouseover: ()=>{
            highlight_species_per_types(data_type.id)
        },
        onclick: ()=>{
            highlight_species_per_types(data_type.id)
        },
    })
    longClickToFilter(3, clickeable_element, "type", ()=>type_text)
    return JSHAC([
            clickeable_element, [
                e('span', 'm-auto', `${type_text} (${data_type.amount})`)
            ],
        ])
        
}

function feedLocationGeneralData(general_data){
    const types_spread = [... new Array(gameData.typeT.length)].map((_,i)=>{return{
        id: i,
        amount: 0
    }}) 
    general_data.pkms.forEach(pk_id => {
        const types = [...new Set(gameData.species[pk_id].stats.types)]
        types.forEach(type_id => {
            types_spread[type_id].amount += 1
        })
    })
    types_spread.sort((a, b)=>{
        return b.amount - a.amount
    })
    const amount_to_filter = types_spread[1].amount
    const types_to_show = types_spread.filter(x => x.amount >= amount_to_filter)
    const frag = document.createDocumentFragment()
    frag.append(e('div', '', 'Most Frequent types:'))
    for (const data_type of types_to_show){
       frag.append(locationTypeSelectionGenerate(data_type))
    }
    frag.append(
        JSHAC([
            e('div', 'location-more-types', '+ more', {
                onclick: ()=>{
                    show_more_location_types(
                        types_spread.filter(x => x.amount < amount_to_filter && x.amount > 0)
                    )
                }
            })
        ])
    )
    $('#location-general-data-most-common').empty().append(frag)
    
}

function show_more_location_types(types_to_show){
    $('#location-general-data-most-common .location-more-types').remove()
    const frag = document.createDocumentFragment()
    for (const data_type of types_to_show){
       frag.append(locationTypeSelectionGenerate(data_type))
    }
    $('#location-general-data-most-common').append(frag)
}

function highlight_species_per_types(type_id){
    const nodes = $('#locations-data .specie-block')
    for (const node of nodes){
        const id = $(node).data('id')
        const types = gameData.species[id].stats.types
        if (types.includes(type_id)){
            $(node).addClass('highlight')
        } else {
            $(node).removeClass('highlight')
        }
    }
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
            prefixTree.specie[prefix].push({data: i, suggestions: specie.name})
        }
        const prefix = gameData.mapsT[x.id].charAt(0).toLowerCase()
        if (!prefixTree.name[prefix]) prefixTree.name[prefix] = []
        prefixTree.name[prefix].push({data: i, suggestions: gameData.mapsT[x.id]})
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
    if (matched && matched.indexOf(currentLocID) == -1 && validID !== undefined) {
        feedPanelLocations(validID)
    }
}
