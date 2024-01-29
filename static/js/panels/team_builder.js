import { gameData } from "../data_version.js";
import { e, JSHAC } from "../utils.js"
import { createPokemon } from "./trainers_panel.js";

export function setupTeamBuilder(){
    $('#builder-data').find('.builder-mon').each(function(){
        addPlaceholder($(this))
        $(this)[0].ondragover = function(ev){
            ev.preventDefault();
        }
        $(this)[0].ondrop = (ev)=>{
            ev.preventDefault()
            const id = ev.dataTransfer.getData("id");
            const baseSpc = gameData.species[id]
            const first4Moves = [...Array(4).keys()].map(x => baseSpc.levelUpMoves[x].id || undefined)
            $(this).empty().append(createPokemon({
                spc: id,
                abi: 0,
                moves: first4Moves,
                item: 0,
                nature: 0,
                ivs: [31,31,31,31,31,31],
                evs: [0,0,0,0,0,0]
            }))
        }
    })
}

function addPlaceholder(jNode){
    const placeholder = e('div', "builder-placeholder", "drop a mon from the list")
    jNode.append(placeholder)
}

function feedBuilderMon(jNode, pokeID){

}

function feedPokemonEdition(){

}