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
    //const offsetColor = minMax[1] - minMax[0] // this is to make the most powerfull stats as 100% and min a 100%
    //value = value - minMax[0]

    const average = +gameData.minMaxBaseStats[statID][2]
    const color = [
        [0, "gray"],
        [40, "#ff3300"],
        [80, "#cc6600"],
        [120, "#cccc00"],
        [160, "#99cc00"],
        [200, "#33cc33"],
        [240, "#00ff99"],
        [280, "#0033cc"],
    ].filter((x)=> x[0] >= ((value / average) * 100).toPrecision(2))[0][1]
    const percent = ((value / 255) * 100).toFixed()
    node.find('.stat-bar').css('background', `linear-gradient(to right, ${color} ${percent}%, white 0%)`)
}


function addAbilities(abilities){
    const node = $('#species-abilities')
    node.empty()
    const fragment = document.createDocumentFragment()
    for (const i in abilities){
        if (abilities[i] == abilities[i -1]) continue
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
