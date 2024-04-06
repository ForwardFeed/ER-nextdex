import { gameData } from "../data_version.js";
import { e, JSHAC } from "../utils.js";
import { createPokemon, getTextNature } from "./trainers_panel.js";
import { getSpritesURL, getSpritesShinyURL } from "./species/species_panel.js";
import { createInformationWindow } from "../window.js";
import { cubicRadial } from "../radial.js";
import { saveToLocalstorage, fetchFromLocalstorage } from "../settings.js";
import { getDefensiveCoverage, getMoveEffectiveness } from "../weakness.js"
import { longClickToFilter } from "../filters.js";
import { itemList } from "../hydrate.js";
import { movePicker, listPicker} from "../pickers.js";

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
        this.spc = 0 // specie id
        this.spcName = ""
        this.isShiny = false
        this.abi = 0
        this.abiName = ""
        this.inns = Array(3)
        this.moves = [
            0,
            0,
            0,
            0
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
    fromSave(saveObj) {
        this.init(saveObj.spc)
        saveKeysPokemon.forEach((val) => {
            this[val] = saveObj[val]
        })
    }
    save() {
        const saveObj = {}
        saveKeysPokemon.forEach((val) => {
            saveObj[val] = this[val]
        })
        return saveObj
    }
    toData(){
        const dataKeysPokemon = [
            "spc",
            "abi",
            "ivs",
            "evs",
            "item",
            "nature",
            "moves",
        ]
        const obj = {}
        dataKeysPokemon.forEach((val) => {
            obj[val] = this[val]
        })
        return obj
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
/** @type PokeNodeView[] */
const teamView = []

export const teamData = [...Array(6).keys()].map((_) => {
    return new Pokemon()
})
// this can be called only when gamedata is loaded
export function restoreSave() {
    const savedString = fetchFromLocalstorage("team-builder")
    if (!savedString) return
    const saveObj = JSON.parse(savedString)
    try{
        setFullTeam(saveObj)
    }catch(_e){
        saveToLocalstorage("team-builder", null)
    }
    
}

export function setFullTeam(party) {
    updateTeamWeaknessesLock = true
    for (let i = 0; i < 6; i++) {
        const val = party[i]
        if (!val || !val.spc || val.spc == -1) {
            deletePokemon($('#builder-data').find('.builder-mon').eq(i), i)
            continue
        }
        teamData[i].fromSave(val)
        createPokeView($('#builder-data').find('.builder-mon').eq(i), i)
    }
    updateTeamWeaknessesLock = false
    updateTeamWeaknesses()
    updateOffensiveTypes()
}

function swapAndRefresh(a, b){
    const data = []
    for (let i = 0; i < 6; i++){
        const poke = teamData[i]
        if (!poke.spcName) continue
        data.push(poke.toData())
    }
    const swap = structuredClone(data[a])
    data[a] = structuredClone(data[b])
    data[b] = swap
    setFullTeam(data)
}

function save() {
    const saveObj = teamData.map(x => x.save())
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
        if (teamData[index].spc) {
            createPokeView($(this), index)
        } else {
            addPlaceholder($(this), index)
        }
        $(this)[0].ondragover = function (ev) {
            ev.preventDefault();
        }
        $(this)[0].ondrop = (ev) => {
            ev.preventDefault()
            const pokeID = ev.dataTransfer.getData("id")
            if (pokeID !== "") {
                teamData[index].init(+pokeID)
                createPokeView($(this), index)
                updateTeamWeaknesses()
                return
            }
            if (ev.target.className === "builder-placeholder") return
            const viewID = ev.dataTransfer.getData("v-id")
            if (viewID !== ""){
                swapAndRefresh(index, +viewID)
            }
        }
        $(this)[0].setAttribute('draggable', true);
        $(this)[0].ondragstart = (ev) => {
            ev.dataTransfer.setData("v-id", index)
        }
        teamView.push(new PokeNodeView($(this)))
    })
    $('#builder-screenshot').on('click', function (ev) {
        const window = e('div', 'builder-screen-window')
        window.onclick = function () {
            window.remove()
        }
        $('#builder-data').find('.builder-mon').each(function (index, value) {
            window.innerHTML += value.innerHTML
        })
        window.querySelectorAll('.builder-placeholder').forEach(x => x.remove())
        ev.stopPropagation()
        document.body.append(window)
    })
    $('#defensive-cov, #offensive-cov').on('click', function(){
        $('#defensive-cov, #offensive-cov').toggleClass('sel-active sel-n-active')
        $('#builder-off-cov, #builder-def-cov').toggle()
    })
}

let updateTeamWeaknessesLock = false
function updateTeamWeaknesses(){
    if (updateTeamWeaknessesLock) return
    const defCoverage = {}
    const defValues = {}
    gameData.typeT.forEach((val) => {
        defValues[val] = 0
        defCoverage[val] = {
            "0": 0,
            "0.25": 0,
            "0.5": 0,
            "1": 0,
            "2": 0,
            "4": 0,
        }
    })
    const effectivenessToShow = ["0", "0.25", "0.5", "2", "4"]
    teamData.forEach((val) => {
        if (!val.spc) return
        const specie = gameData.species[val.spc]
        const monDef = getDefensiveCoverage(specie, val.abi)

        Object.keys(monDef).forEach((val) => {
            const types = monDef[val]
            for (const type of types) {
                if (val === '4') val = '2'
                if (val === '0.125') val = '0.25'
                defCoverage[type][val] += 1
                let indexEff = effectivenessToShow.indexOf(val)
                if (indexEff == -1) continue
                if (indexEff == 0){
                    defValues[type] += 2
                } else if (indexEff <= 2){
                    defValues[type] += 2 * ( 1 / indexEff)
                } else if (indexEff > 2){
                    defValues[type] -= indexEff - 2
                }
                
            }
        })
    })
    const colorNbIndex = ["_","4","4","3","1","0"]
    function weaknessCol(data, hideRow=false) {
        const type = data[0]
        const typeStrength = Math.max(-2, Math.min(defValues[type], 2)) + 2
        const colRow = e('div', `builder-type-col builder-type-strength-${typeStrength}`)
        const colData = data.map((data, indexData)=>{
            if (!indexData){
                const typeNode = e('div', `builder-type ${type.toLowerCase()}`, type.substring(0, 6), {
                    onclick: (ev) => {
                        ev?.stopPropagation()
                        $(colRow).find('.builder-nb-weakness').toggle()
                    }
                })
                longClickToFilter(0, typeNode, 'resist')
                return typeNode   
            }
            if (hideRow){

                let toggle = true
                return e('div', `builder-nb-weakness builder-type-strength-${colorNbIndex[indexData]}`, data, {
                    onclick: ()=>{
                        toggle = !toggle
                        $('#builder-def-cov').find('.bnw-' + indexData).css('filter', `opacity(${toggle?100:0})`)
                    }
                })
            } else {
                return e('div', 'builder-nb-weakness bnw-' + indexData, data)
            }
        })
        return JSHAC([colRow, colData])
    }
    //setup the row of the defensive coverage
    const typesRow = e('div', 'builder-type-row')
    gameData.typeT.forEach((type, index) => {
        if (!(index % 9)) {
            typesRow.append(
                weaknessCol(["Type", ...effectivenessToShow.map(x => x)], true)
            )
        }
        typesRow.append(
            weaknessCol([type, ...effectivenessToShow.map(x => defCoverage[type][x])])
        )
    })
    $('#builder-def-cov').empty().append(typesRow)
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
    updateTeamWeaknesses()
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
        updateTeamWeaknesses()
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
        const overlayNode = overlayEditorAbilities(teamData[viewID].baseSpc, (abiID) => {
            poke.abi = abiID
            poke.abiName = gameData.abilities[poke.baseSpc.stats.abis[abiID]].name
            view.abi.text(poke.abiName)
            abilityDiv.innerText = poke.abiName
            updateTeamWeaknesses()
            save()
        })
        createInformationWindow(overlayNode, ev, "", true)
    }
    moveDiv.onclick = (ev) => {
        ev.stopPropagation()
        const overlayNode = cubicRadial(
            poke.moves.map((x, index) => {
                return [
                    gameData.moves[x].name,
                    () => {
                        const moveCallback = (moveID) => {
                            poke.moves[index] = poke.allMoves[moveID]
                            const moveName = poke.allMovesName[moveID]
                            view.moves.eq(index).children().eq(0).text(moveName)
                            const moveType = gameData.typeT[gameData.moves[poke.moves[index]].types[0]].toLowerCase()
                            view.moves.eq(index)[0].className = `trainers-poke-move ${moveType}-t`
                            save()
                            updateOffensiveTypes()
                        }
                        createInformationWindow(
                            movePicker(poke.allMoves, moveCallback),
                            ev, "focus", true, true
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
        createPokeView(view.node, viewID) //because nature has the coloring to reproduce, it's simpler to simply redo
        save()
    }
    const statsCallback = (field, index, value) => {
        poke[field][index] = +value
        createPokeView(view.node, viewID) //same reason as nature
        save()
    }
    statsDiv.onclick = itemDiv.onclick = natureDiv.onclick = (ev) => {
        ev.stopPropagation()
        const overlayNode = cubicRadial([
            ["Items", (ev) => {
                createInformationWindow(listPicker(itemList, itemCallback), ev, "focus")
            }],
            ["Nature", (ev) => {
                createInformationWindow(listPicker(gameData.natureT.map(x => getTextNature(x)), natureCallback),
                    ev, "focus")
            }],
            ["IVs", (ev) => {
                createInformationWindow(editionStats("ivs", teamData[viewID], statsCallback), ev)
            }],
            ["EVs", (ev) => {
                createInformationWindow(editionStats("evs", teamData[viewID], statsCallback), ev)
            }],
        ], "6em", "1em")
        createInformationWindow(overlayNode, ev, "mid")
    }
}

export function overlayEditorAbilities(pokebase, callbackOnclick) {
    const core = e('div', 'builder-overlay-abis-inns')
    const abiDesc = e('div', 'builder-overlay-abis-desc')
    const abilitiesRow = e('div', 'builder-overlay-abilities')
    const abilities = [...new Set(pokebase.stats.abis)] //remove duplicates
        .map((x, index) => {
            const abi = gameData.abilities[x]
            return e('div', 'builder-overlay-ability', abi.name, {
                onclick: (ev) => {
                    ev.stopPropagation() // not to trigger the window to close
                    callbackOnclick(index)
                    abiDesc.innerText = abi.desc
                },
                onmouseover: () => {
                    abiDesc.innerText = abi.desc
                },
                onmouseleave: () => {
                    abiDesc.innerText = ""
                }
            })
        })
    const innatesRow = e('div', 'builder-overlay-innates')
    const innates = pokebase.stats.inns.map((x, index) => {
        const abi = gameData.abilities[x]
        return e('div', 'builder-overlay-innate', abi.name, {
            onclick: (ev) => {
                ev.stopPropagation() // not to trigger the window to close
                abiDesc.innerText = abi.desc
            },
            onmouseover: () => {
                abiDesc.innerText = abi.desc
            },
            onmouseleave: () => {
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

export function enterToClose(ev){
    if (ev.key === "Enter"){
        $('body').trigger('click')
    }
}

export function overlayList(callback, list) {
    let artificialClickToClose = false // if set to true you can click to close
    const input = e("input", "builder-overlay-list")
    input.setAttribute('list', "item-datalist")
    const dataList = e("datalist")
    dataList.id = "item-datalist"
    const options = list.map((x) => {
        const option = e("option",)
        option.value = x
        return option
    })
    input.onclick = function (ev) {
        if (!artificialClickToClose) ev.stopPropagation()
    }
    input.onkeydown = enterToClose
    input.onkeyup = input.onchange = (ev) => {
        const itemID = list.indexOf(input.value)
        if (itemID != -1) {
            callback(itemID)
            if (ev.key === "Enter") {
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
    "ivs": (value, evKey) => {
        if (value.includes('+') || evKey === "ArrowRight" || evKey === "ArrowUp") {
            value = 31
        } else if (value.includes('-') || evKey === "ArrowLeft"  || evKey === "ArrowDown"){
            value = 0
        } else {
            value = +value.replace(/[^0-9-]/g, "")
        }
        
        if (isNaN(value)) return 0
        return Math.min(Math.max(0, value), 31)
    },
    "evs": (value, evKey, prevValue, evs) => {
        if (value.includes('+') || evKey === "ArrowRight") {
            value = prevValue + 32
        } else if (value.includes('-') || evKey === "ArrowLeft"){
            value = prevValue - 32
        } else if (evKey === "ArrowUp"){
            value = 252
        } else if (evKey === "ArrowDown"){
            value = 0
        } else {
            value = +value.replace(/[^0-9]/g, "");
            if (isNaN(value)) return 0
        }
        evs.forEach((x, i, evs)=>{
            if (i == 6) return
            if (!i) evs[6] = 0
            evs[6] += +x
        })
        value = Math.min(Math.max(0, Math.round(value / 4) * 4), 252)
        const valDiff = value - prevValue
        if (evs[6] + valDiff > 510){
            const maxRow = (evs[6] + valDiff) - 510
            value -= Math.min(Math.max(0, Math.ceil(maxRow / 4) * 4), 252)
        }
        return  value
    }
}
export function editionStats(statField, poke, callback) {
    const core = e("div", "overlay-stats-edition")
    const rowDiv = e("div", "overlay-stats-row")
    statsOrder.forEach((value, index) => {
        const statColumn = e("div", "overlay-stats-column")
        const statLabel = e("label", "overlay-stats-label", value)
        statLabel.setAttribute('for', `overlay-stats-edit${index}`)
        
        const statStat = e(`input#overlay-stats-edit${index}`, "overlay-stats-edit", poke[statField][index],{
            onkeyup: (evKey) => {
                statStat.value = prevValue = 
                        statFieldInputControl[statField](statStat.value, evKey.key, +prevValue, poke[statField])
    
                callback(statField, index, statStat.value)
            },
        })
        let prevValue = +statStat.value
        statStat.type = "text"
        rowDiv.append(JSHAC([
            statColumn, [
                statLabel,
                statStat
            ]
        ]))
        //these only work if you use the event listener, don't ask me why
        let plusUp = e('div', 'overlay-stats-plusminus btn', [e('span', null, '+')], {
            onclick: (evClick)=>{
                statStat.value = prevValue = 
                        statFieldInputControl[statField](statStat.value + '+', 'Plus', +prevValue, poke[statField])
                callback(statField, index, statStat.value)
            }
        })
        let minusDown = e('div', 'overlay-stats-plusminus btn', [e('span', null, '-')],{
            onclick: (evClick)=>{
                statStat.value = prevValue = 
                        statFieldInputControl[statField](statStat.value + '-', 'Minus', +prevValue, poke[statField])
                callback(statField, index, statStat.value)
            }
        })
        statStat.before(plusUp)
        statStat.after(minusDown)
    })
    rowDiv.onclick = function (ev) {
        ev.stopPropagation()
    }

    return JSHAC([
        core, [
            rowDiv,
        ]
    ])
}

function updateOffensiveTypes(){
    $('.off-effective').removeClass('off-effective')
    teamData.forEach((poke, pokeIndex) => {
        if (!poke) return
        poke.moves.forEach((move, moveIndex) =>{
            const typesOff = gameData.moves[move].types.map(x => gameData.typeT[x])
            const typeEff = getMoveEffectiveness(activeOffensiveTypes, typesOff)
            if (typeEff > 1){
                teamView[pokeIndex].moves[moveIndex].classList.add('off-effective')
            }
        })
    })
    
}
const activeOffensiveTypes = []
export function setupOffensiveTeam(){
    $('#builder-off-types').append(
        gameData.typeT.map((x) => JSHAC([
            e('div', 'off-type'),[
                e('div', `builder-off-type builder-off-type-n-active ${x.toLowerCase()}`, x.substring(0, 6), {
                    onclick: (ev)=>{
                        ev.target.classList.toggle('builder-off-type-n-active')
                        const indexT = activeOffensiveTypes.indexOf(x) 
                        if (indexT == -1) {
                            activeOffensiveTypes.push(x)
                        } else {
                            activeOffensiveTypes.splice(indexT, 1)
                        }
                        updateOffensiveTypes()
                    }
                })
            ]
        ]))
    )
}