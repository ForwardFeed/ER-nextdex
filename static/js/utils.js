import { gameData } from "./data_version.js";
import { nodeLists } from "./hydrate.js";

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
 * 
 */
export function clickOutsideToHide(htmlNodeToHide, htmlNodeClickedOn){
    const clickToHide = (ev)=>{
        if (htmlNodeClickedOn == ev.target) return 
        htmlNodeToHide.style.display = "none"
        $(document).off('click', clickToHide)
    }
    // will work as long no future event.stop propagation is written in the code
    $(document).on('click', clickToHide)
}

export function clickOutsideToRemove(node, absorb = false, onCloseCb = ()=>{}){
    function hasParent(node, nodeToCompare){
        if (!node) return false
        if (node != nodeToCompare){
            return hasParent(node.parentNode, nodeToCompare)
        }
        return true
    }
    const clickToHide = (ev, forceClose=false)=>{
        if (hasParent(ev.target, node) && !forceClose) return
        if (absorb) ev.stopPropagation()
        onCloseCb()
        node.remove()
        document.body.removeEventListener('click', clickToHide, absorb)
    }
    // will work as long no future event.stop propagation is written in the code
    document.body.addEventListener('click', clickToHide, absorb)
    //return the callback to delete
    return clickToHide
}

/** JS Util to HTML */
/**
 * 
 * @param {string | undefined} tag 
 * @param {string | undefined} classname 
 * @param {string | undefined} innerText 
 * @param {Object | undefined} events 
 * @returns {HTMLDivElement}
 */
export function e(tag = "div", classname = "", innerText = "", events = {}){
    tag = tag.split("#")
    const id = tag[1]
    tag = tag[0]
    const htmlElement = document.createElement(tag)
    if (id) htmlElement.id = id
    if (classname) htmlElement.className = classname
    if (innerText && typeof innerText === "object"){
        // useful if you like to embed span for text
        for (const subElement of innerText){
            htmlElement.append(subElement)
        }
    } else { 
        if (tag === "input" || tag === "textarea"){
            htmlElement.value = innerText
        } else {
            htmlElement.innerText = innerText
        }
    }
    for (const event in events){
        htmlElement[event] = events[event]
    }
    return htmlElement
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
        if (!element) continue
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

export function setLongClickSelection(node, callback, time = 500, bgColor = "red"){
    const extendableDiv  = e("div", "extend")
    extendableDiv.style.backgroundColor = bgColor
    extendableDiv.style.display = "none"
    node.append(extendableDiv)
    node.style.position = "relative"
    //weird hacks but so it doesn't "click" when long click with the stopImmediaPropagation
    const sharedEvent = {ev: {}}
    const ifNotLongClick = node.onclick?.bind(sharedEvent)
    node.onclick = null
    let timeout
    let hasFired = true
    const mouseDown = (ev)=>{
        if (ev.button == 2) return
        extendableDiv.style.display = "block"
        hasFired = false
        timeout = setTimeout(()=>{
            hasFired = true
            callback()
        }, time)
        extendableDiv.animate([
            { width: "0%"},
            { width: "100%"},
        ], {
            duration: time,
            iterations: 1,
        })
    }
    const mouseUp = (ev)=>{
        if (ev.button == 2) return
        extendableDiv.style.display = "none"
        //transform the long click into a short click
        sharedEvent.ev = ev
        if (!hasFired && ifNotLongClick) ifNotLongClick.apply()
        ev.stopImmediatePropagation(); 
        clearTimeout(timeout)
    }
    node.addEventListener("mousedown", mouseDown)
    node.addEventListener("touchstart", mouseDown)
    node.addEventListener("mouseup", mouseUp)
    node.addEventListener("touchend", mouseUp)

    return extendableDiv
}


export function reorderNodeList(list, sortFn, direction = "<"){
    // fastdom to do it in a single frame or it will lag a lot on some browsers
    fastdom.mutate(()=>{ 
        let clonedForReorder
        if (sortFn){
            clonedForReorder = structuredClone(gameData.species).sort(sortFn)
        } else {
            clonedForReorder = structuredClone(gameData.species)
        }
        if (direction === ">") clonedForReorder = clonedForReorder.reverse()
        const len = clonedForReorder.length
        for (var i=0; i < len; i++){
            const mon = clonedForReorder[i]
            if (mon.nodeID === undefined) continue
            list.append(nodeLists.species[mon.nodeID])
        }
    })
}

/**
 * shamelessly lazy wrapper
 * @param {HTMLElement} node
 * @param {string} text 
 */
export function t(node, text){
    node.innerText = text
}