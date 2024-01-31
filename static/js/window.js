

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
    // remove previous helper
    if (windowFrame) windowFrame.remove()

    windowFrame = document.createElement('div')
    windowFrame.className = "window-frame"
    windowFrame.append(node)
    document.body.append(windowFrame)
    //close the window when the document hears a click (you can ev.stopPropagation())
    const remove = () => {
        console.log("window closed")
        windowFrame.remove()
        $(document).off('click', remove)
    }
    $(document).on('click', remove) //if i click it remove this div too
    // apply cursorPlacement
    if (cursorPlacement === "mid"){
        x -= parseInt(node.offsetWidth / 2)
        y -= parseInt(node.offsetHeight / 2)
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

