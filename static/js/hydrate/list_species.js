import { compareData, gameData } from "../data_version.js";
import { longClickToFilter } from "../filters.js";
import { StatsEnum, currentSpecieID, feedPanelSpecies, getColorOfStat, getSpritesShinyURL, getSpritesURL, matchedSpecies } from "../panels/species/species_panel.js";
import { JSHAC, e } from "../utils.js";
import { nodeLists } from "./hydrate.js";


export function toggleLayoutList(toggle = true) {
    if (toggle) {
        // I tried not using hide() but apparently it has not affect on the lag issue
        // No clue on how to fix this besides reworking a completely new loading system where it's generated on scroll
        $('#panel-list-species').css('display', 'flex')
        $('#panel-block-species').css('display', 'none')
    } else {
        $('#species-return-list-layout').hide()
        $('#panel-list-species').css('display', 'none')
        $('#panel-block-species').css('display', 'flex')
    }
}


export function hydrateSpeciesList() {
    const species = gameData.species
    const speciesLen = species.length
    const fragment = document.createDocumentFragment();
    for (let specieID = 0; specieID < speciesLen; specieID++) {
        if (specieID == 0) continue // skip specie none
        const specie = species[specieID]
        const nameRow = e('div', 'list-species-name')
        let imageIsShiny = false
        nameRow.onclick = () => {
            imageIsShiny = !imageIsShiny
            image.src = imageIsShiny ? getSpritesShinyURL(specie.NAME) : getSpritesURL(specie.NAME)

        }
        /*row.setAttribute('draggable', true);
        row.ondragstart = (ev) => {
            ev.dataTransfer.setData("id", i)
        }*/
        //Node id because for correlation with nodelist in sorting
        /*specie.nodeID = nodeLists.species.length
        nodeLists.species.push(row)*/

        const image = e('img', 'species-list-sprite list-species-sprite')
        image.src = getSpritesURL(specie.NAME)
        image.alt = specie.name
        image.loading = "lazy"
        nameRow.appendChild(image)

        const name = e('span', "species-name span-a", specie.name)
        nameRow.append(name)
        const nodeSpecieRow = JSHAC([
            e('div', 'list-species-row'), [
                nameRow,
                e('div', 'list-species-abis-block', [...new Set(specie.stats.abis)].filter(x => x).map(x => {
                    const abiName = gameData.abilities[x].name
                    const abiNode = e('div', 'list-species-abi', [e('span', null, abiName)])
                    longClickToFilter(0, abiNode, "ability", () => { return abiName })
                    return abiNode
                })),
                e('div', 'list-species-inns-block', [...new Set(specie.stats.inns)].filter(x => x).map(x => {
                    const innName = gameData.abilities[x].name
                    const innNode = e('div', 'list-species-inn', [e('span', null, innName)])
                    longClickToFilter(0, innNode, "ability", () => { return innName })
                    return innNode
                })),
                e('div', 'list-species-types-block', [...new Set(specie.stats.types)].map(x => {
                    const type = gameData.typeT[x]
                    const typeNode = e('div', `list-species-type type ${type.toLowerCase()}`, [e('span', null, type)])
                    longClickToFilter(0, typeNode, "type", () => { return type })
                    return typeNode
                })),
                e('div', 'list-species-basestats-block', StatsEnum.concat(["BST"]).map((x, i) => {
                    const statValue = specie.stats.base[i]
                    const color = getColorOfStat(statValue, i)
                    const statNode = e('span', null, statValue)
                    $(statNode).css('background-color', color)
                    const comp = compareData?.species?.[specieID].stats?.base[i]
                    if (comp) {
                        return JSHAC([
                            e('div', 'list-species-basestats-col', [
                                e('div', 'list-species-basestats-head', x),
                                e('div', 'list-species-basestats-val', [
                                    e('span', 'crossed', comp),
                                    e('br', null, '→'),
                                    statNode,
                                ])
                            ])
                        ])
                    } else {
                        return JSHAC([
                            e('div', 'list-species-basestats-col', [
                                e('div', 'list-species-basestats-head', x),
                                e('div', 'list-species-basestats-val', [
                                    statNode,
                                ])
                            ])
                        ])
                    }

                })),
                e('div', 'list-species-btn-view', [e('span', null, 'View')], {
                    onclick: (ev) => {
                        feedPanelSpecies(specieID)
                        toggleLayoutList(false)
                        $('#species-return-list-layout').show()
                    }
                })
            ]
        ])
        nodeLists.listLayoutSpecies.push(nodeSpecieRow.firstChild)
        if (specieID > LIST_RENDER_RANGE) $(nodeSpecieRow.firstChild).hide()
        fragment.append(nodeSpecieRow)
    }
    
    setupReordering()
    $('#panel-list-species').append(fragment)
}


let reorderedListLayout
function setupReordering(){
    function byAlpha(a, b) { //alphabet reorder
        return a.name.localeCompare(b.name)
    }
    const nameArrowData = createReorderArrow(byAlpha)
    const topNode = JSHAC([
        e('div', 'list-species-row list-species-reorder'),[
            e('div', 'list-species-name', null, {
                onclick: ()=>{
                    nameArrowData.dirNext()
                }
            }), [
                e('div', 'list-species-reorder-block'), [
                    e('div', 'list-species-reorder-inner'), [
                        e('span', null, 'Name'),
                    ],
                    nameArrowData.node
                ]
            ],
            e('div', 'list-species-abis-block', 'abilities'),
            e('div', 'list-species-inns-block', 'innates'),
            e('div', 'list-species-basestats-block', 'basestats'),
        ]
    ])
    $('#panel-list-species').empty().append(topNode)
}

function reorderListLayoutNodes(reordered){
    hideCurrentRendered()
    reorderedListLayout = reordered
    const len = reordered.length
    for (var i=0; i < len; i++){
        const node = reordered[i]
        if (node.nodeID === undefined) continue
        $('#panel-list-species').append(nodeLists.listLayoutSpecies[node.nodeID])
    }
    listRenderingUpdate()
}

function createReorderArrow(sortFn){
    const arrowNode = e('div', 'reorder-arrow', '→')
    const node = JSHAC([
        e('div', 'reorder-arrow-block'), [
            arrowNode
        ]
    ])
    return {
        node: node,
        dir: 0,
        dirDefault: function(reorder = true){
            arrowNode.innerText = "→"
            if (reorder) reorderListLayoutNodes(gameData.species)
        },
        dirDown: function(reorder = true){
            arrowNode.innerText = "↓"
            if (reorder) reorderListLayoutNodes(structuredClone(gameData.species).sort(sortFn))
        },
        dirUp: function(reorder = true){
            arrowNode.innerText = "↑"
            if (reorder) reorderListLayoutNodes(structuredClone(gameData.species).sort(sortFn).reverse())
        },
        dirNext: function(){
            this.dir = (this.dir + 1) % 3
            const directionsFuncs = [this.dirDefault, this.dirDown, this.dirUp]
            fastdom.mutate(()=>{
                directionsFuncs[this.dir]()
            })
        },
        reset: function(){
            if (this.dir){
                this.dirDefault(false)
            }
        }
    }
}

export const LIST_RENDER_RANGE = 20

let lastNbScrolled = 0
let unloadOffset = 0
function calculateRenderingRange(){
    const panelDiv = document.getElementById("panel-list-species")
    // turns out that the reorder bar is always there and in the right size
    const oneRowHeightPx = panelDiv.children[0].clientHeight
    const nbRowScrolledFloat = panelDiv.scrollTop / oneRowHeightPx
    let maxRow
    if (matchedSpecies){
        if (typeof matchedSpecies === "object"){
            maxRow = matchedSpecies.length
        } else {
            maxRow = 1
        }
    } else {
        maxRow = gameData.species.length - 2
    }
    const nbRowScrolledRaw = Math.min(maxRow, Math.round(nbRowScrolledFloat) + unloadOffset)
    // Minus one because it takes in account the top reordering bar
    const nbRowScrolled = Math.max(0, nbRowScrolledRaw - 1)
    return{
        nbRowScrolled: nbRowScrolled,
        curr: {
            min: Math.max(0, nbRowScrolled - LIST_RENDER_RANGE),
            max: Math.min(maxRow, nbRowScrolled + LIST_RENDER_RANGE)
        },
        prev: {
            min: Math.max(0, lastNbScrolled - LIST_RENDER_RANGE),
            max: Math.min(maxRow, lastNbScrolled + LIST_RENDER_RANGE)
        }
    }
}

function listRenderingUpdate() {
    const renderRanges = calculateRenderingRange()
    // first hide those out of range
    if (renderRanges.nbRowScrolled > lastNbScrolled){//scrolled down
        for (let i = renderRanges.prev.min; i < renderRanges.curr.min; i++){
            renderNextRow(i, false)
        }
        unloadOffset += renderRanges.curr.min - renderRanges.prev.min
    } else { //scrolled up
        for (let i = renderRanges.prev.max; i > renderRanges.curr.max; i--){
            renderNextRow(i, false)
        }
        unloadOffset = Math.max(0, unloadOffset - (renderRanges.prev.max - renderRanges.curr.max))
    }
    // then show those in range
    for (let i = renderRanges.curr.min; i < renderRanges.curr.max; i++){
        renderNextRow(i, true)
    }
    lastNbScrolled = renderRanges.nbRowScrolled
}

function getRowRelativeToMatched(rowI){
    if (matchedSpecies && typeof matchedSpecies === "object"){
        // because of species none, there's a need for -1 it
        rowI = matchedSpecies[rowI] - 1
    } else if (matchedSpecies){
        rowI = matchedSpecies - 1
    }
    if (reorderedListLayout){
        return reorderedListLayout[rowI].nodeID
    }
    return rowI
}
// this is because the search just hides the row, so you have to hide over it
function renderNextRow(rowI, show=true){
    rowI = getRowRelativeToMatched(rowI)
    if (show){
        // we've reached the end of things to render
        if (rowI === undefined) return
    }
    if (!nodeLists.listLayoutSpecies[rowI]) return
    nodeLists.listLayoutSpecies[rowI].style.display = show ? "flex" : "none"
}

function hideCurrentRendered(){
    const renderRanges = calculateRenderingRange()
    for (let i = renderRanges.curr.min; i < renderRanges.curr.max; i++){
        renderNextRow(i, false)
    }
}

export function resetListRendering(){
    hideCurrentRendered()
    lastNbScrolled = 0
    unloadOffset = 0
}

export function setupListSpecies() {
    $('#panel-list-species').on('scrollend', () => {
        fastdom.mutate(() => {
            listRenderingUpdate()
        })
    })
}