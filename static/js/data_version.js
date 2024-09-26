import { hydrate } from './hydrate/hydrate.js'
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
const LATEST_DATA_VERSION = "45"/*%%VERSION%%*/

const allVersions = [
    "1.6.1",
    "Beta2.0",
    "Beta2.1",
    "2.1",
    "2.2"
]

const defaultVersion = "2.2"

function setAvailableVersion(){
    const fragment = document.createDocumentFragment()
    const compareDataFrag = document.createDocumentFragment()
    for (const version of allVersions){
        const option = document.createElement('option')
        option.value = version
        option.innerText = version
        fragment.append(option)
        const optionCompare = document.createElement('option')
        optionCompare.value = version
        optionCompare.innerText = version
        compareDataFrag.append(optionCompare)
    }
    let savedVersion = fetchFromLocalstorage("lastusedversion")
    if (allVersions.indexOf(savedVersion) == -1) savedVersion = defaultVersion
    const version = $('#versions').val() || savedVersion
    $('#versions').append(fragment).val(version)
    $('#compare-versions').append(compareDataFrag)
}
let forceRefresh = false
export function changeVersion(version=defaultVersion, firstLoad=false){
    if (!version){
        console.warn(`no such version : ${version}, defaulting to ${defaultVersion}`)
        version = defaultVersion
    }
    const savedVersion = fetchFromLocalstorage("dataversion"+version)
    saveToLocalstorage("lastusedversion", version)
    if (savedVersion && savedVersion == LATEST_DATA_VERSION &&
        $('#enable-storage')[0].checked && !forceRefresh){
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

function hideCompareFieldIdentical(version){
    $('#compare-versions option').show()
    $(`#compare-versions option[value="${version}"]`).hide()
    if (version === $('#compare-versions').val()){
        $('#compare-versions').val("none").trigger('change')
    }
    
}

export function setupDataVersionning(firstLoad = false){
    if (firstLoad) setAvailableVersion()
    $('#versions').on('change', () => {
        hideCompareFieldIdentical($('#versions').val())
        changeVersion($('#versions').val(), firstLoad)
        if (firstLoad) firstLoad = false
    })
    const version = $('#versions').val() || defaultVersion
    $('#versions').val(version).trigger('change')
    $('#force-refresh-data').on('click', function(){
        forceRefresh = true
        changeVersion($('#versions').val())
        forceRefresh = false
    })
    $('#compare-versions').on('change', ()=>{
        const comparedVersion =  $('#compare-versions').val()
        const version = $('#versions').val()
        if (comparedVersion === "none") return
        if (version === comparedVersion) {

        }
        changeCompareData(version,comparedVersion)
    })
}

