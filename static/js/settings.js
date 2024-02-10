
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
    window.localStorage.setItem(appSettings, JSON.stringify(settings))
}

export function saveToLocalstorage(key, value){
    //disabled fetch from local storage if it does not support it
    if (typeof window.localStorage === 'undefined') return undefined
    if (typeof value === "object"){
        window.localStorage.setItem(appName + key, JSON.stringify(value))
    } else {
        window.localStorage.setItem(appName + key, value)
    }
}

export function fetchFromLocalstorage(key){
    //disabled fetch from local storage if it does not support it
    if (typeof window.localStorage === 'undefined') return undefined
    return window.localStorage.getItem(appName + key)
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