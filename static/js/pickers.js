import { gameData } from "./data_version.js"
import { queryFilter2 } from "./filters.js"
import { moveOverlay, queryMapMoves } from "./panels/moves_panel.js"
import { setMoveName, setMovePower, setSplitMove } from "./panels/species/species_panel.js"
import { JSHAC, e } from "./utils.js"

export function movePicker(moveList, callback){
    const parentDiv = e('div', 'move-picker-parent')
    const dataBlock = e('div', 'move-picker-datablock')
    const datalist = e('datalist#datalist-movepicker')
    const datas = moveList.map(x => gameData.moves[x])
    const movesLen = datas.length
    for (let i = 0; i < movesLen; i++){
        const move = datas[i]
        const opt = e('option', null, move.name)
        datalist.append(opt)
    }
    let matched
    const inputDiv = e('input', 'move-picker-input', null, {
        onkeydown: (evKey)=>{
            if (evKey.key === "Tab"){
                evKey.stopPropagation()
                evKey.preventDefault()
                if (!matched || !matched.length) return
                inputDiv.value = gameData.moves[moveList[matched[0]]].name
                callback(matched[0])
            }
        },
        onkeyup: () => {
            const query = {
                op: "AND",
                data: inputDiv.value.toLowerCase(),
                k: 'name',
                suggestion: false,
            }
            matched = queryFilter2(query, datas, queryMapMoves)
            if (!matched || !matched.length){
                return
            }
            $(dataBlock).empty().append(moveOverlay(moveList[matched[0]]))
            $(similarMoves).empty()
            const toShow = matched.splice(0,8)
            const toShowLen = toShow.length
            for (let i = 0; i < toShowLen; i++){
                const moveIndex = toShow[i]
                const moveID = moveList[moveIndex]
                const move = gameData.moves[moveID]
                const movePickingRow = e('div', 'species-move-row move-picker-selectable', null, {
                    onclick: (ev)=>{
                        $(inputDiv).val(move.name)
                        $(dataBlock).empty().append(moveOverlay(moveID))
                        ev.stopPropagation()
                        callback(moveIndex)
                    }
                })
                movePickingRow.append(setSplitMove(move, moveID))
                movePickingRow.append(setMoveName(move))
                movePickingRow.append(setMovePower(move))
                similarMoves.append(movePickingRow)
            }
            callback(toShow[0])
        }
    })
    inputDiv.append(datalist)
    inputDiv.setAttribute('list', 'datalist-movepicker')
    const similarMoves = e('div', 'move-picker-similars')

    return JSHAC([
        parentDiv, [
            inputDiv,
            dataBlock,
            similarMoves
        ]
    ])
}

export function listPicker(itemList, callback){
    const parentDiv = e('div', 'move-picker-parent')
    const datalist = e('datalist#datalist-movepicker')
    const datas = itemList
    const itemsLen = datas.length
    for (let i = 0; i < itemsLen; i++){
        const item = datas[i]
        const opt = e('option', null, item)
        datalist.append(opt)
    }
    let matched
    const inputDiv = e('input', 'move-picker-input', null, {
        onkeydown: (evKey)=>{
            if (evKey.key === "Tab"){
                evKey.stopPropagation()
                evKey.preventDefault()
                if (!matched || !matched.length) return
                inputDiv.value = itemList[matched[0]]
                callback(matched[0])
            }
        },
        onkeyup: () => {
            const val = inputDiv.value.toLowerCase()
            matched = itemList.map((x,i) => {
                return x.toLowerCase().indexOf(val) != -1 ? i : undefined
            }).filter(x => x != undefined)
            if (!matched || !matched.length){
                return
            }
            $(similarItems).empty()
            for (let i = 0; i < matched.length; i++){
                const item = itemList[matched[i]]
                if (!item) break
                similarItems.append(e('div', 'move-picker-selectable', [e('span', null, item)],{
                    onclick: ()=>{
                        inputDiv.value = item.toLowerCase()
                        callback(matched[i])
                    }
                }))
            }
            callback(matched[0])
        }
    })
    inputDiv.append(datalist)
    inputDiv.setAttribute('list', 'datalist-movepicker')
    const similarItems = e('div', 'move-picker-similars')

    return JSHAC([
        parentDiv, [
            inputDiv,
            similarItems
        ]
    ])
}