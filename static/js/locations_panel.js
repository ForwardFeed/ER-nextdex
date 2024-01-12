function feedPanelLocations(mapID){
    const map = gameData.locations.maps[mapID]
    const xrateTable = [
        "land",
        "water",
        "fish",
        "honey",
        "rock",
        "hidden",
    ]
    for (const rateName of xrateTable){
        const rates = map[rateName]
        const node = $('#locations-' + rateName)
        if (!rates) {
            node.parent().hide()
            continue
        }
        node.parent().show()
        console.log(rateName)
        for (const i in rates){
            const rate = rates[i]
            node.children().eq(i).find('.location-specie').text(gameData.species[rate[2]].name)
            node.children().eq(i).find('.location-lvl').text(rate[0] + "-" + rate[1])
        }
    }
    $('#locations-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#locations-list').children().eq(mapID).addClass("sel-active").removeClass("sel-n-active")
}

function updateLocations(search){
    const maps = gameData.locations.maps
    const nodeList = $('#locations-list').children()
    let validID;
    for (const i in maps){
        const map = maps[i]
        const node = nodeList.eq(i)
        if (map.name.toLowerCase().indexOf(search) >= 0 ? true : false)
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    feedPanelLocations(validID || 0)
}