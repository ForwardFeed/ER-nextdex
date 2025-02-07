import { buildTrainerPrefixTrees, feedPanelTrainers } from "../panels/trainers_panel.js";

export function hydrateTrainers() {
    // still missing in the data the alternative like for the rivals
    // and it's not ordered (it requires to have an order set manually)
    const frag = document.createDocumentFragment();
    const trainers = gameData.trainers
    //let lastMap = -1
    for (const i in trainers) {
        const trainer = trainers[i]
        trainer.fullName = `${gameData.tclassT[trainer.tclass]} ${trainer.name}`
        //check if it's a new map to add it as a header
        /*if (lastMap != trainer.map){
            lastMap = trainer.map
            const mapDiv = document.createElement('div')
            mapDiv.className = "data-list-row trainer-map-list-name"
            const mapName = document.createElement('span')
            mapName.innerText = gameData.mapsT[trainer.map] || "unknown"
            mapDiv.append(mapName)
            frag.append(mapDiv)
        }*/
        // add to the html list 
        const core = document.createElement('div')
        core.className = "btn data-list-row sel-n-active"
        const name = document.createElement('span')
        name.innerText = trainer.fullName || "unknown"
        core.append(name)
        core.dataset.id = i
        $(core).on('click', function () {
            fastdom.mutate(() => {
                feedPanelTrainers($(this).attr('data-id'))
            });
        });
        frag.append(core)
    }
    $('#trainers-list').empty().append(frag)
    feedPanelTrainers(1)
    buildTrainerPrefixTrees()
}