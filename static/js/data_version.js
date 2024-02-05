import { hydrate } from './hydrate.js'
import { saveToLocalstorage, fetchFromLocalstorage } from './settings.js';
/**
 * To select which version of the game data to have
 */
/**@type {import('./compactify.js').CompactGameData} */
export let gameData;

// each time the data is modified, this is updated
// so the client checks if it have the latest version by checking lo
const LATEST_DATA_VERSION = "1"/*%%VERSION%%*/

const allVersions = [
    "1.6.1",
    "Alpha",
]
const defaultVersion = "1.6.1"

function setAvailableVersion(){
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
  
function changeVersion(version){
    if (!version || allVersions.indexOf(version) == -1){
        return console.warn(`no such version : ${version}`)
    }
    const savedVersion = fetchFromLocalstorage("dataversion"+version)
    //disabled fetch from local storage for iOS products
    if (savedVersion == LATEST_DATA_VERSION){
        console.log("take gamedata from storage")
        gameData = JSON.parse(fetchFromLocalstorage("data"+version))
        hydrate()
        if (gameData) return
    }
    //fetch remotely
    fetch(`js/data/gameDataV${version}.json`)
        .then((response) => response.json())
        .then((data) => {
            console.log("take gamedata from server")
            gameData = data
            saveToLocalstorage("data"+version, gameData)
            hydrate()
            saveToLocalstorage("dataversion"+version, LATEST_DATA_VERSION)
    })
}

export function setupDataVersionning(){
    setAvailableVersion()
    $('#versions').on('change', function(){
        changeVersion($(this).val())
    })
    changeVersion(defaultVersion)
}

