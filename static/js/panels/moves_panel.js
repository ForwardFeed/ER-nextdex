import { gameData } from "../data_version.js"
import { search } from "../search.js"
import { queryFilter2, longClickToFilter, trickFilterSearch} from "../filters.js"
import { AisInB, e, JSHAC } from "../utils.js"
import { removeInformationWindow } from "../window.js"
import { setAllMoves } from "./species_panel.js"

export let matchedMoves
let currentMoveID = 0
export function feedPanelMoves(moveID) {
    currentMoveID = moveID
    const move = gameData.moves[moveID]
    $('#moves-name').text(move.name)
    $('#moves-internal-id').text(`ingame ID: ${move.id}`)
    $('#moves-pwr').text(move.pwr ? move.pwr == 1 ? "?" : move.pwr : "--")
    $('#moves-acc').text(move.acc)
    $('#moves-chance').text(move.chance)
    $('#moves-pp').text(move.pp)
    $('#moves-prio').text(move.prio)
    setTarget(move.target)
    $('#moves-split').attr("src", `./icons/${gameData.splitT[move.split]}.png`);
    $('#moves-split')[0].dataset.split = gameData.splitT[move.split].toLowerCase()
    //$('#moves-types').text('' + move.types.map((x)=>gameData.typeT[x]).join(' '))
    setTypes(move.types)
    $('#moves-desc').text(move.lDesc) //TODO fix the width of this
    listMoveFlags(move.flags.map((x) => gameData.flagsT[x]), $('#moves-flags'))

    $('#moves-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#moves-list').children().eq(moveID - 1).addClass("sel-active").removeClass("sel-n-active")
}

function setTypes(types) {
    for (let i = 0; i < 2; i++) {
        const type = gameData.typeT[types[i]] || ""
        $(`#moves-types${i + 1}`).attr("class", `type ${type.toLowerCase()}`)
            .children().text(type)
    }
}

function listMoveFlags(flags, core, longClickCallback = ()=>{}) {
    const flagMap = {
        "Makes Contact": "Has contact and Big Pecks boost",
        "Kings Rock Affected": "Triggers King's rock",
        "High Crit": "High crits chances",
        "Iron Fist Boost": "Iron fist boost",
        "Sheer Force Boost": "Sheer force boost",
        "Keen Edge Boost": "Keen edge boost",
        "Air Based": "Giant wings boost",
        "Snatch Affected": "Can be snatched",
        "Dance": "Dance",
        "Always Crit": "Always Crit",
        "Field Based": "Field Explorer boost",
        "Striker Boost": "Striker boost",
        "Two Strikes": "Hit twice",
        "Reckless Boost": "Reckless boost",
        "Magic Coat Affected": "Affected by magic coat",
        "Horn Based": "Mighty Horn boost",
        "Strong Jaw Boost": "Strong Jaw boost",
        "Sound": "Is a sound move",
        "Mega Launcher Boost": "Mega Launcher Boost",
        "Ballistic": "Is a bullet move",
        "Dmg Underwater": "Damage foes under water",
        "Weather Based": "Changes with the weather",
        "Powder": "Power move",
        "Dmg In Air": "Damages foes in air",
        "Dmg Underground": "Damages foes underground",
        "Bone Based": "Is a bonemove",
        "Dmg Ungrounded Ignore Type If Flying": "",
        "Thaw User": "Unfreeze the user",
        "Protection Move": "Gives protection to the user",
        "Dmg 2x In Air": "Damage the foes in air with 2X damage",
        "Stat Stages Ignored": "Ignore Stats boost",
        "Hit In Substitute": "Hit Throught Substitute",
        "Target Ability Ignored": "Target Ability is ignored",
    }
    const NoFlagMap = {
        "Protect Affected": "Isn't affected by protect",
        "Mirror Move Affected": "Cannot be mirrored",
    }
    const frag = document.createDocumentFragment()
    for (const flag of flags) {
        const descFlag = flagMap[flag]
        if (!descFlag) continue
        const node = e("div", undefined, descFlag)
        longClickToFilter(2, node, "move-effect", () => {return flag}, longClickCallback)
        frag.append(node)
    }
    const noFlagArray = Object.keys(NoFlagMap)
    for (const noFlag of noFlagArray) {
        if (flags.indexOf(noFlag) != -1) continue
        const descFlag = NoFlagMap[noFlag]
        const node = e("div", undefined, descFlag)
        longClickToFilter(2, node, "move-effect", () => {return descFlag}, longClickCallback)
        frag.append(node)
    }
    core.empty()
    core.append(frag)
}

function setTarget(targetID) {
    const target = gameData.targetT[targetID]
    const targetMap = ["foe1", "foe2", "foe3", "ally1", "allySelf", "ally2"]
    const colorMap = {
        "SELECTED": [0, 1, 0, 0, 0, 0],
        "BOTH": [0, 1, 0, 0, 1, 0],
        "USER": [0, 0, 0, 0, 1, 0],
        "RANDOM": [2, 2, 2, 2, 0, 2], // how do i communicate the randomly?
        "FOES_AND_ALLY": [1, 1, 1, 1, 0, 1],
        "DEPENDS": [2, 2, 2, 0, 0, 0], //
        "ALL_BATTLERS": [1, 1, 1, 1, 1, 1],
        "OPPONENTS_FIELD": [1, 1, 1, 0, 0, 0],
        "ALLY": [0, 0, 0, 1, 0, 1],
    }[target]
    const colorCode = ["unset", "#f4072a", "#c74fef"]
    for (const i in targetMap) {
        const nodeTarget = $("#" + targetMap[i])
        const colorID = colorMap[i]
        nodeTarget.css('background-color', colorCode[colorID])
    }
}

export function setupMoves(){
    $('#moves-types1, moves-types2').each((index, node)=>{
        longClickToFilter(2, node, "type", ()=>{return node.children[0].innerText})
    })
    $('#moves-name, #moves-internal-id').on('click', function(){
        $('#moves-name, #moves-internal-id').toggle()
    })
    longClickToFilter(2, $('#moves-split').parent()[0], "category", 
            ()=>{ return $('#moves-split')[0].dataset.split || ""}
        )
    
}

export function redirectMove(moveId) {
    search.callbackAfterFilters = () => {
        $('#moves-list').children().eq(moveId - 1).click()[0].scrollIntoView({ behavior: "smooth" })
    }
    $("#btn-moves").click()

}


export function moveOverlay(moveId) {
    const triggerMoveRefresh = ()=>{
        trickFilterSearch(2)
        setAllMoves()
    }
    const move = gameData.moves[moveId]
    const core = e("div", "move-overlay")
    const power = e("div", "move-overlay-power")
    const powerTitle = e("div", "move-overlay-top", move.name)
    powerTitle.onclick = (ev) => {
        removeInformationWindow(ev)
        redirectMove(moveId)
    }
    longClickToFilter(0, powerTitle, "Move", undefined)
    const powerNumber = e("div", "move-overlay-fill", move.pwr || "?")
    const stats = e("div", "move-overlay-stats")
    const statsAcc = e("div", "move-overlay-acc", `Acc: ${move.acc || "--"}`)
    const statsPP = e("div", "move-overlay-pp", `PP: ${move.pp}`)
    const statsPrio = e("div", "move-overlay-prio", `Prio: ${move.prio}`)
    const statsChance = e("div", "move-overlay-chance", `Chance: ${move.chance}`)
    const otherInfos = e("div", "move-overlay-other")
    const typeDiv = e("div", "move-overlay-types")
    const type1 = gameData.typeT[move.types[0]]
    const type1Div = e("div", `move-overlay-type ${type1.toLowerCase()}`, type1)
    longClickToFilter(2, type1Div, "type", undefined, triggerMoveRefresh)
    const type2 = move.types[1] ? gameData.typeT[move.types[1]] : ""
    const type2Div = e("div", `move-overlay-type ${type2.toLowerCase()}`, type2)
    longClickToFilter(2, type2Div, "type", undefined, triggerMoveRefresh)
    const splitDiv = e('div')
    const split = e("img", "move-overlay-img pixelated")
    split.src = `./icons/${gameData.splitT[move.split]}.png`
    longClickToFilter(2, splitDiv, "category", 
            ()=>{ return gameData.splitT[move.split].toLowerCase() || ""}
        , triggerMoveRefresh)
    const effectsDiv = e("div", "move-overlay-effects")
    listMoveFlags(move.flags.map((x) => gameData.flagsT[x]), $(effectsDiv), triggerMoveRefresh)

    return JSHAC([
        core, [
            power, [
                powerTitle,
                powerNumber,
            ],
            stats, [
                statsAcc,
                statsPP,
                statsPrio,
                statsChance
            ],
            otherInfos, [
                typeDiv, [
                    type1Div,
                    type2Div,
                ],
                splitDiv, [
                    split
                ]
            ],
            effectsDiv
        ]
    ])
}

export const queryMapMoves = {
    "name": (queryData, move) => {
        const moveName = move.name.toLowerCase()
        if (AisInB(queryData, moveName)) {
            return [moveName === queryData, moveName, true]
        }
        return false
    },
    "move": (queryData, move) => {
        const moveName = move.name.toLowerCase()
        if (AisInB(queryData, moveName)) {
            return [moveName === queryData, moveName, true]
        }
        return false
    },
    "type": (queryData, move) => {
        const types = move.types.map((x) => gameData.typeT[x].toLowerCase())
        for (const type of types) {
            if (AisInB(queryData, type)) return type
        }
        return false
    },
    "move-effect": (queryData, move) => {
        //it's called effect but in the data it's flags not effect
        //effect in the data might be useless to the dex, at least to short and medium terms
        const flags = move.flags.map((x) => gameData.flagsT[x].toLowerCase())
        for (const flag of flags) {
            if (AisInB(queryData, flag)) return flag
        }
        return false
    },
    "category": (queryData, move) => {
        const moveSplit = gameData.splitT[move.split].toLowerCase()
        if (AisInB(queryData, moveSplit)){
            return moveSplit
        }
    },
}
export function updateMoves(searchQuery) {
    const moves = gameData.moves
    const nodeList = $('#moves-list').children()
    matchedMoves = queryFilter2(searchQuery, moves, queryMapMoves)
    let validID;
    const movesLen = moves.length
    for (let i  = 0; i < movesLen; i++) {
        if (i == 0) continue
        const node = nodeList.eq(i - 1)
        if (!matchedMoves || matchedMoves.indexOf(i) != -1) {
            if (!validID) validID = i
            node.show()
        } else {
            node.hide()
        }
    }
    //if the current selection isn't in the list then change
    if (matchedMoves && matchedMoves.indexOf(currentMoveID) == -1 && validID) feedPanelMoves(validID)
}
