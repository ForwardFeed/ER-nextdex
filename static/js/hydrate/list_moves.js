import { gameData } from "../data_version.js"
import { longClickToFilter } from "../filters.js"
import { JSHAC, e } from "../utils.js"


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

export function hydrateListMoves(){
    const fragment = document.createDocumentFragment()
    const len = gameData.moves.length
    for (let specieID = 1; specieID < len; specieID++){
        const move = gameData.moves[specieID]
        const splitImg = e('img', 'moves-list-split')
        splitImg.src = `./icons/${gameData.splitT[move.split]}.png`
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
                splitImg,
                e('div', 'list-moves-types-block', [...new Set(move.types)].map(x => {
                    const type = gameData.typeT[x]
                    const typeNode = e('div', `list-species-type type ${type.toLowerCase()}`, [e('span', null, type)])
                    longClickToFilter(2, typeNode, "type", () => { return type })
                    return typeNode
                })),
                e('div', 'moves-list-stats-flags'),
                    move.flags.map(x =>
                        e('div', 'moves-list-stats-flag', [e('span', null, gameData.flagsT[x])])
                    )
            ]       
        ])
        fragment.append(node)
    }
    $('#panel-list-moves').append(fragment)
}

function setupReordering(){
    const node = JSHAC([
        e('div', 'moves-list-row'),[
            e('div', 'moves-list-stats0'),[
                e('span', null, 'Name'),
            ],
            
        ]
    ])
    $('#panel-list-moves').append(fragment)
}

export function setupListMoves(){
    setupReordering()
    const node = $('#panel-list-moves')[0]
}