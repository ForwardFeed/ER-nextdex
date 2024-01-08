function feedPanelMoves(moveID){
    const move = gameData.moves[moveID]
    $('#moves-name').text(move.name)
    $('#moves-pwr').text('PWR: ' + move.pwr)
    $('#moves-acc').text('ACC: ' + move.acc)
    $('#moves-chance').text('CHANCE: ' + move.chance)
    $('#moves-pp').text('PP: ' + move.pp)
    $('#moves-prio').text('PRIO: ' + move.prio)
    $('#moves-target').text('' + gameData.targetT[move.target])
    $('#moves-split').text('' + gameData.splitT[move.split])
    $('#moves-types').text('' + move.types.map((x)=>gameData.typeT[x]).join(' '))
    $('#moves-desc').text('' + move.lDesc)
    $('#moves-flags').text('' + move.flags.map((x)=>gameData.flagsT[x]).join(' '))
}

function updateMoves(search){
    
}