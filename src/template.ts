
/**
 * This File is for code documentation purpose
 * This is a template of a multi files part parsing method
 * 
 * The function of all of this is the following:
 * From a whatever data format to convert it into a JSON format used after in the UI
 * 
 * you may find this kind of structure of the species parsing which involves a lot of data
 */

/**
 * This is what is returned,
 * the file iterator is the line the parser has decided to stop
 * (note that if the parsing fails any step further will not be executed)
 * and the data resulting of the parsed
 */
export interface Result{
    fileIterator: number,
    data: WhateverData[],
}
/**
 * here you put at least one specific data structure which is the result of the parsing
 */
export interface WhateverData {
    name: string,
}

function initWhateverData(): WhateverData{
    return {
        name: ""
    }
}
/**
 * Since the logic here is to read line by line
 * we often need to remember some informations left by previous lines
 * and to be more flexible with the data we can store
 */
interface Context{
    dataCollection: WhateverData[]
    /**
     *  when you have a block of a data structure that is separated on muliple lines
     */
    current: WhateverData,
    /**
     *  when using maps it's quite usefull
     */
    currentKey: string,
    /*
         To be more sure about if you don't make a typo
          you can also make executionMap as a type and use keyof typeof ExecutionMap
    */
    execFlag: string, 
    /**
     * don't read in the wind
     */
    stopRead: boolean,
}
/**
 * using a function that ensure that all the data is at least 
 * correctly initialiazed is much more useful than a type assertion
 */
function initContext(): Context{
    return {
        dataCollection: [],
        current: initWhateverData(),
        currentKey: "",
        execFlag: "awaitData", // 
        stopRead: false
    }
}
/**
 * this may look unorthodox, but it reduce the if else of one level systematically
 * !TODO finish this
 */
const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "awaitData" : (line, context) =>{
        if (line.match('trigger')){
            context.execFlag = "main"
        }
    },
    "main" : (line, context) =>{
        if (line.match('data detected')){
            //grab data from
        } if (line.match('};')){
            //stop the reading at this
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

