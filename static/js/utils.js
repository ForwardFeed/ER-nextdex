import { search } from "./search.js";

export function addTooltip(node, description) {
	const tooltip = document.createElement("div");
	tooltip.innerText = description;
    tooltip.className = "tooltip"
	node.onmouseover = () => {
		tooltip.style.display = "block";
	};
	node.onmouseleave = () => {
		tooltip.style.display = "none";
	};
	// support for touchpad
	node.ontouchstart = () => {
		tooltip.style.display = tooltip.style.display === "block" ? "none" : "block"
	};
	node.appendChild(tooltip);
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
/**
 * Uses indexOf which is significantly faster in V8 than includes
 * @param {string} a is included in b? 
 * @param {string} b include a?
 * @param {boolean} addToSuggestion if it includes, add b to the suggestion list?
 * @returns {boolean}
 */
export function AisInB(a, b){
	if (b.indexOf(a) != -1){
		return true
	} 
	return false
}


/**
 * will work as long no future event.stop propagation is written in the code
 */

export function clickOutsideToRemove(htmlNodeToHide, htmlNodeClickedOn){
    const clickToHide = (ev)=>{
        if (htmlNodeClickedOn == ev.target) return 
        htmlNodeToHide.style.display = "none"
        $(document).off('click', clickToHide)
    }
    $(document).on('click', clickToHide)
}

/** JS Util to HTML */
/**
 * 
 * @param {string | undefined} tag 
 * @param {string | undefined} classname 
 * @param {string | undefined} innerText 
 * @returns {HTMLDivElement}
 */
export function e(tag = "div", classname = "", innerText ="" ){
    const htmlTag = document.createElement(tag)
    htmlTag.className = classname
    htmlTag.innerText = innerText
    return htmlTag
}
/**
 * Javascript HTML Array Concatenation
 * @param {HTMLDivElement | HTMLDivElement[]} htmlArray
 * @returns  {DocumentFragment}
 */
export function JSHAC(htmlArray){
    const frag = document.createDocumentFragment()
    for (let i = 0; i < htmlArray.length; i++){
        const element = htmlArray[i]
        if (element.constructor.name !== "Array"){
            // It means it is a children
            frag.append(element)
            
        } else {
            // It means the previous children was a parent
            const parent = htmlArray[i - 1]
            parent.append(JSHAC(element))
        }
    }
    return frag
}


export class Selectable {
    constructor(list) {
        this.wrapper = e("div", "selectable-wrapper");
        this.input = e("input", "selectable-input");
        this.input.type = "button";
        this.selections = e("div", "selectable-selections");
        this.list = list
        this.nodelist = list && 
                        list.constructor.name === "Array" &&
                        list.map(x=> e("div", "", x)) ||
                        []
        return JSHAC([
            this.wrapper, [
                this.input,
                this.selections, [
                    this.nodelist
                ]
            ]
        ])

    }
}


export function setLongClickSelection(node, callback, time = 1000){
    const extendableDiv  = e("div", "")
    node.append(extendableDiv)
    
    //weird hacks but so it doesn't "click" when long click with the stopImmediaPropagation
    const ifNotLongClick = node.onclick.bind({})
    node.onclick = null
    let timeout
    let hasFired = true
    const mouseDown = (ev)=>{
        hasFired = false
        timeout = setTimeout(()=>{
            hasFired = true
            callback()
        }, time)
        extendableDiv.className = "extend"
        extendableDiv.animate([
            { width: "0%"},
            { width: "100%"},
        ], {
            duration: time,
            iterations: 1,
        })
    }
    const mouseUp = (ev)=>{
        if (!hasFired) ifNotLongClick.apply() //transform the long click into a short click
        ev.stopImmediatePropagation(); 
        clearTimeout(timeout)
        extendableDiv.className = ""
    }
    node.addEventListener("mousedown", mouseDown)
    node.addEventListener("touchstart", mouseDown)
    node.addEventListener("mouseup", mouseUp)
    node.addEventListener("touchend", mouseUp)
}
