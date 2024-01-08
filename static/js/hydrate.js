function hydrate(){
    if (!gameData){
        return console.warn("couldn't find gameData")
    }
    /*
        add some reconstitution data for ease of use here
    */
    gameData.minMaxBaseStats = new Array(6) 
    /*
        hydrate the UI with the data
    */
    hydrateAbilities()
    hydrateMoves()
    hydrateSpecies()
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
    for (let statID = 0; statID < 6; statID++){
        // - 2 because of the first none specie
        gameData.minMaxBaseStats[statID][2] = (gameData.minMaxBaseStats[statID][2] / (gameData.species.length - 2)).toFixed()
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
    const panel = $("#panel-abis");
    panel.append(fragment);
}

function hydrateMoves(){
    const fragment = document.createDocumentFragment();
    const moves = gameData.moves
    for (const i in moves){
        if (i == 0) continue
        const mv = moves[i]
        const core = document.createElement('div')
        core.className = "species-row color" + (i % 2 ? "A" : "B")
        const name = document.createElement('span')
        name.innerText = mv.name || "Unknown"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function(){
            console.log($(this).attr('data-id'))
        });
        fragment.append(core)
    }
    const panel = $("#moves-list");
    panel.append(fragment);

}

function hydrateSpecies(){
    const fragment = document.createDocumentFragment();
    const species = gameData.species
    for (const i in species){
        if (i == 0) continue //because of NONE species
        const spec = species[i]
        for (const statID in spec.stats.base){
            const value = spec.stats.base[statID]
            feedMinMaxBaseStats(statID, value)
        }
        const core = document.createElement('div')
        core.className = "species-row color" + (i % 2 ? "A" : "B")
        const name = document.createElement('span')
        name.innerText = spec.name || "unknown"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function(){
            fastdom.mutate(() => {
                updatePanelSpecies($(this).attr('data-id'))
            });
            
        });
        fragment.append(core)
    }
    setMeanBaseStats()
    const panel = $("#species-list");
    panel.append(fragment);
    updatePanelSpecies(1)
}