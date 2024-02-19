import { hydrate } from './hydrate.js'
import { saveToLocalstorage, fetchFromLocalstorage } from './settings.js';
/**
 * To select which version of the game data to have
 */
/**@type {import('./compactify.js').CompactGameData} */
export let gameData;
/**@type {import('./compactify.js').CompactGameData} */
export let compareData;

// each time the data is modified, this is updated
// so the client checks if it have the latest version by checking lo
const LATEST_DATA_VERSION = "7"/*%%VERSION%%*/

const allVersions = [
    "1.6.1",
    "Alpha",
]
const defaultVersion = "1.6.1"

function setAvailableVersion(){
    const fragment = document.createDocumentFragment()
    for (const version of allVersions){
        const option = document.createElement('option')
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
    changeCompareData(version, "Vanilla") //TODO, make it so you can target other things

    const savedVersion = fetchFromLocalstorage("dataversion"+version)

    if (savedVersion && savedVersion == LATEST_DATA_VERSION &&
        $('#enable-storage')[0].checked ){
        try{
            gameData = JSON.parse(fetchFromLocalstorage("data"+version))
            if (gameData) {
                console.log("took gamedata from storage")
                hydrate()
                return
            }
        } catch(_e){
            console.log(_e)
        }
    }
    //fetch remotely
    fetch(`js/data/gameDataV${version}.json`)
        .then((response) => response.json())
        .then((data) => {
            console.log("took gamedata from server")
            gameData = data
            hydrate()
            try{
                saveToLocalstorage("data"+version, gameData)
                saveToLocalstorage("dataversion"+version, LATEST_DATA_VERSION)
            }catch(_e){
                // bruh
            }
            
    })
}

function changeCompareData(currentVersion, versionTarget){
    //fetch remotely
    fetch(`js/data/comparify${currentVersion}${versionTarget}.json`)
        .then((response) => response.json())
            .then((data) => {
                console.log("took compareData from server")
                compareData = data
            })
            .catch((e)=>{
                console.warn(e)
            })
        .catch((e)=>{
            console.warn(e)
        })
}

export function setupDataVersionning(){
    setAvailableVersion()
    $('#versions').on('change', function(){
        changeVersion($(this).val())
        saveToLocalstorage("lastusedversion", $(this).val())
    })
    const lastUsedVersion = fetchFromLocalstorage("lastusedversion")
    $('#versions').val(lastUsedVersion || defaultVersion).change()
}

