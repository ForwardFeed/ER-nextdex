import { regexGrabNum, regexGrabStr, upperCaseFirst } from "../parse_utils"

export interface Result{
    fileIterator: number,
    forms: Map<string, string[]>,
}


interface Context {
    current: string[],
    currKey: string,
    forms: Map<string, string[]>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        current: [],
        currKey: "",
        forms: new Map(),
        execFlag: "main",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "main": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (line.match('u16s')){
            if (context.currKey){
                context.forms.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = regexGrabStr(line, /(?<=constu16)\w+/)
        } else if (line.match('SPECIES_')){
            // apparently /(?<=[^_])SPECIES_\w+/ doesn't work so f u
            const value = regexGrabStr(line, /SPECIES_\w+/)
            if (value === "SPECIES_END") return
            if (value === context.currKey) return
            context.current.push(value)
        } else if (line.match('gFormSpeciesIdTables')){
            context.execFlag = "pointers"
        }

    },
    "pointers": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (line.match(/\[SPECIES_/)){
            const species = regexGrabStr(line, /(?<=\[)SPECIES\w+/)
            const ptr = regexGrabStr(line, /(?<==)\w+/)
            if (!context.forms.has(ptr)) return
            const learnset = context.forms.get(ptr)
            if (!learnset) return
            context.forms.set(species, learnset)
            context.forms.delete(ptr)    
        } else if (line.match('};')){
            context.forms.set(context.currKey, context.current)
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
    return {
        fileIterator: fileIterator,
        forms: context.forms
    }
}
