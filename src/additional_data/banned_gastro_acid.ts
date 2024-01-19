import { regexGrabStr } from "../parse_utils"

export interface Result{
    fileIterator: number,
    data: string[],
}

interface Context{
    dataCollection: string[]
    execFlag: string, 
    stopRead: boolean,
}

function initContext(): Context{
    return {
        dataCollection: [],
        execFlag: "awaitData",
        stopRead: false
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitData" : (line, context) =>{
        if (line.match('u16 sGastroAcidBannedAbilities')){
            context.execFlag = "main"
        }
    },
    "main" : (line, context) =>{
        if (line.match('ABILITY_')){
            context.dataCollection.push(regexGrabStr(line, /ABILITY_\w+/))
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
        data: context.dataCollection
    }
}

