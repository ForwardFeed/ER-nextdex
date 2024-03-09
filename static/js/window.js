import { clickOutsideToRemove } from "./utils.js"

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