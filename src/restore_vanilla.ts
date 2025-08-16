import { writeFile } from "fs"
import { CompactGameData, CompactSpecie } from "./compactify"
import { ComparifyGameData, getFileAsJson } from "./comparify"

function cloneObj(target: object){
    return JSON.parse(JSON.stringify(target))  
}

export function restore_vanilla(){
    const redux = getFileAsJson("./static/js/data/gameDataV1.6.1.json")
    const comp = getFileAsJson("./static/js/data/comparify1.6.1Vanilla.json") as string | ComparifyGameData

    if (typeof redux === "string") throw "wrong redux filepath"
    if (typeof comp === "string") throw "wrong comp filepath"

    const vanillaGameData: CompactGameData = {
        abilities: [],
        moves: [],
        species: [],
        locations: undefined,
        trainers: [],
        items: [],
        typeT: [],
        targetT: [],
        flagsT: [],
        effT: [],
        splitT: [],
        eggT: [],
        growT: [],
        colT: [],
        evoKindT: [],
        natureT: [],
        scriptedEncoutersHowT: [],
        mapsT: [],
        MAPST: [],
        tclassT: [],
        creationDate: 0
    }

    const sLen = redux.species.length
    for (let i = 0; i < sLen; i++){
        const specie = redux.species[i]
        const c = comp.species[i]
        const newSpecie = vanillaGameData.species[i] = cloneObj(specie) as CompactSpecie
        if (c == true){
            continue
        } else if (c == false){
            console.log(c, specie.NAME, "what does false mean?")
            continue
        }
        const stats = c.stats
        if (typeof stats === "boolean"){
            console.log(c, specie.NAME, "I don't get it")
            continue
        }
        const baseStats = stats.base
        if (typeof baseStats === "boolean"){
            console.log(c, specie.NAME, "Please explain")
            continue
        }
        newSpecie.stats.base = baseStats.map((x, i) => {
            if (typeof x === "boolean"){
                return specie.stats.base[i]
            }
            return x
        })
    }


    const outputPath = `./out/gameDataVVanilla.json`
    writeFile(outputPath , JSON.stringify(vanillaGameData) , (err_exist)=>{
        if (err_exist){
            console.error(`couldn't write the gamedata output to ${outputPath}`)
        } else {
            console.log("successfully written to " + outputPath)
        }
        
    })
}

restore_vanilla()