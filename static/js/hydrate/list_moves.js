import { gameData } from "../data_version.js"
import { DynamicList, LIST_RENDER_RANGE } from "../dynamic_list.js"
import { longClickToFilter } from "../filters.js"
import { feedPanelMoves, matchedMoves } from "../panels/moves_panel.js"
import { JSHAC, e } from "../utils.js"
import { nodeLists } from "./hydrate.js"
import { blockMovesDynList } from "./moves.js"


export function toggleLayoutListMoves(toggle = true){
    if (toggle) {
        // I tried not using hide() but apparently it has not affect on the lag issue
        // No clue on how to fix this besides reworking a completely new loading system where it's generated on scroll
        $('#panel-list-moves').css('display', 'flex')
        $('#panel-block-moves').css('display', 'none')
    } else {
        $('#moves-return-list-layout').hide()
        $('#panel-list-moves').css('display', 'none')
        $('#panel-block-moves').css('display', 'flex')
    }
}

function generateMovesNodes(){
    nodeLists.listLayoutMoves.length = 0
    const fragment = document.createDocumentFragment()
    const len = gameData.moves.length
    for (let moveID = 1; moveID < len; moveID++){
        const move = gameData.moves[moveID]
        const splitImg = e('img', 'moves-list-split')
        splitImg.src = `./icons/${gameData.splitT[move.split]}.png`
        const typeSplitNode = e('div', 'list-moves-types-block moves-list-split')
        typeSplitNode.style.backgroundImage = `url(./icons/${gameData.splitT[move.split]}.png)`
        const node = JSHAC([
            e('div', 'moves-list-row'),[
                e('div', 'moves-list-stats0'), [
                    e('div', 'moves-list-name'),[
                        e('span', null, move.name),
                    ],
                    e('div', 'moves-list-power'),[
                        e('span', null, move.pwr),
                    ],
                ],
                e('div', 'moves-list-stats1'),[
                    e('div', 'moves-list-stats1-row'),[
                        e('span', 'moves-list-stats1-name', "acc: "),
                        e('span', null, move.acc || "--")
                    ],
                    e('div', 'moves-list-stats1-row'),[
                        e('span', 'moves-list-stats1-name', "p.p: "),
                        e('span', null, move.pp)
                    ],
                    e('div', 'moves-list-stats1-row'),[
                        e('span', 'moves-list-stats1-name', "pri: "),
                        e('span', null, move.prio)
                    ],
                    e('div', 'moves-list-stats1-row'),[
                        e('span', 'moves-list-stats1-name', "e.c: "),
                        e('span', null, move.chance)
                    ],
                ],
                typeSplitNode, [...new Set(move.types)].map(x => {
                    const type = gameData.typeT[x]
                    const typeNode = e('div', `list-species-type type ${type.toLowerCase()}`, [e('span', null, type)])
                    longClickToFilter(2, typeNode, "type", () => { return type })
                    return typeNode
                }),
                e('div', 'moves-list-stats-flags'),
                    [... new Set(move.flags)].map(x =>
                        e('div', 'moves-list-stats-flag', [e('span', null, gameData.flagsT[x])])
                    ),
                e('div', 'list-species-btn-view', [e('span', null, 'View')], {
                    onclick: (ev) => {
                        feedPanelMoves(moveID)
                        toggleLayoutListMoves(false)
                        $('#moves-return-list-layout').show()
                    }
                })
            ]       
        ]).firstChild
        fragment.append(node)
        nodeLists.listLayoutMoves.push(node)
        if (moveID > LIST_RENDER_RANGE) $(node).hide()
    }
    return fragment
}

export function hydrateListMoves(){

    listMovesDynList.replaceList(generateMovesNodes,movesListDataUpdate)
}

function setupReordering(){
    const node = JSHAC([
        e('div', 'moves-list-row'),[
            e('div', 'moves-list-name'),[
                e('span', null, 'Name'),
            ],
            e('div', 'moves-list-stats1-row'),[
                e('span', null, 'Stats'),
            ],
            e('div', 'moves-list-split'),[
                e('span', null, 'Split'),
            ],
            e('div', 'list-moves-types-block'),[
                e('span', null, 'Types'),
            ],
            e('div', 'moves-list-stats-flags'),[
                e('span', null, 'Move-Effect'),
            ],
        ]
    ])
    $('#panel-list-moves').append(node)
}

export function movesListDataUpdate(){
    const finalDataListLayout = []
    if (matchedMoves && typeof matchedMoves === "object"){
        const matchedMovesLen = matchedMoves.length
        for(let i = 0; i < matchedMovesLen; i++){
            // because of species none, there's a need for -1 it
            finalDataListLayout[i] = matchedMoves[i] - 1
        }
    } else if (matchedMoves){
            finalDataListLayout[0] = matchedMoves
    } else {
        const naturalOrderLen = nodeLists.listLayoutMoves.length
        for(let i = 0; i < naturalOrderLen; i++) finalDataListLayout[i] = i
    }
    listMovesDynList.dataUpdate(finalDataListLayout).update()
    blockMovesDynList.dataUpdate(finalDataListLayout).update()
}

/** @type {DynamicList} */
export let listMovesDynList
export function setupListMoves(){
    setupReordering()
    const node = $('#panel-list-moves')[0]
    listMovesDynList = new DynamicList(node, node.children[0], "listLayoutMoves")
    listMovesDynList.setup()
}
