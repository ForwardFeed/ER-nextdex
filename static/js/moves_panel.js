function feedPanelMoves(moveID){
    const move = gameData.moves[moveID]
    $('#moves-name').text(move.name)
    $('#moves-pwr').text(move.pwr || "--")
    $('#moves-acc').text(move.acc)
    $('#moves-chance').text(move.chance)
    $('#moves-pp').text(move.pp)
    $('#moves-prio').text(move.prio)
    $('#moves-target').text('TARGET :' + gameData.targetT[move.target])
    $('#moves-split').attr("src",`./icons/${gameData.splitT[move.split]}.png`);
    $('#moves-types').text('' + move.types.map((x)=>gameData.typeT[x]).join(' '))
    const type1 = gameData.typeT[move.types[0]]
    $('#moves-types1').text(type1).attr("class", type1.toLowerCase())
    if (typeof move.types[1] === "number") {
        const type2 = gameData.typeT[move.types[1]]
        $('#moves-types2').text(type2).attr("class", type2.toLowerCase())
    }
    $('#moves-desc').text('' + move.lDesc)
    listMoveFlags(move.flags.map((x)=>gameData.flagsT[x]))

    $('#moves-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#moves-list').children().eq(moveID - 1).addClass("sel-active").removeClass("sel-n-active")
}

function listMoveFlags(flags){
    const flagMap = {
        "MAKES_CONTACT": "Has contact and Big Pecks boost",
        //"KINGS_ROCK_AFFECTED": "King's rock effective",
        "HIGH_CRIT": "High crits chances",
        "IRON_FIST_BOOST": "Iron fist boost",
        "SHEER_FORCE_BOOST": "Sheer force boost",
        "KEEN_EDGE_BOOST": "Keen edge boost",
        "AIR_BASED": "Giant wings boost",
        "SNATCH_AFFECTED": "Can be snatched",
        "DANCE" : "Dance",
        "ALWAYS_CRIT" :"Always Crit",
        "FIELD_BASED" :"Field Explorer boost",
        "STRIKER_BOOST" :"Striker boost",
        "TWO_STRIKES" :"Hit twice",
        "RECKLESS_BOOST" :"Reckless boost",
        "MAGIC_COAT_AFFECTED" :"Affected by magic coat",
        "HORN_BASED" :"Mighty Horn boost",
        "STRONG_JAW_BOOST" :"Strong Jaw boost",
        "SOUND" :"Is a sound move",
        "MEGA_LAUNCHER_BOOST" :"Mega Launcher Boost",
        "BALLISTIC" :"Is a bullet move",
        "DMG_UNDERWATER" :"Damage foes under water",
        "WEATHER_BASED" :"Changes with the weather",
        "POWDER" :"Power move",
        "DMG_IN_AIR" :"Damages foes in air",
        "DMG_UNDERGROUND" :"Damages foes underground",
        "BONE_BASED" :"Is a bonemove",
        "THAW_USER" :"Unfreeze the user",
        "PROTECTION_MOVE" :"Gives protection to the user",
        "DMG_2X_IN_AIR" :"Damage the foes in air with 2X damage",
        "STAT_STAGES_IGNORED" :"Ignore Stats boost",
        "DMG_UNGROUNDED_IGNORE_TYPE_IF_FLYING" :"",
        "HIT_IN_SUBSTITUTE" :"Hit Throught Substitute",
        "TARGET_ABILITY_IGNORED" :"Target Ability is ignored",
    }
    const NoFlagMap = {
        "PROTECT_AFFECTED": "isn't affected by protect",
        "MIRROR_MOVE_AFFECTED": "cannot be mirrored",
    }
    const core = $('#moves-flags')
    const frag = document.createDocumentFragment()
    for (const flag of flags){
        const descFlag = flagMap[flag]
        if (!descFlag) continue
        const node = document.createElement('div')
        node.innerText = descFlag
        frag.append(node)
    }
    const noFlagArray = Object.keys(NoFlagMap)
    for (const noFlag of noFlagArray){
        if (flags.indexOf(noFlag) != -1) continue
        const descFlag = NoFlagMap[noFlag]
        const node = document.createElement('div')
        node.innerText = descFlag
        frag.append(node)
    }
    core.append(frag)
}

function updateMoves(search){
    const moves = gameData.moves
    const nodeList = $('#moves-list').children()
    let validID;
    for (const i in moves){
        if (i == 0 ) continue
        const move = moves[i]
        const node = nodeList.eq(i - 1)
        if (move.name.toLowerCase().indexOf(search) >= 0 ? true : false)
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    feedPanelMoves(validID || 1) //1 ??
}