import { updateSpecies } from "./species_panel.js"
import { updateAbilities} from "./abilities_panel.js"
import { updateMoves } from "./moves_panel.js"
import { updateLocations } from "./locations_panel.js"

export const search = {
    // the search guard is here to prevent that while the app is searching
    // no more searching is going, not to overwhelm the app
    updateGuard: false,
    // if a request is done in the mean time, this flag will tell that once it's finished,
    // another request should be scheduled
    updateQueue: false,
    // if modified sync it with "siderbar.js > setupPanels() > panelTable" variable
    panelUpdatesTable: [
        updateSpecies,
        updateAbilities,
        updateMoves,
        updateLocations,
    ],
    // 
    // if modified sync it with "siderbar.js > setupPanels() > panelTable" variable
    panelFrozenUpdate: [
        false,
        false,
        false,
        false,
    ],
    // if modified sync it with "siderbar.js > setupPanels() > defaultShow" variable
    panelUpdatesIndex: 0 
}

export function setupSearch(){
    $('#main-search').on('keyup', function(){
        $(this).val($(this).val().toLowerCase())
        const searchValue = $(this).val()
        if (search.updateGuard) {
            search.updateQueue = true
            return
        }
        search.updateGuard = true
        while(true){
            fastdom.mutate(() => {
                //tells all panels that once they get to switch in they have to do an update
                search.panelFrozenUpdate = search.panelFrozenUpdate.map((x, index)=>{
                    return search.panelUpdatesIndex != index
                })
                //execute the update of the active panel
                search.panelUpdatesTable[search.panelUpdatesIndex](searchValue)
            })
            if (!search.updateQueue) break
            search.updateQueue = false
        }
        search.updateGuard = false    
    })
    
    $('#filter-icon').on('click', function(){
        //$('#filter-data').toggle()
        console.log('nope, not ready yet')
    })
}
