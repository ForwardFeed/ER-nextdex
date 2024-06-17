import { feedPanelMoves } from "../panels/moves_panel.js"
import { gameData } from "../data_version.js"
import { DynamicList, LIST_RENDER_RANGE } from "../dynamic_list.js"
import { JSHAC, e } from "../utils.js"
import { movesListDataUpdate } from "./list_moves.js"
import { nodeLists } from "./hydrate.js"

export let HPMoveID = 0
export let HPsMovesID = []
function generateMovesNodes(moves = gameData.moves){
    nodeLists.moves.length = 0 // reset
    HPsMovesID = []
    if (gameData.flagsT.indexOf('Technician') == -1) gameData.flagsT.push('Technician', 'Perfectionnist')
    const fragment = document.createDocumentFragment();
    let movesLen = moves.length
    for (let i = 0; i < movesLen; i++) {
        if (i == 0) continue
        const mv = moves[i]
        if (mv.name === "Hidden Power"){
            mv.name = "H.P. Normal"
            HPMoveID = i
            for (const typeI in gameData.typeT){
                const typeName = gameData.typeT[typeI]
                if (typeName === "Normal") continue
                const newHP = structuredClone(mv)
                newHP.types[0] = typeI
                newHP.name = "H.P. " + typeName
                movesLen++
                
                HPsMovesID.push(moves.push(newHP) - 1)
            }
        }
        if (mv.pwr > 0 && mv.pwr <= 60) mv.flags.push(gameData.flagsT.indexOf('Technician'))
        if (mv.pwr > 0 && mv.pwr < 50) mv.flags.push(gameData.flagsT.indexOf('Perfectionnist'))
        const core = document.createElement('div')
        core.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = mv.name || "Unknown"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function () {
            fastdom.mutate(() => {
                $("#filter-frame").hide()
                feedPanelMoves($(this).attr('data-id'))
            });
        });
        if (i > LIST_RENDER_RANGE) $(core).hide()
        nodeLists.moves.push(core)
        fragment.append(core)
    }
    return fragment
}


export function hydrateMoves() {
    generateMovesNodes()
    movesListDataUpdate()
    blockMovesDynList.replaceList(generateMovesNodes)
    feedPanelMoves(1)
}

// a weird mechanic from ER that makes any evee evo line learn any other move from any other evo line
// it is so weird that i'm using a pointer for that
export function addAllOtherEveeMoves(){
    const Eevee = gameData.species.find(x => x.name === "Eevee")
    if (!Eevee) return
    let moveListPointer = Eevee.allMoves
    if (!moveListPointer) {
        console.warn('unexplainable problem in addAllOtherEveeMoves')
        return
    }
    let allMoves = []
    // add all moves uniquely into a shared object 
    for (const evo of Eevee.evolutions){
        const nextEvo = gameData.species[evo.in]
        allMoves = [... new Set(allMoves.concat(nextEvo.allMoves))]
        nextEvo.allMoves = moveListPointer
    }
    // show it shows into pree evo moves too
    for (const evo of Eevee.evolutions){
        const nextEvo = gameData.species[evo.in]
        nextEvo.preevomoves = nextEvo.preevomoves.concat(allMoves.filter(
            x => nextEvo.allMoves.indexOf(x) == -1
        ))
    }
    moveListPointer.splice(0) // i delete everything inside to keep the pointer alive
    moveListPointer.push(...allMoves)
}


export function takeMovesFromPreEvolution(){
    const speciesLen = gameData.species.length
    for(let i=0; i < speciesLen; i++){
        const specie = gameData.species[i]
        for(const evo of specie.evolutions){
            if (!evo.from) continue
            const previousSpecie = gameData.species[evo.in]
            specie.preevomoves = previousSpecie.allMoves.filter(
                x => specie.allMoves.indexOf(x) == -1
            )
            specie.allMoves =  [... new Set(specie.allMoves.concat(...specie.preevomoves))]
        }
    }
}

function setupReorderBtn(){
    return JSHAC([
        e('div', 'data-list-row'), [
            e('span', null, '')
        ]
    ]).firstChild
}

/** @type {DynamicList} */
export let blockMovesDynList

export function setupBlockMoves(){
    const node = $("#moves-list")[0]
    node.append(setupReorderBtn())
    blockMovesDynList = new DynamicList(node, node.children[0], "moves")
    blockMovesDynList.setup()
}