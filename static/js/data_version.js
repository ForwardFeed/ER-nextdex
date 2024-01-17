import { hydrate } from './hydrate.js'

/**
 * To select which version of the game data to have
 */
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

$('#versions').on('change', function(ev){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.gameData = JSON.parse(xhttp.responseText)
            hydrate()
        }
    };
    xhttp.open("GET", `gameDataV${$(this).val()}.json`, true);
    xhttp.send();
})