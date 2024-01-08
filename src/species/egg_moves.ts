import { regexGrabNum, regexGrabStr, upperCaseFirst } from "../parse_utils"

export interface Result{
    fileIterator: number,
    eggMoves: Map<string, string[]>,
}

interface Context {
    current: string[],
    currKey: string,
    eggMoves: Map<string, string[]>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        current: [],
        currKey: "",
        eggMoves: new Map(),
        execFlag: "awaitForStart",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitForStart": (line, context) => {
        if (line.match('gEggMoves')){
            context.execFlag = "main"
        }
    },
    "main": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (!line) return
        if (line.match('egg_moves')){
            if (context.currKey){
                context.eggMoves.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = "SPECIES_" + regexGrabStr(line, /(?<=\()\w+/)
        } if (line.match(/MOVE/)){
            context.current.push(regexGrabStr(line, /MOVE\w+/))
        } else if (line.match('};')){
            context.eggMoves.set(context.currKey, context.current)
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
        eggMoves: context.eggMoves
    }
}
