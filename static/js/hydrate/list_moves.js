import { gameData } from "../data_version.js"
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
        const node = JSHAC([
            e('div', 'moves-list-name'),[
                e('span', null, move.name)
            ],
            e('div', 'moves-list-power',[
                e('span', null, move.pwr)
            ]),
            e('div', 'moves-list-stats1'),[
                e('div', 'moves-list-stats1-row'),[
                    e('span', null, move.acc || "--")
                ],
                e('div', 'moves-list-stats1-row'),[
                    e('span', null, move.pp)
                ],
                e('div', 'moves-list-stats1-row'),[
                    e('span', null, move.prio)
                ],
                e('div', 'moves-list-stats1-row'),[
                    e('span', null, move.chance)
                ],
            ]
                
        ])
        fragment.append(node)
    }
    $('#panel-list-moves').append(fragment)
}