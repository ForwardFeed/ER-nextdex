document.addEventListener("DOMContentLoaded", function(){
    downloadComparify()
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
    fetch(`js/data/gameDataVLastest.json`)
        .then((response) => response.json())
        .then((data) => {
            window.gamedata = gamedata = data
            downloadOld()
        })   
}

function downloadOld(){
    fetch(`js/data/gameDataVBeta2.0.json`)
        .then((response) => response.json())
        .then((data) => {
            window.gamedataold = gamedataold = data
            makeChangelog()
            displayChangelog()
        })
}

const changelog = {}
function makeChangelog(){
    comparify.moves.map((x, i)=>{
        if (!x) return
        compareMove(gamedata.moves[i], x, gamedataold.moves[i] || {})
    })
    comparify.species.map((x, i)=>{
        if (!x) return
        compareSpecie(gamedata.species[i], x, gamedataold.species[i] || {})
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

function compareSpecie(specie, comp, old){
    if (comp == true){
        addToChangelog(`Specie ${specie.name} is completely new`, specie.name)
        return
    }
    if (!old.stats){
        return
    }
    comp.abis = comp.stats.abis.filter(x => x != false)
    if (comp.abis.length){
        comp.abis.forEach((x, i)=>{
            const oldId = old.stats.abis[i]
            addToChangelog(`Specie ${specie.name} changed ability ${gamedataold.abilities[oldId].name} to\
 ${gamedata.abilities[x].name}`,
                 specie.name)
        })
    }
    comp.inns = comp.stats.inns.filter(x => x != false)
    if (comp.inns.length){
        comp.inns.forEach((x, i)=>{
            const oldId = old.stats.inns[i]
            addToChangelog(`Specie ${specie.name} changed innate ${gamedataold.abilities[oldId].name} to\
 ${gamedata.abilities[x].name}`,
                 specie.name)
        })
    }
    comp.base = comp.stats.base.filter(x => x != false)
    if (comp.base.length){
        comp.base.forEach((x, i)=>{
            const oldBase = old.stats.base[i]
            addToChangelog(`Specie ${specie.name} changed base stat ${statsOrder[i]} ${oldBase} to ${x}`,
                specie.name)
        })
    }
    comp.types = comp.stats.types.filter(x => x != false)
    if (comp.types.length){
        comp.types.forEach((x, i)=>{
            const oldType = gamedataold.typeT[old.stats.types[i]]
            const newType = gamedata.typeT[x]
            addToChangelog(`Specie ${specie.name} changed type ${oldType} to ${newType}`,
                specie.name)
        })
    }
}

function compareMove(move, comp, old){
    if (comp.prio != false){
        addToChangelog(`Move ${move.name} had it prio changed from ${old.prio} to ${move.prio}`, move.name)
    }
    if (comp.pwr != false){
        addToChangelog(`Move ${move.name} had it power changed from ${old.pwr} to ${move.pwr}`, move.name)
    }
    if (comp.chance != false){
        addToChangelog(`Move ${move.name} had it chance changed from ${old.chance} to ${move.chance}`, move.name)
    }
    if (comp.pp != false){
        addToChangelog(`Move ${move.name} had it pp changed from ${old.pp} to ${move.pp}`, move.name)
    }
    if (comp.acc != false){
        addToChangelog(`Move ${move.name} had it acc changed from ${old.acc} to ${move.acc}`, move.name)
    }
    if (comp.split != false){
        addToChangelog(`Move ${move.name} had it split changed from ${gamedata.splitT[old.split]} to ${gamedata.splitT[move.split]}`, move.name)
    }
    if (comp.target != false){
        addToChangelog(`Move ${move.name} had it target changed from ${gamedata.targetT[old.target]} to ${gamedata.targetT[move.target]}`, move.name)
    }
    comp.flags = comp.flags.filter(x => x != false)
    if (comp.flags.length){
        comp.flags.forEach(x => {
            if (x == true){
                //addToChangelog(`Move ${move.name}had one flag removed`, move.name)
            } else {
                addToChangelog(`Move ${move.name}had one flag changed to ${gamedata.flagsT[x]}`, move.name)
            }
            
        });
    }
    comp.types = comp.types.filter(x => x != false)
    if (comp.types.length){
        comp.types.forEach(x => {
            addToChangelog(`Move ${move.name}had one type changed to ${gamedata.typeT[x]}`, move.name)
        });
    }
}

function displayChangelog(){
    let display = ""
    const keys = Object.keys(changelog)
    for (const key of keys){
        const changes = changelog[key]
        if (display) display += "\n\n"
        display += changes.join("\n")
    }
    console.log(display)
}
