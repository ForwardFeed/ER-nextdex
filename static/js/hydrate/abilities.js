import { e, JSHAC } from "../utils.js";
import { gameData } from "../data_version.js"
import { nodeLists } from "./hydrate.js";
import { longClickToFilter } from "../filters.js";

export function hydrateAbilities(abilities = gameData.abilities) {
    $("#abis-list").empty().append(JSHAC(
        abilities.map((abi, i) => {
            if (abi.name === "-------") return undefined
            const abi_name = e("div", "abi-name color" + (i % 2 ? "A" : "B"), abi.name)
            longClickToFilter(0, abi_name, "ability", ()=>abi.name)
            const row = JSHAC([
                e("div", "abi-row"), [
                    abi_name,
                    e("div", "abi-desc color" + (i % 2 ? "C" : "D"), abi.desc),
                    e("div", "abi-id color" + (i % 2 ? "A" : "B"), abi.id),
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