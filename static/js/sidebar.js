import { search, updateMainSearchKey} from "./search.js"
import { activateSearch } from "./filters.js"
import { capitalizeFirstLetter } from "./utils.js"

export function setupPanels(){
    // if modified sync it with "search.js > search > panelUpdatesTable" variable
    const panelTable = [
        ["#btn-species", "#panel-species", "#species-data", "#builder-data"],
        ["#btn-abis", "#panel-abis"],
        ["#btn-moves", "#panel-moves"],
        ["#btn-locations", "#panel-locations"],
        ["#btn-trainers", "#panel-trainers"]
    ]
    
    for (const i in panelTable){
        const btnPanel = panelTable[i]
        $(btnPanel[0]).on('click', ()=>{
            const curBtn = $('aside .btn-active')
            const btn = $(btnPanel[0])
            const panel = $(btnPanel[1])
            if (curBtn[0] === btn[0]){
                if (!btnPanel[2]) return
                // modify the button inner text
                const small = btn.find('.small-select')
                const big = btn.find('.big-select')
                small[0].className = "big-select"
                big[0].className = "small-select"
                small.insertBefore(big)
                // changes the data panel
                $(btnPanel[2]).toggle()
                $(btnPanel[3]).toggle()
                return
            }

            curBtn.addClass('btn-n-active')
            curBtn.removeClass('btn-active')
            
            btn.removeClass('btn-n-active')
            btn.addClass('btn-active')

            const curPan = $('.active-panel')
            curPan.removeClass('active-panel')
            curPan.toggle()
            panel.addClass('active-panel')
            panel.toggle()
            
            // tell the search only to update this
            search.panelUpdatesIndex = i
            //if an update was caused when this pannel was frozen
            if (search.panelFrozenUpdate[i]){
                search.defrosting = false
                fastdom.mutate(() => {
                    //then refresh in the next frame
                    activateSearch()
                    //and tell this pannel has done the required search
                    search.panelFrozenUpdate[i] = false
                    updateMainSearchKey(search.queryMapList[i])
                    search.defrosting = true
                })
            } else if (search.callbackAfterFilters) {
                search.callbackAfterFilters()
                search.callbackAfterFilters = null
            }
            // restore previous search on this panel
            $('#search-bar').val(search.searchData[search.panelUpdatesIndex])
            // restore previous key on this panel or adapt the query key to the first available
            updateMainSearchKey(search.queryMapList[i])
            $('#search-keys').val(search.searchKeys[search.panelUpdatesIndex] ||
                capitalizeFirstLetter(Object.keys(search.queryMapList[i])[0]))
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