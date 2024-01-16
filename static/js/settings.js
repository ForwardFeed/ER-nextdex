/*
    I'll load the settings and preference before everything because it will hold the 
*/

if (!localStorage.getItem('init_storage')){
    window.settings = { //default settings
        theme: "blueish",
        init_storage: true
    }
    for (const key of Object.keys(window.settings)){
        localStorage.setItem(key, JSON.stringify(window.settings[key]))
    }
    
} else {
    window.settings = {}
    for (const key of Object.keys(localStorage)){
        window.settings[key] = localStorage.getItem(key)
    }
}



function changeTheme(){
    const themesList =  [
        "blueish",
        "rushed"
    ]
    const settingsTheme = settings.theme
    for (const theme of themesList){
        document.getElementById(`styles-${theme}`).disabled = theme !== settingsTheme
    }
    
}

function setupSettings(){
    const themesList =  [
        "blueish",
        "rushed"
    ]
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
            window.settings[name] = theme
            localStorage.setItem(name, theme)
            changeTheme()
        }
        frag.append(themeLabel)
        frag.append(themeInput)
    }
    themeCore.append(frag)
    $('#settings-frame').append(themeCore)
}

// setup it early so the theme load quickly
changeTheme()

//setupSettings() will be loaded in the index js