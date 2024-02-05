import { hydrate } from './hydrate.js'
import { saveToLocalstorage, fetchFromLocalstorage } from './settings.js';
/**
 * To select which version of the game data to have
 */
/**@type {import('./compactify.js').CompactGameData} */
export let gameData;

// each time the data is modified, this is updated
// so the client checks if it have the latest version by checking lo
const version = "1"/*%%VERSION%%*/

export function setAvailableVersion(){
    const allVersions = [
        "1.6.1",
        "Alpha",
    ]
    let defaultVersion = "1.6.1"
    if (!allVersions.includes(defaultVersion)){
        console.warn('flimsy dev, you set a wrong default version, defaulting to first')
        defaultVersion = allVersions[0]
    }
    const fragment = document.createDocumentFragment()
    for (const version of allVersions){
        const option = document.createElement('option')
        if (option === defaultVersion) option.prop('selected',true);
        option.value = version
        option.innerText = version
        fragment.append(option)
    }
    $('#versions').append(fragment).val(defaultVersion).change()

}

$('#versions').on('change', function(){
    fetch(`js/data/gameDataV${$(this).val()}.json`)
        .then((response) => response.json())
        .then((data) => {
          gameData = data
          hydrate()
        })
    
    
})