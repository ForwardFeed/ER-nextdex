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
        ivs: [],
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
    "awaitForMain" : (line, context) =>{
        if (line.match('static const struct TrainerMonItemCustomMoves')){
            context.execFlag = "main"
            context.reread = true
        }
    },
    "main": (line, context) =>{
        if (!line) return
        if (line.match('TrainerMonItemCustomMoves')){
            context.key = regexGrabStr(line, /sParty_\w+/)// previous version added => .split(/(?<=[^^])(?=[A-Z])/).join(' ') 
            return
        } else  if (line.match('{')){
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
            context.currentPokemon.ability = regexGrabNum(line.replace(/\s/g, ''), /(?<==)\d+/)
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
            if (context.currentPokemon.ability != -1 &&
            context.currentPokemon.moves.length != 0 &&
            context.currentPokemon.nature !== ""){
                context.currentTrainer.push(context.currentPokemon)
                context.currentPokemon = initTrainerPokemon()
                context.execFlag = "main"
            }
            
        }
    }
}

export function parse(lines: string[], fileIterator: number): Result{
    const lineLen = lines.length
    const context = initContext()
    for (;fileIterator<lineLen; fileIterator++){
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
        if (context.reread) {
            context.reread = false
            executionMap[context.execFlag](line, context)
        }
    }
    return {
        fileIterator: fileIterator,
        trainers: context.trainers
    }
}
