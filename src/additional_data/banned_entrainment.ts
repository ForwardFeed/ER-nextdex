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
        execFlag: "awaitFirst",
        stopRead: false
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitFirst" : (line, context) =>{
        if (line.match('u16 sEntrainmentBannedAttackerAbilities')){
            context.execFlag = "First"
        }
    },
    "First" : (line, context) =>{
        if (line.match('ABILITY_')){
            context.dataCollection.push(regexGrabStr(line, /ABILITY_\w+/))
        } if (line.match(';')){
            context.execFlag = "awaitSecond"
        }
    },
    "awaitSecond" : (line, context) =>{
        if (line.match('u16 sEntrainmentTargetSimpleBeamBannedAbilities')){
            context.execFlag = "Second"
        }
    },
    "Second" : (line, context) =>{
        if (line.match('ABILITY_')){
            const abi = regexGrabStr(line, /ABILITY_\w+/)
            if (!context.dataCollection.includes(abi)) context.dataCollection.push(abi)
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

