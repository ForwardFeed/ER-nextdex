function updatePanel(id){
    const specie = gameData.species[id]

    console.log(specie)
    $('#specie-name').text(specie.name)
    updateBaseStats(specie.stats.base)
    setSprite(specie.NAME)
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

function changeStatBar(node, value){

}