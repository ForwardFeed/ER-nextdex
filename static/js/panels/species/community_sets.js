import { gameData } from "../../data_version.js";
import { JSHAC, e } from "../../utils.js";
import { getTextNature, statsOrder } from "../trainers_panel.js";
import { currentSpecieID } from "./species_panel.js";
import { createInformationWindow } from "../../window.js";
import { cubicRadial } from "../../radial.js";
import { overlayList, editionStats, overlayEditorAbilities, enterToClose} from "../team_builder.js";

/** @type {string[]} */
export let communitySets;
/** @type BlockView[]*/
const blockViews = []

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
    }
}
export function setUpComSets() {
    blockViews.push(new BlockView(0), new BlockView(1))
}


class BlockView {
    /**
     * 
     * @param {pokeData} data 
     * @param {number} blockID 
     */
    constructor(blockID) {
        this.allMovesName = []

        this.block = $('.species-sets-block').eq(blockID)
        
        this.placeholder = e('div', 'species-sets-placeholder', null, {
            onclick: ()=>{
                $(this.dataDiv).toggle()
                $(this.placeholder).toggle()
                this.feed(emptyData(currentSpecieID))
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
                    this.notes.value = vals.join('')
                    ev.stopPropagation()
                    ev.preventDefault()
                }
            }
        })

        this.dataDiv = e('div', 'species-sets-data')
        this.dataDiv.style.display = "none"
        this.top = e('div', 'species-sets-top', 'Name of the sets', {
            onclick: (ev)=>{
                const input = e('input',null, this.pokeData.name, {
                    onkeydown: enterToClose
                })
                createInformationWindow(
                    input, ev, "focus", true, true, ()=>{
                        t(this.top,input.value)
                    })
            }
        })
        this.delete = e('div', 'species-sets-delete btn', 'Delete', {
            onclick: ()=>{
                $(this.dataDiv).toggle()
                $(this.placeholder).toggle()
            }
        })
        this.notesBtn = e('div', 'species-sets-notes-btn btn', 'notes', {
            onclick: ()=>{
                $(this.dataDiv).toggle()
                $(this.notesDiv).toggle()
            }
        })
        const abiCallback = (abiID) => {
            t(this.ability, gameData.abilities[gameData.species[this.pokeData.spc].stats.abis[abiID]].name)
            // this.save()
        }
        const itemCallback = (itemID) => {
            console.log(itemID, this.item)
            t(this.item, gameData.items[itemID].name)
            //this.save()
        }
        const natureCallback = (natureID) => {
            t(this.nature, gameData.natureT[natureID])
            //this.save()
        }
        const statsCallback = (field, index, value) => {
            t(this[field][index], value)
            //this.save()
        }
        this.mid = e('div', 'species-sets-mid')
        this.midLeft = e('div', 'species-sets-mid-left', null, {
            onclick: (ev)=>{
                ev.stopPropagation()
                const overlayNode = cubicRadial([
                    ["Abilities", (ev) => {
                        const overlayNode = overlayEditorAbilities(gameData.species[this.pokeData.spc], abiCallback)
                        createInformationWindow(overlayNode, ev, "", true)
                    }],
                    ["Items", (ev) => {
                        createInformationWindow(overlayList(itemCallback, gameData.items.map(x => x.name)), ev, "focus")
                    }],
                    ["Nature", (ev) => {
                        createInformationWindow(overlayList(natureCallback,
                            gameData.natureT.map(x => getTextNature(x))),
                            ev, "focus")
                    }],
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
        this.ability = e('div', 'row')
        this.item = e('div', 'row')
        this.nature = e('div', 'row')
        this.midRight = e('div', 'species-sets-mid-right')
        this.movesDiv = []
        this.movesSpan = []
        for (let i = 0; i < 4; i++){
            const moveSpan = e('span', null, '-')
            const moveCallback = (moveID) => {
                t(moveSpan, this.allMovesName[moveID])
                //this.save()
            }
            this.movesSpan.push(moveSpan)
            this.movesDiv.push(e('div', 'trainers-poke-move', [moveSpan], {
                onclick: (ev)=>{
                    createInformationWindow(
                        overlayList(moveCallback, this.allMovesName),
                        ev, "focus"
                    )
                }
            }))      
        } 
        this.moves = [0,1,2,3].map(x => {
                
        })
        this.statsRow = e('div', 'species-sets-stats')
        this.evs = []
        this.ivs = []
        statsOrder.map((x, i)=>{
            const ev = e('div', `trainers-poke-evs`, 0)
            const iv = e('div', `trainers-poke-ivs`, 0)
            this.evs.push(ev)
            this.ivs.push(iv)
            this.statsRow.append(JSHAC([
                e('div', 'trainers-stats-col'), [
                    e('div', `trainers-stats-name`, x),
                    iv,
                    ev
                ]
            ]))
        })

        this.bot = e('div', 'species-sets-selection')
        this.edit = e('div', 'btn species-sets-edit', 'Edit', {
            onclick: () => {
                return
            }
        })
        this.prev = e('div', 'species-sets-previous btn', 'Previous')
        this.counter = e('div', 'species-sets-counter', '0/0')
        this.next = e('div', 'species-sets-next btn left', 'Next')
        this.newD = e('div', 'btn species-sets-new right', 'New')

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
                    blockID ? this.edit : this.newD,
                    this.prev,
                    this.counter,
                    this.next,
                    blockID ? this.newD : this.edit
                ]
            ]
        ]))
    }
    /**
     * @param {pokeData} pokeData 
     */
    feed(pokeData){
        this.pokeData = pokeData
        const spc = gameData.species[pokeData.spc]
        t(this.ability, gameData.abilities[spc.stats.abis[pokeData.abi]].name)
        t(this.item, gameData.items[pokeData.item] || 'no item')
        t(this.nature, gameData.natureT[pokeData.nature])
        for (let i=0; i<6; i++){
            t(this.evs[i], pokeData.evs[i])
            t(this.ivs[i], pokeData.ivs[i])
        }
        for (let i=0; i<4; i++){
            t(this.movesSpan[i], gameData.moves[pokeData.moves[i]].name)
        }
        t(this.top, pokeData.name || 'Name of the sets')
        this.allMovesName = spc.allMoves.map(x => gameData.moves[x].name)
    }

}
/**
 * shamelessly lazy wrapper
 * @param {HTMLElement} node
 * @param {string} text 
 */
function t(node, text){
    node.innerText = text
}