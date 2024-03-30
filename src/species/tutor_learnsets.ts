import { VERSION_STRUCTURE } from "../main"
import { regexGrabNum, regexGrabStr, upperCaseFirst } from "../parse_utils"

export interface Result{
    fileIterator: number,
    tutorMoves: Map<string, string[]>,
}

interface Context {
    tutorArray: string[],
    current: string[],
    currKey: string,
    tutorMoves: Map<string, string[]>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        tutorArray: [],
        current: [],
        currKey: "",
        tutorMoves: new Map(),
        execFlag: VERSION_STRUCTURE > 0 ? "awaitForData1" : "awaitForData",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitForData": (line, context) => {
        if (line.match('gTutorMoves')){
            context.execFlag = "setTutorArray"
        }
    },
    "setTutorArray": (line, context) => {
        line = line.replace(/\s/g, '')
        if (line.match('gNewTutorLearnsets')){
            context.execFlag = "newTutor"
        } else if (line.match('TUTOR_MOVE_')){ // the order is actually important
            const moveName = regexGrabStr(line, /(?<==)\w+/)
            context.tutorArray.push(moveName)
        }
    },
    "newTutor": (line, context) => {
        if (line.match('SPECIES_')){
            if (context.currKey){
                context.tutorMoves.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = regexGrabStr(line, /SPECIES_\w+/)
        } else if (line.match('MOVE_')){
            const moveName = regexGrabStr(line, /MOVE_\w+/)
            context.current.push(moveName)
        } else if (line.match('sTutorLearnsets')){
            if (context.currKey){
                context.tutorMoves.set(context.currKey, context.current)
            }
            context.execFlag = "tutorPtr"
        }
    },
    "tutorPtr": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (line.match(/\[SPECIES_/)){
            if (context.currKey){
                context.tutorMoves.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = regexGrabStr(line, /(?<=^\[)\w+/)
            if (context.tutorMoves.has(context.currKey)){
                context.current = context.tutorMoves.get(context.currKey)
            }
            context.current = context.current.concat(regexGrabStr(line, /(?<=\{)[^\}]+/).match(/0x[0-9A-Fa-f]+/g))
        } else if (line.match('};')){
            context.tutorMoves.set(context.currKey, context.current)
            context.stopRead = true
        }
    },
    "awaitForData1": (line, context) => {
        if (line.match('gTutorLearnsets')){
            context.execFlag = "newTutor1"
        }
    },
    "newTutor1": (line, context) => {
        if (line.match('SPECIES_')){
            if (context.currKey){
                context.tutorMoves.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = regexGrabStr(line, /SPECIES_\w+/)
        } else if (line.match('MOVE_')){
            const moveName = regexGrabStr(line, /MOVE_\w+/)
            context.current.push(moveName)
        } else if (line.match(';')){
            if (context.currKey){
                context.tutorMoves.set(context.currKey, context.current)
            }
            context.stopRead = true
        }
    },
}

export function parse(lines: string[], fileIterator: number): Result{
    const lineLen = lines.length
    const context = initContext()
    for (;fileIterator<lineLen; fileIterator++){
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
    }
    /* Now we have to unravel this odd pointer format (yippee)*/
    context.tutorMoves.forEach((moves, specie, map)=>{
        let tutorNum = 0 //5 in total, [0,1,2,3,4]
        const moveUnraveledArray: string[] = []
        for (const move of moves){
            if (isNaN(+move)) { 
                moveUnraveledArray.push(move)
                continue
            }
            const moveID = +move
            for (let i = 0; i < 32; i++){
                if (moveID & ( 1 << i)) {
                    moveUnraveledArray.push(context.tutorArray[i + (tutorNum * 32)])
                }
            }
            tutorNum++
        }
        map.set(specie, moveUnraveledArray)
    })
    return {
        fileIterator: fileIterator,
        tutorMoves: context.tutorMoves
    }
}
