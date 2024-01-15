import { regexGrabNum, regexGrabStr, TYPE_toType } from "./parse_utils"

export interface Trainer{
    name: string,
    double: boolean,
    team: TrainerPokemon[],
    //insane: TrainerPokemon[]  insane Team
    //rematches Trainer[] rematches
}

function initTrainer(): Trainer{
    return {
        name: "",
        double: false,
        team: [],
        // insane: [],
        // rematches: [],
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
// need to inclide Trainer gTrainers
// and RematchTrainer gRematchTable from battle_setup.c
/**
 * TRAINER_GRUNT_MAGMA_HIDEOUT_14 <= first take this to make the name
 * ^<= also i need if there is an insane team associated
 * [TRAINER_ROSE_1, TRAINER_ROSE_2, TRAINER_ROSE_3, TRAINER_ROSE_4] <= then get rematch this way
 */
const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "AwaitForRematch" : (line, context) =>{
        if (line.match('RematchTrainer gRematchTable')){
            context.execFlag = "rematch"
        }
    },
    "rematch" : (line, context) =>{
        if (line.match('}')){
            context.execFlag = "main"
        }
    },
    "awaitForMain" : (line, context) =>{
        if (line.match('}')){
            context.execFlag = "main"
        }
    },
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