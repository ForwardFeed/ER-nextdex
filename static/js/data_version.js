import { hydrate } from './hydrate.js'
import { saveToLocalstorage, fetchFromLocalstorage } from './settings.js';
/**
 * To select which version of the game data to have
 */
/**@type {import('../../src/compactify.js').CompactGameData} */
export let compareData;
/**@type {import('../../src/compactify.js').CompactGameData} */
export let gameData;
// each time the data is modified, this is updated
// so the client checks if it have the latest version by checking lo
const LATEST_DATA_VERSION = "29"/*%%VERSION%%*/

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
    const version = $('#versions').val() || fetchFromLocalstorage("lastusedversion")
    $('#versions').append(fragment).val(version)
}

export function changeVersion(version=defaultVersion, firstLoad=false){
    if (!version /*|| allVersions.indexOf(version) == -1*/){
        console.warn(`no such version : ${version}, defaulting to ${defaultVersion}`)
        version = defaultVersion
    }
    
    changeCompareData(version, "Vanilla") //TODO, make it so you can target other things
    
    const savedVersion = fetchFromLocalstorage("dataversion"+version)
    saveToLocalstorage("lastusedversion", version)

    if (savedVersion && savedVersion == LATEST_DATA_VERSION &&
        $('#enable-storage')[0].checked ){
        try{
            gameData = JSON.parse(fetchFromLocalstorage("data"+version))
            if (gameData) {
                window.gameData = gameData
                console.log("took gamedata from storage")
                hydrate(firstLoad)
                return
            }
        } catch(_e){
            console.warn(_e)
        }
    }
    //fetch remotely
    fetch(`js/data/gameDataV${version}.json`)
        .then((response) => response.json())
        .then((data) => {
            console.log("took gamedata from server")
            gameData = data
            window.gameData = gameData
            try{
                //save first, because it causes issue after
                saveToLocalstorage("data"+version, gameData)
                saveToLocalstorage("dataversion"+version, LATEST_DATA_VERSION)
            }catch(_e){
                // bruh
            }
            hydrate(firstLoad)
            
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
                compareData = undefined
                console.warn(e)
            })
        .catch((e)=>{
            compareData = undefined
            console.warn(e)
        })
}

export function setupDataVersionning(firstLoad = false){
    if (firstLoad) setAvailableVersion()
    $('#versions').on('change', () => {
        changeVersion($('#versions').val(), firstLoad)
        if (firstLoad) firstLoad = false
    })
    const version = $('#versions').val() || defaultVersion
    $('#versions').val(version).trigger('change')
}

