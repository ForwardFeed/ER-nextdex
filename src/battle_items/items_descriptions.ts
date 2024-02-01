import { regexGrabStr } from "../parse_utils"

export interface Result{
    fileIterator: number,
    data: Map<string, string>,
}
interface Context{
    dataCollection: Map<string, string>,
    key: string,
    currentDesc: string,
    execFlag: string,
    stopRead: boolean,
}
function initContext(): Context{
    return {
        dataCollection: new Map(),
        key: "",
        currentDesc: "",
        execFlag: "main",
        stopRead: false
    }
}
const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "main" : (line, context) =>{
        if (line.match('static const u8')){
            if (context.key){
                context.dataCollection.set(context.key, context.currentDesc)
            }
            context.key = regexGrabStr(line, /s\w+(?=\[)/)
            context.currentDesc = ""
        } else if (line.match('"')){
            const desc = regexGrabStr(line, /(?<=")[^"]+/).replace('\\n', ' ')
            context.currentDesc += desc
        } // no stop read because it is read last
    }

}


export function parse(lines: string[], fileIterator: number): Result{
    const lineLen = lines.length
    const context = initContext()
    for (;fileIterator<lineLen; fileIterator++){
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) {
            fileIterator--
            break
        }
    }
    //since there is no stop it will continue read and won't read the last one
    if (context.key){
        context.dataCollection.set(context.key, context.currentDesc)
    }
    return {
        fileIterator: fileIterator,
        data: context.dataCollection
    }
}

