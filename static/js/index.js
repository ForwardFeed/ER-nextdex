import setupPanels from "./sidebar.js"
import { setupSpeciesSubPanel } from "./panels/species_panel.js"
import { setAvailableVersion } from "./data_version.js"
import { setupSearch } from "./search.js"
import { addTooltip } from "./utils.js"
import { setupSettings } from "./settings.js"
$(document).ready(function(){
    setupSettings()
    setupPanels()
    setupSpeciesSubPanel()
    setAvailableVersion()
    setupSearch()
    addTooltip($('.main-title')[0], 'Berkay, the dex is up btw')
})