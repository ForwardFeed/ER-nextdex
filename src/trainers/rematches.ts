import { regexGrabStr } from "../parse_utils"

export interface Result{
    fileIterator: number,
    rematches: Map<string, string[]>,
}

interface Context{
    rematches: Map<string, string[]>,
    execFlag: string, 
    stopRead: boolean,
}

function initContext(): Context{
    return {
        rematches: new Map(),
        execFlag: "awaitData",
        stopRead: false
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitData" : (line, context) =>{
        if (line.match('RematchTrainer gRematchTable')){
            context.execFlag = "main"
        }
    },
    "main" : (line, context) =>{
        if (line.match('REMATCH')){
            line = line.replace(/\s/g, '')
            const rematches = regexGrabStr(line, /(?<=REMATCH\()[^)]+/).split(',')
            if (rematches.length){
                rematches.splice(rematches.length - 1, 1) // remove the map name
                context.rematches.set(rematches.splice(0,1)[0], rematches)
            }
        } if (line.match(';')){
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
        rematches: context.rematches
    }
}

