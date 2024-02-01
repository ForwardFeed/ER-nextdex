import setupPanels from "./sidebar.js"
import { setupSpeciesPanel } from "./panels/species_panel.js"
import { setAvailableVersion } from "./data_version.js"
import { setupSearch } from "./search.js"
import { addTooltip } from "./utils.js"
import { setupSettings } from "./settings.js"
import { setupFilters } from "./filters.js"
import { setupTeamBuilder } from "./panels/team_builder.js"
import { activateInsanity } from "./insanity.js"

$(document).ready(function(){
    setupSettings()
    setupPanels()
    setupSpeciesPanel()
    setAvailableVersion()
    setupSearch()
    setupFilters()
    setupTeamBuilder()
    addTooltip($('.main-title')[0], 'Berkay, the dex is up btw')
    $('#insanity').on('click', activateInsanity)
})