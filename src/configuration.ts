import {readFileSync, writeFileSync, existsSync, stat, Stats} from 'fs'
import { join } from 'path'

export interface Configuration{
    project_root: string
    verified: boolean
}
const CONFIG_PATH = "./nextdex_config.json"


const defaultConfiguration: Configuration = {
    project_root: "",
    verified: false,
}

export function saveConfigFile(configuration: Configuration){
    writeFileSync(CONFIG_PATH, JSON.stringify(configuration))
}
function initIfMissing(){
    writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfiguration))
    
} 

export function writeDefaultConfiguration(){
    saveConfigFile(defaultConfiguration)
        console.log('Initialized config file to ' + CONFIG_PATH)
        return defaultConfiguration
}
export function getConfiguration(): Configuration | undefined{
    if (!existsSync(CONFIG_PATH)) return undefined
    try{
        const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
        return config
    } catch(e){
        console.error(`Couldn't read or parse configuration file ${CONFIG_PATH}`)
        return undefined
    }
    
}

function checkIfPathExist(path: string): Promise<void>{
    return new Promise((resolved, rejected)=>{
        stat(path, (err: NodeJS.ErrnoException, stat: Stats)=>{
            if (err){
                rejected(path)
            } else {
                resolved()
            }
        })
    })
}


function verifyFolders(configuration: Configuration): Promise<void>{
    const foldersToCheck: string[] = [
        "include",
        "include/constants",
        "src",
        "src/data",
        "src/data/pokemon"
    ]
    return new Promise((resolved, rejected)=>{
        Promise.allSettled(foldersToCheck.map((folder)=>{
            const path = join(configuration.project_root, folder)
            return checkIfPathExist(path)
        })).then((values)=>{
            let isGood = true
            for (const value of values){
                if (value.status === "rejected"){
                    console.error(`could not find path ${value.reason}`)
                    isGood = false
                }
            }
            isGood ? resolved() : rejected()
        })
    })
}

export function verifyConfiguration(configuration: Configuration): Promise<void>{
    return new Promise((resolved, rejected)=>{
        verifyFolders(configuration)
            .then(()=>{
                //check the files
                resolved()
            })
            .catch(()=>{
                rejected()
            })
    })
    
}
