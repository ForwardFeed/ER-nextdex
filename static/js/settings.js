import { loadFont } from "./fonts.js"


const appName = "ERdex"
const appSettings = appName + "_settings"
const settingsVersion = "5" //when changed it will init newly added elements from default to the current settings
// and this automatically to prevent some undefined behavior
const themeList =  [
    "blueish",
    "rushed",
    "wood",
    "blahaj",
]
const fontList = [
    'basis33',
    'Inconsolata',
    'Determination',
]
export const settings = {

}

const defaultSettings = {
    settingsVersion: settingsVersion,
    theme: "blueish",
    storageEnable: true,
    monotype: false,
    discordFormat: true,
    font: "basis33"
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
    loadFont(settings.font)
}

export function saveSettings(){
    try{
        if (window.localStorage) window.localStorage.setItem(appSettings, JSON.stringify(settings))
    }
    catch(e){
        alert("couldn't save settings, report to the dev if this message appear")
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
        try{
            window.localStorage.setItem(appName + key, value)
        } catch(_e){
            // no localstorage for ou i guess
        }
        
    }
}

export function fetchFromLocalstorage(key){
    try {
        //disabled fetch from local storage if it does not support it
        if (typeof window.localStorage === 'undefined') return undefined
        const returnedValue = window.localStorage.getItem(appName + key)
        // sometimes it's "null" stringified, which is very fun
        return returnedValue === "null" || returnedValue === null ? undefined : returnedValue
    } catch(_e){
        return undefined
    }
    
}

function changeTheme(){
    let settingsTheme = settings.theme
    if (themeList.indexOf(settingsTheme) == -1) settingsTheme = themeList[0]
    for (const theme of themeList){
        document.getElementById(`styles-${theme}`).disabled = theme !== settingsTheme
    }
    
}
function toUpperCaseFirst(word){
    return word.charAt(0).toUpperCase() + word.slice(1)
}
function setDynamicalRowOfSettings(name, settingsList, onchange){
    const Name = toUpperCaseFirst(name)
    const frag = document.createDocumentFragment()
    const rowCore = document.createElement('div')
    rowCore.className = 'settings-row'
    const themeSpan = document.createElement('span')
    themeSpan.innerText =  Name + ":"
    frag.append(themeSpan)
    for (let i = 0 ; i < settingsList.length ; i++){
        const settingsItem = settingsList[i]
        const label = document.createElement('label')
        label.innerText = toUpperCaseFirst(settingsItem)
        label.htmlFor = `${name}-${settingsItem}`
        const input = document.createElement('input')
        input.type = "radio"
        input.name = name
        input.id = `${name}-${settingsItem}`
        if (settings[name] === settingsItem) input.checked = true
        input.onchange = ()=>{onchange(settingsItem, i)}
        frag.append(label)
        frag.append(input)
    }
    rowCore.append(frag)
    $('#settings-main').after(rowCore)
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
    $('#enable-monotype').on('change', ()=>{
        settings.monotype = true
        saveSettings()
    })
    $('#disable-monotype').on('change', ()=>{
        settings.monotype = false
        saveSettings()
    })
    if (settings.monotype) $('#enable-monotype').attr('checked', true)
    $('#enable-export-discord').on('change', ()=>{
        settings.discordFormat = true
        saveSettings()
    })
    $('#disable-export-discord').on('change', ()=>{
        settings.discordFormat = false
        saveSettings()
    })
    setDynamicalRowOfSettings("font", fontList, (font)=>{
        settings.theme = font
        saveSettings()
        loadFont(font)
    })
    if (settings.discordFormat) $('#enable-export-discord').attr('checked', true)
    setDynamicalRowOfSettings("theme", themeList, (theme) => {
        settings.theme = theme
        saveSettings()
        changeTheme()
    })
    
}

/**
 * when the localStorage is too full
 */
function cleanLocalStorage(){
    if (!localStorage) return // dunno
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