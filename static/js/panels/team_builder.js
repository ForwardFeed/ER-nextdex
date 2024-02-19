import { gameData } from "../data_version.js";
import { e, JSHAC } from "../utils.js";
import { createPokemon, getTextNature } from "./trainers_panel.js";
import { getSpritesURL, getSpritesShinyURL } from "./species_panel.js";
import { createInformationWindow } from "../window.js";
import { cubicRadial } from "../radial.js";
import { saveToLocalstorage, fetchFromLocalstorage } from "../settings.js";

const saveKeysPokemon = [
    "spc",
    "isShiny",
    "abi",
    "moves",
    "item",
    "ivs",
    "evs",
    "nature",
]

class Pokemon {
    constructor() {
        this.node = null
        this.baseSpc = null
        this.spc = null // specie id
        this.spcName = ""
        this.isShiny = false
        this.abi = null
        this.abiName = ""
        this.inns = Array(3)
        this.moves = [
            null,
            null,
            null,
            null
        ]
        this.item = -1
        this.nature = null
        this.ivs = Array(6)
        this.evs = Array(6)
    }
    getSpritesURL() {
        if (this.isShiny) {
            return getSpritesShinyURL(this.baseSpc.NAME)
        } else {
            return getSpritesURL(this.baseSpc.NAME)
        }

    }
    init(pokeID) {
        this.baseSpc = gameData.species[pokeID]
        this.spc = pokeID
        this.spcName = this.baseSpc.name
        this.isShiny = false
        this.abi = 0
        this.ability = this.baseSpc.stats.abis[0]
        this.abiName = gameData.abilities[this.ability].name
        this.inns = this.baseSpc.stats.inns
        this.innsNames = this.inns.map(x => gameData.abilities[x].name)
        this.allMoves = gameData.species[pokeID].allMoves
        this.allMovesName = gameData.species[pokeID].allMoves.map(x => gameData.moves[x].name)
        const first4Moves = [...Array(4).keys()].map(x => this.allMoves[x] || 0)
        this.moves = first4Moves,
        this.item = -1
        this.nature = 0
        this.ivs = [31, 31, 31, 31, 31, 31]
        this.evs = [0, 0, 0, 0, 0, 0]
    }
    fromSave(saveObj){
        this.init(saveObj.spc)
        saveKeysPokemon.forEach((val)=>{
            this[val] = saveObj[val]
        })
    }
    save(){
        const saveObj = {}
        saveKeysPokemon.forEach((val)=>{
            saveObj[val] = this[val]
        })
        return saveObj
    }
}

class PokeNodeView {
    constructor(node) {
        this.node = node
        return this
    }
    init() {
        this.spc = this.node.find('.trainers-poke-specie')
        this.sprite = this.node.find('.trainer-poke-sprite')
        this.abi = this.node.find('.trainers-poke-ability')
        this.moves = this.node.find('.trainers-poke-move')
        this.item = this.node.find('.trainers-poke-item')
        this.nature = this.node.find('.trainers-poke-nature')
        this.ivs = this.node.find('.trainers-poke-ivs')
        this.evs = this.node.find('.trainers-poke-evs')
    }
}

const teamView = []

export const teamData = [...Array(6).keys()].map((_) => {
    return new Pokemon()
})
// this can be called only when gamedata is loaded
export function restoreSave(){
    const savedString = fetchFromLocalstorage("team-builder")
    if (!savedString) return
    const saveObj = JSON.parse(savedString)
    setFullTeam(saveObj)
}

export function setFullTeam(party){
    for (let i = 0; i < 6; i++){
        const val = party[i]
        if (!val || !val.spc) {
            return deletePokemon($('#builder-data').find('.builder-mon').eq(i), i)
        }
        teamData[i].fromSave(val)
        createPokeView($('#builder-data').find('.builder-mon').eq(i), i)
    }
}

function save(){
    const saveObj = teamData.map(x=>x.save())
    saveToLocalstorage("team-builder", saveObj)
}

export function setupTeamBuilder() {
    let selected = 0
    const buttonArrayMap = [
        ["#builder-editor-btn", "#builder-editor"],
        ["#builder-team-btn", "#builder-team"]
    ]
    buttonArrayMap.forEach((selection, index, selectionArray) => {
        const btn = $(selection[0])
        const dataTop = $(selection[1])
        btn.on('click', () => {
            $(selectionArray[selected][0]).removeClass("btn-active").addClass("btn-n-active")
            btn.removeClass("btn-n-active").addClass("btn-active")
            $(selectionArray[selected][1]).hide()
            dataTop.show()
            selected = index
        })
    })
    $('#builder-data').find('.builder-mon').each(function (index, value) {
        if (teamData[index].spc){
            createPokeView($(this), index)
        } else {
            addPlaceholder($(this), index)
        }
        $(this)[0].ondragover = function (ev) {
            ev.preventDefault();
        }
        $(this)[0].ondrop = (ev) => {
            ev.preventDefault()
            const pokeID = ev.dataTransfer.getData("id");
            teamData[index].init(pokeID)
            createPokeView($(this), index)
        }
        teamView.push(new PokeNodeView($(this)))
    })
}

function createPokeView(jNode, viewID) {
    const deleteBtn = e("div", "builder-mon-delete", "Delete")
    deleteBtn.onclick = (ev) => {
        ev.stopPropagation()
        deletePokemon(jNode, viewID)
    }
    jNode.empty().append(createPokemon(teamData[viewID])).append(deleteBtn)
    jNode.children().eq(0).attr('class', 'trainers-pokemon trainers-pokemon-builder')
    jNode[0].onmouseover = () => {
        $(deleteBtn).show()
    }
    jNode[0].onmouseleave = () => {
        $(deleteBtn).hide()
    }
    let startX = 0
    let isSwiping = false
    const screenSwapLength = document.body.offsetWidth / 2
    jNode[0].ontouchstart = (ev) => {
        isSwiping = true;
        startX = ev.touches[0].clientX;
    }
    jNode[0].ontouchend = (ev) => {
        if (isSwiping) {
            const endX = ev.changedTouches[0].clientX;
            const deltaX = endX - startX;
            if (deltaX > screenSwapLength) deletePokemon(jNode, viewID)
            isSwiping = false;
        }
    }
    feedPokemonEdition(jNode, viewID)
    teamView[viewID].init()
    save()
}

function deletePokemon(jNode, viewID) {
    jNode.empty()
    $('#builder-editor').empty()
    addPlaceholder(jNode, viewID)
    teamData[viewID] = new Pokemon()
    save()
}

function addPlaceholder(jNode, viewID) {
    const isTouchPad = navigator.maxTouchPoints
    let placeholder
    if (isTouchPad) {
        placeholder = e('div', "builder-placeholder", "tap to add the selected pokemon from the list")
    } else {
        placeholder = e('div', "builder-placeholder", "drop a mon from the list or click to add the selected pokemon from the list")
    }
    placeholder.onclick = () => {
        const pokeID = $('#species-list .sel-active')[0].dataset.id
        teamData[viewID].init(pokeID)
        createPokeView(jNode, viewID)
    }
    jNode.append(placeholder)
}

function feedPokemonEdition(jNode, viewID) {
    const poke = teamData[viewID]
    const view = teamView[viewID]

    const spriteDiv = jNode.find('.trainer-poke-sprite')[0]
    const abilityDiv = jNode.find('.trainers-poke-ability')[0]
    const moveDiv = jNode.find('.trainers-poke-moves')[0]

    const rightDiv = e("div", "builder-editor-right")
    const itemDiv = jNode.find('.trainers-poke-item')[0]
    const natureDiv = jNode.find('.trainers-poke-nature')[0]
    const statsDiv = jNode.find('.trainers-stats-row')[0]

    spriteDiv.onclick = () => {
        poke.isShiny = !poke.isShiny
        view.sprite[0].src = poke.getSpritesURL()
        save()
    }
    abilityDiv.onclick = (ev) => {
        ev.stopPropagation() //if you forget this the window will instantly close
        const overlayNode = overlayEditorAbilities(viewID, (abiID) => {
            poke.abi = abiID
            poke.abiName = gameData.abilities[poke.baseSpc.stats.abis[abiID]].name
            view.abi.text(poke.abiName)
            abilityDiv.innerText = poke.abiName
            save()
        })
        createInformationWindow(overlayNode, ev, "", true)
    }
    moveDiv.onclick = (ev) => {
        ev.stopPropagation()
        const overlayNode = cubicRadial(
            poke.moves.map((x, index)=>{
                return [
                    gameData.moves[x].name,
                    ()=>{
                        const moveCallback = (moveID) => {
                            poke.moves[index] = poke.allMoves[moveID]
                            const moveName = poke.allMovesName[moveID]
                            view.moves.eq(index).text(moveName)
                            save()
                        }
                        createInformationWindow(
                                overlayList(moveCallback, poke.allMovesName),
                                ev, "focus"
                            )
                    }
                ]
            }), "6em", "1em"
        )
        createInformationWindow(overlayNode, ev, "mid")
    }
    const itemCallback = (itemID) => {
        poke.item = itemID
        view.item.text(itemDiv.innerText = gameData.items[itemID].name)
        save()
    }
    const natureCallback = (natureID) => {
        poke.nature = natureID
        createPokeView(view.node, viewID)
        save()
    }
    const statsCallback = (field, index, value) => {
        poke[field][index] = value
        createPokeView(view.node, viewID)
        save()
    }
    statsDiv.onclick = itemDiv.onclick = natureDiv.onclick = (ev) => {
        ev.stopPropagation()
        const overlayNode = cubicRadial([
            ["Items", (ev) => {
                createInformationWindow(overlayList(itemCallback, gameData.itemT), ev, "focus")
            }],
            ["Nature", (ev) => {
                createInformationWindow(overlayList(natureCallback,
                                                    gameData.natureT.map(x => getTextNature(x))),
                 ev, "focus")
            }],
            ["IVs", (ev) => { 
                createInformationWindow(editionStats("ivs", viewID, statsCallback), ev)
            }],
            ["EVs", (ev) => { 
                createInformationWindow(editionStats("evs", viewID, statsCallback), ev)
             }],
        ], "6em", "1em")
        createInformationWindow(overlayNode, ev, "mid")
    }
}

function overlayEditorAbilities(viewID, callbackOnclick) {
    const core = e('div', 'builder-overlay-abis-inns')
    const abiDesc = e('div', 'builder-overlay-abis-desc')
    const abilitiesRow = e('div', 'builder-overlay-abilities')
    const abilities = [...new Set(teamData[viewID].baseSpc.stats.abis)] //remove duplicates
        .map((x, index) => {
            const abi = gameData.abilities[x]
            return e('div', 'builder-overlay-ability', abi.name,{
                onclick: (ev) => {
                    ev.stopPropagation() // not to trigger the window to close
                    callbackOnclick(index)
                    abiDesc.innerText = abi.desc
                },
                onmouseover: () =>{
                    abiDesc.innerText = abi.desc
                },
                onmouseleave: () =>{
                    abiDesc.innerText = ""
                }
            })
        })
    const innatesRow = e('div', 'builder-overlay-innates')
    const innates = teamData[viewID].baseSpc.stats.inns.map((x, index) =>{
        const abi = gameData.abilities[x]
        return e('div', 'builder-overlay-innate', abi.name, {
            onclick: (ev) => {
                ev.stopPropagation() // not to trigger the window to close
                abiDesc.innerText = abi.desc
            },
            onmouseover: () =>{
                abiDesc.innerText = abi.desc
            },
            onmouseleave: () =>{
                abiDesc.innerText = ""
            }
        })
    })
    return JSHAC([
        core, [
            abilitiesRow,
                abilities,
            innatesRow,
                innates,
            abiDesc
        ]
        
    ])
}

function overlayList(callback, list) {
    let artificialClickToClose = false // if set to true you can click to close
    const input = e("input", "builder-overlay-list")
    input.setAttribute('list', "item-datalist")
    const dataList = e("datalist")
    dataList.id = "item-datalist"
    const options = list.map((x)=>{
        const option =  e("option",)
        option.value = x
        return option
    })
    input.onclick = function(ev){
        if (!artificialClickToClose) ev.stopPropagation()
    }
    input.onkeyup = input.onchange = (ev)=>{
        const itemID = list.indexOf(input.value)
        if (itemID != -1){
            callback(itemID)
            if (ev.key === "Enter"){
                artificialClickToClose = true
                input.click()
            }
        }
        
    }
    
    return JSHAC([
        input,
        dataList,
            options
    ])
}
const statsOrder = [
    "HP",
    "Atk",
    "Def",
    "SpA",
    "SpD",
    "Spe",
]
const statFieldInputControl = {
    "ivs": (value) => {
        value = +value.replace(/[^0-9-]/g, "")
        if (isNaN(value)) return 0
        return Math.min(Math.max(0,value),31)  
    },
    "evs": (value) => {
        value = +value.replace(/[^0-9-]/g, "");
        if (isNaN(value)) return 0
        return Math.min(Math.max(0,Math.round(value / 4) * 4),252)        
    }
}
function editionStats(statField, viewID, callback){
    const poke = teamData[viewID]
    const core = e("div", "overlay-stats-edition")
    const rowDiv = e("div", "overlay-stats-row")
    statsOrder.forEach((value, index)=>{
        const statColumn = e("div", "overlay-stats-column")
        const statLabel = e("label", "overlay-stats-label", value)
        statLabel.setAttribute('for', `overlay-stats-edit${index}`)
        const statStat = e("input", "overlay-stats-edit")
        statStat.id = `overlay-stats-edit${index}`
        statStat.value = poke[statField][index]
        statStat.type = "number"
        statStat.onclick = statStat.onchange = () =>{
            statStat.value = statFieldInputControl[statField](statStat.value)
            callback(statField, index, statStat.value, )
        }
        rowDiv.append(JSHAC([
            statColumn,[
                statLabel,
                statStat
            ]
        ]))
    })
    rowDiv.onclick = function(ev){
        ev.stopPropagation()
    }

    return JSHAC([
        core,[
            rowDiv,
        ]
    ])
}
