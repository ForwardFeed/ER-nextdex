function setupPanels(){
    const panelTable = [
        ["#btn-species", "#panel-species"],
        ["#btn-abis", "#panel-abis"],
        ["#btn-moves", "#panel-moves"],
        ["#btn-locations", "#panel-locations"],
    ]
    for (const btnPanel of panelTable){
        $(btnPanel[0]).on('click', ()=>{
            const curBtn = $('.btn-active')
            curBtn.addClass('btn-n-active')
            curBtn.removeClass('btn-active')
            $(btnPanel[0]).removeClass('btn-n-active')
            $(btnPanel[0]).addClass('btn-active')

            const curPan = $('.active-panel')
            curPan.removeClass('active-panel')
            curPan.toggle()
            $(btnPanel[1]).addClass('active-panel')
            $(btnPanel[1]).toggle()
        })
        $(btnPanel[1]).toggle()
    }
    const defaultShow = 3
    const defaultPanel = $(panelTable[defaultShow][1])
    defaultPanel.addClass('active-panel')
    defaultPanel.toggle()
}