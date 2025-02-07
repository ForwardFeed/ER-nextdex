import { GameData } from "./main"
import { regexGrabStr } from "./parse_utils"
import { FileDataOptions, getMulFilesData, autojoinFilePath } from "./utils"

export interface Result{
    fileIterator: number,
    abilities: Map<string, Ability>,
}

export interface Ability {
    name: string,
    desc: string,
}

interface Context {
    abilities: Map<string, Ability>,
    abilitiesPtr: Map<string, string>
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        abilities: new Map(),
        abilitiesPtr: new Map(),
        execFlag: "desc",
        stopRead: false,
    }
}

const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "desc": (line, context) =>{
        if (line.match('u8 s')){
            const ptr = regexGrabStr(line, /\w+(?=\[)/)
            const desc = regexGrabStr(line, /(?<=")[^"]+/).replace('\\n', ' ')
            context.abilitiesPtr.set(ptr, desc)
        } else if (line.match('gAbilityNames')){
            context.execFlag = "names"
        }
    },
    "names": (line, context) => {
        if (line.match(/\[ABILITY_/)){
            const abilityID = regexGrabStr(line, /(?<=\[)\w+/)
            const name = regexGrabStr(line, /(?<=")[^"]+/)
            const ability = {
                name: name,
                desc: "",
            }
            context.abilities.set(abilityID, ability)
        } else if (line.match('};')){
            context.execFlag = "pointers"
        }
    },
    "pointers": (line, context) => {
        line = line.replace(/\s/g, '')
        if (line.match(/\[ABILITY_/)){
            const abilityID = regexGrabStr(line, /(?<=\[)\w+/)
            const ability = context.abilities.get(abilityID)
            if (!ability) return
            const ptr = regexGrabStr(line, /(?<==)\w+/)
            const abilityPtrDesc = context.abilitiesPtr.get(ptr)
            if (!abilityPtrDesc) return
            ability.desc = abilityPtrDesc
            context.abilities.set(abilityID, ability)
        }
        if (line.match('};')){
            context.stopRead = true
        }
    }
}

function parse(fileData: string): Map<string, Ability>{
    const lines = fileData.split('\n')
    const lineLen = lines.length
    const context = initContext()
    for (let fileIterator = 0;fileIterator<lineLen; fileIterator++){
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
    }
    return context.abilities
}

export function getAbilities(ROOT_PRJ: string, optionsGlobal_h: FileDataOptions, gameData: GameData): Promise<void>{
    return new Promise((resolve: ()=>void, reject)=>{
        getMulFilesData(autojoinFilePath(ROOT_PRJ, ['src/data/text/abilities.h',
                                                ]), optionsGlobal_h)
            .then((abilityData)=>{
                gameData.abilities = parse(abilityData)
                resolve()
            })
            .catch((reason)=>{
                const err = 'Failed at gettings species reason: ' + reason
                reject(err)
            })
    })
    
}