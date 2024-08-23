document.addEventListener("DOMContentLoaded", function(){
    //downloadComparify()
    downloadLatest()
});
let comparify, gamedata, gamedataold
function downloadComparify(){
    fetch(`js/data/comparifyLastestBeta2.0.json`)
        .then((response) => response.json())
        .then((data) => {
            window.comparify = comparify = data
            downloadLatest()
    })
}

function downloadLatest(){
    const beta21   = `js/data/gameDataVBeta2.1.json`
    const latest   = `js/data/gameDataVLastest.json` 
    const stable21 = `js/data/gameDataV2.1.json` 

    fetch(stable21)
        .then((response) => response.json())
        .then((data) => {
            window.gamedata = gamedata = data
            downloadOld()
        }) 
}

function downloadOld(){
    fetch(`js/data/gameDataV1.6.1.json`)
        .then((response) => response.json())
        .then((data) => {
            window.gamedataold = gamedataold = data
            buildCommonTableSpecies()
            makeChangelog()
            displayChangelog()
        })
}

const changelog = {}
function makeChangelog(){
    buildCommonTableMoves()
    /*gamedata.moves.map((x, i)=>{
        if (!x) return
        compareMove(gamedata.moves[i], x, gamedataold.moves[i] || {})
    })*/
    gamedata.species.map((x, i)=>{
        if (!x) return
        compareSpecie(gamedata.species[i], gamedataold.species[newToOldS[i]] || {}, i)
    })
}

function addToChangelog(text, name){
    if (!changelog[name]) changelog[name] = []
    changelog[name].push(text)
}

const statsOrder = [
    "HP",
    "Atk",
    "Def",
    "SpA",
    "SpD",
    "Spe",
]

function shareMovesWithEvolution(specie, gamestructure){
    for (const evo of specie.evolutions){
        if (evo.in == -1)
            continue
        const next = gamestructure.species[evo.in]
        next.eggMoves = specie.eggMoves
        next.tutor = specie.tutor
        shareMovesWithEvolution(next, gamestructure)
    }
}
let newSpecies = []
let oldToNewS = []
let newToOldS = []
function buildCommonTableSpecies(){
    let len = gamedata.species.length
    for (let i = 0; i < len; i++){
        const specie = gamedata.species[i]
        const old = gamedataold.species[i]
        if (!old){
            newSpecies.push(i)
            continue
        }
        if (specie.NAME == old.NAME){
            newToOldS[i] = i
            oldToNewS[i] = i
        } else {
            const oldID = gamedataold.species.findIndex(x => x.NAME == specie.NAME)
            if (oldID == -1){
                newSpecies.push(i)
                continue
            }
            newToOldS[i] = oldID
            oldToNewS[oldID] = i

        }     
    }
}
let newMoves = []
let oldToNewM = []
let newToOldM = []
function buildCommonTableMoves(){
    let len = gamedata.moves.length
    for (let i = 0; i<len; i++){
        if (gamedataold.moves.length <= i){
            newMoves.push(i)
            continue
        }
        if (gamedata.moves[i].NAME == gamedataold.moves[i].NAME){
            newToOldM[i] = i
        } else {
            const NAME = gamedata.moves[i].NAME
            newToOldM[i] = gamedataold.moves.findIndex(x => x.NAME == NAME)
        }
    }
    len = gamedataold.moves.length
    for (let i = 0; i<len; i++){
        if (gamedataold.moves[i].NAME == gamedata.moves[i].NAME){
            oldToNewM[i] = i
        } else {
            const NAME = gamedataold.moves[i].NAME
            oldToNewM[i] = gamedata.moves.findIndex(x => x.NAME == NAME)
        }
    }

}

function compareSpecie(specie, old, specieID){
    if (newSpecies.includes(specieID)){
        addToChangelog(`Specie ${specie.name} is completely new`, specie.name)
        return
    }
    if (!old.stats){
        return
    }
    specie.stats.abis.forEach((x, i)=>{
        const oldId = old.stats.abis[i]
        if (!oldId){
            addToChangelog(`+Ability: ${gamedata.abilities[x].name}`, specie.name)
        } else if (oldId != x){
            addToChangelog(`Ability: ${gamedata.abilities[oldId].name} -> \
${gamedata.abilities[x].name}`, specie.name)
        }
    })
    if (specie.stats.abis.length < old.stats.abis.length){
        console.warn("an ability has been removed", specie.stats.abis, old.stats.abis)
    }
    specie.stats.inns.forEach((x, i)=>{
        const oldId = old.stats.inns[i]
        if (!oldId){
            addToChangelog(`+Innate: ${gamedata.abilities[x].name}`, specie.name)
        } else if (oldId != x){
            addToChangelog(`Innate: ${gamedata.abilities[oldId].name} -> \
${gamedata.abilities[x].name}`, specie.name)
        }
    })
    if (specie.stats.inns.length < old.stats.inns.length){
        console.warn("an innate has been removed", specie.stats.abis, old.stats.abis)
    }
    specie.stats.base.forEach((x, i)=>{
        const oldStat = old.stats.base[i]
        if (x != oldStat){
            addToChangelog(`${statsOrder[i]}: ${oldStat} -> ${x}`, specie.name)
        }
    })
    specie.stats.types.forEach((x, i)=>{
        const oldType = old.stats.types[i]
        if (oldType == -1){
            addToChangelog(`+Type: ${gamedata.typeT[x]}`, specie.name)
        }
        else if (gamedata.typeT[x] != gamedataold.typeT[oldType]){
            addToChangelog(`Type: ${gamedataold.typeT[oldType]} -> ${gamedata.typeT[x]}`, specie.name)
        }
    })
    if (!old || !old.levelUpMoves || !old.eggMoves)
        return
    shareMovesWithEvolution(specie, gamedata)
    shareMovesWithEvolution(old, gamedataold)
    specie.allMoves = [...new Set(specie.eggMoves.concat(
        specie.levelUpMoves.map(x => x.id).concat(
            specie.TMHMMoves.concat(
                specie.tutor
            )
        )
    )), 0]
    old.allMoves = [...new Set(old.eggMoves.concat(
        old.levelUpMoves.map(x => x.id).concat(
            old.TMHMMoves.concat(
                old.tutor
            )
        )
    )), 0]
    specie.allMoves.forEach((x, i)=>{
        if (!x)
            return
        if (newMoves.includes[x] || !old.allMoves.includes(newToOldM[x])){
            addToChangelog(`+${gamedata.moves[x].name}`, specie.name)
        }
    })
    old.allMoves.forEach((x, i)=>{
        if (!x)
            return
        if (!specie.allMoves.includes(oldToNewM[x])){
            addToChangelog(`-${gamedataold.moves[x].name}`, specie.name)
        }
    })
}

function compareMove(move, comp, old){
    if (comp.prio != false){
        addToChangelog(`prio ${old.prio} -> ${move.prio}`, move.name)
    }
    if (comp.pwr != false){
        addToChangelog(`power ${old.pwr} -> ${move.pwr}`, move.name)
    }
    if (comp.chance != false){
        addToChangelog(`chance ${old.chance} -> ${move.chance}`, move.name)
    }
    if (comp.pp != false){
        addToChangelog(`pp ${old.pp} -> ${move.pp}`, move.name)
    }
    if (comp.acc != false){
        addToChangelog(`acc ${old.acc} -> ${move.acc}`, move.name)
    }
    if (comp.split != false){
        addToChangelog(`split ${gamedata.splitT[old.split]} -> ${gamedata.splitT[move.split]}`, move.name)
    }
    if (comp.target != false){
        addToChangelog(`target ${gamedata.targetT[old.target]} -> ${gamedata.targetT[move.target]}`, move.name)
    }
    comp.flags = comp.flags.filter(x => x != false)
    if (comp.flags.length){
        comp.flags.forEach(x => {
            if (x == true){
                //addToChangelog(`Move ${move.name}had one flag removed`, move.name)
            } else {
                addToChangelog(`Move ${move.name}had one flag changed -> ${gamedata.flagsT[x]}`, move.name)
            }
            
        });
    }
    comp.types = comp.types.filter(x => x != false)
    if (comp.types.length){
        comp.types.forEach(x => {
            addToChangelog(`Move ${move.name}had one type changed -> ${gamedata.typeT[x]}`, move.name)
        });
    }
}

function displayChangelog(){
    let display = ""
    const keys = Object.keys(changelog)
    for (const key of keys){
        const changes = changelog[key]
        if (display) display += `\n\n`
        display += `${key}\n` + changes.join("\n")
    }
    console.log(display)
}
