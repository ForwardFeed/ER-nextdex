
const appName = "ERdex"
const appSettings = appName + "_settings"
const settingsVersion = "1"
const themesList =  [
    "blueish",
    "rushed"
]
export const settings = {

}

export function initAppSettings(){
    if (!localStorage.getItem(appSettings)){
        //default settings
        Object.assign(settings, { 
            theme: "blueish",
            settingsVersion: settingsVersion,
        })
        saveSettings()
    } else {
        Object.assign(settings, JSON.parse(localStorage.getItem(appSettings)))
    }
    changeTheme()
}

export function saveSettings(){
    localStorage.setItem(appSettings, JSON.stringify(settings))
}


function changeTheme(){
    const settingsTheme = settings.theme
    for (const theme of themesList){
        document.getElementById(`styles-${theme}`).disabled = theme !== settingsTheme
    }
    
}

export function setupSettings(){
    $('#settings-btn').on('click', function(){
        $('#settings-frame').toggle()
    })
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