function hydrate(){
    if (!gameData){
        return console.warn("couldn't find gameData")
    }
    /*
        add some reconstitution data for ease of use here
    */
    gameData.minMaxBaseStats = new Array(6) 
    gameData.BST = []
    /*
        hydrate the UI with the data
    */
    hydrateAbilities()
    hydrateMoves()
    hydrateSpecies()
    hydrateLocation()
}

function feedMinMaxBaseStats(statID, value){
    const row = gameData.minMaxBaseStats[statID]
    if (row){
        if (row[0] > value){
            gameData.minMaxBaseStats[statID][0] = value
        }
        if (row[1] < value){
            gameData.minMaxBaseStats[statID][1] = value
        }
        gameData.minMaxBaseStats[statID][2] += value
    } else {
        gameData.minMaxBaseStats[statID] = [value, value, value]
    }
}

function setMeanBaseStats(){
    for (let statID = 0; statID < 7; statID++){
        // - 1 because of the first none specie
        gameData.minMaxBaseStats[statID][2] = (gameData.minMaxBaseStats[statID][2] / (gameData.species.length - 1)).toFixed()
    }
    
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
        if (i == 0) continue //because of NONE species
        const spec = species[i]
        spec.stats.base[6] = 0
        for (const statID in spec.stats.base){
            const value = spec.stats.base[statID]
            feedMinMaxBaseStats(statID, value)
            if (statID < 6)spec.stats.base[6] += + value
        }
        const core = document.createElement('div')
        core.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = spec.name || "unknown"
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
    const fragmentList = document.createDocumentFragment();
    const maps = gameData.locations.maps
    for (const i in maps){
        const map = maps[i]
        const listRow = document.createElement('div')
        listRow.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = map.name || "unknown"
        listRow.append(name)
        listRow.dataset.id = i
        $(listRow).on('click', function(){
            fastdom.mutate(() => {
                feedPanelLocations($(this).attr('data-id'))
            });
        });
        fragmentList.append(listRow)
    }
    $("#locations-list").empty().append(fragmentList);
    const xrateTable = [
        "land",
        "water",
        "fish",
        "honey",
        "rock",
        "hidden",
    ]
    const locations = gameData.locations
    for (const rateName of xrateTable){
        const rates = locations[rateName+ "Rate"]
        if (!rates) continue
        const fragmentRate = document.createDocumentFragment();
        for (const rate of rates){
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
            fragmentRate.append(nodeCore)
        }
        $('#locations-' + rateName).empty().append(fragmentRate)
    }
    feedPanelLocations(0)
}