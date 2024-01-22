import { getSpritesURL, redirectSpecie } from "./species_panel.js"
import { queryFilter } from "../search.js"
import { gameData } from "../data_version.js"
import { AisInB } from "../utils.js"

export function feedPanelTrainers(trainerID){
    $('#trainers-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#trainers-list').children().eq(trainerID - 1).addClass("sel-active").removeClass("sel-n-active")

    const trainer = gameData.trainers[trainerID]
    $('#trainers-name').text(trainer.name)

    setBaseTrainer(trainer)
    setRematchesBar(trainer.rem)
    setInsane(trainer)
    setPartyPanel(trainer.party)
}

function setDouble(double){
    if (double){
        $('#trainers-double').show()
    } else {
        $('#trainers-double').hide()
    }
}

function setBaseTrainer(trainer){
    const party = trainer.party
    if (!party || party.length < 1) {
        $('#trainers-normal').empty()
        return
    }
    const nodeNormal = document.createElement('div')
    nodeNormal.innerText = "Normal"
    nodeNormal.className = "trainer-match-btn sel-active"
    nodeNormal.onclick = ()=>{
        setPartyPanel(party)
        $('#trainers-infobar').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
        nodeNormal.className = "trainer-match-btn sel-active"
    }
    $('#trainers-normal').empty().append(nodeNormal)
    setDouble(trainer.db)
}

function setInsane(trainer){
    const insaneTeam = trainer.insane
    if (!insaneTeam || insaneTeam.length < 1) {
        $('#trainers-elite').empty()
        return
    }
    const nodeElite = document.createElement('div')
    nodeElite.innerText = "Elite"
    nodeElite.className = "trainer-match-btn sel-n-active"
    nodeElite.onclick = ()=>{
        setPartyPanel(insaneTeam)
        $('#trainers-infobar').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
        nodeElite.className = "trainer-match-btn sel-active"
    }
    $('#trainers-elite').empty().append(nodeElite)
    setDouble(trainer.db)
}

function setRematchesBar(rematches){
    if (rematches.length < 1){
        return $('#trainers-rematch').empty()
    }
    const frag = document.createDocumentFragment()
    const spanInfo = document.createElement('span')
    spanInfo.innerText = "Rematches :"
    frag.append(spanInfo)
    for (const remI in rematches){
        const rem = rematches[remI]
        const nodeRem = document.createElement('div')
        nodeRem.innerText = +remI + 1
        nodeRem.className = "trainer-match-btn sel-n-active"
        nodeRem.onclick = ()=>{
            setPartyPanel(rem.party)
            $('#trainers-infobar').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
            $('#trainers-rematch').children().eq(+remI + 1).addClass("sel-active").removeClass("sel-n-active")
            setDouble(rem.db)
        }
        frag.append(nodeRem)
    }
    $('#trainers-rematch').empty().append(frag)
}

function setPartyPanel(party){
    if (party.length < 1 ){
        return console.warn('party had team ' + party)
    }
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
        core.onclick = () => {
          redirectSpecie(poke.spc)
        }

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
            const type1 = gameData.typeT[move.types[0]].toLowerCase()
            const moveNode = document.createElement('div')
            moveNode.className = `trainers-poke-move ${type1}-t`
            moveNode.style.color = 
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
export const queryMapTrainers = {
    "name": (queryData, trainer) => {
        return AisInB(queryData, trainer.name.toLowerCase(), true)
    }
}
export function updateTrainers(searchQuery){
    const trainers = gameData.trainers
    const nodeList = $('#trainers-list').children()
    let validID;
    
    for (const i in trainers){
        if (i == 0) continue
        const trainer = trainers[i]
        const node = nodeList.eq(i - 1)
        if (queryFilter(searchQuery, trainer, queryMapTrainers))
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    if (validID) feedPanelTrainers(validID)
}