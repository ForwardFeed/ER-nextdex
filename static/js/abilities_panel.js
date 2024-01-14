export function updateAbilities(search){
    const abis = gameData.abilities
    const nodeList = $('#abis-list').children()
    for (const i in abis){
        if (i == 0 ) continue
        const abi = abis[i]
        const node = nodeList.eq(i - 1)
        if (abi.name.toLowerCase().indexOf(search) >= 0 ? true : false ||
            abi.desc.toLowerCase().indexOf(search) >= 0 ? true : false)
        {
                node.show()
        } else {
                node.hide()
        }
    }
}