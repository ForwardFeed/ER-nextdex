function feedPanelSpecies(id){
    const specie = gameData.species[id]

    $('#species-name').text(specie.name)
    updateBaseStats(specie.stats.base)
    setSprite(specie.NAME)
    setAbilities(specie.stats.abis)
    setInnates(specie.stats.inns)
    setTypes(specie.stats.types)
    setLevelUpMoves($('#learnset'), specie.levelUpMoves)
    setMoves($('#tmhm'), specie.TMHMMoves)
    setMoves($('#tutor'), specie.tutor)
    setMoves($('#eggmoves'), specie.eggMoves)
    setEvos(specie.evolutions)
    $('#species-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#species-list').children().eq(id - 1).addClass("sel-active").removeClass("sel-n-active")
}

function setTypes(types){
    const core = $('#species-types')
    const type1 = gameData.typeT[types[0]]
    const nodeType1 = core.children().eq(0)
    nodeType1.attr("class", "species-type " + type1.toLowerCase())
    nodeType1.text(type1)
    let type2
    if (!types[1] || types[1] == types[0] ) {
        type2 = ""
    } else {
        type2 = gameData.typeT[types[1]]
    }
    const nodeType2 = core.children().eq(1)
    nodeType2.attr("class", "species-type " + type2.toLowerCase())
    nodeType2.text(type2)
}

function setMoves(core, moves){
    core.empty()
    const frag = document.createDocumentFragment()
    for (const moveID of moves){
        const move = gameData.moves[moveID]
        if (!move) {
            console.warn(`unable to find move with ID ${moveID}`)
            continue
        }
        const node = document.createElement('div')
        node.innerText = move.name
        frag.append(node)
    }
    core.append(frag)
}
function setLevelUpMoves(core, moves){
    core.empty()
    const frag = document.createDocumentFragment()
    for (const moveID of moves){
        const move = gameData.moves[moveID.id]
        if (!move) {
            console.warn(`unable to find move with ID ${moveID.id}`)
            continue
        }
        const row = document.createElement('div')
        row.className="species-levelup-row"
        const nodeMoveLvl = document.createElement('div')
        nodeMoveLvl.innerText = +moveID.lv || "Ev"
        nodeMoveLvl.className = "species-levelup-lvl"
        row.append(nodeMoveLvl)
        const nodeMoveName = document.createElement('div')
        nodeMoveName.innerText = move.name
        nodeMoveName.className = "species-levelup-name"
        row.append(nodeMoveName)
        frag.append(row)
    }
    core.append(frag)
}

function updateBaseStats(stats){
    const baseStatsTable = [
        '#BHP',
        '#BAT',
        '#BDF',
        '#BSA',
        '#BSD',
        '#BSP',
        '#BST',
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
    let color = "gray"
    for (const colorMapped of colorMap = [
        [gameData.speciesStats.result.min5[statID], "#ff3300"],
        [gameData.speciesStats.result.min20[statID], "#cc6600"],
        [gameData.speciesStats.result.median[statID], "#cccc00"],
        [gameData.speciesStats.result.top20[statID], "#99cc00"],
        [gameData.speciesStats.result.top5[statID], "#33cc33"],
        [256, "#0033cc"],
    ]){
        if (value < colorMapped[0]) break
        color = colorMapped[1]
    }
    /*const CV = 210// color variator, the closer to 255, the brighter
    let colorMath = +(((value / average) * CV).toPrecision(2))
    console.log(colorMath)
    let color;

    if (colorMath < CV){
        color = `rgb(170, ${colorMath}, 0)`
    } else if (colorMath < (CV * 1.5)){
        colorMath = colorMath > 254 ? 255 : colorMath
        color = `rgb(${colorMath / 2}, ${colorMath}, 0)`
    } else {
        colorMath = colorMath > 254 ? 255 : colorMath
        color = `rgb(0, ${colorMath / 2}, ${colorMath})`
    }
    ^ this one is funky but not working yet
    */
    const maxValue = statID < 6 ? 255 : gameData.speciesStats.result.maxBST
    const percent = ((value / maxValue ) * 100).toFixed()
    node.find('.stat-num').css('background-color', color)
    node.find('.stat-bar').css('background', `linear-gradient(to right, ${color} ${percent}%, white 0%)`)
}

function setAbilities(abilities){
    const node = $('#species-abilities')
    node.empty()
    const fragment = document.createDocumentFragment()
    for (const i in abilities){
        if (abilities[i] == abilities[i -1]) {    
            continue
        }
        const abi = gameData.abilities[abilities[i]]
        const name = document.createElement('div')
        name.className = "species-abilities"
        name.innerText = abi.name
        addTooltip(name, abi.desc)
        fragment.append(name)
    }
    node.append(fragment)
}

function setInnates(innates){
    const node = $('#species-innates')
    node.empty()
    const fragment = document.createDocumentFragment()
    for (const i in innates){
        const inn = gameData.abilities[innates[i]]
        const name = document.createElement('div')
        name.className = "species-innate"
        name.innerText = inn.name
        addTooltip(name, inn.desc)
        fragment.append(name)
    }
    node.append(fragment)
}


function setupSpeciesSubPanel(){
    const subPanelsAndBtns = [
        ["#switch-moves", "#species-moves"],
        ["#switch-evos", "#species-evos"]
    ]
    subPanelsAndBtns.forEach((x)=>{
        $(x[0]).on('click', ()=>{
            $(x[0]).parent().find('.sel-active').addClass('sel-n-active').removeClass('sel-active')
            $(x[0]).addClass('sel-active').removeClass('sel-n-active')
            $("#species-bot").find('.active-sub-panel').removeClass('active-sub-panel').hide()
            $(x[1]).addClass('active-sub-panel').show()
        })
    })
}
function toLowerButFirstCase(word){
    word = word.toLowerCase()
    return word.charAt(0).toUpperCase() + word.slice(1);
}
function convertItemNames(word){
    return word.replace('ITEM_', '').split('_').map(toLowerButFirstCase).join(' ')
}
function convertMoveNames(word){
    return word.replace('MOVE_', '').split('_').map(toLowerButFirstCase).join(' ')
}
function convertSpeciesNames(word){
    return word.replace('SPECIES_', '').split('_').map(toLowerButFirstCase).join(' ')
}

function setEvos(evos){
    const frag = document.createDocumentFragment()
    for (const evo of evos){
        if (evo.in == -1) continue //not set yet
        const node = document.createElement('div')
        node.className = "evo-parent" // i dunno how do classname it
        const intoSpecieNode = document.createElement('div')
        intoSpecieNode.className = "evo-into"
        intoSpecieNode.innerText = `into ${gameData.species[evo.in].name}`
        node.append(intoSpecieNode)
        const reason = document.createElement('div')
        reason.className = "evo-reason"
        reason.innerText = setEvoReason(evo.kd, evo.rs)
        node.append(reason)
        frag.append(node)
    }
    $('#species-evos').empty().append(frag)
}
/**
 * 
 * @param {number} kindID that is mapped into gameData evoKindT
 * @param {string} reason the whatever reason that is given
 * @returns text
 */
function setEvoReason(kindID, reason){
    return {
        "EVO_LEVEL": `Evolves at level: ${reason}`,
        "EVO_MEGA_EVOLUTION": `Mega-evolves with ${convertItemNames(reason)}`,
        "EVO_ITEM": `Evolves with ${convertItemNames(reason)}`,
        "EVO_MOVE": `Evolves with ${convertMoveNames(reason)}`,
        "EVO_LEVEL_ATK_LT_DEF": `Evolves if Atk < def`,
        "EVO_LEVEL_ATK_GT_DEF": `Evolves if Atk > def`,
        "EVO_LEVEL_ATK_EQ_DEF": `Evolves if Atk = def`,
        "EVO_LEVEL_SILCOON": "???",
        "EVO_LEVEL_CASCOON": "???" ,
        "EVO_PRIMAL_REVERSION": "???",
        "EVO_ITEM_MALE": `Evolves with ${convertItemNames(reason)}`,
        "EVO_ITEM_FEMALE": `Evolves with ${convertItemNames(reason)}`,
        "EVO_LEVEL_NINJASK": "???",
        "EVO_LEVEL_SHEDINJA": "???",
        "EVO_MOVE_MEGA_EVOLUTION": `Mega-evolves with ${convertMoveNames(reason)}`,
        "EVO_LEVEL_FEMALE": `Evolves at level: ${reason} if female`,
        "EVO_LEVEL_MALE": `Evolves at level: ${reason} if male`,
        "EVO_SPECIFIC_MON_IN_PARTY": `Evolves if ${convertSpeciesNames(reason)} is in party`,
        "EVO_LEVEL_NIGHT": `Evolves at night if level ${reason}`,
        "EVO_LEVEL_DUSK": `Evolves at dusk if level ${reason}`,
        "EVO_LEVEL_DAY": `Evolves at day if level ${reason}`,
    }[gameData.evoKindT[kindID]]
}

function updateSpecies(search){
    const species = gameData.species
    const nodeList = $('#species-list').children()
    let validID;
    for (const i in species){
        if (i == 0 ) continue
        const specie = species[i]
        const node = nodeList.eq(i - 1)
        if (specie.name.toLowerCase().indexOf(search) >= 0 ? true : false)
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    if (validID) feedPanelSpecies(validID)
}