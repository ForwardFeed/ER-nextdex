import { regexGrabNum, regexGrabStr } from "../parse_utils"



// src/data/trainers.h
export interface Result{
    fileIterator: number,
    trainers: Map<string, BaseTrainer>,
}


export interface BaseTrainer {
    category: string,
    double: boolean,
    partyPtr: string,
    insanePtr: string,
    rematches: BaseTrainer[], // to be filled much later
}

function initBaseTrainer(): BaseTrainer{
    return {
        category: "",
        double: false,
        partyPtr: "",
        insanePtr: "",
        rematches: [],
    }
}
 
interface Context{
    current: BaseTrainer,
    key: string,
    trainers: Map<string, BaseTrainer>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        current: initBaseTrainer(),
        key: "",
        trainers: new Map(),
        execFlag: "main",
        stopRead: false
    }
}
const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "main" : (line, context) =>{
        if (line.match(/\[TRAINER_/)){
            if (context.key){
                context.trainers.set(context.key, context.current)
                context.current = initBaseTrainer()
            }
            context.key = regexGrabStr(line, /TRAINER_\w+/)
        } else if (line.match('trainerClass')){
            context.current.category = regexGrabStr(line, /TRAINER_CLASS_\w+/)
        }else if (line.match('doubleBattle')){
            context.current.double = regexGrabStr(line.replace(/\s/g, ''), /(?<==)\w+/) === "TRUE" ? true : false
        } else if (line.match('partySizeInsane')){ //order is important with partysize
            context.current.insanePtr = regexGrabStr(line, /sParty_\w+/)
        } else if (line.match('partySize')){
            context.current.partyPtr = regexGrabStr(line, /sParty_\w+/)
        }  else if (line.match('};')){
            if (context.key){
                context.trainers.set(context.key, context.current)
            }
            context.stopRead = true
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
    }
    return {
        fileIterator: fileIterator,
        trainers: context.trainers
    }
}