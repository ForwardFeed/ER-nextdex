import { regexGrabNum, regexGrabStr, upperCaseFirst } from "../parse_utils"

export interface Result{
    fileIterator: number,
    names: Map<string, string>,
}

interface Context {
    names: Map<string, string>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        names: new Map(),
        execFlag: "awaitForData",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitForData": (line, context) => {
        if (line.match('gSpeciesNames')){
            context.execFlag = "main"
        }
    },
    "main": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (line.match(/\[SPECIES_/)){
            const specieID = regexGrabStr(line, /(?<=^\[)\w+/)
            const name = regexGrabStr(line, /(?<=")[^"]+/)
            context.names.set(specieID, name)
        } else if (line.match('};')){
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
        names: context.names
    }
}
