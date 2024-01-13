/**
 * To select which version of the game to have
 */

function setAvailableVersion(){
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
    const loadGameData = document.createElement("script");
    loadGameData.type = "text/javascript";
    loadGameData.src = `gameDataV${$(this).val()}.js`;
    document.body.appendChild(loadGameData)
})