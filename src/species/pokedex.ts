import { regexGrabNum, regexGrabStr } from "../parse_utils"

export interface Result{
    fileIterator: number,
    data: Map<string, PokePokedex>,  //SPECIE_ as key
}
export interface PokePokedex {
    id: number,
    desc: string,
    hw: [number, number]
    // category: string
}

function initPokePokedex(): PokePokedex{
    return {
        id: -1,
        desc: "",
        hw: [0,0]
    }
}
interface Context{
    dataCollection: Map<string, PokePokedex>
    descMap: Map<string, string>,
    dexID: number,
    current: PokePokedex,
    currentKey: string,
    execFlag: string, 
    stopRead: boolean,
}
function initContext(): Context{
    return {
        dataCollection: new Map(),
        descMap: new Map(),
        dexID: 0,
        current: initPokePokedex(),
        currentKey: "",
        execFlag: "desc",
        stopRead: false
    }
}
const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "desc" : (line, context) =>{
        if (line.match(/PokedexText\[\]/)){
            context.currentKey = regexGrabStr(line, /\w+(?=\[)/)
        } else if (line.match('"')){
            const desc = regexGrabStr(line, /(?<=")[^"]+/).replace('\\n', ' ')
            if (context.descMap.has(context.currentKey)){
                const prev = context.descMap.get(context.currentKey) + desc
                context.descMap.set(context.currentKey, prev)
            } else {
                context.descMap.set(context.currentKey, desc)
            }
        } else if (line.match("gPokedexEntries")){
            context.currentKey = ""
            context.execFlag = "entries"
        }
    },
    "entries" : (line, context) =>{
        if (line.match('NATIONAL_DEX')){
            if (context.currentKey){
                context.dataCollection.set(context.currentKey, context.current)
                context.current = initPokePokedex()
            }
            context.currentKey = regexGrabStr(line, /(?<=\[)\w+(?=\])/).replace('NATIONAL_DEX', 'SPECIES')
            context.current.id = context.dexID
            context.dexID++
        } else if (line.match('.height')){
            context.current.hw[0] = regexGrabNum(line.replace(/\s/g, ''), /(?<==)\d+/)
        } else if (line.match('.weight')){
            context.current.hw[1] = regexGrabNum(line.replace(/\s/g, ''), /(?<==)\d+/)
        }else if (line.match('.description')){
            const descPtr = regexGrabStr(line.replace(/\s/g, ''), /(?<==)\w+/)
            context.current.desc = context.descMap.get(descPtr).replace(/--/g, '  ') || ""
        } else if (line.match(';')){
            if (context.currentKey){
                context.dataCollection.set(context.currentKey, context.current)
                context.current = initPokePokedex()
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

