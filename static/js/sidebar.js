import { search , activateSearch, updateMainSearchKey} from "./search.js"
//import { capitalizeFirstLetter } from "./utils.js"

export function setupPanels(){
    // if modified sync it with "search.js > search > panelUpdatesTable" variable
    const panelTable = [
        ["#btn-species", "#panel-species"],
        ["#btn-abis", "#panel-abis"],
        ["#btn-moves", "#panel-moves"],
        ["#btn-locations", "#panel-locations"],
        ["#btn-trainers", "#panel-trainers"]
    ]
    for (const i in panelTable){
        const btnPanel = panelTable[i]
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
            
            // tell the search only to update this
            search.panelUpdatesIndex = i
            //if an update was caused when this pannel was frozen
            if (search.panelFrozenUpdate[i]){
                fastdom.mutate(() => {
                    //then refresh in the next frame
                    activateSearch()
                    //and tell this pannel has done the required search
                    search.panelFrozenUpdate[i] = false
                    updateMainSearchKey(search.queryMapList[i])
                })
            } else if (search.callbackAfterFilters) {
                search.callbackAfterFilters()
                search.callbackAfterFilters = null
            }
            // adapt the query key to the first available
            /*const defaultKey = capitalizeFirstLetter(Object.keys(search.queryMapList[i])[0])
            $('#search-keys').val(defaultKey)*/
        })
        $(btnPanel[1]).toggle()
    }
    // if modified sync it with "search.js > search > panelUpdatesIndex" variable
    const defaultShow = 0
    const defaultPanel = $(panelTable[defaultShow][1])
    defaultPanel.addClass('active-panel')
    defaultPanel.toggle()
}

export default setupPanels