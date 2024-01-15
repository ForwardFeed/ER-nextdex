import { feedPanelSpecies, getSpritesURL } from "./species_panel.js"
import { feedPanelMoves } from "./moves_panel.js"
import { feedPanelLocations } from "./locations_panel.js"
import { feedPanelTrainers } from "./trainers_panel.js"

export function hydrate(){
    if (!gameData){
        return console.warn("couldn't find gameData")
    }
    /*
        add some reconstitution data for ease of use here
    */
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
    
    /*
        hydrate the UI with the data
    */
    hydrateAbilities()
    hydrateMoves()
    hydrateSpecies()
    hydrateLocation()
    hydrateTrainers()
}

function feedBaseStatsStats(statID, value){
    gameData.speciesStats.data[statID].push(value)
    if (statID == 6 && (value > gameData.speciesStats.result.maxBST)) {
        gameData.speciesStats.result.maxBST = value
    }
}

function setMeanBaseStats(){
    for (const statID in gameData.speciesStats.data){
        const sorted = gameData.speciesStats.data[statID].sort((a,b)=>{return a - b})
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

function hydrateAbilities(){
    const fragment = document.createDocumentFragment();
    const abilities = gameData.abilities
    for (const i in abilities){
        if (i == 0) continue
        const abi = abilities[i]
        const core = document.createElement('div')
        core.className = "abi-row"
        const name = document.createElement('div')
        name.innerText = abi.name || "unknown"
        name.className = "abi-name color" + (i % 2 ? "A" : "B")
        const desc = document.createElement('div')
        desc.innerText = abi.desc || "unknown"
        desc.className = "abi-desc color" + (i % 2? "C" : "D")
        core.append(name)
        core.append(desc)
        fragment.append(core)
    }
    $("#abis-list").empty().append(fragment);
}

function hydrateMoves(){
    const fragment = document.createDocumentFragment();
    const moves = gameData.moves
    for (const i in moves){
        if (i == 0) continue
        const mv = moves[i]
        const core = document.createElement('div')
        core.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = mv.name || "Unknown"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function(){
            fastdom.mutate(() => {
                feedPanelMoves($(this).attr('data-id'))
            });
        });
        fragment.append(core)
    }
    $("#moves-list").empty().append(fragment);
    feedPanelMoves(1)
}

function hydrateSpecies(){
    const fragment = document.createDocumentFragment();
    const species = gameData.species
    for (const i in species){
        if (i == 0) continue
        const spec = species[i]
        spec.stats.base[6] = 0
        for (const statID in spec.stats.base){
            const value = spec.stats.base[statID]
            feedBaseStatsStats(statID, value)
            if (statID < 6)spec.stats.base[6] += + value
        }
        //share the eggmoves to the evolution
        for (const evo of spec.evolutions){
            if (evo.in == -1) continue
            const nextEvo = species[evo.in]
            nextEvo.eggMoves = spec.eggMoves
            if (!nextEvo.TMHMMoves.length) nextEvo.TMHMMoves = spec.TMHMMoves
            if (!nextEvo.tutor.length) nextEvo.tutor = spec.tutor
        }
        // prepare to be appended a list of location where this pokemon appear
        spec.locations = [];
        // add to the html list 
        const core = document.createElement('div')
        core.className = "btn data-list-row sel-n-active"
        const image = document.createElement('img')
        image.className = 'species-list-sprite'
        image.src = getSpritesURL(spec.NAME)
        image.alt = spec.name
        core.appendChild(image)


        const name = document.createElement('span')
        name.innerText = spec.name || "unknown"
        name.className="species-name"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function(){
            fastdom.mutate(() => {
                feedPanelSpecies($(this).attr('data-id'))
            });
        });
        fragment.append(core)
    }
    setMeanBaseStats()
    $("#species-list").empty().append(fragment);
    feedPanelSpecies(1)
}

function hydrateLocation(){
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
    for (const mapID in maps){
        const map = maps[mapID]
        // FEED the pokemons location
        for (const locName of xmapTable){
            const mons = map[locName]
            if (!mons) continue
            for (const monID of mons){
                const specieID = monID[2]
                if (specieID < 1) continue
                gameData.species[specieID].locations.push(mapID)
            }
        }

        // hydrate the html list
        const listRow = document.createElement('div')
        listRow.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = map.name || "unknown"
        listRow.append(name)
        listRow.dataset.id = mapID
        $(listRow).on('click', function(){
            fastdom.mutate(() => {
                feedPanelLocations($(this).attr('data-id'))
            });
        });
        fragmentList.append(listRow)
    }
    $("#locations-list").empty().append(fragmentList);
    const locations = gameData.locations
    for (const rateName of xmapTable){
        
        const rates = locations[rateName+ "Rate"]
        if (!rates) continue
        
        if(rateName === "fish")
        {
            $('#locations-' + rateName).empty().append(fishingTable(rates))
            continue
        }

        const fragmentRate = document.createDocumentFragment();
        for (const rate of rates){
            
            addRow(fragmentRate, rate)
        }
        $('#locations-' + rateName).empty().append(fragmentRate)
    }
    feedPanelLocations(1)
}

function fishingTable(rates)
{
    const fragmentRate = document.createDocumentFragment();
    let parent = document.createElement('div')
    parent.className="old-rod"
    parent.innerHTML="Old Rod"
    fragmentRate.append(parent)
    for( let i = 0; i < rates.length;i++)
    {
        const rate = rates[i]
        if(i === 3)
        {
            parent = document.createElement('div')
            fragmentRate.append(parent)
            parent.className="good-rod"
            parent.innerHTML="Good Rod"
        }
        if(i === 6)
        {
            parent = document.createElement('div')
            fragmentRate.append(parent)
            parent.className="super-rod"
            parent.innerHTML="Super Rod"
        }
        addRow(parent, rate)
    }
    return fragmentRate
}

function addRow(parent, rate) {
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
    parent.append(nodeCore)
}

function hydrateTrainers(){
    // still missing in the data the alternative like for the rivals
    // and it's not ordered (it requires to have an order set manually)
    const frag = document.createDocumentFragment();
    const trainers = gameData.trainers
    for (const i in trainers){
        if (i == 0) continue
        const trainer = trainers[i]
        // add to the html list 
        const core = document.createElement('div')
        core.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = trainer.name || "unknown"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function(){
            fastdom.mutate(() => {
                feedPanelTrainers($(this).attr('data-id'))
            });
        });
        frag.append(core)
    }
    $('#trainers-list').empty().append(frag)
    feedPanelTrainers(1)
}

export default hydrate