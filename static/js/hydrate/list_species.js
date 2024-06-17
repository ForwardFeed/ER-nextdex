import { compareData, gameData } from "../data_version.js";
import { DynamicList, LIST_RENDER_RANGE} from "../dynamic_list.js";
import { longClickToFilter } from "../filters.js";
import { StatsEnum, feedPanelSpecies, getColorOfStat, getSpritesShinyURL, getSpritesURL, matchedSpecies } from "../panels/species/species_panel.js";
import { JSHAC, e } from "../utils.js";
import { nodeLists } from "./hydrate.js";
import { blockSpeciesDynList } from "./species.js";


export function toggleLayoutListSpecies(toggle = true) {
    if (toggle) {
        $('#panel-list-species').css('display', 'flex')
        $('#panel-block-species').css('display', 'none')
    } else {
        $('#species-return-list-layout').hide()
        $('#panel-list-species').css('display', 'none')
        $('#panel-block-species').css('display', 'flex')
    }
}


function generateSpeciesNode(){
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
                        toggleLayoutListSpecies(false)
                        $('#species-return-list-layout').show()
                    }
                })
            ]
        ])
        nodeLists.listLayoutSpecies.push(nodeSpecieRow.firstChild)
        if (specieID > LIST_RENDER_RANGE) $(nodeSpecieRow.firstChild).hide()
        fragment.append(nodeSpecieRow)
    }
    return fragment
}

export function hydrateSpeciesList() {
    speciesListDataUpdate()
    listSpeciesDynList.replaceList(generateSpeciesNode)
}


function setupReordering(){
    function byAlpha(a, b) { //alphabet reorder
        return a.name.localeCompare(b.name)
    }
    function byStats(statID, a, b) {
        return b.stats.base[statID] - a.stats.base[statID]
    }
    const nameArrowData = createReorderArrow(byAlpha)
    const statsArrowData = []
    const baseStatsNodes = StatsEnum.concat(["BST"]).map((x, statsID)=>{
        const arrowData = statsArrowData[statsID] = createReorderArrow(byStats.bind(null, statsID))
        return JSHAC([
            e('div', 'list-species-basestats-col', null, {
                onclick: ()=>{
                    arrowData.dirNext()
                }
            }), [
                e('div', 'list-species-basestats-head', x),
                arrowData.node
            ]
        ])
    })
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
            e('div', 'list-species-abis-block', [e('span', null, 'abilities')]),
            e('div', 'list-species-inns-block', [e('span', null, 'innates')]),
            e('div', 'list-species-types-block', [e('span', null, 'types')]),
            e('div', 'list-species-basestats-block', /*[e('span', null, 'basestats')]*/),
                baseStatsNodes
        ]
    ])
    $('#panel-list-species').append(topNode)
}

let reorderedDataListLayout = undefined
export function reorderListLayoutNodes(reordered){
    listSpeciesDynList.hideCurrentRendered()
    reorderedDataListLayout = []
    const len = reordered.length
    for (var i=0; i < len; i++){
        const node = reordered[i]
        if (node.nodeID === undefined) continue
        reorderedDataListLayout[i - 1] = node.nodeID
        $('#panel-list-species').append(nodeLists.listLayoutSpecies[node.nodeID])
    }
    speciesListDataUpdate()
}
const reorderArrowsdata = []
function resetAllArrows(callerID){
    const len =reorderArrowsdata.length
    for (let i = 0; i < len; i++){
        if (callerID == i) continue
        reorderArrowsdata[i].reset()
    }
}
function createReorderArrow(sortFn){
    const arrowNode = e('div', 'reorder-arrow', '→')
    const node = JSHAC([
        e('div', 'reorder-arrow-block'), [
            arrowNode
        ]
    ])
    const arrowID = reorderArrowsdata.length
    reorderArrowsdata.push({
        arrowID: arrowID,
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
            fastdom.mutate(()=>{
                resetAllArrows(this.arrowID)
                this.dir = (this.dir + 1) % 3
                const directionsFuncs = [this.dirDefault, this.dirDown, this.dirUp]
                directionsFuncs[this.dir]()
            })
        },
        reset: function(){
            if (this.dir){
                this.dir = 0
                this.dirDefault(false)
            }
        }
    })
    return reorderArrowsdata[arrowID]
}

export function speciesListDataUpdate(){
    const finalDataListLayout = []
    if (!reorderedDataListLayout){
        if (matchedSpecies && typeof matchedSpecies === "object"){
            const matchedSpeciesLen = matchedSpecies.length
            for(let i = 0; i < matchedSpeciesLen; i++){
                // because of species none, there's a need for -1 it
                finalDataListLayout[i] = matchedSpecies[i] - 1
            }
        } else if (matchedSpecies){
                finalDataListLayout[0] = matchedSpecies
        } else {
            const naturalOrderLen = nodeLists.listLayoutSpecies.length
            for(let i = 0; i < naturalOrderLen; i++) finalDataListLayout[i] = i
        }
        listSpeciesDynList.dataUpdate(finalDataListLayout).update()
        blockSpeciesDynList.dataUpdate(finalDataListLayout).update()
        return 
    }
    if (matchedSpecies && typeof matchedSpecies === "object"){
        const reorderLen = reorderedDataListLayout.length
        const matchedLen = matchedSpecies.length
        for(let i = 0; i < reorderLen; i++){
            if (finalDataListLayout.length == matchedLen) {
                listSpeciesDynList.dataUpdate(finalDataListLayout).update()
                blockSpeciesDynList.dataUpdate(finalDataListLayout).update()
                return
            }
            const reorderI = reorderedDataListLayout[i] + 1
            if (matchedSpecies.indexOf(reorderI) == - 1) continue
            finalDataListLayout.push(reorderI - 1)
        }
    } else if (matchedSpecies){
            finalDataListLayout[0] = matchedSpecies
    } else {
        const reordererOrderLen = nodeLists.listLayoutSpecies.length
        for(let i = 0; i < reordererOrderLen; i++) finalDataListLayout[i] = reorderedDataListLayout[i]
    }
    listSpeciesDynList.dataUpdate(finalDataListLayout).update()
    blockSpeciesDynList.dataUpdate(finalDataListLayout).update()
}

/** @type {DynamicList} */
export let listSpeciesDynList
export function setupListSpecies() {
    setupReordering()
    const node = $('#panel-list-species')[0]
    listSpeciesDynList = new DynamicList(node, node.children[0], "listLayoutSpecies")
    listSpeciesDynList.setup()

}