function setupPanels(){
    const panelTable = [
        ["#btn-abis", "#panel-abis"],
        ["#btn-moves", "#panel-moves"],
        ["#btn-species", "#panel-species"],
    ]
    for (const btnPanel of panelTable){
        $(btnPanel[0]).on('click', ()=>{
            const curPan = $('.active-panel')
            curPan.removeClass('active-panel')
            curPan.toggle()
            $(btnPanel[1]).addClass('active-panel')
            $(btnPanel[1]).toggle()
        })
        $(btnPanel[1]).toggle()
    }
    const defaultShow = 2
    const defaultPanel = $(panelTable[defaultShow][1])
    defaultPanel.addClass('active-panel')
    defaultPanel.toggle()
}