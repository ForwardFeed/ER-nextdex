import { redirectLocation } from "./locations_panel.js"
import { redirectMove, moveOverlay } from "./moves_panel.js"
import { addTooltip, capitalizeFirstLetter, AisInB, JSUH } from "../utils.js"
import { queryFilter, search } from "../search.js"
import { gameData } from "../data_version.js"
import { createInformationWindow } from "../window.js"
import { getDefensiveCoverage } from "../weakness.js"

export function feedPanelSpecies(id){
    const specie = gameData.species[id]

    $('#species-name').text(specie.name)
    updateBaseStats(specie.stats.base)
    $('#species-front').attr('src', getSpritesURL(specie.NAME))
    $('#species-front')[0].onclick = ()=>{
        if ($('#species-front')[0].dataset.shiny === "off"){
            $('#species-front')[0].dataset.shiny = "on"
            $('#species-front').attr('src', getSpritesShinyURL(specie.NAME))
        } else {
            $('#species-front')[0].dataset.shiny = "off"
            $('#species-front').attr('src', getSpritesURL(specie.NAME))
        }
    }
    $('#species-front')[0].dataset.shiny = "off"
    setAbilities(specie.stats.abis)
    setInnates(specie.stats.inns)
    setTypes(specie.stats.types)
    setLevelUpMoves($('#learnset'), specie.levelUpMoves)
    setMoves($('#tmhm'), specie.TMHMMoves)
    setMoves($('#tutor'), specie.tutor)
    setMoves($('#eggmoves'), specie.eggMoves)
    setEvos(specie.evolutions)
    setLocations(specie.locations, specie.SEnc)
    $('#species-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#species-list').children().eq(id-1).addClass("sel-active").removeClass("sel-n-active")
    //need to make a selection for the type coverage
    const abilities = specie.stats.abis
        .map(x => gameData.abilities[x].name)
        .concat(specie.stats.inns
                .map(x=> gameData.abilities[x].name))
    const types = specie.stats.types.map(x => gameData.typeT[x])
    setDefensiveCoverage(getDefensiveCoverage(types, abilities))
}

export function redirectSpecie(specieId) {
    search.callbackAfterFilters = () =>{
        $('#species-list').children().eq(specieId-1).click()[0].scrollIntoView({behavior:"smooth"})
    }
    $("#btn-species").click()
   
}

function setDefensiveCoverage(coverage){
    const frag = document.createDocumentFragment()
    const multiplicators = Object.keys(coverage).sort()
    for (const mult of multiplicators){
        const row = JSUH("div", "species-coverage-row")
        const mulDiv = JSUH("div", "species-coverage-mul")
        const mulSpan = JSUH("span", "span-align", mult)
        mulDiv.append(mulSpan)
        row.append(mulDiv)
        const typeNodeList = JSUH("div", "species-coverage-list")
        const types = coverage[mult]
        for (const type of types){
            const colorDiv = JSUH("div", type.toLowerCase())
            const divText = JSUH("span", "span-align type", type.substr(0, 4))
            colorDiv.append(divText)
            typeNodeList.append(colorDiv)
        }
        row.append(typeNodeList)
        frag.append(row)
    }

    const core = $('#species-coverage')
    core.empty()
    core.append(frag)
}

function setTypes(types){
    const core = $('#species-types')
    const type1 = gameData.typeT[types[0]]
    const nodeType1 = core.children().eq(0)
    nodeType1.attr("class", "type " + type1.toLowerCase())
    nodeType1.text(type1)
    let type2
    if (!types[1] || types[1] == types[0] ) {
        type2 = ""
    } else {
        type2 = gameData.typeT[types[1]]
    }
    const nodeType2 = core.children().eq(1)
    nodeType2.attr("class", "type " + type2.toLowerCase())
    nodeType2.text(type2)
}

/**
 * 
 * @param {Object} move 
 * @returns an HTML node
 */
function setSplitMove(move){
    const nodeMoveSplit = document.createElement('img')
    nodeMoveSplit.src = `./icons/${gameData.splitT[move.split]}.png`
    nodeMoveSplit.className = "species-move-sprite"
    return nodeMoveSplit
}
/**
 * 
 * @param {Object} move
 * @param {number} moveID
 * @returns an HTML node
 */
function setMoveName(move){
    const type1 = gameData.typeT[move.types[0]].toLowerCase()
    const nodeMoveName = document.createElement('div')
    nodeMoveName.innerText = move.name
    nodeMoveName.className = `species-move-name ${type1}-t`
    return nodeMoveName
}
/**
 * 
 * @returns an HTML node
 */
function setMoveRow(moveID){
    const row = document.createElement('div')
    row.className="species-move-row"
    row.onclick=(ev) => {
        fastdom.mutate(() => {
            createInformationWindow(moveOverlay(moveID), {x: ev.clientX, y: ev.clientY})
        });
    }
    /*row.onmouseenter= (ev)=>{
        mouseHoverTimer = setTimeout(()=>{
            fastdom.mutate(() => {
                createInformationWindow(moveOverlay(moveID), {x: ev.clientX, y: ev.clientY})
            });
        }, 500) // Half of second
    }
    row.onmouseout = ()=>{
        clearTimeout(mouseHoverTimer)
    }*/
    return row
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
        const row = setMoveRow(moveID)
        row.append(setSplitMove(move, moveID))
        row.append(setMoveName(move))
        frag.append(row)
    }
    core.append(frag)
}
function setLevelUpMoves(core, moves){
    core.empty()
    const frag = document.createDocumentFragment()
    for (const {lv: lvl, id:id} of moves){
        const move = gameData.moves[id]
        if (!move) {
            console.warn(`unable to find move with ID ${id}`)
            continue
        }
        const row = setMoveRow(id)
        
        const nodeMoveLvl = document.createElement('div')
        nodeMoveLvl.innerText = +lvl || "Ev"
        nodeMoveLvl.className = "species-levelup-lvl"
        row.append(nodeMoveLvl)
        row.append(setSplitMove(move))

       
        row.append(setMoveName(move))
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

export function getSpritesURL(NAME){
    NAME = NAME.replace(/^SPECIES_/, '')
    return `./sprites/${NAME}.png`
}
export function getSpritesShinyURL(NAME){
    NAME = NAME.replace(/^SPECIES_/, '')
    return `./sprites/SHINY_${NAME}.png`
}

function changeBaseStat(node, value, statID){
    node.find('.stat-num').text(value)
    let color = "gray"
    for (const colorMapped of [
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
        if (abilities[i] == abilities[i -1] || abilities[i] === 0) {    
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
        if (innates[i] == innates[i -1] || innates[i] === 0) {    
            continue
        }
        const inn = gameData.abilities[innates[i]]
        const name = document.createElement('div')
        name.className = "species-innate"
        name.innerText = inn.name
        addTooltip(name, inn.desc)
        fragment.append(name)
    }
    node.append(fragment)
}


export function setupSpeciesPanel(){
    const subPanelsAndBtns = [
        ["#switch-moves", "#species-moves"],
        ["#switch-evos-locs", "#species-evos-locs"],
    ]
    subPanelsAndBtns.forEach((x)=>{
        $(x[0]).on('click', ()=>{
            $(x[0]).parent().find('.sel-active').addClass('sel-n-active').removeClass('sel-active')
            $(x[0]).addClass('sel-active').removeClass('sel-n-active')
            $("#species-bot").find('.active-sub-panel').removeClass('active-sub-panel').hide()
            $(x[1]).addClass('active-sub-panel').show()
        })
    })
    $('#species-basestats, #species-coverage').on('click', function(){
        $('#species-basestats, #species-coverage').toggle()
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
function convertMapName(word){
    return word.replace('MAPSEC_', '').split('_').map(toLowerButFirstCase).join(' ')
}

function setEvos(evos){
    const frag = document.createDocumentFragment()
    for (const evo of evos){
        if (evo.in == -1) continue //not set yet
        const node = document.createElement('div')
        node.className = "evo-parent" // i dunno how do classname it
        const intoSpecieNode = document.createElement('span')
        intoSpecieNode.className = "evo-into"
        intoSpecieNode.innerText = evo.from ? "From" : "Into "
        intoSpecieNode.appendChild(createSpeciesBlock(evo.in))
        node.append(intoSpecieNode)
        const reason = document.createElement('div')
        reason.className = "evo-reason"
        reason.innerText = setEvoReason(evo.kd, evo.rs)
        node.append(reason)
        frag.append(node)
    }
    $('#species-evos').empty().append(frag)
}

export function createSpeciesBlock(specieId)
{
    //create a div, then inside an image and the species name with redirection
    const node = $("<span/>").addClass("specie-block").click(() => {
      redirectSpecie(specieId)
    })
    const specie = gameData.species[specieId]
    const img= $("<img/>").attr('src', getSpritesURL(specie.NAME))
                .addClass("sprite")
    const name = $("<span/>").html(specie.name)
    return node.append(img).append(name)[0]

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
        "EVO_SPECIFIC_MAPSEC": `Evolves when level up at ${convertMapName(reason)}`
    }[gameData.evoKindT[kindID]]
}


function setLocations(locations, SEnc){
    const frag = document.createDocumentFragment()
    for (const [locID,value] of locations){
        const loc = gameData.locations.maps[locID]
        if (!loc) continue 
        const node = document.createElement('div')
        node.className = "specie-locs"
        let locationString = `Can be found at ${loc.name}`
        
        let first = true
        for (const field of value) {
            if(first) first=false
            else
            {
                locationString+=` and`
            }
            locationString+=` on ${capitalizeFirstLetter(field)}`
        }
        node.innerText = locationString
        node.onclick = () => {
            redirectLocation(locID)
        }
        frag.append(node)
    }
    for (const enc of SEnc){
        const node = document.createElement('div')
        node.className = "specie-locs-scripted"
        node.innerHTML = `Can be found at ${gameData.mapsT[enc.map]} as a ${gameData.scriptedEncoutersHowT[enc.how]}`
        frag.append(node)
    }
    $('#species-locations').empty().append(frag)
}
export const queryMapSpecies = {
    "name": (queryData, specie) => {
        if (AisInB(queryData, specie.name.toLowerCase())) return specie.name
    },
    "type": (queryData, specie) => {
        const types = specie.stats.types.map((x)=>gameData.typeT[x].toLowerCase())
        for (const type of types){
            if (AisInB(queryData, type)) return type
        }
        return false
    },
    "ability": (queryData, specie) => {
        let abilities = specie.stats.abis
                        .map((x)=>gameData.abilities[x].name.toLowerCase())
                        .concat(
                            specie.stats.inns.map((x)=>gameData.abilities[x].name.toLowerCase())
                        )
        for (const abi of abilities){
            if (AisInB(queryData, abi)) return abi
        }
        return false
    },
    "move": (queryData, specie) => {
        let moves = specie.eggMoves.concat(
            specie.levelUpMoves.map(x=>x.id).concat(
                specie.TMHMMoves.concat(
                    specie.tutor
                )
            )
        ).map((x)=>gameData.moves[x].name.toLowerCase())
        for (const move of moves){
            if (AisInB(queryData, move)) return move
        }
        return false
    },
}
export function updateSpecies(searchQuery){
    const species = gameData.species
    const nodeList = $('#species-list').children()
    let validID;
    for (const i in species){
        if (i == 0 ) continue
        const specie = species[i]
        const node = nodeList.eq(i - 1)
        if (queryFilter(searchQuery, specie, queryMapSpecies))
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    if (validID) feedPanelSpecies(validID)
}