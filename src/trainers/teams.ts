import { regexGrabNum, regexGrabStr } from "../parse_utils"

export interface Result{
    fileIterator: number,
    trainers: Map<string, TrainerPokemon[]>
}

export interface TrainerPokemon{
    specie: string,
    ability: number,
    ivs: number[],
    evs: number[],
    item: string,
    nature: string,
    moves: string[]
}

function initTrainerPokemon(): TrainerPokemon{
    return {
        specie: "",
        ability: -1,
        ivs: [31,31,31,31,31,31],
        evs: [],
        item: "",
        nature: "",
        moves: []
    }
}


interface Context{
    key: string,
    currentPokemon: TrainerPokemon,
    currentTrainer: TrainerPokemon[]
    trainers: Map<string, TrainerPokemon[]>,
    execFlag: string,
    reread: boolean, //means reread with a different pattern matching solution
    stopRead: boolean,
}

function initContext(): Context{
    return {
        key: "",
        currentPokemon: initTrainerPokemon(),
        currentTrainer: [],
        trainers: new Map(),
        execFlag: "main",
        reread: false,
        stopRead: false
    }
}
const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "main": (line, context) =>{
        if (!line) return
        if (line.match('TrainerMonItemCustomMoves')){
            context.key = regexGrabStr(line, /sParty_\w+/)// previous version added => .split(/(?<=[^^])(?=[A-Z])/).join(' ')
        } else if (line.match('{')){
            context.execFlag = "pokemon"
        } else if (line.match(';')){
            if (context.key){
                context.trainers.set(context.key, context.currentTrainer)
            }
            context.key = ""
            context.currentTrainer = []
        }
    },
    "pokemon": (line, context) =>{
        if (!line) return
        if (line.match('.species')){
            context.currentPokemon.specie = regexGrabStr(line.replace(/\s/g, ''), /(?<==)\w+/)
        } else if (line.match('.heldItem')){
            context.currentPokemon.item = regexGrabStr(line.replace(/\s/g, ''), /(?<==)\w+/)
        } else if (line.match('.ability')){
            context.currentPokemon.ability = regexGrabNum(line.replace(/\s/g, ''), /(?<==)\d+/, 0)
        } else if (line.match('.zeroSpeedIvs')){
            context.currentPokemon.ivs[5] = 0
        } else if (line.match('.ivs')){
            context.currentPokemon.ivs = regexGrabStr(line.replace(/\s/g, ''), /(?<=\{)[^}]+/)
                .split(',')
                .filter((x)=>{
                    return !isNaN(+x)}
                )
                .map((x)=>+x)
        } else if (line.match('.evs')){
            context.currentPokemon.evs = regexGrabStr(line.replace(/\s/g, ''), /(?<=\{)[^}]+/)
                .split(',')
                .filter((x)=>{
                    return !isNaN(+x)}
                )
                .map((x)=>+x)
        } else if (line.match('.nature')){
            context.currentPokemon.nature = regexGrabStr(line.replace(/\s/g, ''), /(?<==)\w+/)
        } else if (line.match('.moves')){
            context.currentPokemon.moves = regexGrabStr(line.replace(/\s/g, ''), /(?<==)[\w,]+/).split(',')
        } else if (line.match('}')){
            if (context.currentPokemon.moves.length != 0 &&
            context.currentPokemon.nature !== ""){
                context.currentTrainer.push(context.currentPokemon)
                context.currentPokemon = initTrainerPokemon()
            }
            context.execFlag = "main"
        }
    }
}

export function parse(lines: string[], fileIterator: number): Result{
    const context = initContext()
    lines.splice(0, fileIterator + 1)
    const blocks = lines.join('\n').split(';')
    const blocksLen = blocks.length
    for (let i = 0; i < blocksLen; i++){
        let block = blocks[i] + ";"
        let firstP = block.match(/^[^\{]+(?={)/)?.[0]
        if (!firstP) continue
        block = block.replace(firstP + "{", firstP)
        const subLines = block.split('\n')
        for (const line of subLines){
            executionMap[context.execFlag](line, context)
            if (context.stopRead) break
            if (context.reread) {
                context.reread = false
                executionMap[context.execFlag](line, context)
            }
        }
        
    }
    return {
        fileIterator: fileIterator,
        trainers: context.trainers
    }
}
