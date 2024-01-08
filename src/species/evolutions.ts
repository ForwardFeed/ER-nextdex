import { regexGrabNum, regexGrabStr, upperCaseFirst } from "../parse_utils"

export interface Result{
    fileIterator: number,
    evolutions: Map<string, Evolution[]>,
}

export interface Evolution {
    kind: string,
    specifier: string,
    into: string
}

function initEvolution(): Evolution{
    return {
        kind: "",
        specifier: "",
        into: "",
    }
}

interface Context {
    current: Evolution[],
    currKey: string,
    evolutions: Map<string, Evolution[]>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        current: [],
        currKey: "",
        evolutions: new Map(),
        execFlag: "awaitForStart",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitForStart": (line, context) => {
        if (line.match('gEvolutionTable')){
            context.execFlag = "main"
        }
    },
    "main": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (!line) return
        if (line.match(/^\[SPECIES/)){
            if (context.currKey){
                context.evolutions.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = regexGrabStr(line, /(?<=^\[)\w+/)
        } if (line.match(/(?<={)EVO/)){
            const values = regexGrabStr(line, /(?<={)EVO[\w,]+/).split(',')
            context.current.push(
                {
                    kind: values[0],
                    specifier: values[1],
                    into: values[2],
                }
            )
           
        } else if (line.match('};')){
            context.evolutions.set(context.currKey, context.current)
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
        evolutions: context.evolutions
    }
}
