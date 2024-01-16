import { getSpritesURL } from "./species_panel.js"
import { query } from "./search.js"

export function feedPanelTrainers(trainerID){
    $('#trainers-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#trainers-list').children().eq().addClass("sel-active").removeClass("sel-n-active")

    const trainer = gameData.trainers[trainerID]
    $('#trainers-name').text(trainer.name)

    const party = trainer.party
    const frag = document.createDocumentFragment()
    for (const poke of party){
        const specie = gameData.species[poke.spc]
        const ability = gameData.abilities[specie.stats.abis[poke.abi]]
        const moves = poke.moves.map((x)=>{
            return gameData.moves[x]
        })
        const item = gameData.itemT[poke.item]
        const nature = gameData.natureT[poke.nature]

        const core = document.createElement('div')
        core.className="trainers-pokemon"

        const leftPanel = document.createElement('div')
        leftPanel.className = "trainers-pokemon-left"

        const pokeName = document.createElement('div')
        pokeName.className = "trainers-pokemon-specie"
        pokeName.innerText = specie.name

        const pokeImg = document.createElement('img')
        pokeImg.className = "trainer-pokemon-sprite"
        pokeImg.src = getSpritesURL(specie.NAME)

        const pokeAbility = document.createElement('div')
        pokeAbility.className = "trainers-poke-ability"
        pokeAbility.innerText = ability.name

        leftPanel.append(pokeName)
        leftPanel.append(pokeImg)
        leftPanel.append(pokeAbility)
        core.append(leftPanel)

        const midPanel = document.createElement('div')
        midPanel.className = "trainers-pokemon-mid"

        const pokeMoves = document.createElement('div')
        pokeMoves.className = "trainers-poke-moves"
        for (const move of moves){
            const moveNode = document.createElement('div')
            moveNode.className = "trainers-poke-move"
            moveNode.innerText = move.name
            pokeMoves.append(moveNode)
        }

        midPanel.append(pokeMoves)
        core.append(midPanel)

        const rightPanel = document.createElement('div')
        rightPanel.className = "trainers-pokemon-right"

        const pokeItem = document.createElement('div')
        pokeItem.className = "trainers-poke-item"
        pokeItem.innerText = item

        const pokeNature = document.createElement('div')
        pokeNature.className = "trainers-poke-nature"
        pokeNature.innerText = nature
        

        const pokeIVs = document.createElement('div')
        pokeIVs.className = "trainers-poke-ivs"
        pokeIVs.innerText = 'IVs: ' + poke.ivs.join(' ')
        

        const pokeEVs = document.createElement('div')
        pokeEVs.className = "trainers-poke-evs"
        pokeEVs.innerText = 'EVs: ' + poke.evs.join(' ')
        
        rightPanel.append(pokeItem)
        rightPanel.append(pokeNature)
        rightPanel.append(pokeIVs)
        rightPanel.append(pokeEVs)
        core.append(rightPanel)

        frag.append(core)
    }
    $('#trainers-team').empty().append(frag)
}

export function updateTrainers(searchQuery){
    const trainers = gameData.trainers
    const nodeList = $('#trainers-list').children()
    let validID;
    const queryMap = {
        "name": (queryData, trainer) => {
            return trainer.name.toLowerCase().indexOf(queryData) >= 0 ? true : false
        }
    }
    for (const i in trainers){
        if (i == 0) continue
        const trainer = trainers[i]
        const node = nodeList.eq(i - 1)
        if (query(searchQuery, trainer, queryMap))
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    if (validID) feedPanelTrainers(validID)
}