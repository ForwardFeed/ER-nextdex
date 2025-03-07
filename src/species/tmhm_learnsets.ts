import {regexGrabStr } from "../parse_utils"
import { VERSION_STRUCTURE } from "../main"

export interface Result{
    fileIterator: number,
    tmhmLearnsets: Map<string, string[]>,
}

interface Context {
    current: string[],
    currKey: string,
    tmhmLearnsets: Map<string, string[]>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        current: [],
        currKey: "",
        tmhmLearnsets: new Map(),
        execFlag: "awaitForData",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitForData": (line, context) => {
        if (VERSION_STRUCTURE == 2){
            context.stopRead = true
        }
        if (line.match('gTMHMLearnsets')){
            context.execFlag = VERSION_STRUCTURE > 0 ? "main1" : "main"
        }
    },
    "main": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (line.match(/\[SPECIES_/)){
            if (context.currKey){
                context.tmhmLearnsets.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = regexGrabStr(line, /(?<=^\[)\w+/)
        } 
        if (line.match('TMHM')){
            const tmhm = regexGrabStr(line, /\w+(?=\))/)
            if (tmhm === "0") return
            context.current.push(tmhm)
        } else if (line.match('};')){
            context.tmhmLearnsets.set(context.currKey, context.current)
            context.stopRead = true
        }
    },
    "main1": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (line.match(/\[SPECIES_/)){
            if (context.currKey){
                context.tmhmLearnsets.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = regexGrabStr(line, /(?<=^\[)\w+/)
        } 
        if (line.match('MOVE_')){
            const tmhm = regexGrabStr(line, /(?<=TM\()\w+/)
            context.current.push(tmhm)
        } else if (line.match('};')){
            context.tmhmLearnsets.set(context.currKey, context.current)
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
        tmhmLearnsets: context.tmhmLearnsets
    }
}
