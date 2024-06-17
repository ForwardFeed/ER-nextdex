import { e, JSHAC } from "../utils.js";
import { gameData } from "../data_version.js"
import { nodeLists } from "./hydrate.js";

export function hydrateAbilities(abilities = gameData.abilities) {
    nodeLists.abilities.length = 0
    $("#abis-list").empty().append(JSHAC(
        abilities.map((abi, i) => {
            if (abi.name === "-------") return undefined
            const row = JSHAC([
                e("div", "abi-row"), [
                    e("div", "abi-name color" + (i % 2 ? "A" : "B"), abi.name),
                    e("div", "abi-desc color" + (i % 2 ? "C" : "D"), abi.desc)
                ]
            ])
            nodeLists.abilities.push(row)
            return row
        }).filter(x => x)
    ));
    /*$('#filter-alphabethically').on('click', ()=>{
        fastdom.mutate(()=>{
            function sortAlphabethically(a, b){
                return a.name.localeCompare(b.name)
            }
            const abiSorted = structuredClone(abilities)
            abiSorted.splice(0,1)
            hydrateAbilities(abiSorted.sort(sortAlphabethically))
        })
    })*/
}