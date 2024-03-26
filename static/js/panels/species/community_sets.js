import { gameData } from "../../data_version.js";
import { JSHAC, e, t} from "../../utils.js";
import { getTextNature, statsOrder } from "../trainers_panel.js";
import { currentSpecieID } from "./species_panel.js";
import { createInformationWindow } from "../../window.js";
import { cubicRadial } from "../../radial.js";
import { overlayList, editionStats, overlayEditorAbilities, enterToClose} from "../team_builder.js";
import { fetchFromLocalstorage, saveToLocalstorage } from "../../settings.js";
import { exportDataShowdownFormat, parseShowdownFormat } from "../../format_showdown.js";
import { itemList } from "../../hydrate.js";
import { movePicker, listPicker } from "../../pickers.js";

/** @type {Map<string, pokeData[]>} */
let communitySets = new Map();
/** @type BlockComSets[]*/
const blocks = []
/**
 * @typedef pokeData
 * @prop {string} name
 * @prop {number} spc
 * @prop {number[]} moves
 * @prop {number} abi
 * @prop {number} item
 * @prop {number} nature
 * @prop {number[]} evs
 * @prop {number[]} ivs
 * @prop {string} notes
 * @returns {pokeData}
 */
function emptyData(specieID){
    return {
        name: "",
        spc: specieID,
        moves:  [0, 0, 0, 0],
        abi:    0,
        item:   undefined,
        nature: 0,
        evs: [0,0,0,0,0,0],
        ivs: [31,31,31,31,31,31],
        notes: "",
    }
}

function importFromCommunitySet(file){
    if (!file) return
    if (file.target) file = file.target.files[0]
    var reader = new FileReader();
    reader.onload = (result) => {
        const fullSet = parseShowdownFormat(result.target.result)
        for (const set of fullSet){
            const specie = gameData.species[set.spc]
            // don't overwrite, add to the previous set
            if (communitySets.has(specie.NAME)){
                const previous = communitySets.get(specie.NAME)
                //prevent total duplicates (if one value changed, then it is no longer considered as such)
                let isDuplicate = false
                for (const prevSet of previous){
                    if (JSON.stringify(prevSet) === JSON.stringify(set)) isDuplicate = true
                }
                if (isDuplicate) continue
                previous.push(set)
                communitySets.set(specie.NAME, previous)
            } else {
                communitySets.set(specie.NAME, [set])
            }
        }
        feedCommunitySets(gameData.species[currentSpecieID].NAME)
        saveCommunitySets()
    }
    reader.readAsText(file, 'UTF-8')
}
export function setUpComSets() {
    blocks.push(new BlockComSets(0), new BlockComSets(1))
    $('#export-comsets').on('click', function(){
        const allPokimons = []
        communitySets.forEach((val, key, map)=>{
            if (val.length < 1){
                map.delete(key)
                return
            }
            allPokimons.push(...val)
        })
        const element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportDataShowdownFormat(allPokimons)))
        element.setAttribute('download', 'communitySets.txt')
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click();
        document.body.removeChild(element);
    })
    var input = document.createElement("input");
    input.id = "savefile-upload";
    input.type = "file";
    input.accept = ".txt";
    input.style.display = "none";
    input.onchange = importFromCommunitySet;
    $('#import-comsets').before(input).on('click', function(){
        input.click()
    })
}


class BlockComSets {
    /**
     * @param {pokeData} data 
     * @param {number} blockID 
     */
    constructor(blockID) {
        this.allMovesName = []
        this.multiplePokedatas = []

        this.blockID = blockID
        this.block = $('.species-sets-block').eq(blockID)
        
        this.placeholder = e('div', 'species-sets-placeholder', null, {
            onclick: ()=>{
                this.showBlock()
                addSets(this.blockID)
            }
        })

        this.notesDiv = e('div', 'species-sets-notes')
        this.notesTop = e('div', 'species-sets-notes-top')
        this.notesReturn = e('div', 'species-sets-notes-return btn', null, {
            onclick: ()=>{
                $(this.dataDiv).toggle()
                $(this.notesDiv).toggle()
            }
        })
        this.notesDiv.style.display = 'none'
        /* var suggests = ["hello", "world"];
        $("#text-area1").asuggest(suggests);s*/
        this.notes = e('textarea', 'species-sets-notes-text', null, {
            onkeydown : (ev)=>{
                //tab to indent
                if (ev.key === "Tab"){
                    const vals = this.notes.value.split('')
                    vals.splice(this.notes.selectionStart, 0, " ".repeat(4 - (this.notes.selectionStart % 4)))
                    this.pokeData.notes = this.notes.value = vals.join('')
                    ev.stopPropagation()
                    ev.preventDefault()
                }
                $(this.save).show()
            },
            onkeyup : (ev) =>{
                this.pokeData.notes = this.notes.value
            }
        })

        this.dataDiv = e('div', 'species-sets-data')
        this.dataDiv.style.display = "none"
        this.top = e('div', 'species-sets-top')
        this.name = e('div', 'species-sets-name', 'Name of the sets', {
            onclick: (ev)=>{
                const input = e('input',null, this.pokeData.name, {
                    onkeydown: enterToClose
                })
                createInformationWindow(
                    input, ev, "focus", true, true, ()=>{
                        this.pokeData.name = input.value
                        t(this.name, input.value)
                        $(this.save).show()
                    })
            }
        })
        this.delete = e('div', 'species-sets-delete btn', 'Delete', {
            onclick: ()=>{
                pokeDatas.splice(this.pokeDataID, 1)
                this.pokeDataID = getPreviousPokeID(this.pokeDataID)
                const oppositeBlockID = blockID == 1 ? 0 : 1
                const oppBlock =  blocks[oppositeBlockID]
                if (this.pokeDataID < oppBlock.pokeDataID){
                    oppBlock.pokeDataID -= 1
                }
                
                if (this.pokeDataID == null){
                    this.hideBlock()
                } else {
                    this.feed(this.pokeDataID)
                }
                oppBlock.updateCounter()
                saveCommunitySets()
            }
        })
        this.notesBtn = e('div', 'species-sets-notes-btn btn', 'notes', {
            onclick: ()=>{
                $(this.dataDiv).toggle()
                $(this.notesDiv).toggle()
            }
        })
        const abiCallback = (abiID) => {
            this.pokeData.abi = abiID
            t(this.ability, gameData.abilities[this.baseSpc.stats.abis[abiID]].name)
            $(this.save).show()
        }
        const itemCallback = (itemID) => {
            this.pokeData.item = itemID
            t(this.item, gameData.items[itemID].name)
            $(this.save).show()
        }
        const natureCallback = (natureID) => {
            this.pokeData.nature = natureID
            this.updateNature()
            $(this.save).show()
        }
        const statsCallback = (field, index, value) => {
            this.pokeData[field][index] = value
            if (field === "evs"){
                this.updateEv(index, value)
            } else {
                this.updateIv(index, value)
            }
            $(this.save).show()
        }
        this.mid = e('div', 'species-sets-mid')
        this.midLeft = e('div', 'species-sets-mid-left', null, {
            onclick: (ev)=>{
                ev.stopPropagation()
                const overlayNode = cubicRadial([
                    ["Abilities", (ev) => {
                        const overlayNode = overlayEditorAbilities(this.baseSpc, abiCallback)
                        createInformationWindow(overlayNode, ev, "", true)
                    }],
                    ["Items", (ev) => {
                        createInformationWindow(listPicker(itemList, itemCallback), ev, "focus")
                    }],
                    ["Nature", (ev) => {
                        createInformationWindow(listPicker(gameData.natureT.map(x => getTextNature(x)), natureCallback),
                            ev, "focus")
                    }],
                ], "6em", "1em")
                createInformationWindow(overlayNode, ev, "mid", true)
            }
        })
        this.ability = e('div', 'row')
        this.item = e('div', 'row')
        this.nature = e('div', 'row')
        this.midRight = e('div', 'species-sets-mid-right')
        this.movesDiv = []
        this.movesSpan = []
        for (let i = 0; i < 4; i++){
            const moveSpan = e('span', null, '-')
            const moveCallback = (moveID) => {
                this.pokeData.moves[i] = this.baseSpc.allMoves[moveID]
                t(moveSpan, this.allMovesName[moveID])
                const moveType = gameData.typeT[gameData.moves[this.baseSpc.allMoves[moveID]].types[0]].toLowerCase()
                this.movesDiv[i].className = `trainers-poke-move ${moveType}-t`
                $(this.save).show()
            }
            this.movesSpan.push(moveSpan)
            this.movesDiv.push(e('div', 'trainers-poke-move', [moveSpan], {
                onclick: (ev)=>{
                    createInformationWindow(
                        movePicker(this.baseSpc.allMoves, moveCallback),
                        ev, "focus", true, true
                    )
                }
            }))      
        }
        this.statsRow = e('div', 'species-sets-stats', null,{
            onclick: (ev)=>{
                ev.stopPropagation()
                const overlayNode = cubicRadial([
                    ["IVs", (ev) => {
                        createInformationWindow(editionStats("ivs", this.pokeData, statsCallback), ev)
                    }],
                    ["EVs", (ev) => {
                        createInformationWindow(editionStats("evs", this.pokeData, statsCallback), ev)
                    }],
                ], "6em", "1em")
                createInformationWindow(overlayNode, ev, "mid", true)
            } 
        })
        this.statsNames = []
        this.evs = []
        this.ivs = []
        statsOrder.map((x, i)=>{
            const col = e('div', `trainers-stats-name`, x)
            const ev = e('div', `trainers-poke-evs`, 0)
            const iv = e('div', `trainers-poke-ivs`, 0)
            this.statsNames.push(col)
            this.evs.push(ev)
            this.ivs.push(iv)
            this.statsRow.append(JSHAC([
                e('div', 'trainers-stats-col'), [
                    col,
                    iv,
                    ev
                ]
            ]))
        })

        this.bot = e('div', 'species-sets-selection')
        this.new = e('div', 'btn species-sets-new', 'New', {
            onclick: () => {
                addSets(this.blockID)
            }
        })
        this.prev = e('div', 'species-sets-previous btn', 'Previous', {
            onclick: ()=>{
                const prevPokeID = getPreviousPokeID(this.pokeDataID - 1)
                if (prevPokeID == null) return 
                this.feed(prevPokeID)
            }
        })
        this.counter = e('div', 'species-sets-counter', '0/0')
        this.next = e('div', 'species-sets-next btn left', 'Next', {
            onclick: ()=>{
                const nextPokeID = getNextPokeID(this.pokeDataID + 1)
                if (nextPokeID == null) return
                this.feed(nextPokeID)
            }
        })
        this.save = e('div', 'btn species-sets-save right', 'Save', {
            onclick: ()=>{
                this.savedPokeData = structuredClone(this.toPokeData())
                communitySets.set(this.baseSpc.NAME, pokeDatas)
                saveCommunitySets()
                $(this.save).hide()
            }
        })
        this.save.style.display = "none"

        this.block.empty().append(JSHAC([
            this.placeholder, [
                e('span', null, 'Click to add a set')
            ],
            this.notesDiv, [
                this.notesTop, [
                    this.notesReturn, [e('span', null, 'Return')]
                ],
                this.notes,
            ],
            this.dataDiv,[
                this.top, [
                    this.delete,
                    this.name,
                    this.notesBtn
                ],
                this.mid, [
                    this.midLeft,[
                        this.ability,
                        this.item,
                        this.nature,
                    ],
                    this.midRight, this.movesDiv,
                ],
                this.statsRow,
                this.bot, [
                    this.save,
                    this.prev,
                    this.counter,
                    this.next,
                    this.new
                ]
            ]
        ]))
    }
    /**
     * @param {number | pokeData} pokeData 
     */
    feed(pokeDataID){
        const pokeData = this.pokeData = pokeDatas[pokeDataID]
        if (!pokeData) return
        this.pokeDataID = pokeDataID
        this.showBlock()
        this.savedPokeData = structuredClone(pokeData)
        this.pokeData = pokeData
        this.baseSpc = gameData.species[pokeData.spc]
        t(this.ability, gameData.abilities[this.baseSpc.stats.abis[pokeData.abi]].name)
        t(this.item, gameData.items[pokeData.item]?.name || 'no item')
        this.updateNature()
        for (let i=0; i<6; i++){
            this.updateEv(i, pokeData.evs[i])
            this.updateIv(i, pokeData.ivs[i])
        }
        for (let i=0; i<4; i++){
            t(this.movesSpan[i], gameData.moves[pokeData.moves[i]]?.name || "-")
            const moveType = gameData.typeT[gameData.moves[pokeData.moves[i]]?.types[0]]?.toLowerCase()
            this.movesDiv[i].className = `trainers-poke-move ${moveType}-t`
        }
        t(this.name, pokeData.name || 'Name of the sets')
        this.notes.value = pokeData.notes || ""
        this.allMovesName = this.baseSpc.allMoves.map(x => gameData.moves[x].name)
        this.updateCounter()
    }
    updateNature(){
        const textNature = getTextNature(gameData.natureT[this.pokeData.nature])
        t(this.nature, textNature)
        const nerfedBuffed = textNature.match(/((Def)|(SpA)|(Atk)|(SpD)|(Spe))/g)
        const statBuffed = nerfedBuffed?.[0]
        const statNerfed = nerfedBuffed?.[1]
        $(this.statsRow).find('.trainers-stats-name.nerfed, .trainers-stats-name.buffed').removeClass("nerfed buffed")
        if (statBuffed && statNerfed){
            const buffedRowIndex = statsOrder.indexOf(statBuffed)
            const nerfedRowIndex = statsOrder.indexOf(statNerfed)
            this.statsNames[buffedRowIndex].classList.add('buffed')
            this.statsNames[nerfedRowIndex].classList.add('nerfed')
        } else {
            
        }
    }
    updateEv(index, evVal){
        t(this.evs[index], +evVal)
        let fontRgb = window.getComputedStyle(document.body).color.match(/\d+/g)
        if (!fontRgb || fontRgb.length != 3) fontRgb = [255, 255, 255]
        this.evs[index].style.color = `rgb(0, ${evVal}, 0)`
    }
    updateIv(index, ivVal){
        t(this.ivs[index], +ivVal)
        if (ivVal == 0){
            this.ivs[index].classList.add("nerfed")
        } else {
            this.ivs[index].classList.remove("nerfed")
        }
    }
    updateCounter(){
        t(this.counter, `${this.pokeDataID + 1}/${pokeDatas.length}`)
    }
    showBlock(){
        $(this.dataDiv).show()
        $(this.placeholder).hide()
        const oppositeBlockID = this.blockID == 1 ? 0 : 1
        const oppositeBlock = blocks[oppositeBlockID]
        if (oppositeBlock.dataDiv.style.display === "none"){
            $(this.new).hide()
        } else {
            $(this.new).show()
            $(oppositeBlock.new).show()
        }

    }
    hideBlock(){
        $(this.dataDiv).hide()
        $(this.placeholder).show()
        $(this.notesDiv).hide()
        this.pokeDataID = -1
        const oppositeBlockID = this.blockID == 1 ? 0 : 1
        const oppositeBlock = blocks[oppositeBlockID]
        $(oppositeBlock.new).hide()
    }
    /**
     * @returns {pokeData}
     */
    toPokeData(){
        return{
            name:   this.pokeData.name,
            spc:    this.pokeData.spc,
            moves:  this.pokeData.moves,
            abi:    this.pokeData.abi,
            item:   this.pokeData.item,
            nature: this.pokeData.nature,
            evs:    this.pokeData.evs,
            ivs:    this.pokeData.ivs,
            notes:  this.pokeData.notes
        }
    }
}

/** @type {pokeData[]} pokeData  */
let pokeDatas = []
/**
 * @param {string} specieNAME 
 */
export function feedCommunitySets(specieNAME){
    pokeDatas = []
    if (!communitySets.has(specieNAME)){
        for (let i = 0; i < 2; i++){
            blocks[i].hideBlock()
        }
    } else {
        pokeDatas = communitySets.get(specieNAME)
        for (let i = 0; i < 2; i++){
            const pokeData = pokeDatas[i]

            if (!pokeData){
                blocks[i].hideBlock()
            } else {
                blocks[i].feed(i)
            }
        }
    }
    
}
function addSets(blockID){
    const oppositeBlockID = blockID == 1 ? 0 : 1
    const oppositeBlock = blocks[oppositeBlockID]
    const block = blocks[blockID]
    block.pokeDataID = pokeDatas.push(emptyData(currentSpecieID)) - 1
    block.feed(block.pokeDataID)
    oppositeBlock.updateCounter()
}

function isIdInUse(dataID){
    const allIdsInUse = blocks.map(x => x.pokeDataID)
    return allIdsInUse.indexOf(dataID) != -1
}

function getNextPokeID(nextPokeDataID){
    if (isIdInUse(nextPokeDataID)) {
        nextPokeDataID = getNextPokeID(nextPokeDataID + 1)
    }
    if (nextPokeDataID >= pokeDatas.length) return null
    return nextPokeDataID
}

function getPreviousPokeID(PreviousPokeDataID){
    if (isIdInUse(PreviousPokeDataID)) {
        PreviousPokeDataID = getPreviousPokeID(PreviousPokeDataID - 1)
    }
    if (PreviousPokeDataID < 0) return null
    return PreviousPokeDataID
}

export function getCommunitySetsFromStorage(){
    let comSets = fetchFromLocalstorage("communitySets")
    if (!comSets) return communitySets = new Map()
    return communitySets = new Map(JSON.parse(comSets));
}

function saveCommunitySets(){
    saveToLocalstorage("communitySets", JSON.stringify(Array.from(communitySets.entries())))
}

window.clearCom = function(){
    saveToLocalstorage("communitySets", "")
}