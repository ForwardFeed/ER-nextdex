import { gameData } from "../data_version.js";
import { e, JSHAC } from "../utils.js"
import { createPokemon } from "./trainers_panel.js";
import { getSpritesURL, getSpritesShinyURL } from "./species_panel.js";

class Pokemon{
    constructor(){
        this.node = null
        this.spc = null
        this.spcName = ""
        this.sprite = null
        this.abi = null
        this.abiName = ""
        this.moves = [
            null,
            null,
            null,
            null
        ]
        this.item = null
        this.nature = null
        this.ivs = Array(6)
        this.evs = Array(6)
    }
    init(pokeID){
        const baseSpc = gameData.species[pokeID]
        const first4Moves = [...Array(4).keys()].map(x => baseSpc.levelUpMoves[x].id || 0)
        this.spc= pokeID,
        this.spcName = baseSpc.name
        this.sprite = getSpritesURL(baseSpc.NAME)
        this.abi= 0,
        this.abiName = gameData.abilities[this.abi].name
        this.moves= first4Moves,
        this.item= 0,
        this.nature= 0,
        this.ivs= [31,31,31,31,31,31],
        this.evs= [0,0,0,0,0,0]
    }
}

class PokeNodeView{
    constructor(node){
        this.node = node
        this.spc = node.find('.trainers-pokemon-specie')
        this.sprite = node.find('.trainer-pokemon-sprite')
        this.abi = node.find('.trainers-pokemon-ability')
        this.sprite = node.find('.trainer-pokemon-sprite')
        this.moves = node.find('.trainers-poke-move')
        this.item = node.find('.trainers-poke-item')
        this.nature = node.find('.trainers-poke-nature')
        this.ivs = node.find('.trainers-poke-ivs')
        this.evs = node.find('.trainers-poke-evs')
        return this
    }
}

function createProxyPokemon(pokeData, pokeNodeEditor, pokeNodeBuilder){
    return {
        specie(specie){
            if (!specie) return pokeData.spc
            pokeData.spc = specie,
            pokeNodeBuilder.spc.text(specie)
        }   
    }
}
const teamView = []

const teamData = [...Array(6).keys()].map((_) => {
    return new Pokemon()
})

const currentTeam = {
    activeMon: null,
    setActive: function(id){
        this.activeMon = id
    }
}

export function setupTeamBuilder(){
    let selected = 0
    const buttonArrayMap = [
        ["#builder-editor-btn", "#builder-editor"],
        ["#builder-team-btn", "#builder-team"]
    ]
    buttonArrayMap.forEach((selection, index, selectionArray)=>{
        const btn = $(selection[0])
        const dataTop = $(selection[1])
        btn.on('click', ()=>{
            console.log('click')
            $(selectionArray[selected][0]).removeClass("btn-active").addClass("btn-n-active")
            btn.removeClass("btn-n-active").addClass("btn-active")
            $(selectionArray[selected][1]).hide()
            dataTop.show()
            selected = index
        })
    })

    $('#builder-data').find('.builder-mon').each(function(index, value){
        addPlaceholder($(this), index)
        $(this)[0].ondragover = function(ev){
            ev.preventDefault();
        }
        $(this)[0].ondrop = (ev)=>{
            ev.preventDefault()
            const pokeID = ev.dataTransfer.getData("id");
            teamData[index].init(pokeID)
            setupPokeView($(this), index)
            setupTeamBuilder
            
        }
        teamView.push(new PokeNodeView($(this)))  
    })
}

function setupPokeView(jNode, viewID){
    const deleteBtn = e("div", "builder-mon-delete", "Delete")
    deleteBtn.onclick = ()=>{
        deletePokemon(jNode, viewID)
    }
    jNode.empty().append(createPokemon(teamData[viewID])).append(deleteBtn)

    jNode[0].onmouseover = ()=>{
        $(deleteBtn).show()
    }
    jNode[0].onmouseleave = ()=>{
        $(deleteBtn).hide()
    }
    let startX = 0
    let isSwiping = false
    const screenSwapLength = document.body.offsetWidth / 2
    jNode[0].ontouchstart = (ev)=>{
        isSwiping = true;
        startX = ev.touches[0].clientX;
    }
    jNode[0].ontouchend = (ev)=>{
        if (isSwiping) {
            const endX = ev.changedTouches[0].clientX;
            const deltaX = endX - startX;
            if (deltaX > screenSwapLength) deletePokemon(jNode, viewID)
            isSwiping = false;
        }
    }
    jNode[0].onclick = ()=>{
        feedPokemonEdition(viewID)
    }
}

function deletePokemon(jNode, viewID){
    jNode.empty()
    $('#builder-editor').empty()
    addPlaceholder(jNode, viewID)
    teamData[viewID] = new Pokemon()
}

function addPlaceholder(jNode, viewID){
    const isTouchPad = navigator.maxTouchPoints
    let placeholder
    if (isTouchPad){
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

function feedPokemonEdition(viewID){
    const poke = teamData[viewID]
    const view = teamView[viewID]

    const core = e()
    const leftDiv = e("div", "builder-editor-left")
    const specieDiv = e("div", "builder-editor-specie", poke.spcName)
    const spriteDiv = e("img", "builder-editor-sprite")
    spriteDiv.src = poke.sprite
    const abilityDiv = e("div", "builder-editor-ability", poke.abiName)

    const midDiv = e("div", "builder-editor-mid")
    const moveDivs = poke.moves.map((x)=>{
        return e("div", "builder-editor-move", gameData.moves[x].name)
    })
    console.log(moveDivs)
    const rightDiv = e("div", "builder-editor-right")

    $('#builder-editor').empty().append(JSHAC([
        core, [
            leftDiv, [
                specieDiv,
                spriteDiv,
                abilityDiv
            ],

            rightDiv,
        ]
    ]))
}
