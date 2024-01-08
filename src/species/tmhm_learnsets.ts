import { regexGrabNum, regexGrabStr, upperCaseFirst } from "../parse_utils"

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
        if (line.match('gTMHMLearnsets')){
            context.execFlag = "main"
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
            context.current.push(regexGrabStr(line, /\w+(?=\))/))
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
