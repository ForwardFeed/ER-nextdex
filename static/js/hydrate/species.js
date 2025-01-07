import { HPMoveID } from "./moves.js"
import { HPsMovesID } from "./moves.js"
import { e } from "../utils.js"
import { abilitiesExtraType, buildSpeciesPrefixTrees, feedPanelSpecies, getSpritesURL, matchedSpecies, setupReorderBtn } from "../panels/species/species_panel.js"
import { gameData } from "../data_version.js"
import { nodeLists } from "./hydrate.js"

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



/**
 * Not a fully functionnally recursive way to add specie evolution
 * @param {number} currentSpecieID - species into what the pokemon is evolving
 * @param {import("./compactify.js").CompactEvolution} currentEvo - the how this pokemon is getting evolved (first degree)
 */
function hydrateNextEvolutionWithMoves(previousSpecieID, currentEvo) {
    if (currentEvo.in == -1 || currentEvo.from) return
    const previousSpecie = gameData.species[previousSpecieID]
    const currentSpecie = gameData.species[currentEvo.in]
    
    console.log(currentSpecie);
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



export function hydrateSpecies() {
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
        // add the region based of the id, which is not the thing that works the best
        // If you have a better idea let me know
        for (const regionsMapped of [
            [0, "Kanto"],
            [151, "Johto"],
            [251, "Hoenn"],
            [386, "Sinnoh"],
            [493, "Unova"],
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
            console.log(specie.name, specie.id, regionsMapped[1])
            specie.region = regionsMapped[1]
        }
        // track all types on all evolutions lines
        if (!specie.typeEvosSet || specie.typeEvosSet.constructor.name === "Object"){
            specie.typeEvosSet = new Set(specie.stats.types)
        }
        // share the eggmoves to the evolutions !TODO recursively
        for (const evo of specie.evolutions) {
            console.log(specie)
            console.log(specie.evolutions)
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
