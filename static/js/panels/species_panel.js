import { redirectLocation } from "./locations_panel.js"
import { matchedMoves, moveOverlay } from "./moves_panel.js"
import { addTooltip, capitalizeFirstLetter, AisInB, e, JSHAC, reorderNodeList } from "../utils.js"
import { search } from "../search.js"
import { queryFilter2, longClickToFilter } from "../filters.js"
import { gameData, compareData } from "../data_version.js"
import { createInformationWindow, removeInformationWindow } from "../window.js"
import { getDefensiveCoverage, abilitiesToAddedType} from "../weakness.js"
import { nodeLists } from "../hydrate.js"
import { cubicRadial } from "../radial.js"

export let currentSpecieID = 1

export function feedPanelSpecies(id) {
    currentSpecieID = id
    const specie = gameData.species[id]
    $('#species-name').text(`${specie.name}#${specie.dex.id || "??"}`)
    $('#species-id').text(`ingame ID: ${specie.id}`)
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
    setTypes([...new Set(specie.stats.types), abilitiesExtraType(specie.activeAbi, specie)], specie)
    setAllMoves(specie)
    setEvos(specie.evolutions)
    setLocations(specie.locations, specie.SEnc)
    $('#species-misc').text(specie.dex.desc)
    $('#species-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    nodeLists.species[id - 1].classList.replace("sel-n-active", "sel-active")
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
        getDefensiveCoverage(
            types.map(x => gameData.typeT[x]), [specie.stats.abis[specie.activeAbi], ...specie.stats.inns]
        )
    )
}

export function setAllMoves(specie = gameData.species[currentSpecieID]){
    setLevelUpMoves($('#learnset'), specie.levelUpMoves)
    setMoves($('#tmhm'), specie.TMHMMoves)
    setMoves($('#tutor'), specie.tutor)
    setMoves($('#eggmoves'), specie.eggMoves)
}

function filterMoves(moveIDlist) {
    if (!matchedMoves) return moveIDlist
    return moveIDlist.map(x => matchedMoves.indexOf(x) != -1 && x).filter(x => x)
}
/**
 * @param {Object} move 
 * @returns an HTML node
 */
function setSplitMove(move) {
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
function setMoveName(move) {
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
function setMoveRow(moveID) {
    const row = document.createElement('div')
    row.className = "species-move-row"
    row.onclick = function(ev){
        fastdom.mutate(() => {
            createInformationWindow(moveOverlay(moveID), ev)
        });
    }
    return row
}

function setMoves(core, moves) {
    core.empty()
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
        frag.append(row)
    }
    core.append(frag)
}
function setLevelUpMoves(core, moves) {
    core.empty()
    const frag = document.createDocumentFragment()
    for (const { lv: lvl, id: id } of moves) {
        if (matchedMoves && matchedMoves.indexOf(id) == -1) continue
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

function changeBaseStat(node, value, statID, cmp) {

    if (cmp && !isNaN(+cmp)){
        node.find('.stat-num').html(`${cmp}→<br>${value}`)
        node.find('.stat-num').css('font-size', '0.5em').css('width', '3em')
    } else {
        node.find('.stat-num').text(value)
        node.find('.stat-num').css('font-size', '1em').css('width', '')
    }
    
    let color = "gray"
    for (const colorMapped of [
        [gameData.speciesStats.result.min5[statID], "#ff3300"],
        [gameData.speciesStats.result.min20[statID], "#cc6600"],
        [gameData.speciesStats.result.median[statID], "#cccc00"],
        [gameData.speciesStats.result.top20[statID], "#99cc00"],
        [gameData.speciesStats.result.top5[statID], "#33cc33"],
        [256, "#0033cc"],
    ]) {
        if (value < colorMapped[0]) break
        color = colorMapped[1]
    }
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
            const name = e("div", "species-ability", abi.name)
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
            const name = e("div", "species-innate", inn.name)
            longClickToFilter(0, name, "ability", () => { return inn.name }, 0)
            addTooltip(name, inn.desc)
            return name
        }).filter(x => x))
    )
}

function abilitiesExtraType(abilityID, specie) {
    return abilitiesToAddedType([specie.stats.abis[abilityID], ...specie.stats.inns])
}

export function setupSpeciesPanel() {
    const subPanelsAndBtns = [
        ["#switch-moves", "#species-moves"],
        ["#switch-evos-locs", "#species-evos-locs"],
        ["#switch-misc", "#species-misc"],
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
    $('#species-id, #species-name').on('click', function () {
        $('#species-id, #species-name').toggle()
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
        let locationString = `Can be found at ${loc.name}`

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
    for (const enc of SEnc) {
        const node = document.createElement('div')
        node.className = "specie-locs-scripted"
        node.innerHTML = `Can be found at ${gameData.mapsT[enc.map]} as a ${gameData.scriptedEncoutersHowT[enc.how]}`
        frag.append(node)
    }
    $('#species-locations').empty().append(frag)
}

const reorderMapSpecies = {
    "alphabetical": "",
    "atk": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",

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

export const queryMapSpecies = {
    "name": (queryData, specie) => {
        const specieName = specie.name.toLowerCase()
        if (AisInB(queryData, specieName)) {
            return specie.name
        }
    },
    "type": (queryData, specie) => {
        const types = specie.stats.types.map((x) => gameData.typeT[x].toLowerCase())
        for (const type of types) {
            if (AisInB(queryData, type)) return type
        }
        return false
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
}
export function updateSpecies(searchQuery) {
    const species = gameData.species
    const nodeList = $('#species-list').children()
    const matched = queryFilter2(searchQuery, species, queryMapSpecies)
    let validID;
    const specieLen = species.length
    for (let i = 0; i < specieLen; i++) {
        if (i == 0) continue
        const node = nodeList.eq(i)
        if (!matched || matched.indexOf(i) != -1) {
            if (!validID) validID = i
            node.show()
        } else {
            node.hide()
        }
    }
    //if the current selection isn't in the list then change
    if (matched && matched.indexOf(currentSpecieID) == -1 && validID) feedPanelSpecies(validID)
}