import { clickOutsideToRemove, e, JSHAC } from "./utils.js"

let windowFrame, callbackDelete

/**
 * @typedef CursorPosition
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */
/**
 * @param {HTMLElement} node
 * @param {CursorPosition} cursorPosition
 */

export function createInformationWindow(node, ev, cursorPlacement="", transparency=false, absorb = true, onCloseCb = ()=>{}) {
    // remove previous window
    removeInformationWindow()
    if (!node) return
    let x = ev.clientX
    let y = ev.clientY
    windowFrame = document.createElement('div')
    windowFrame.className = "window-frame"
    if (transparency) windowFrame.style.backgroundColor = "rgba(0,0,0,0)"
    windowFrame.append(node)
    document.body.append(windowFrame)
    callbackDelete = clickOutsideToRemove(windowFrame, absorb, onCloseCb)
    ev.stopPropagation()
    // apply cursorPlacement
    if (windowFrame.offsetWidth + x > document.body.offsetWidth) {
        x = document.body.offsetWidth - windowFrame.offsetWidth // no overflow
    }
    if (windowFrame.offsetHeight + y > document.body.offsetHeight) {
        y = document.body.offsetHeight - windowFrame.offsetHeight // no overflow
    }
    const cursorPlacementMap = {
        "mid": ()=>{
            x -= parseInt(node.offsetWidth / 2)
            if (x < 0) x = 0
            y -= parseInt(node.offsetHeight / 2)
            if (y < 0) y = 0
        },
        "": ()=>{

        },
        "absolute": ()=>{
            x = 0
            y = 0
        },
        "fullcenter": ()=>{
            x = Math.round((document.body.offsetWidth - windowFrame.offsetWidth) / 2)
            y = Math.round((document.body.offsetHeight - windowFrame.offsetHeight) / 2)
        },
    }
    if (cursorPlacementMap[cursorPlacement]) cursorPlacementMap[cursorPlacement]()
    windowFrame.style.left = x + "px"
    windowFrame.style.top = y + "px"
    if (cursorPlacement === "focus"){
        $(windowFrame).find('input').trigger('focus')
    }
}

export function removeInformationWindow(ev, forceClose=false){
    // remove previous window
    if (ev && callbackDelete) callbackDelete(ev, forceClose)
    if (windowFrame) windowFrame.remove()
}

/**
 * 
 * @param {HTMLElement} node 
 */
export function createGrabbableWindow(
    node
){
    let is_being_grabbed = false
    let pos = {
        x: 0,
        y: 0
    }
    const onmousemove = (event)=>{
        if (is_being_grabbed === false){
                return
            }
            const current_x = root_node.style.left ? +(root_node.style.left.replace("px", '')) : 0
            const current_y = root_node.style.top ? +(root_node.style.top.replace("px", '')) : 0 
            const delta_x = pos.x - event.x
            const delta_y = pos.y - event.y
            pos.x = event.x
            pos.y = event.y
            root_node.style.left = `${current_x - delta_x}px`
            root_node.style.top = `${current_y - delta_y}px`
    }
    const root_node = e('div', 'grabbable-window-root', undefined, {
        onmousedown: (event) =>{
            is_being_grabbed = true
            pos = {
                x: event.x,
                y: event.y
            }
        },
        onmousemove,
        onmouseup: () =>{
            is_being_grabbed = false
        },
        onmouseleave: ()=>{
            is_being_grabbed = false
        }
    })
    $('body')[0].appendChild(JSHAC([
        root_node, [
            node,
            e('div', 'grabbable-close-btn', undefined, {
                onclick: ()=>{
                    root_node.remove()
                }
            }), [
                e('span', 'm-auto', 'X')
            ]
        ]
    ]))
}