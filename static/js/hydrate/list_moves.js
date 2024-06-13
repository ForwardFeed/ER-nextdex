import { gameData } from "../data_version"


export function toggleLayoutListMoves(toggle = true){
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

export function hydrateListMoves(){
    const len = gameData.species.length
    for (let specieID = 1; specieID < len; specieID++){
        const specie = gameData.species[specieID]
        
    }
}