import { regexGrabStr } from "../parse_utils"



// src/data/trainers.h
export interface Result{
    fileIterator: number,
    trainers: Map<string, BaseTrainer>,
}

export interface BaseTrainer {
    NAME: string,
    name: string,
    tclass: string,
    double: boolean,
    partyPtr: string,
    insanePtr: string,
    gender: boolean, // true w*man
    music: string,
    pic: string,
}

function initBaseTrainer(): BaseTrainer{
    return {
        NAME: "",
        name: "",
        tclass: "",
        double: false,
        partyPtr: "",
        insanePtr: "",
        gender: false, // false m*le
        music: "",
        pic: "",
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
        execFlag: "await",
        stopRead: false
    }
}
const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "await": (line, context) => {
        if (line.match('const struct Trainer gTrainers')) context.execFlag = "main"
    },
    "main" : (line, context) =>{
        if (line.match(/\[TRAINER_/)){
            if (context.key){
                context.trainers.set(context.key, context.current)
            }
            context.current = initBaseTrainer()
            context.key = regexGrabStr(line, /TRAINER_\w+/)
            context.current.NAME = context.key
        } else if (line.match('trainerClass')){
            context.current.tclass = regexGrabStr(line, /TRAINER_CLASS_\w+/)
        }else if (line.match('doubleBattle')){
            context.current.double = regexGrabStr(line.replace(/\s/g, ''), /(?<==)\w+/) === "TRUE" ? true : false
        } else if (line.match('partySizeInsane')){ //order is important with regex conflict with partysize
            context.current.insanePtr = regexGrabStr(line, /sParty_\w+/)
        } else if (line.match('partySize')){
            context.current.partyPtr = regexGrabStr(line, /sParty_\w+/)
        } else if (line.match('trainerName')){
            context.current.name = regexGrabStr(line, /(?<=")[^"]+/)
        } else if (line.match('trainerPic')){
            context.current.pic = regexGrabStr(line, /TRAINER_PIC_\w+/)
        } else if (line.match('encounterMusic_gender')){
            if (regexGrabStr(line, 'F_TRAINER_FEMALE', "")) context.current.gender = true
            context.current.music = regexGrabStr(line, /TRAINER_\w+(_MUSIC_)\w+/)
        } else if (line.match('};')){
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