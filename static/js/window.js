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
export function createInformationWindow(node, ev, cursorPlacement, transparency=false, absorb = true) {
    // remove previous window
    removeInformationWindow()

    let x = ev.clientX
    let y = ev.clientY
    windowFrame = document.createElement('div')
    windowFrame.className = "window-frame"
    if (transparency) windowFrame.style.backgroundColor = "rgba(0,0,0,0)"
    windowFrame.append(node)
    document.body.append(windowFrame)
    callbackDelete = clickOutsideToRemove(windowFrame, absorb)
    ev.stopPropagation()
    // apply cursorPlacement
    if (cursorPlacement === "mid"){
        x -= parseInt(node.offsetWidth / 2)
        if (x < 0) x = 0
        y -= parseInt(node.offsetHeight / 2)
        if (y < 0) y = 0
    }
    if (windowFrame.offsetWidth + x > document.body.offsetWidth) {
        x = document.body.offsetWidth - windowFrame.offsetWidth // no overflow
    }
    if (windowFrame.offsetHeight + y > document.body.offsetHeight) {
        y = document.body.offsetHeight - windowFrame.offsetHeight // no overflow
    }
    windowFrame.style.left = x + "px"
    windowFrame.style.top = y + "px"
    if (cursorPlacement === "focus"){
        $(windowFrame).find('input').focus()
    }
}

export function removeInformationWindow(ev){
    // remove previous window
    if (ev && callbackDelete) callbackDelete(ev)
    if (windowFrame) windowFrame.remove()
}