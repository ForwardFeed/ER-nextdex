import {e} from "./utils.js"

export function quadriRadial(buttons, buttonWidth, buttonHeight){
    if (buttons.length != 4) {
        return console.warn("quadri radial needs 4 buttons not : " + buttons.length)
    }
    const core = e("div", "quadri-radial")
    core.style.width = `calc(${buttonWidth} * 2.1)`
    core.style.height = `calc(${buttonHeight} * 4.5)`

    for (const btnI in buttons){
        const btnData = buttons[btnI]
        const btn = e("div","radial-btn quadri-radial-btn" + btnI ,btnData[0])
        btn.onclick = (ev) => {
            btnData[1]()
            ev.stopPropagation()
        }
        btn.style.width = buttonWidth
        core.append(btn)
    }
    return core
}