import { buildlocationPrefixTrees, feedPanelLocations } from "../panels/locations_panel.js"

import { gameData } from "../data_version.js"

function addFishingTable(rates) {
    const fragmentRate = document.createDocumentFragment();
    let parent = document.createElement('div')
    parent.className = "location-rod"
    parent.innerHTML = "Old Rod"
    fragmentRate.append(parent)
    // I took this data from the games files
    // and sunk cost fallacy made me use it instead of using a comprehensible way
    const rodGrades = gameData.locations.rodGrade
    for (let i = 0; i < rates.length; i++) {
        const rate = rates[i]
        if (i === rodGrades[0] + 1) {
            parent = document.createElement('div')
            parent.className = "location-rod"
            parent.innerText = "Good Rod"
            fragmentRate.append(parent)
        }
        if (i === rodGrades[1] + 1) {
            parent = document.createElement('div')
            parent.className = "location-rod"
            parent.innerText = "Super Rod"
            fragmentRate.append(parent)
        }
        fragmentRate.append(addLocationRow(rates[i]))
    }
    return fragmentRate
}

function addLocationRow(rate) {
    const nodeCore = document.createElement('div')
    nodeCore.className = "location-row"
    const nodeRate = document.createElement('div')
    nodeRate.className = "location-rate"
    nodeRate.innerText = rate
    nodeCore.append(nodeRate)
    const nodeSpecie = document.createElement('div')
    nodeSpecie.className = "location-specie"
    nodeCore.append(nodeSpecie)
    const nodeLvl = document.createElement('div')
    nodeLvl.className = "location-lvl"
    nodeCore.append(nodeLvl)
    return nodeCore
}


export function hydrateLocation() {
    const xmapTable = [
        "land",
        "water",
        "fish",
        "honey",
        "rock",
        "hidden",
    ]
    gameData.locations.given = []
    const fragmentList = document.createDocumentFragment();
    const maps = gameData.locations.maps
    for (const mapID in maps) {
        const map = maps[mapID]
        if (!map.speciesSet || map.speciesSet.constructor.name === "Object") map.speciesSet = new Set() // new variable that store pokemon names
        // FEED the pokemons location
        for (const locName of xmapTable) {
            const mons = map[locName]
            if (!mons) continue
            for (const monID of mons) {
                const specieID = monID[2]
                if (specieID < 1) continue
                const specie = gameData.species[specieID]
                if (specie.locations === undefined) {
                    specie.locations = new Map()
                }
                map.speciesSet.add(specie)
                if (!specie.locations.get(mapID))
                    specie.locations.set(mapID, new Set())
                specie.locations.get(mapID).add(locName)
            }
        }

        // hydrate the html list
        const listRow = document.createElement('div')
        listRow.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = gameData.mapsT[map.id] || "unknown"
        listRow.append(name)
        listRow.dataset.id = mapID
        $(listRow).on('click', function () {
            fastdom.mutate(() => {
                feedPanelLocations($(this).attr('data-id'))
            });
        });
        fragmentList.append(listRow)
    }
    $("#locations-list").empty().append(fragmentList);
    const locations = gameData.locations
    for (const rateName of xmapTable) {

        const rates = locations[rateName + "Rate"]
        if (!rates) continue

        const fragmentRate = document.createDocumentFragment();
        if (rateName === "fish") {
            $('#locations-' + rateName).empty().append(addFishingTable(rates))
            continue
        }
        else
            for (const rate of rates) {
                fragmentRate.appendChild(addLocationRow(rate))
            }
        $('#locations-' + rateName).empty().append(fragmentRate)
    }
    feedPanelLocations(0)
    buildlocationPrefixTrees()
}