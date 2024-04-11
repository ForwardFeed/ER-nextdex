import { abilitiesExtraType, buildSpeciesPrefixTrees, feedPanelSpecies, getSpritesURL, matchedSpecies, setupReorderBtn } from "./panels/species/species_panel.js"
import { feedPanelMoves } from "./panels/moves_panel.js"
import { buildlocationPrefixTrees, feedPanelLocations } from "./panels/locations_panel.js"
import { feedPanelTrainers, buildTrainerPrefixTrees} from "./panels/trainers_panel.js"
import { gameData } from "./data_version.js"
import { restoreSave, setupOffensiveTeam } from "./panels/team_builder.js"
import { e, JSHAC } from "./utils.js"
import { load } from "./loading.js"
import { initFormatShowdown } from "./format_showdown.js"
import { getCommunitySetsFromStorage, setUpComSets } from "./panels/species/community_sets.js"

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
        [hydrateSpecies, "species  data"],
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
let HPMoveID = 0
let HPsMovesID = []
function hydrateMoves(moves = gameData.moves) {
    HPsMovesID = []
    gameData.flagsT.push('Technician', 'Perfectionnist')
    const fragment = document.createDocumentFragment();
    let movesLen = moves.length
    for (let i = 0; i < movesLen; i++) {
        if (i == 0) continue
        const mv = moves[i]
        if (mv.name === "Hidden Power"){
            mv.name = "H.P. Normal"
            HPMoveID = i
            for (const typeI in gameData.typeT){
                const typeName = gameData.typeT[typeI]
                if (typeName === "Normal") continue
                const newHP = structuredClone(mv)
                newHP.types[0] = typeI
                newHP.name = "H.P. " + typeName
                movesLen++
                
                HPsMovesID.push(moves.push(newHP) - 1)
            }
        }
        if (mv.pwr > 0 && mv.pwr <= 60) mv.flags.push(gameData.flagsT.indexOf('Technician'))
        if (mv.pwr > 0 && mv.pwr < 50) mv.flags.push(gameData.flagsT.indexOf('Perfectionnist'))
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
    if (!currentSpecie.dex.hw) currentSpecie.dex.hw = previousSpecie.dex.hw
    if (previousSpecie.typeEvosSet && !currentSpecie.typeEvosSet) {
        currentSpecie.stats.types.forEach(x => previousSpecie.typeEvosSet.add(x))
        currentSpecie.typeEvosSet = previousSpecie.typeEvosSet
    }
    
    //do not add if it was already added
    for (const evo of currentSpecie.evolutions){
        if (evo.kd === currentEvo.kd && evo.rs === currentEvo.rs && evo.in === currentEvo.in) return
    }
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
function takeMovesFromPreEvolution(){
    const speciesLen = gameData.species.length
    for(let i=0; i < speciesLen; i++){
        const specie = gameData.species[i]
        for(const evo of specie.evolutions){
            if (!evo.from) continue
            const previousSpecie = gameData.species[evo.in]
            specie.preevomoves = previousSpecie.allMoves.filter(
                x => specie.allMoves.indexOf(x) == -1
            )
            specie.allMoves =  [... new Set(specie.allMoves.concat(...specie.preevomoves))]
        }
    }
}

// a weird mechanic from ER that makes any evee evo line learn any other move from any other evo line
// it is so weird that i'm using a pointer for that
function addAllOtherEveeMoves(){
    const Eevee = gameData.species.find(x => x.name === "Eevee")
    if (!Eevee) return
    let moveListPointer = Eevee.allMoves
    if (!moveListPointer) {
        console.warn('unexplainable problem in addAllOtherEveeMoves')
        return
    }
    let allMoves = []
    // add all moves uniquely into a shared object 
    for (const evo of Eevee.evolutions){
        const nextEvo = gameData.species[evo.in]
        allMoves = [... new Set(allMoves.concat(nextEvo.allMoves))]
        nextEvo.allMoves = moveListPointer
    }
    // show it shows into pree evo moves too
    for (const evo of Eevee.evolutions){
        const nextEvo = gameData.species[evo.in]
        nextEvo.preevomoves = nextEvo.preevomoves.concat(allMoves.filter(
            x => nextEvo.allMoves.indexOf(x) == -1
        ))
    }
    moveListPointer.splice(0) // i delete everything inside to keep the pointer alive
    moveListPointer.push(...allMoves)
}

function hydrateSpecies() {
    //matchedSpecies.splice(0, matchedSpecies.length, ...gameData.species)
    nodeLists.species = [] // reset
    const fragment = document.createDocumentFragment();
    const species = gameData.species
    fragment.append(setupReorderBtn())
    for (const i in species) {
        if (i == 0) continue
        const specie = species[i]
        specie.stats.base[6] = 0
        for (const statID in specie.stats.base) {
            const value = specie.stats.base[statID]
            feedBaseStatsStats(statID, value)
            if (statID < 6) specie.stats.base[6] += + value
        }
        // set third types for innates
        specie.thirdType = abilitiesExtraType(false, specie)
        // prepare to be appended a list of location where this pokemon appear
        specie.locations = new Map();
        // concatenate all moves into a new variable
        // also remove all duplicates
        // also adding move none to it, so it's selectable
        specie.allMoves = [...new Set(specie.eggMoves.concat(
            specie.levelUpMoves.map(x => x.id).concat(
                specie.TMHMMoves.concat(
                    specie.tutor
                )
            )
        )), 0]
        //if it has Hidden power, set all others non-normal typed HPs
        if (specie.allMoves.indexOf(HPMoveID) != -1){
            specie.allMoves.push(...HPsMovesID)
        }
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

            if (specie.id <= regionsMapped[0]) break
            specie.region = regionsMapped[1]
        }
        // track all types on all evolutions lines
        if (!specie.typeEvosSet || specie.typeEvosSet.constructor.name === "Object"){
            specie.typeEvosSet = new Set(specie.stats.types)
        }
        // share the eggmoves to the evolutions !TODO recursively
        for (const evo of specie.evolutions) {
            hydrateNextEvolutionWithMoves(i, evo)
        }
        // list all pokemon if they are given
        for (const enc of specie.SEnc){
            if (gameData.scriptedEncoutersHowT[enc.how] === "given"){
                const maps = gameData.locations.maps
                const mapLen = maps.length
                let locaObj
                for (let i=0; i<mapLen; i++){
                    const map = maps[i]
                    if (map.id == enc.map){
                        enc.locaId = i
                        locaObj = gameData.locations.maps[i]
                        break
                    }
                }
                if (!locaObj) continue
                if (!locaObj.given) locaObj.given = []
                if (!locaObj.speciesSet || locaObj.speciesSet.constructor.name === "Object") locaObj.speciesSet = new Set()
                locaObj.speciesSet.add(gameData.species[i])
                locaObj.given.push(['??','??',i])
            }
        }
        // add to the html list 
        const row = e('div', "btn data-list-row sel-n-active")
        row.setAttribute('draggable', true);
        row.ondragstart = (ev) => {
            ev.dataTransfer.setData("id", i)
        }
        //Node id because for correlation with nodelist in sorting
        specie.nodeID = nodeLists.species.length
        nodeLists.species.push(row)

        const image = e('img', 'species-list-sprite')
        image.src = getSpritesURL(specie.NAME)
        image.alt = specie.name
        image.loading = "lazy"
        row.appendChild(image)

        const name = e('span', "species-name span-a", specie.name)
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
    buildSpeciesPrefixTrees()
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
                if (gameData.species[specieID].locations === undefined) continue //what?
                map.speciesSet.add(gameData.species[specieID])
                if (!gameData.species[specieID].locations.get(mapID))
                    gameData.species[specieID].locations.set(mapID, new Set())
                gameData.species[specieID].locations.get(mapID).add(locName)
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
        const trainer = trainers[i]
        trainer.fullName = `${gameData.tclassT[trainer.tclass]} ${trainer.name}`
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
        name.innerText = trainer.fullName || "unknown"
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
    buildTrainerPrefixTrees()
}

export default hydrate