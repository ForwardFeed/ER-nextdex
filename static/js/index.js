import setupPanels from "./sidebar.js"
import { setupSpeciesPanel } from "./panels/species/species_panel.js"
import { setupDataVersionning, changeVersion } from "./data_version.js"
import { initSearch, setupSearch } from "./search.js"
import { addTooltip } from "./utils.js"
import { setupSettings, fetchFromLocalstorage } from "./settings.js"
import { setupFilters } from "./filters.js"
import { setupTeamBuilder } from "./panels/team_builder.js"
import { activateInsanity } from "./insanity.js"
import { setupMoves} from "./panels/moves_panel.js"
import { load } from "./loading.js"
import { setupFormatShowdown } from "./format_showdown.js"
import { setupLoadSave } from "./load_save.js"


document.addEventListener("DOMContentLoaded", function(){
    load(()=>{}, "start")
    const setupSteps = [
        [setupSettings, "settings"],
        [initSearch, "init search"],
        [setupPanels, "side bar"],
        [setupMoves, "panel moves"],
        [setupSpeciesPanel, "panel species"],
        [setupTeamBuilder, "panel builder"], // the team builder BEFORE data version is Important
        [setupSearch, "search frame"],
        [setupFilters, "filter frame"],
        [setupFormatShowdown, "Showdown format"],
        [setupLoadSave, "save loader"],
        [()=>{setupDataVersionning(true)}, "gamedata loader"],
    ]
    for (const step of setupSteps){
        load(step[0], step[1])
    }
    //misc
    setupHeader()
    $('#insanity').on('click', activateInsanity)    
})


function setupHeader(){
    let showOrNot = true, timeout, isClick = false
    let startY
    $(document).on('touchstart', (ev)=>{
        startY = ev.originalEvent.changedTouches[0].clientY
    })
    $(document).on('touchend', (ev)=>{
        const delta = ev.originalEvent.changedTouches[0].clientY - startY
        isClick = true
        if (delta == 0 ) return
        if (delta < 0){ //bot -> top
            if (delta * 2 < -document.body.clientHeight){ //50%
                if (!showOrNot) return
                showOrNot = false
            }
        } else if (delta * 2 > document.body.clientHeight){ //50%~
            if (showOrNot) return
            showOrNot = true
        } else {
            return
        }
        showOrNot ? $('#top-header, #search-wrapper').show() : $('#top-header, #search-wrapper').hide()
    })
    /*let heightTrigger = 0
    $('#top-header, #search-wrapper').toArray().map(x => heightTrigger += x.clientHeight + 2)
    $(document).on('mousemove', (ev) => {
        if (isClick){ // before fucking mousemove is triggered by touchend F U
            isClick = false
            return
        }
        const y = ev.originalEvent.clientY
        if (showOrNot){
            if (y > document.body.clientHeight / 2){
                showOrNot = false
                clearTimeout(timeout)
            } else {return}
        } else {
            if (y < heightTrigger){
                showOrNot = true
                clearTimeout(timeout)
            } else {return}
        }
        timeout = setTimeout(()=>{
            showOrNot ? $('#top-header, #search-wrapper').show("1000") : $('#top-header, #search-wrapper').hide()
        }, 300) // time for the pointer to stay in the zone
         
    })*/
    
}