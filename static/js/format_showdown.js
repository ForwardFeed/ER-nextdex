import { e, JSHAC } from "./utils.js"
import { createInformationWindow, removeInformationWindow } from "./window.js"
import { setFullTeam, teamData } from "./panels/team_builder.js"
import { gameData } from "./data_version.js"
import { itemList } from "./hydrate.js"
import { settings } from "./settings.js"



const statsN = [
    "HP", "Atk", "Def", "SpA", "SpD", "Spe"
]


export function parseShowdownFormat(text){
    const lines = text.split('\n')
    const party = []
    function defaultPokemon(){
        return {
            spc: -1,
            moves: [],
            notes: "",
            ivs: [31,31,31,31,31,31],
            evs: [0,0,0,0,0,0],
        }
    }
    let poke = defaultPokemon()
    let parsePtr = 0
    const next = () => {
        parsePtr += 1
    }
    let sameLineNextStepFlag = false
    const sameLineNextStep = () => {
        sameLineNextStepFlag = true
        next()
    }
    let invalid = false
    const parseSteps = [
        (line)=>{
            if (!line.match(/^#/)){
                return sameLineNextStep()
            }
            poke.name = line.replace(/^# /, '')
            next()
        },
        (line)=>{
            const spcItem = line.split(' @ ')
            poke.spc = spcNameList.indexOf(spcItem[0])
            if (poke.spc == -1) invalid = true //
            if (spcItem[1] != undefined) poke.item = itemList.indexOf(spcItem[1])
            next()
        },
        (line)=>{
            if (line.match(/^Level:/)) return
            poke.nature = gameData.natureT.indexOf(line.match(/^\w+/)[0])
            next()
        },
        (line)=>{
            const abiName = line.replace(/^Ability: /, '')
            poke.abi = gameData.species[poke.spc].stats.abis.indexOf(abiNameList.indexOf(abiName))
            next()
        },
        (line)=>{
            if (!line.match(/^EVS: /)) {
                return sameLineNextStep()
            }
            const evsText = line.replace(/^EVS: /, '').split(' / ')
            for (const ev of evsText){
                const t = ev.split(' ')
                poke.evs[statsN.indexOf(t[1])] = t[0]
            }
            next()
        },
        (line)=>{
            if (!line.match(/^IVS: /)) {
                return sameLineNextStep()
            }
            const ivsText = line.replace(/^IVS: /, '').split(' / ')
            for (const iv of ivsText){
                const t = iv.split(' ')
                poke.ivs[statsN.indexOf(t[1])] = t[0]
            }
            next()
        },
        (line)=>{
            if (!line.match(/^- /)) {
                return sameLineNextStep()
            }
            const moveName = line.replace(/- /, '')
            poke.moves.push(moveNameList.indexOf(moveName))
        },
        (line)=>{
            if (!line.match(/\/\//)) return next()
            poke.notes += line.replace(/^\/\//, '') + "\n"
        }
    ]
    for (const line of lines){
        if (!line) {
            if (poke.spc != -1) party.push(poke)
            invalid = false
            poke = defaultPokemon()
            parsePtr = 0
            continue
        }
        if (invalid) {
            console.warn('invalid', line)
            continue
        }
        try{
            parseSteps[parsePtr](line)
            while(sameLineNextStepFlag){
                sameLineNextStepFlag = false
                parseSteps[parsePtr](line)
            }
        } catch(e){
            console.warn(e, line)
        }
    }
    if (poke.spc != -1) party.push(poke)
    return party
}

function getAbi(spc, abiD){
    return abiNameList[gameData.species[spc].stats.abis[abiD]]
}

export function exportDataShowdownFormat(party){
    let text = []
    for (const poke of party){
        if (!poke.spc) continue
        const item = itemList[poke.item]
        poke.evs.splice(6)
        text.push(`${poke.name?`# ${poke.name}\n`:""}\
${spcNameList[poke.spc]}${item?` @ ${item}`:""}
Level: 1
${gameData.natureT[poke.nature]} Nature
Ability: ${getAbi(poke.spc, poke.abi)}
${`EVS: ${poke.evs.map((x, i) => x?`${x} ${statsN[i]}`:"").filter(x => x).join(' / ')}`.replace(/EVS: $/, '')}
${`IVS: ${poke.ivs.map((x, i) => !+x?`${x} ${statsN[i]}`:"").filter(x => x).join(' / ')}`.replace(/IVS: $/, '')}
${poke.moves.map(x => moveNameList[x]).filter(x => x != "-").map(x => `- ${x}`).join('\n')}
${poke.notes ? `${poke.notes.split('\n').map(x =>`//${x}\n`).join('')}` : ''}
`.replace(/\n[\n]+/g, '\n'))
    }
    return text.join('\n')
}

function showFormatWindow(ev){
    const block = e('div', 'showdown-block')
    const left = e('div', 'showdown-left')
    const leftTop = e('div', 'showdown-top')
    const leftBot = e('textarea#showdown-text', 'showdown-bot', null,{
        onkeyup: ()=>{
            bottomConfirm.style.display = "flex"
        }
    })
    const right = e('div', 'showdown-right')
    const rightTop = e('div', 'showdown-top')
    let text = exportDataShowdownFormat(teamData)
    if (settings.discordFormat){
        text = `\`\`\`\n${text}\`\`\``
    }
    const rightBot = e('pre', 'showdown-bot', text)
    const bottomConfirm = e('div', 'showdown-confirm btn-btn-hover', null, {
        onclick: (ev_cb)=>{
            setFullTeam(parseShowdownFormat($('#showdown-text').val()))
            bottomConfirm.style.display = "none"
            removeInformationWindow(ev_cb, true)
        }
    })
    bottomConfirm.style.display = "none"
    right.onclick = function(){
        navigator.clipboard.writeText(text)
        rightTop.children[0].textContent = 'Export (copied !)'
        setTimeout(function(){
            rightTop.children[0].textContent = 'Export (click to copy)'
        }, 1500)
    }

    createInformationWindow(JSHAC([
        block, [
            left,[
                leftTop, [e('span',null, 'Import')],
                leftBot,
                bottomConfirm, [e('span', null, 'Confirm import')]
            ],
            right,[
                rightTop, [e('span',null, 'Export (click to copy)')],
                rightBot
            ],
            
        ]
    ]), ev, "fullcenter", true, true)
}

let spcNameList = [], abiNameList = [], moveNameList = []

export function initFormatShowdown(){
    gameData.species.forEach(x => spcNameList.push(x.name))
    gameData.abilities.forEach(x => abiNameList.push(x.name))
    gameData.moves.forEach(x => moveNameList.push(x.name))
}

export function setupFormatShowdown(){
    $('#builder-import').on('click', showFormatWindow)
}