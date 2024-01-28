import { gameData } from "../data_version.js"
import { queryFilter, search } from "../search.js"
import { AisInB, JSUH, JSHAC } from "../utils.js"

export function feedPanelMoves(moveID){
    const move = gameData.moves[moveID]
    $('#moves-name').text(move.name)
    $('#moves-pwr').text(move.pwr ? move.pwr == 1 ? "?" : move.pwr : "--")
    $('#moves-acc').text(move.acc)
    $('#moves-chance').text(move.chance)
    $('#moves-pp').text(move.pp)
    $('#moves-prio').text(move.prio)
    setTarget(move.target)
    $('#moves-split').attr("src",`./icons/${gameData.splitT[move.split]}.png`);
    $('#moves-types').text('' + move.types.map((x)=>gameData.typeT[x]).join(' '))
    const type1 = gameData.typeT[move.types[0]]
    $('#moves-types1').text(type1).attr("class", type1.toLowerCase()).addClass("type")
    if (typeof move.types[1] === "number") {
        const type2 = gameData.typeT[move.types[1]]
        $('#moves-types2').text(type2).attr("class", type2.toLowerCase()).addClass("type")
    }
    $('#moves-desc').text(move.lDesc) //TODO fix the width of this
    listMoveFlags(move.flags.map((x)=>gameData.flagsT[x]), $('#moves-flags'))

    $('#moves-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#moves-list').children().eq(moveID - 1).addClass("sel-active").removeClass("sel-n-active")
}

function listMoveFlags(flags, core){
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
    for (const flag of flags){
        const descFlag = flagMap[flag]
        if (!descFlag) continue
        const node = document.createElement('div')
        node.innerText = descFlag
        frag.append(node)
    }
    const noFlagArray = Object.keys(NoFlagMap)
    for (const noFlag of noFlagArray){
        if (flags.indexOf(noFlag) != -1) continue
        const descFlag = NoFlagMap[noFlag]
        const node = document.createElement('div')
        node.innerText = descFlag
        frag.append(node)
    }
    core.empty()
    core.append(frag)
}

function setTarget(targetID){
    const target = gameData.targetT[targetID]
    const targetMap =  ["foe1", "foe2", "foe3", "ally1", "allySelf", "ally2"]
    const colorMap = {
        "SELECTED": [0,1,0, 0,0,0],
        "BOTH": [0,1,0, 0,1,0],
        "USER": [0,0,0, 0,1,0],
        "RANDOM": [2,2,2, 2,0,2], // how do i communicate the randomly?
        "FOES_AND_ALLY": [1,1,1, 1,0,1],
        "DEPENDS": [2,2,2, 0,0,0], //
        "ALL_BATTLERS": [1,1,1, 1,1,1],
        "OPPONENTS_FIELD": [1,1,1, 0,0,0],
        "ALLY": [0,0,0,1,0,1],
    }[target]
    const colorCode = ["unset","#f4072a","#c74fef" ]
    for (const i in targetMap){
        const nodeTarget = $("#" + targetMap[i])
        const colorID = colorMap[i]
        nodeTarget.css('background-color', colorCode[colorID])
    }
}

export function redirectMove(moveId)
{
    search.callbackAfterFilters = () =>{
        $('#moves-list').children().eq(moveId - 1).click()[0].scrollIntoView({behavior:"smooth"})
    }
    $("#btn-moves").click()
    
}


export function moveOverlay(moveId){
    const move = gameData.moves[moveId]
    
    const core = JSUH("div", "move-overlay")
    const power = JSUH("div", "move-overlay-power")
    const powerTitle = JSUH("div", "move-overlay-top", move.name)
    powerTitle.onclick = () => {
        redirectMove(moveId)
    }
    const powerNumber = JSUH("div", "move-overlay-fill", move.pwr || "?")
    const stats = JSUH("div", "move-overlay-stats")
    const statsAcc = JSUH("div", "move-overlay-acc", `Acc: ${move.acc || "--"}`)
    const statsPP = JSUH("div", "move-overlay-pp", `PP: ${move.pp}`)
    const statsPrio = JSUH("div", "move-overlay-prio", `Prio: ${move.prio}`)
    const statsChance = JSUH("div", "move-overlay-chance", `Chance: ${move.chance}`)
    const otherInfos = JSUH("div", "move-overlay-other")
    const typeDiv = JSUH("div", "move-overlay-types")
    const type1 = gameData.typeT[move.types[0]]
    const type1Div = JSUH("div", `move-overlay-type ${type1.toLowerCase()}`, type1)
    const type2 = move.types[1] ? gameData.typeT[move.types[1]] : ""
    const type2Div = JSUH("div", `move-overlay-type ${type2.toLowerCase()}`, type2)
    const split = JSUH("img", "move-overlay-img pixelated")
    split.src = `./icons/${gameData.splitT[move.split]}.png`
    const effectsDiv = JSUH("div", "move-overlay-effects")
    listMoveFlags(move.flags.map((x)=>gameData.flagsT[x]), $(effectsDiv))

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
                split
            ],
            effectsDiv
        ]
    ])
}

export const queryMapMoves = {
    "name": (queryData, move) => {
        if (AisInB(queryData, move.name.toLowerCase())) return move.name
        return false
    },
    "move": (queryData, move) => {
        if (AisInB(queryData, move.name.toLowerCase())) return move.name
        return false
    },
    "type": (queryData, move) => {
        const types = move.types.map((x)=>gameData.typeT[x].toLowerCase())
        for (const type of types){
            if (AisInB(queryData, type)) return type
        }
        return false
    },
    "move-effect": (queryData, move) => {
        //it's called effect but in the data it's flags not effect
        //effect in the data might be useless to the calc, at least to short and medium terms
        const flags = move.flags.map((x)=>gameData.flagsT[x].toLowerCase())
        for (const flag of flags){
            if (AisInB(queryData, flag)) return flag
        }
        return false
    },
}

export function updateMoves(searchQuery){
    const moves = gameData.moves
    const nodeList = $('#moves-list').children()
    
    let validID;
    for (const i in moves){
        if (i == 0 ) continue
        const move = moves[i]
        const node = nodeList.eq(i - 1)
        if (queryFilter(searchQuery, move, queryMapMoves))
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    if (validID) feedPanelMoves(validID)
}
