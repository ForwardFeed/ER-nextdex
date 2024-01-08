function updatePanelSpecies(id){
    const specie = gameData.species[id]

    console.log(specie)
    $('#specie-name').text(specie.name)
    updateBaseStats(specie.stats.base)
    setSprite(specie.NAME)
    addAbilities(specie.stats.abis)
    addInnates(specie.stats.inns)
}


function updateBaseStats(stats){
    const baseStatsTable = [
        '#BHP',
        '#BAT',
        '#BDF',
        '#BSA',
        '#BSD',
        '#BSP',
    ]
    for (const i in baseStatsTable){
        changeBaseStat($(baseStatsTable[i]), stats[i], i)
    }
    
}

function setSprite(NAME){
    NAME = NAME.replace(/^SPECIES_/, '')
    $('#species-front').attr("src",`./sprites/${NAME}.png`);
}

function changeBaseStat(node, value, statID){
    node.find('.stat-num').text(value)
    const minMax = gameData.minMaxBaseStats[statID]
    const offsetColor = minMax[1] - minMax[0] // this is to make the most powerfull stats as 100% and min a 100%
    value = value - minMax[0]
    const totalBar = ((value / offsetColor) * 100).toFixed()
    const color = [
        [0, "gray"],
        [15, "#ff3300"],
        [30, "#cc6600"],
        [45, "#cccc00"],
        [60, "#99cc00"],
        [75, "#33cc33"],
        [90, "#00ff99"],
        [100, "#0033cc"],
    ].filter((x)=> x[0] >= totalBar)[0][1]
    node.find('.stat-bar').css('background', `linear-gradient(to right, ${color} ${totalBar}%, white 0%)`)
}


function addAbilities(abilities){
    const node = $('#species-abilities')
    node.empty()
    const fragment = document.createDocumentFragment()
    for (const i in abilities){
        const abi = gameData.abilities[abilities[i]]
        const name = document.createElement('div')
        name.className = "species-abilities"
        name.innerText = abi.name
        fragment.append(name)
    }
    node.append(fragment)
}

function addInnates(innates){
    const node = $('#species-innates')
    node.empty()
    const fragment = document.createDocumentFragment()
    for (const i in innates){
        const inn = gameData.abilities[innates[i]]
        const name = document.createElement('div')
        name.className = "species-innate"
        name.innerText = inn.name
        fragment.append(name)
    }
    node.append(fragment)
}
