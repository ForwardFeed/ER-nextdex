
const appName = "ERdex"
const appSettings = appName + "_settings"
const settingsVersion = "2" //when changed it will init newly added elements from default to the current settings
const themesList =  [
    "blueish",
    "rushed",
    "wood",
    "blahaj",
]
export const settings = {

}

const defaultSettings = {
    settingsVersion: settingsVersion,
    theme: "blueish",
    storageEnable: true,
}

export function initAppSettings(){
    if (!window.localStorage.getItem(appSettings)){
        //default settings
        Object.assign(settings, defaultSettings)
        saveSettings()
    } else {
        Object.assign(settings, JSON.parse(window.localStorage.getItem(appSettings)))
        if (settings.settingsVersion !== settingsVersion){
            console.log('readapted the settings')
            for (const newSettings in defaultSettings){
                if (settings[newSettings] == undefined){
                    settings[newSettings] = defaultSettings[newSettings]
                }
            }
            settings.settingsVersion = settingsVersion
            saveSettings()
        }
    }
    changeTheme()
}

export function saveSettings(){
    try{
        window.localStorage.setItem(appSettings, JSON.stringify(settings))
    }
    catch(e){
        alert("Muh data too big to fit? :3 (seriously, report to the dev if this message appear)")
    }
}

export function saveToLocalstorage(key, value){
    //disabled fetch from local storage if it does not support it
    if (typeof window.localStorage === 'undefined') return undefined
    if (typeof value === "object"){
        try{
            window.localStorage.setItem(appName + key, JSON.stringify(value))
        }
        catch(e){
            cleanLocalStorage()
        }
    } else {
        window.localStorage.setItem(appName + key, value)
    }
}

export function fetchFromLocalstorage(key){
    //disabled fetch from local storage if it does not support it
    if (typeof window.localStorage === 'undefined') return undefined
    const returnedValue = window.localStorage.getItem(appName + key)
    // sometimes it's "null" stringified, which is very fun
    return returnedValue === "null" ? undefined : returnedValue
}

function changeTheme(){
    let settingsTheme = settings.theme
    if (themesList.indexOf(settingsTheme) == -1) settingsTheme = themesList[0]
    for (const theme of themesList){
        document.getElementById(`styles-${theme}`).disabled = theme !== settingsTheme
    }
    
}

export function setupSettings(){
    $('#settings-btn').on('click', function(){
        $('#settings-frame').toggle()
    })
    $('#disable-storage').on('change', ()=>{
        settings.storageEnable = false
        saveSettings()
    })
    $('#enable-storage').on('change', ()=>{
        settings.storageEnable = true
        saveSettings()
    })
    if (!settings.storageEnable) $('#disable-storage').attr('checked', true)
    const toUpperCaseFirst = (word)=>{
        return word.charAt(0).toUpperCase() + word.slice(1)
    }
    const name = "theme"
    const Name = toUpperCaseFirst(name)
    const frag = document.createDocumentFragment()
    const themeCore = document.createElement('div')
    themeCore.className = "settings-row"
    const themeSpan = document.createElement('span')
    themeSpan.innerText = Name + ":"
    frag.append(themeSpan)
    for (const theme of themesList){
        const themeLabel = document.createElement('label')
        themeLabel.htmlFor = `${name}-${theme}`
        themeLabel.innerText = toUpperCaseFirst(theme)
        const themeInput = document.createElement('input')
        themeInput.type = "radio"
        themeInput.name = name
        themeInput.id = `${name}-${theme}`
        if (settings[name] === theme) themeInput.checked = true
        themeInput.onchange = () => {
            settings.theme = theme
            saveSettings()
            changeTheme()
        }
        frag.append(themeLabel)
        frag.append(themeInput)
    }
    themeCore.append(frag)
    $('#settings-frame').append(themeCore)
}

/**
 * when the localStorage is too full
 */
function cleanLocalStorage(){
    console.log('cleaned the local storage of data')
    const keys = Object.keys(localStorage) 
    for (const key of keys){
        //only delete the part that are about ER dex
        if (key.indexOf("ERdex") == -1) continue
        // only delete the data
        if (key.indexOf("ERdexdata") == -1) continue
        localStorage.removeItem(key)
    }
}