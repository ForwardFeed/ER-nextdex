import { clickOutsideToRemove } from "./utils.js"

let windowFrame  

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
export function createInformationWindow(node, { x: x, y: y }, cursorPlacement) {
    // remove previous window
    removeInformationWindow()

    windowFrame = document.createElement('div')
    windowFrame.className = "window-frame"
    windowFrame.append(node)
    document.body.append(windowFrame)
    clickOutsideToRemove(windowFrame, true)
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
    console.log("window created", windowFrame)
    if (cursorPlacement === "focus"){
        $(windowFrame).find('input').focus()
    }
}

export function removeInformationWindow(){
    // remove previous window
    if (windowFrame) windowFrame.remove()
}