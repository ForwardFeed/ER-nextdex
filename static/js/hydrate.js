import { feedPanelSpecies, getSpritesURL, setupReorderBtn } from "./panels/species_panel.js"
import { feedPanelMoves } from "./panels/moves_panel.js"
import { feedPanelLocations } from "./panels/locations_panel.js"
import { feedPanelTrainers } from "./panels/trainers_panel.js"
import { gameData } from "./data_version.js"
import { restoreSave } from "./panels/team_builder.js"
import { e, JSHAC } from "./utils.js"
import { load, endLoad} from "./loading.js"

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
        [hydrateAbilities, "abilities data"],
        [hydrateMoves, "moves data"],
        [hydrateSpecies, "species  data"],
        [hydrateLocation, "locations  data"],
        [hydrateTrainers, "trainers data"],
        [hydrateItems, "items data"],
        [restoreSave, "save"], // also restore the save of the team builder
    ]
    for (const step of steps){
        if (firstLoad){
            load(step[0], step[1])
        } else {
            step[0]()
        }
    }
    if (firstLoad) endLoad()
}

function feedBaseStatsStats(statID, value) {
    gameData.speciesStats.data[statID].push(value)
    if (statID == 6 && (value > gameData.speciesStats.result.maxBST)) {
        gameData.speciesStats.result.maxBST = value
    }
}

function setMeanBaseStats() {
    for (const statID in gameData.speciesStats.data) {
        const sorted = gameData.speciesStats.data[statID].sort((a, b) => { return a - b })
        const len = sorted.length
        gameData.speciesStats.result.min5[statID] = sorted[Math.ceil(len * 0.05)]
        gameData.speciesStats.result.min20[statID] = sorted[Math.ceil(len * 0.2)]
        gameData.speciesStats.result.median[statID] = sorted[Math.ceil(len * 0.5)]
        gameData.speciesStats.result.top20[statID] = sorted[Math.ceil(len * 0.80)]
        gameData.speciesStats.result.top5[statID] = sorted[Math.ceil(len * 0.95)]
    }
    // i don't trust the garbage collector
    delete gameData.speciesStats.data
}

function hydrateAbilities(abilities = gameData.abilities) {
    $("#abis-list").empty().append(JSHAC(
        abilities.map((abi, i) => {
            if (abi.name === "-------") return undefined
            const row = JSHAC([
                e("div", "abi-row"), [
                    e("div", "abi-name color" + (i % 2 ? "A" : "B"), abi.name),
                    e("div", "abi-desc color" + (i % 2 ? "C" : "D"), abi.desc)
                ]
            ])
            nodeLists.abilities.push(row)
            return row
        }).filter(x => x)
    ));
    /*$('#filter-alphabethically').on('click', ()=>{
        fastdom.mutate(()=>{
            function sortAlphabethically(a, b){
                return a.name.localeCompare(b.name)
            }
            const abiSorted = structuredClone(abilities)
            abiSorted.splice(0,1)
            hydrateAbilities(abiSorted.sort(sortAlphabethically))
        })
    })*/
}

function hydrateMoves(moves = gameData.moves) {
    const fragment = document.createDocumentFragment();
    for (const i in moves) {
        if (i == 0) continue
        const mv = moves[i]
        const core = document.createElement('div')
        core.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = mv.name || "Unknown"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function () {
            fastdom.mutate(() => {
                $("#filter-frame").hide()
                feedPanelMoves($(this).attr('data-id'))
            });
        });
        fragment.append(core)
    }
    $("#moves-list").empty().append(fragment);
    feedPanelMoves(1)
}
/**
 * Not a fully functionnally recursive way to add specie evolution
 * @param {number} currentSpecieID - species into what the pokemon is evolving
 * @param {import("./compactify.js").CompactEvolution} currentEvo - the how this pokemon is getting evolved (first degree)
 */
function hydrateNextEvolutionWithMoves(previousSpecieID, currentEvo) {
    if (currentEvo.in == -1 || currentEvo.from) return
    const previousSpecie = gameData.species[previousSpecieID]
    const currentSpecie = gameData.species[currentEvo.in]
    if (!currentSpecie.eggMoves.length) currentSpecie.eggMoves = previousSpecie.eggMoves
    if (!currentSpecie.TMHMMoves.length) currentSpecie.TMHMMoves = previousSpecie.TMHMMoves
    if (!currentSpecie.tutor.length) currentSpecie.tutor = previousSpecie.tutor
    //import evolution
    currentSpecie.evolutions.push({
        kd: currentEvo.kd,
        rs: currentEvo.rs,
        in: previousSpecieID,
        from: true// its a added flag so we can know if into into but from
    })
    //import region for megas
    if (!currentSpecie.region) currentSpecie.region = previousSpecie.region
}

function hydrateSpecies() {
    nodeLists.species = [] // reset
    const fragment = document.createDocumentFragment();
    const species = gameData.species
    fragment.append(setupReorderBtn())
    for (const i in species) {
        if (i == 0) continue
        const spec = species[i]
        spec.stats.base[6] = 0
        for (const statID in spec.stats.base) {
            const value = spec.stats.base[statID]
            feedBaseStatsStats(statID, value)
            if (statID < 6) spec.stats.base[6] += + value
        }
        // prepare to be appended a list of location where this pokemon appear
        spec.locations = new Map();
        // concatenate all moves into a new variable
        // also remove all duplicates
        spec.allMoves = [...new Set(spec.eggMoves.concat(
            spec.levelUpMoves.map(x => x.id).concat(
                spec.TMHMMoves.concat(
                    spec.tutor
                )
            )
        ))]
        // add the region
        for (const regionsMapped of [
            [0, "Kanto"],
            [151, "Johto"],
            [251, "Hoenn"],
            [386, "Sinnoh"],
            [494, "Unova"],
            [649, "Kalos"],
            [721, "Alola"],
            [809, "Galar"],
            [898, "Hisui"],
            [905, "Paldea"],
            [1500, ""], //MEGAs to link up after
            [1547, "Alola"],
            [1568, "Galar"],
            [1587, ""], //Misc forms to link up after
            [1808, "Hisui"],
            [1824, ""],//Misc forms to link up after
            [2300, "Redux"], 
        ]) {

            if (spec.id <= regionsMapped[0]) break
            spec.region = regionsMapped[1]
        }
        //share the eggmoves to the evolutions !TODO recursively
        for (const evo of spec.evolutions) {
            hydrateNextEvolutionWithMoves(i, evo)
        }
        // add to the html list 
        const row = e('div', "btn data-list-row sel-n-active")
        row.setAttribute('draggable', true);
        row.ondragstart = (ev) => {
            ev.dataTransfer.setData("id", i)
        }
        //Node id because for correlation with nodelist in sorting
        spec.nodeID = nodeLists.species.length
        nodeLists.species.push(row)

        const image = e('img', 'species-list-sprite')
        image.src = getSpritesURL(spec.NAME)
        image.alt = spec.name
        image.loading = "lazy"
        row.appendChild(image)

        const name = e('span', "species-name", spec.name)
        row.append(name)
        row.dataset.id = i
        $(row).on('click', function () {
            $("#filter-frame").hide()
            fastdom.mutate(() => {
                feedPanelSpecies($(this).attr('data-id'))
            });
        });
        fragment.append(row)
    }
    setMeanBaseStats()
    $("#species-list").empty().append(fragment);
    feedPanelSpecies(1)
}

function hydrateLocation() {
    const xmapTable = [
        "land",
        "water",
        "fish",
        "honey",
        "rock",
        "hidden",
    ]
    const fragmentList = document.createDocumentFragment();
    const maps = gameData.locations.maps
    for (const mapID in maps) {
        const map = maps[mapID]
        map.speciesSet = new Set() // new variable that store pokemon names
        // FEED the pokemons location
        for (const locName of xmapTable) {
            const mons = map[locName]
            if (!mons) continue
            for (const monID of mons) {
                const specieID = monID[2]
                if (specieID < 1) continue
                map.speciesSet.add(gameData.species[specieID].name.toLowerCase())
                if (!gameData.species[specieID].locations.get(mapID))
                    gameData.species[specieID].locations.set(mapID, new Set())
                gameData.species[specieID].locations.get(mapID).add(locName)
            }
        }

        // hydrate the html list
        const listRow = document.createElement('div')
        listRow.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = map.name || "unknown"
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
}

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

function hydrateTrainers() {
    // still missing in the data the alternative like for the rivals
    // and it's not ordered (it requires to have an order set manually)
    const frag = document.createDocumentFragment();
    const trainers = gameData.trainers
    //let lastMap = -1
    for (const i in trainers) {
        if (i == 0) continue
        const trainer = trainers[i]
        //check if it's a new map to add it as a header
        /*if (lastMap != trainer.map){
            lastMap = trainer.map
            const mapDiv = document.createElement('div')
            mapDiv.className = "data-list-row trainer-map-list-name"
            const mapName = document.createElement('span')
            mapName.innerText = gameData.mapsT[trainer.map] || "unknown"
            mapDiv.append(mapName)
            frag.append(mapDiv)
        }*/
        // add to the html list 
        const core = document.createElement('div')
        core.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = trainer.name || "unknown"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function () {
            fastdom.mutate(() => {
                feedPanelTrainers($(this).attr('data-id'))
            });
        });
        frag.append(core)
    }
    $('#trainers-list').empty().append(frag)
    feedPanelTrainers(1)
}

function hydrateItems() {
    gameData.itemT = []
    gameData.items.forEach((val) => {
        gameData.itemT.push(val.name)
    })
}

export default hydrate