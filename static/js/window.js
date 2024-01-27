

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
export function createInformationWindow(node, { x: x, y: y }) {
    // remove previous helper
    if (windowFrame) windowFrame.remove()

    windowFrame = document.createElement('div')
    windowFrame.className = "window-frame"
    windowFrame.append(node)
    document.body.append(windowFrame)
    // so the cursor is slightly on the window
    x -= 20
    y -= 20
    //close the window
    const remove = () => {
        windowFrame.remove()
        $(document).off('click', remove)
    }
    $(document).on('click', remove) //if i click it remove this div too

    if (windowFrame.offsetWidth + x > document.body.offsetWidth) {
        x = document.body.offsetWidth - windowFrame.offsetWidth // no overflow
    }
    if (windowFrame.offsetHeight + y > document.body.offsetHeight) {
        y = document.body.offsetHeight - windowFrame.offsetHeight // no overflow
    }
    windowFrame.style.left = x + "px"
    windowFrame.style.top = y + "px"
}

