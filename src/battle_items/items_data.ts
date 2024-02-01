import { regexGrabStr } from "../parse_utils"

export interface Result{
    fileIterator: number,
    data: Map<string, BattleItem>,
}

export interface BattleItem {
    name: string,
    descPtr: string,
}

function initItem(): BattleItem{
    return {
        name: "",
        descPtr: "",
    }
}

interface Context{
    dataCollection: Map<string, BattleItem>
    currentItem: BattleItem,
    key: string,
    isValid: boolean,
    execFlag: string, 
    stopRead: boolean,
}

function initContext(): Context{
    return {
        dataCollection: new Map(),
        currentItem: initItem(),
        key: "",
        isValid: false,
        execFlag: "awaitData",
        stopRead: false
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitData" : (line, context) =>{
        if (line.match('gItems')){
            context.execFlag = "main"
        }
    },
    "main" : (line, context) =>{
        const baseLine = line
        line = line.replace(/\s/g, '')
        if (line.match(/\[ITEM_/)){
            if (context.isValid && context.key){
                context.dataCollection.set(context.key, context.currentItem)
            }
            context.currentItem = initItem()
            context.isValid = false
            context.key = regexGrabStr(line, /(?<=\[)\w+/)
        } else if (line.match(/^\.name/)){
            context.currentItem.name = regexGrabStr(baseLine, /(?<=")[^"]+/)
        } else if (line.match(/^\.description/)){
            context.currentItem.descPtr = regexGrabStr(line, /(?<==)s\w+/)
        } else if (line.match(/^\.holdEffect(?==)/)){
            context.isValid = true //i only fetch for valid items
        } else if (line.match(';')){
            if (context.isValid && context.key){
                context.dataCollection.set(context.key, context.currentItem)
            }
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

