import { gameData } from "../data_version.js";
import { e, JSHAC } from "../utils.js";
import { createPokemon } from "./trainers_panel.js";
import { getSpritesURL, getSpritesShinyURL } from "./species_panel.js";
import { createInformationWindow } from "../window.js";
import { quadriRadial } from "../radial.js";

class Pokemon {
    constructor() {
        this.node = null
        this.baseSpc = null
        this.spc = null // specie id
        this.spcName = ""
        this.isShiny = false
        this.abi = null
        this.abiName = ""
        this.inns = Array(3)
        this.moves = [
            null,
            null,
            null,
            null
        ]
        this.item = -1
        this.nature = null
        this.ivs = Array(6)
        this.evs = Array(6)
    }
    getSpritesURL() {
        if (this.isShiny) {
            return getSpritesShinyURL(this.baseSpc.NAME)
        } else {
            return getSpritesURL(this.baseSpc.NAME)
        }

    }
    init(pokeID) {
        this.baseSpc = gameData.species[pokeID]
        const first4Moves = [...Array(4).keys()].map(x => this.baseSpc.levelUpMoves[x].id || 0)
        this.spc = pokeID
        this.spcName = this.baseSpc.name
        this.isShiny = false
        this.abi = 0
        this.ability = this.baseSpc.stats.abis[0]
        this.abiName = gameData.abilities[this.ability].name
        this.inns = this.baseSpc.stats.inns
        this.innsNames = this.inns.map(x => gameData.abilities[x].name)
        this.moves = first4Moves,
        this.item = -1
        this.nature = 0
        this.ivs = [31, 31, 31, 31, 31, 31]
        this.evs = [0, 0, 0, 0, 0, 0]
    }
}

class PokeNodeView {
    constructor(node) {
        this.node = node
        return this
    }
    init() {
        this.spc = this.node.find('.trainers-poke-specie')
        this.sprite = this.node.find('.trainer-poke-sprite')
        this.abi = this.node.find('.trainers-poke-ability')
        this.moves = this.node.find('.trainers-poke-move')
        this.item = this.node.find('.trainers-poke-item')
        this.nature = this.node.find('.trainers-poke-nature')
        this.ivs = this.node.find('.trainers-poke-ivs')
        this.evs = this.node.find('.trainers-poke-evs')
    }
}

const teamView = []

const teamData = [...Array(6).keys()].map((_) => {
    return new Pokemon()
})

const currentTeam = {
    activeMon: null,
    setActive: function (id) {
        this.activeMon = id
    }
}

export function setupTeamBuilder() {
    let selected = 0
    const buttonArrayMap = [
        ["#builder-editor-btn", "#builder-editor"],
        ["#builder-team-btn", "#builder-team"]
    ]
    buttonArrayMap.forEach((selection, index, selectionArray) => {
        const btn = $(selection[0])
        const dataTop = $(selection[1])
        btn.on('click', () => {
            $(selectionArray[selected][0]).removeClass("btn-active").addClass("btn-n-active")
            btn.removeClass("btn-n-active").addClass("btn-active")
            $(selectionArray[selected][1]).hide()
            dataTop.show()
            selected = index
        })
    })

    $('#builder-data').find('.builder-mon').each(function (index, value) {
        addPlaceholder($(this), index)
        $(this)[0].ondragover = function (ev) {
            ev.preventDefault();
        }
        $(this)[0].ondrop = (ev) => {
            ev.preventDefault()
            const pokeID = ev.dataTransfer.getData("id");
            teamData[index].init(pokeID)
            setupPokeView($(this), index)
            setupTeamBuilder

        }
        teamView.push(new PokeNodeView($(this)))
    })
}

function setupPokeView(jNode, viewID) {
    const deleteBtn = e("div", "builder-mon-delete", "Delete")
    deleteBtn.onclick = (ev) => {
        ev.stopPropagation()
        deletePokemon(jNode, viewID)
    }
    jNode.empty().append(createPokemon(teamData[viewID])).append(deleteBtn)

    jNode[0].onmouseover = () => {
        $(deleteBtn).show()
    }
    jNode[0].onmouseleave = () => {
        $(deleteBtn).hide()
    }
    let startX = 0
    let isSwiping = false
    const screenSwapLength = document.body.offsetWidth / 2
    jNode[0].ontouchstart = (ev) => {
        isSwiping = true;
        startX = ev.touches[0].clientX;
    }
    jNode[0].ontouchend = (ev) => {
        if (isSwiping) {
            const endX = ev.changedTouches[0].clientX;
            const deltaX = endX - startX;
            if (deltaX > screenSwapLength) deletePokemon(jNode, viewID)
            isSwiping = false;
        }
    }
    jNode[0].onclick = () => {
        feedPokemonEdition(viewID)
    }
    teamView[viewID].init()
}

function deletePokemon(jNode, viewID) {
    jNode.empty()
    $('#builder-editor').empty()
    addPlaceholder(jNode, viewID)
    teamData[viewID] = new Pokemon()
}

function addPlaceholder(jNode, viewID) {
    const isTouchPad = navigator.maxTouchPoints
    let placeholder
    if (isTouchPad) {
        placeholder = e('div', "builder-placeholder", "tap to add the selected pokemon from the list")
    } else {
        placeholder = e('div', "builder-placeholder", "drop a mon from the list or click to add the selected pokemon from the list")
    }
    placeholder.onclick = () => {
        const pokeID = $('#species-list .sel-active')[0].dataset.id
        teamData[viewID].init(pokeID)
        setupPokeView(jNode, viewID)
    }
    jNode.append(placeholder)
}

function feedPokemonEdition(viewID) {
    const poke = teamData[viewID]
    const view = teamView[viewID]

    const leftDiv = e("div", "builder-editor-left")
    //const specieDiv = e("div", "builder-editor-specie", poke.spcName)
    const spriteDiv = e("img", "builder-editor-sprite pixelated")
    spriteDiv.src = poke.getSpritesURL()

    const leftMidDiv = e('div', "builder-editor-abilities")
    const abilityDiv = e("div", "builder-editor-ability", poke.abiName)
    const innateDivs = poke.innsNames.map(x => e("div", "builder-editor-ability", x))
    const midDiv = e("div", "builder-editor-mid")
    const moveDivs = poke.moves.map((x) => {
        return e("div", "builder-editor-move", gameData.moves[x].name)
    })

    const rightDiv = e("div", "builder-editor-right")
    const itemDiv = e("div", "builder-editor-right", gameData.itemT[poke.item])
    const natureDiv = e("div", "builder-editor-nature", gameData.natureT[poke.nature])
    const EVsRow = e("div", "builder-editor-statsrow")
    const EVs = poke.evs.map((x) => {
        return e("div", "", x)
    })
    const IVsRow = e("div", "builder-editor-statsrow")
    const IVs = poke.ivs.map((x) => {
        return e("div", "", x)
    })

    spriteDiv.onclick = () => {
        poke.isShiny = !poke.isShiny
        spriteDiv.src = view.sprite[0].src = poke.getSpritesURL()
    }
    leftMidDiv.onclick = (ev) => {
        ev.stopPropagation() //if you forget this the window will instantly close
        const overlayNode = overlayEditorAbilities(viewID, (abiID) => {
            poke.abi = abiID
            poke.abiName = gameData.abilities[abiID].name
            view.abi.text(poke.abiName)
            abilityDiv.innerText = poke.abiName
        })
        createInformationWindow(overlayNode, { x: ev.clientX, y: ev.clientY })
    }
    const itemCallback = (itemID) => {
        poke.item = itemID
        view.item.text(itemDiv.innerText = gameData.itemT[itemID])
    }
    rightDiv.onclick = (ev) => {
        ev.stopPropagation()
        const overlayNode = quadriRadial([
            ["Items", () => {
                createInformationWindow(overlayItem(itemCallback), { x: ev.clientX, y: ev.clientY }, "focus")
            }],
            ["Nature", () => { console.log("yippee1") }],
            ["IVs", () => { console.log("yippee3") }],
            ["EVs", () => { console.log("yippee2") }],
        ], "6em", "2vmax")
        createInformationWindow(overlayNode, { x: ev.clientX, y: ev.clientY }, "mid")
    }
    $('#builder-editor').empty().append(JSHAC([
        leftDiv, [
            //specieDiv,
            spriteDiv,
            leftMidDiv, [
                abilityDiv
                //innateDiv vv
            ].concat(innateDivs),
        ],
        midDiv, [
            //moves vv
        ].concat(moveDivs),
        rightDiv, [
            itemDiv,
            natureDiv,
            EVsRow,
            EVs,
            IVsRow,
            IVs
        ]
    ]))
}

function overlayEditorAbilities(viewID, callbackOnclick) {
    const core = e('div', 'builder-overlay-abilities')
    const abilities = [...new Set(teamData[viewID].baseSpc.stats.abis)] //remove duplicates
        .map((x) => {
            const abilityNode = e('div', 'builder-overlay-ability', gameData.abilities[x].name)
            abilityNode.onclick = (ev) => {
                ev.stopPropagation() // not to trigger the window to close
                callbackOnclick(x)
            }
            return abilityNode
        })
    return JSHAC([
        core,
        abilities
    ])
}

function overlayItem(itemCallback) {
    const input = e("input", "builder-overlay-items")
    input.setAttribute('list', "item-datalist")
    const dataList = e("datalist")
    dataList.id = "item-datalist"
    const options = gameData.itemT.map((x)=>{
        const option =  e("option",)
        option.value = x
        return option
    })
    input.onclick = function(ev){
        ev.stopPropagation()
    }
    input.onkeyup = ()=>{
        const itemID = gameData.itemT.indexOf(input.value)
        if (itemID != -1){
            itemCallback(itemID)
        }
        
    }
    
    return JSHAC([
        input,
        dataList,
            options
    ])
}