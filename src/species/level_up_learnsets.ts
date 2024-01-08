import { regexGrabNum, regexGrabStr, upperCaseFirst } from "../parse_utils"

export interface Result{
    fileIterator: number,
    levelLearnsets: Map<string, LevelUpMove[]>,
}

export interface LevelUpMove {
    level: number,
    move: string,
}

interface Context {
    current: LevelUpMove[],
    currKey: string,
    levelUpLearnsetPtr: Map<string, LevelUpMove[]>,
    levelUpLearnset: Map<string, LevelUpMove[]>,
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        current: [],
        currKey: "",
        levelUpLearnsetPtr: new Map(),
        levelUpLearnset: new Map(),
        execFlag: "main",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "main": (line, context) =>{
        line = line.replace(/\s/g, '')
        if (!line) return
        if (line.match('LevelUpMove')){
            if (context.currKey){
                context.levelUpLearnsetPtr.set(context.currKey, context.current)
                context.current = []
            }
            context.currKey = regexGrabStr(line, /(?<=LevelUpMove)\w+/)
        } else if (line.match('LEVEL_UP_MOVE')){
            let levelUpMove = {
                level: regexGrabNum(line, /(?<=\()\d+/, 0),
                move: regexGrabStr(line, /\w+(?=\))/)
            }
            context.current.push(levelUpMove)
        }
        if (line.match('gLevelUpLearnsets')){
            context.levelUpLearnsetPtr.set(context.currKey, context.current)
            context.execFlag = "pointers"
        }
    },
    "pointers": (line, context) => {
        line = line.replace(/\s/g, '')
        if (line.match(/^\[SPECIES/)){
            const species = regexGrabStr(line, /(?<=\[)SPECIES\w+/)
            const ptr = regexGrabStr(line, /(?<==)\w+/)
            if (!context.levelUpLearnsetPtr.has(ptr)) return
            const learnset = context.levelUpLearnsetPtr.get(ptr)
            context.levelUpLearnset.set(species, learnset)
        }
        if (line.match('};')){
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
    console.log(context.levelUpLearnset)
    return {
        fileIterator: fileIterator,
        levelLearnsets: context.levelUpLearnset
    }
}
