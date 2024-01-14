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
	node.appendChild(tooltip);
}
