import { regexGrabNum, regexGrabStr, Xtox } from "./parse_utils"

interface Description {
    ptrDesc: string,
    desc: string,
}

function initDescription(): Description{
    return {
        ptrDesc: "",
        desc: "",
    }
}

export interface Move {
    name: string,
    shortName: string,
    effect: string,
    power: number,
    types: string[],
    acc: number,
    pp: number,
    chance: number,
    target: string,
    priority: number,
    flags: string[],
    split: string,
    argument: string,
    desc: string,
    longDesc: string,
}

function initMove(): Move{
    return {
        name: "",
        shortName: "",
        effect: "",
        power: 0,
        types: [],
        acc: 100,
        pp: 0,
        chance: 0,
        target: "",
        priority: 0,
        flags: [],
        split: "",
        argument: "",
        desc: "",
        longDesc: "",
    }
}

interface Context{
    stopRead: boolean,
    execFlag: string,
    stage: {[key: string]: (line: string, context: Context) => void},
    moves: Map<string, Move>,
    currMove: Move,
    Descs: Map<string, Description>,
    currDesc: Description,
    LongDesc: Map<string, Description>,
    currLongDesc: Description,
}

function initContext(): Context{
    return {
        stopRead: false,
        execFlag: "",
        stage: stageBattleMovesExecutionMap,
        moves: new Map(),
        currMove: initMove(),
        Descs: new Map(),
        currDesc: initDescription(),
        LongDesc: new Map(),
        currLongDesc: initDescription(),
    }
}

const stageBattleMovesExecutionMap: {[key: string]: (line: string, context: Context) => void} = {
    "": (line, context) => {
        if (line.match('gBattleMoves')) context.execFlag = "moves"
    },
    "moves": (line, context) => {
        line = line.replace(/\s/g, '')
        if (line.match(/\[MOVE/)){
            if (context.currMove.name) {
                if (!context.currMove.types.length) context.currMove.types = ["Normal"] // default value
                context.moves.set(context.currMove.name, context.currMove)
                context.currMove = initMove()
            }
            context.currMove.name = regexGrabStr(line, /MOVE_\w+/)
        } else if (line.match('.effect')){
            context.currMove.effect = Xtox('EFFECT_',regexGrabStr(line, /EFFECT_\w+/))
        } else if (line.match('.power')){
            context.currMove.power = regexGrabNum(line, /(?<==)\d+/)
        } else if (line.match('.type')){
            context.currMove.types.push(Xtox('TYPE_', regexGrabStr(line, /TYPE_\w+/)))
        } else if (line.match('.acc')){
            context.currMove.acc = regexGrabNum(line, /(?<==)\d+/, 100)
        } else if (line.match('.pp')){
            context.currMove.pp = regexGrabNum(line, /(?<==)\d+/, 0)
        } else if (line.match('.secondary')){
            context.currMove.chance = regexGrabNum(line, /(?<==)\d+/, 0)
        } else if (line.match('.target')){
            context.currMove.target = regexGrabStr(line, /(?<==)\w+/).replace(/^MOVE_TARGET_/, '')
        } else if (line.match('.priority')){
            context.currMove.priority = regexGrabNum(line, /(?<==)\d+/, 0)
        } else if (line.match('.flags')){
            context.currMove.flags = regexGrabStr(line, /(?<==)[^,]+/)
                .split("|")
                .map((x)=>Xtox('FLAG_',x))
                .filter(x => x !== "0")
        } else if (line.match('.split')){
            context.currMove.split = regexGrabStr(line, /(?<==)\w+/).replace(/^SPLIT_/, '')
        } else if (line.match('.argument')){
            context.currMove.argument = regexGrabStr(line, /(?<==)\w+/)
        } else if (line.match(/};/)) {
            context.stage = stageDescriptionExecutionMap
            context.execFlag = "desc"
            return
        }
    }
}

const stageDescriptionExecutionMap: {[key: string]: (line: string, context: Context) => void} = {
    "desc": (line, context) => {
        if (line.match('u8 s')){
            if (context.currDesc.ptrDesc !== ""){
                context.Descs.set(context.currDesc.ptrDesc, context.currDesc)
                context.currDesc = initDescription()
            }
            context.currDesc.ptrDesc = regexGrabStr(line, /s\w+(?=\[)/)
        } else if (line.match('^"')) {
            context.currDesc.desc += regexGrabStr(line, /(?<=")[^"]+/).replace('\\n', ' ')   
        } else if (line.match(/gMoveDescriptionPointers/)) {
            context.execFlag = "descToMove"
            return
        }
    },
    "descToMove": (line, context) => {
        line = line.replace(/\s/g, '')
        if (line.match(/^\[/)){
            const moveName = regexGrabStr(line, /(?<=\[)\w+/)
            const descPtr = regexGrabStr(line, /(?<==)\w+/)
            if (!context.moves.has(moveName)) return
            const move = context.moves.get(moveName)
            if (!context.Descs.has(descPtr)) return
            move.desc = context.Descs.get(descPtr).desc
            context.moves.set(moveName, move)
        } else if (line.match(/};/)) {
            context.execFlag = "descFourLine"
        }
    },
    "descFourLine": (line, context) => {
        if (line.match('u8 s')){
            if (context.currLongDesc.ptrDesc !== ""){
                context.LongDesc.set(context.currLongDesc.ptrDesc, context.currLongDesc)
                context.currLongDesc = initDescription()
            }
            context.currLongDesc.ptrDesc = regexGrabStr(line, /\w+(?=\[)/)
            context.currLongDesc.desc = regexGrabStr(line, /(?<=")[^"]+/).replace(/\\n/g, ' ')
        } else if (line.match('gMoveFourLineDescriptionPointers')){
            context.execFlag = "descFourLineToMove"
        }
        
    },
    "descFourLineToMove": (line, context) => {
        line = line.replace(/\s/g, '')
        if (line.match(/^\[/)){
            const moveName = regexGrabStr(line, /(?<=\[)\w+/)
            const descPtr = regexGrabStr(line, /(?<==)\w+/)
            if (!context.moves.has(moveName)) return
            const move = context.moves.get(moveName)
            if (!context.LongDesc.has(descPtr)) return
            move.longDesc = context.LongDesc.get(descPtr).desc
            context.moves.set(moveName, move)
        } else if (line.match(/};/)) {
            context.stage = stageNameExecutionMap
            context.execFlag = ""
            return
        }
    }
}

const stageNameExecutionMap: {[key: string]: (line: string, context: Context) => void} = {
    "": (line, context) => {
        if (line.match(/gMoveNames/)) context.execFlag = "movesName"
    },
    "movesName": (line, context) => {
        line = line.replace(/\s/g, '')
        if (line.match(/^\[/)){
            const moveName = regexGrabStr(line, /(?<=\[)\w+/)
            const IGName = regexGrabStr(line, /(?<=")[^"]+/)
            if (!context.moves.has(moveName)) return
            const move = context.moves.get(moveName)
            move.shortName = IGName
            context.moves.set(moveName, move)
        } else if (line.match(/};/)) {
            context.execFlag = "awaitNamesLong"
            return
        }

    },
    "awaitNamesLong": (line, context) => {
        if (line.match('gMoveNamesLong')) {
            context.execFlag = "movesNameLong"
            return
        }
    },
    "movesNameLong": (line, context) => {
        if (line.match(/^\[/)){
            const moveName = regexGrabStr(line, /(?<=\[)\w+/)
            const IGName = regexGrabStr(line, /(?<=")[^"]+/)
            if (!context.moves.has(moveName)) return
            const move = context.moves.get(moveName)
            move.name = IGName
            context.moves.set(moveName, move)
        } else if (line.match(/};/)) {
            context.stopRead = true
            return
        }
    }
}

export function parse(filedata: string){
    const lines = filedata.split('\n')

    const context = initContext()

    for (let line of lines){
        line = line.trim()
        if (line == "") continue
        context.stage[context.execFlag](line, context)
        if (context.stopRead) break
    }
    return Array.from(context.moves.entries()) 
}