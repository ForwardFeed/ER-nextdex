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