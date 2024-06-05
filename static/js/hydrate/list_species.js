import { gameData } from "../data_version.js";
import { JSHAC, e } from "../utils.js";


export function hydrateSpeciesList(){
    const species = gameData.species
    const speciesLen = species.length
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < speciesLen; i++) {
        if (i == 0) continue // skip specie none
        const specie = species[i]
        fragment.append(JSHAC([
            e('div', 'list-species-row'), [
                e('div', 'list-species-name', [e('span', '', specie.name)]),
                e('div', 'list-species-abis-block', specie.stats.abis.map(x => {
                    return e('div', 'list-species-abi', [e('span', null, gameData.abilities[x].name)])
                })),
                e('div', 'list-species-inns-block', specie.stats.inns.map(x => {
                    return e('div', 'list-species-inn', [e('span', null, gameData.abilities[x].name)])
                })),
            ]
        ]))
    }
    $('#panel-list-species').empty().append(fragment)
}