import {e} from "./utils.js"
/**
 * 
 * @param {*} buttons - [0: InnerText, 1:CallBack on click]
 * @param {*} buttonWidth 
 * @param {*} buttonHeight 
 * @returns 
 */
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
            btnData[1](ev)
            ev.stopPropagation()
        }
        btn.style.width = buttonWidth
        core.append(btn)
    }
    return core
}

export function cubicRadial(buttons, buttonWidth, buttonHeight){
    const nbSides = Math.round(Math.sqrt(buttons.length))
    const core = e("div", "cubic-radial")
    core.style.width = `calc(${buttonWidth} * ${nbSides})`
    core.style.height = `calc(${buttonHeight} * ${nbSides})`

    for (let i = 0; i < nbSides; i++){//row
        for (let j = 0; j < nbSides; j++){//columns
            const btnData =  buttons[i * nbSides + j]
            if (!btnData) continue
            const btnNode = e("div","radial-btn" , btnData[0])
            btnNode.style.left = `calc(${buttonWidth} * ${j})`
            btnNode.style.top = `calc(${buttonHeight} * ${i})`
            btnNode.onclick = (ev) => {
                btnData[1](ev)
                ev.stopPropagation()
            }
            btnNode.style.width = buttonWidth
            core.append(btnNode)
        }
    }
    return core
}