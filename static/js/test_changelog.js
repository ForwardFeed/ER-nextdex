document.addEventListener("DOMContentLoaded", function(){
    downloadComparify()
});
let comparify, gamedata
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
            window.gameData = gamedata = data
            makeChangelog()
            displayChangelog()
        })

        
}
const changelog = {}
function makeChangelog(){
    const xd = comparify.moves.map((x, i)=>{
        if (!x) return
        compareMoves(gamedata.moves[i], x)
    })
}

function addToChangelog(text, name){
    if (!changelog[name]) changelog[name] = []
    changelog[name].push(text)
}

function compareMoves(move, comp){
    if (comp.prio != false){
        addToChangelog(`Move ${move.name}had it prio changed to ${move.prio}`, move.name)
    }
    if (comp.pwr != false){
        addToChangelog(`Move ${move.name}had it power changed to ${move.pwr}`, move.name)
    }
    if (comp.chance != false){
        addToChangelog(`Move ${move.name}had it chance changed to ${move.chance}`, move.name)
    }
    if (comp.pp != false){
        addToChangelog(`Move ${move.name}had it pp changed to ${move.pp}`, move.name)
    }
    if (comp.acc != false){
        addToChangelog(`Move ${move.name}had it acc changed to ${move.acc}`, move.name)
    }
    if (comp.split != false){
        addToChangelog(`Move ${move.name}had it split changed to ${gameData.splitT[move.split]}`, move.name)
    }
    if (comp.target != false){
        addToChangelog(`Move ${move.name}had it target changed to ${gameData.targetT[move.target]}`, move.name)
    }
    comp.flags = comp.flags.filter(x => x != false)
    if (comp.flags.length){
        comp.flags.forEach(x => {
            if (x == true){
                //addToChangelog(`Move ${move.name}had one flag removed`, move.name)
            } else {
                addToChangelog(`Move ${move.name}had one flag changed to ${gameData.flagsT[x]}`, move.name)
            }
            
        });
    }
    comp.types = comp.types.filter(x => x != false)
    if (comp.types.length){
        comp.types.forEach(x => {
            addToChangelog(`Move ${move.name}had one type changed to ${gameData.typeT[x]}`, move.name)
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
