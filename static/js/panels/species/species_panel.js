import { redirectLocation } from "../locations_panel.js"
import { matchedMoves, moveOverlay } from "../moves_panel.js"
import { addTooltip, capitalizeFirstLetter, AisInB, e, JSHAC, reorderNodeList } from "../../utils.js"
import { search } from "../../search.js"
import { longClickToFilter, queryFilter3 } from "../../filters.js"
import { gameData, compareData } from "../../data_version.js"
import { createInformationWindow, removeInformationWindow } from "../../window.js"
import { getDefensiveCoverage, abilitiesToAddedType} from "../../weakness.js"
import { nodeLists } from "../../hydrate/hydrate.js"
import { cubicRadial } from "../../radial.js"
import { getHintInteractibilityClass, settings } from "../../settings.js"
import { feedCommunitySets } from "./community_sets.js"
import { LIST_RENDER_RANGE, resetListRendering, toggleLayoutList } from "../../hydrate/list_species.js"

export const StatsEnum = [
    "HP",
    "Atk",
    "Def",
    "SpA",
    "SpD",
    "Spe",
]

export let currentSpecieID = 1

export function feedPanelSpecies(id) {
    currentSpecieID = id
    const specie = gameData.species[id]
    $('#species-name').text(`${specie.name}#${specie.dex.id || "??"}`)
    $('#species-id').text(`ID: ${specie.id}`)
    updateBaseStats(specie.stats.base)
    $('#species-front').attr('src', getSpritesURL(specie.NAME))
    $('#species-front')[0].onclick = () => {
        if ($('#species-front')[0].dataset.shiny === "off") {
            $('#species-front')[0].dataset.shiny = "on"
            $('#species-front').attr('src', getSpritesShinyURL(specie.NAME))
        } else {
            $('#species-front')[0].dataset.shiny = "off"
            $('#species-front').attr('src', getSpritesURL(specie.NAME))
        }
    }
    $('#species-front')[0].dataset.shiny = "off"
    setAbilities(specie.stats.abis, specie)
    setInnates(specie.stats.inns)
    specie.activeAbi = 0
    specie.thirdType = abilitiesExtraType(specie.activeAbi, specie)
    setTypes([...new Set(specie.stats.types), specie.thirdType], specie)
    setAllMoves(specie)
    setEvos(specie.evolutions)
    setLocations(specie.locations, specie.SEnc)
    $('#species-desc').text(specie.dex.desc)
    setSpecieHeightWeight()
    $('#species-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    nodeLists.species[id - 1].classList.replace("sel-n-active", "sel-active")

    feedCommunitySets(specie.NAME)
}

export function redirectSpecie(specieId) {
    if ($("#btn-species")[0].classList.contains("btn-active")) {
        $(nodeLists.species[specieId - 1]).click()[0].scrollIntoView({ behavior: "smooth" })
    } else {
        search.callbackAfterFilters = () => {
            $(nodeLists.species[specieId - 1]).click()[0].scrollIntoView({ behavior: "smooth" })
        }
        $("#btn-species").click()
    }
}

let freedom = false
function setSpecieHeightWeight(){
    const specie = gameData.species[currentSpecieID]
    const height = freedom ? `${((specie.dex?.hw?.[0] / 10) * 3.28).toFixed(2)} ft` : `${(specie.dex?.hw?.[0] / 10).toFixed(2)} m`
    const weight = freedom ? `${((specie.dex?.hw?.[1] / 10) * 2.2).toFixed(2)} lb` : `${(specie.dex?.hw?.[1] / 10).toFixed(2)} kg`
    $('#species-height').text(height)
    $('#species-weight').text(weight)
}

function setDefensiveCoverage(coverage) {
    const frag = document.createDocumentFragment()
    const multiplicators = Object.keys(coverage).sort()
    for (const mult of multiplicators) {
        const row = e("div", "species-coverage-row")
        const mulDiv = e("div", "species-coverage-mul")
        const mulSpan = e("span", "span-align", mult)
        mulDiv.append(mulSpan)
        row.append(mulDiv)
        const typeNodeList = e("div", "species-coverage-list")
        const types = coverage[mult]
        for (const type of types) {
            const colorDiv = e("div", `${type.toLowerCase()} type`)
            const divText = e("span", "span-align", type.substr(0, 5))
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

function setTypes(types, specie) {
    types = types.filter(x => x != undefined)
    const core = $('#species-types')
    for (let i = 0; i < 3; i++) {
        const type = gameData.typeT[types[i]] || ""
        const node = core.children().eq(i).children().eq(0)
        if (!type) {
            node.hide()
            continue
        }
        node.show()
        node.text(type).attr("class", `type ${type.toLowerCase()}`)
    }
    setDefensiveCoverage(
        getDefensiveCoverage(specie, specie.activeAbi)
    )
}

export function setAllMoves(specie = gameData.species[currentSpecieID]){
    setLevelUpMoves($('#learnset'), specie.levelUpMoves, $('#learnset-title'))
    setMoves($('#tmhm'), specie.TMHMMoves, $('#tmhm-title'))
    setMoves($('#tutor'), specie.tutor, $('#tutor-title'))
    setMoves($('#eggmoves'), specie.eggMoves,$('#eggmoves-title'))
    setMoves($('#preevomoves'), specie.preevomoves || [], $('#preevomoves-title'))
    
    if ($('#eggmoves-title').css('display') === 'none' && $('#preevomoves-title').css('display') === 'none') {
        $('#eggpreevo-title').hide()
    } else {
        $('#eggpreevo-title').show()
    }
}

function filterMoves(moveIDlist) {
    if (!matchedMoves) return moveIDlist
    return moveIDlist.map(x => matchedMoves.indexOf(x) != -1 && x).filter(x => x)
}
/**
 * @param {Object} move 
 * @returns an HTML node
 */
export function setSplitMove(move) {
    const nodeMoveSplit = document.createElement('img')
    nodeMoveSplit.src = `./icons/${gameData.splitT[move.split]}.png`
    nodeMoveSplit.className = "species-move-sprite"
    return nodeMoveSplit
}
/**
 * @param {Object} move
 * @param {number} moveID
 * @returns an HTML node
 */
export function setMoveName(move) {
    const type1 = gameData.typeT[move.types[0]].toLowerCase()
    const nodeMoveName = document.createElement('div')
    nodeMoveName.innerText = move.name
    nodeMoveName.className = `species-move-name ${type1}-t`
    return nodeMoveName
}
export function setMovePower(move){
    return e('div', 'species-move-pwr', move.pwr ? move.pwr : null)
}
/**
 * 
 * @returns an HTML node
 */
export function setMoveRow(moveID) {
    const row = document.createElement('div')
    row.className = "species-move-row"
    row.onclick = function(ev){
        fastdom.mutate(() => {
            createInformationWindow(moveOverlay(moveID), ev)
        });
    }
    return row
}

function setMoves(core, moves, title) {
    core.empty()
    if (!moves.length){
        core.hide()
        title.hide()
        return
    } else {
        core.show()
        title.show()
    }
    const frag = document.createDocumentFragment()
    moves = filterMoves(moves)
    for (const moveID of moves) {
        const move = gameData.moves[moveID]
        if (!move) {
            console.warn(`unable to find move with ID ${moveID}`)
            continue
        }
        const row = setMoveRow(moveID)
        row.append(setSplitMove(move, moveID))
        row.append(setMoveName(move))
        row.append(setMovePower(move))
        frag.append(row)
    }
    core.append(frag)
}
function setLevelUpMoves(core, moves, title) {
    core.empty()
    if (!moves.length){
        core.hide()
        title.hide()
        return
    } else {
        core.show()
        title.show()
    }
    const frag = document.createDocumentFragment()
    for (const { lv: lvl, id: id } of moves) {
        if (matchedMoves && matchedMoves.indexOf(id) == -1) continue
        const move = gameData.moves[id]
        if (!move) {
            console.warn(`unable to find move with ID ${id}`)
            continue
        }
        frag.append(JSHAC([
            setMoveRow(id), [
                e('div', "species-levelup-lvl"), [e('span', null, +lvl || "Ev")],
                setSplitMove(move),
                setMoveName(move),
                setMovePower(move)
            ]
        ]))
    }
    core.append(frag)
}

function updateBaseStats(stats) {
    const baseStatsTable = [
        '#BHP',
        '#BAT',
        '#BDF',
        '#BSA',
        '#BSD',
        '#BSP',
        '#BST',
    ]
    for (const i in baseStatsTable) {
        changeBaseStat($(baseStatsTable[i]), stats[i], i, compareData?.species?.[currentSpecieID].stats?.base[i])
    }
}

export function getSpritesURL(NAME) {
    NAME = NAME.replace(/^SPECIES_/, '')
    return `./sprites/${NAME}.png`
}
export function getSpritesShinyURL(NAME) {
    NAME = NAME.replace(/^SPECIES_/, '')
    return `./sprites/SHINY_${NAME}.png`
}

export function getColorOfStat(value, statID){
    let color = "gray"
    for (const colorMapped of [
        [gameData.speciesStats.result.min5[statID], "#ff3300"],
        [gameData.speciesStats.result.min20[statID], "#cc6600"],
        [gameData.speciesStats.result.median[statID], "#cccc00"],
        [gameData.speciesStats.result.top20[statID], "#33CC8B"],
        [gameData.speciesStats.result.top5[statID], "#33cc33"],
        [256, "#0033cc"],
    ]) {
        if (value < colorMapped[0]) break
        color = colorMapped[1]
    }
    return color
}

function changeBaseStat(node, value, statID, cmp) {

    if (cmp && !isNaN(+cmp)){
        node.find('.stat-num').html(`${cmp}→<br>${value}`)
        node.find('.stat-num').css('font-size', '0.5em').css('width', '3em')
    } else {
        node.find('.stat-num').text(value)
        node.find('.stat-num').css('font-size', '1em').css('width', '')
    }
    const color = getColorOfStat(value, statID)
    
    const maxValue = statID < 6 ? 255 : gameData.speciesStats.result.maxBST
    const percent = ((value / maxValue) * 100).toFixed()
    node.find('.stat-num').css('background-color', color)
    node.find('.stat-bar').css('background', `linear-gradient(to right, ${color} ${percent}%, #0000 0%)`)[0]
    node[0].animate([
        {width: "0"},
        {width: `100%`},
    ], {
        duration: 300,
        iterations: 1,
    })
}

function setAbilities(abilities, specie) {
    $('#species-abilities').empty().append(
        JSHAC(abilities.map((val, i) => {
            if (abilities[i] == abilities[i - 1] || abilities[i] === 0) {
                return undefined
            }
            const abi = gameData.abilities[abilities[i]]
            const name = e("div", "species-ability " + getHintInteractibilityClass(), abi.name)
            addTooltip(name, abi.desc)
            name.onclick = () => {
                $('#species-abilities .sel-active').removeClass('sel-active').addClass('sel-n-active')
                name.classList.replace('sel-n-active', 'sel-active')
                specie.activeAbi = i
                setTypes([...new Set(specie.stats.types), abilitiesExtraType(specie.activeAbi, specie)], specie)
            }
            name.classList.add(i ? "sel-n-active" : "sel-active")
            longClickToFilter(0, name, "ability", () => { return abi.name })
            return name
        }).filter(x => x))
    )
}

function setInnates(innates) {
    $('#species-innates').empty().append(
        JSHAC(innates.map((val, i) => {
            if (innates[i] == innates[i - 1] || innates[i] === 0) {
                return
            }
            const inn = gameData.abilities[innates[i]]
            const name = e("div", "species-innate " + getHintInteractibilityClass(), inn.name)
            longClickToFilter(0, name, "ability", () => { return inn.name }, 0)
            addTooltip(name, inn.desc)
            return name
        }).filter(x => x))
    )
}

export function abilitiesExtraType(abilityID, specie) {
    if (abilityID == false) return abilitiesToAddedType(specie.stats.inns.filter(x => x))
    return abilitiesToAddedType([specie.stats.abis[abilityID], ...specie.stats.inns].filter(x => x))
}

export function setupSpeciesPanel() {
    const subPanelsAndBtns = [
        ["#switch-moves", "#species-moves"],
        ["#switch-evos-locs", "#species-evos-locs"],
        ["#switch-misc", "#species-misc"],
        ["#switch-sets", "#species-sets"],
    ]
    subPanelsAndBtns.forEach((x) => {
        $(x[0]).on('click', () => {
            $(x[0]).parent().find('.sel-active').addClass('sel-n-active').removeClass('sel-active')
            $(x[0]).addClass('sel-active').removeClass('sel-n-active')
            $("#species-bot").find('.active-sub-panel').removeClass('active-sub-panel').hide()
            $(x[1]).addClass('active-sub-panel').show()
        })
    })
    $('#species-basestats, #species-coverage').on('click', function () {
        $('#species-basestats, #species-coverage').toggle()
    })
    $('#species-types').children().each((index, val) => {
        longClickToFilter(0, val, "type")
    })
    $('#species-hw').on('click', ()=>{
        freedom = !freedom
        setSpecieHeightWeight()
    })
    $('#species-return-list-layout').on('click', ()=>{
        toggleLayoutList(true)
        $('#species-return-list-layout').hide()
    })
}
function toLowerButFirstCase(word) {
    word = word.toLowerCase()
    return word.charAt(0).toUpperCase() + word.slice(1);
}
function convertItemNames(word) {
    return word.replace('ITEM_', '').split('_').map(toLowerButFirstCase).join(' ')
}
function convertMoveNames(word) {
    return word.replace('MOVE_', '').split('_').map(toLowerButFirstCase).join(' ')
}
function convertSpeciesNames(word) {
    return word.replace('SPECIES_', '').split('_').map(toLowerButFirstCase).join(' ')
}
function convertMapName(word) {
    return word.replace('MAPSEC_', '').split('_').map(toLowerButFirstCase).join(' ')
}

export function setEvos(evos) {
    const frag = document.createDocumentFragment()
    for (const evo of evos) {
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

export function createSpeciesBlock(specieId) {
    //create a div, then inside an image and the species name with redirection
    const node = $("<span/>").addClass("specie-block").click(() => {
        redirectSpecie(specieId)
    })
    const specie = gameData.species[specieId]
    const img = $("<img/>").attr('src', getSpritesURL(specie.NAME))
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
function setEvoReason(kindID, reason) {
    return {
        "EVO_LEVEL": `Evolves at level: ${reason}`,
        "EVO_MEGA_EVOLUTION": `Mega-evolves with ${convertItemNames(reason)}`,
        "EVO_ITEM": `Evolves with ${convertItemNames(reason)}`,
        "EVO_MOVE": `Evolves with ${convertMoveNames(reason)}`,
        "EVO_LEVEL_ATK_LT_DEF": `Evolves if Atk < def`,
        "EVO_LEVEL_ATK_GT_DEF": `Evolves if Atk > def`,
        "EVO_LEVEL_ATK_EQ_DEF": `Evolves if Atk = def`,
        "EVO_LEVEL_SILCOON": "???",
        "EVO_LEVEL_CASCOON": "???",
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


function setLocations(locations, SEnc) {
    const frag = document.createDocumentFragment()
    for (const [locID, value] of locations) {
        const loc = gameData.locations.maps[locID]
        if (!loc) continue
        const node = document.createElement('div')
        node.className = "specie-locs"
        let locationString = `Can be found at ${gameData.mapsT[loc.id]}`

        let first = true
        for (const field of value) {
            if (first) first = false
            else {
                locationString += ` and`
            }
            locationString += ` on ${capitalizeFirstLetter(field)}`
        }
        node.innerText = locationString
        node.onclick = () => {
            redirectLocation(locID)
        }
        frag.append(node)
    }
    for (const {how, map, locaId} of SEnc) {
        const node = e('div', 'specie-locs-scripted',
            `Can be found at ${gameData.mapsT[map]} as a ${gameData.scriptedEncoutersHowT[how]}`, {
            onclick: () => {
                if (typeof locaId === "undefined") return
                redirectLocation(locaId)
                // this may not work because maps for scripted encounters aren't sync with location encounter
            }
        }) 
        frag.append(node)
    }
    $('#species-locations').empty().append(frag)
}

export function setupReorderBtn() {
    const row = e('div', 'data-list-row', 'reorder')
    function byAlpha(a, b) {
        return a.name.localeCompare(b.name)
    }
    function localeByStats(statID, a, b) {
        return a.stats.base[statID] - b.stats.base[statID]
    }
    const list = $('#species-list')
    const sortOrderStats = (ev, statsID) => {
        createInformationWindow(cubicRadial([
            ["STRONGER First >", (ev) => {
                reorderNodeList(list, localeByStats.bind(null, statsID), ">")
                removeInformationWindow(ev)
            }],
            ["weaker first <", (ev) => {
                reorderNodeList(list, localeByStats.bind(null, statsID), "<")
                removeInformationWindow(ev)
            }],
            undefined, undefined // if you don't make it a square it won't work
        ], "8em", "1em"), ev, "mid", true, true)
    }
    row.onclick = (ev) => {
        createInformationWindow(cubicRadial([
            ["Default", (ev) => {
                reorderNodeList(list)
                removeInformationWindow(ev)

            }],
            ["A-Z", (ev) => {
                reorderNodeList(list, byAlpha)
                removeInformationWindow(ev)
            }],
            ["Stats", () => {
                createInformationWindow(cubicRadial([
                    ["HP", (ev) => {
                        sortOrderStats(ev, 0)
                    }],
                    ["Atk", (ev) => {
                        sortOrderStats(ev, 1)
                    }],
                    ["Def", (ev) => {
                        sortOrderStats(ev, 2)
                    }],
                    ["SpA", (ev) => {
                        sortOrderStats(ev, 3)
                    }],
                    ["SpD", (ev) => {
                        sortOrderStats(ev, 4)
                    }],
                    ["Spe", (ev) => {
                        sortOrderStats(ev, 5)
                    }],
                    ["BST", (ev) => {
                        sortOrderStats(ev, 6)
                    }],
                    undefined // if you don't make it a square it won't work
                ], "4em", "1em"), ev, "mid", true, false)
            }],
        ], "6em", "1em"), ev, "mid", true, false)
    }

    return row
}

function buildResist(specie){
    const weaknesses = getDefensiveCoverage(specie, 0)
    specie.resist = [].concat.apply([], [weaknesses["0"], weaknesses["0.25"], weaknesses["0.5"]])
        .filter(x => x)
        .map(x => x.toLowerCase())
}


const prefixTree = {
    treeId: "species"
}
export function buildSpeciesPrefixTrees(){
    prefixTree.name = {}
    prefixTree.type = {}
    gameData.species.forEach((x, i)=>{
        x.splicedName = x.name.split(' ').map(x => x.toLowerCase())
        for (const splice of x.splicedName){
            const prefix = splice.charAt(0)
            if (!prefixTree.name[prefix]) prefixTree.name[prefix] = []
            prefixTree.name[prefix].push({data: i, suggestions: x.name})
        }
        x.allTypesNames = x.stats.types.map((pokeType) => {
            const typeAsString = gameData.typeT[pokeType].toLowerCase()
            const prefix = typeAsString.charAt(0)
            if (!prefixTree.type[prefix]) prefixTree.type[prefix] = []
            prefixTree.type[prefix].push({data: i, suggestions: typeAsString})
            return typeAsString
        })
    })
}

export const queryMapSpecies = {
    "name": (queryData, specie) => {
        if (specie.name.toLowerCase() === queryData) return [true, specie.name, false]
        queryData = queryData.split(' ')
        if (!queryData.length) return false
        for (const subQueryData of queryData){
            let hasSlicedMatched = false
            for (const splice of specie.splicedName){
                hasSlicedMatched = AisInB(subQueryData, splice) || hasSlicedMatched
            }
            if (!hasSlicedMatched) return false
        }
        return specie.name
        
    },
    "type": (queryData, specie) => {
        if (settings.monotype && specie.allTypesNames[0]) {
            return AisInB(queryData, specie.allTypesNames[0]) && specie.allTypesNames[0] == specie.allTypesNames[1]
        }
        const typesQueried = queryData.split(' ').filter(x => x)
        const thirdType = specie.thirdType ? gameData.typeT[specie.thirdType].toLowerCase() : null
        let multiSuggestions = []
        for (const typeQueried of typesQueried){
            let isValid = false
            if(thirdType && AisInB(typeQueried, thirdType)) {
                multiSuggestions.push(thirdType)
                continue
            }
            for (const type of specie.allTypesNames) {
                if (AisInB(typeQueried, type)) {
                    multiSuggestions.push(type)
                    isValid = true
                    break
                }
            }
            if (!isValid) {
                return false
            }
        }
        return {multiSuggestions: multiSuggestions}
    },
    "ability": (queryData, specie) => {
        let abilities = specie.stats.abis
            .map((x) => gameData.abilities[x].name.toLowerCase())
            .concat(
                specie.stats.inns.map((x) => gameData.abilities[x].name.toLowerCase())
            )
        for (const abi of abilities) {
            if (AisInB(queryData, abi)) {
                return [abi === queryData, abi, false]
            }
        }
        return false
    },
    "move": (queryData, specie) => {
        let moves = specie.allMoves?.map((x) => gameData.moves[x].name.toLowerCase()) || []
        let isUnperfectMatch = false
        for (const move of moves) {
            if (AisInB(queryData, move)) {
                if (queryData === move) return [true, move, false]
                isUnperfectMatch = move
            }
        }
        return isUnperfectMatch
    },
    "region": (queryData, specie) => {
        const specieRegion = specie.region?.toLowerCase() || ""
        if (AisInB(queryData, specieRegion)) {
            return specie.region
        }
    },
    "resist": (queryData, specie) => {
        const typesQueried = queryData.split(' ').filter(x => x)
        let multiSuggestions = []
        for (const typeQueried of typesQueried){
            let isValid = false
            if (!specie.resist) buildResist(specie)
            for (const typeR of specie.resist){
                if (AisInB(typeQueried, typeR)) {
                    multiSuggestions.push(typeR)
                    isValid = true
                    break
                }
            }
            if (!isValid) {
                return false
            }
        }
        return {multiSuggestions: multiSuggestions}
    },
}

export let matchedSpecies = undefined
export function updateSpecies(searchQuery) {
    resetListRendering()
    const species = gameData.species
    matchedSpecies = queryFilter3(searchQuery, species, queryMapSpecies, prefixTree)
    let validID;
    let listRenderingCapacity = LIST_RENDER_RANGE;
    const specieLen = species.length
    for (let i = 0; i < specieLen; i++) {
        if (i == 0) continue
        const node = $(nodeLists.species[i - 1])
        const nodeLayoutList = $(nodeLists.listLayoutSpecies[i - 1])
        if (!matchedSpecies || matchedSpecies.indexOf(i) != -1) {
            if (!validID) validID = i
            node.show()
            if (listRenderingCapacity){
                listRenderingCapacity--
                nodeLayoutList.show()
            }
            
        } else {
            node.hide()
            nodeLayoutList.hide()
        }
    }
    //if the current selection isn't in the list then change
    if (matchedSpecies && matchedSpecies.indexOf(currentSpecieID) == -1 && validID) feedPanelSpecies(validID)
}