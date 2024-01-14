import { regexGrabNum, regexGrabStr, TYPE_toType } from "../parse_utils"

export interface Trainer{
    name: string,
    double: boolean,
    team: TrainerPokemon[]
}

function initTrainer(): Trainer{
    return {
        name: "",
        double: false,
        team: []
    }
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
    currentTrainer: Trainer,
    currentPokemon: TrainerPokemon,
    trainers: Trainer[],
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        currentTrainer: initTrainer(),
        currentPokemon: initTrainerPokemon(),
        trainers: [],
        execFlag: "main",
        stopRead: false
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "main": (line, context) =>{
        if (!line) return
        if (line.match('TrainerMonItemCustomMoves')){
            context.currentTrainer.name = regexGrabStr(line, /(?<=sParty_)\w+/).split(/(?<=[^^])(?=[A-Z])/).join(' ') 
            return
        } else  if (line.match('{')){
            context.execFlag = "pokemon"
        } else if (line.match('};')){
            context.trainers.push(context.currentTrainer)
            context.currentTrainer = initTrainer()
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
            context.currentTrainer.team.push(context.currentPokemon)
            context.currentPokemon = initTrainerPokemon()
            context.execFlag = "main"
        }
    }
}

export function parse(fileData: string):Trainer[] {
    const lines = fileData.split('\n')
    const context = initContext()
    for (const line of lines){
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
    }
    return context.trainers
}