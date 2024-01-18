import { updateSpecies } from "./species_panel.js"
import { updateAbilities} from "./abilities_panel.js"
import { updateMoves } from "./moves_panel.js"
import { updateLocations } from "./locations_panel.js"
import { updateTrainers } from "./trainers_panel.js"

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
        updateTrainers,
    ],
    // 
    // if modified sync it with "siderbar.js > setupPanels() > panelTable" variable
    panelFrozenUpdate: [
        false,
        false,
        false,
        false,
        false,
    ],
    // if modified sync it with "siderbar.js > setupPanels() > defaultShow" variable
    panelUpdatesIndex: 0,
    // if any pannel needs a special key you need to append it here
    queryKeys: [
        "name",
        "type",
        "ability",
    ]
}

export function setupSearch(){
    $('#search-bar, #search-keys').on('keyup search', function(){
        $('#search-bar').val($('#search-bar').val().toLowerCase())
        const queryData = $('#search-bar').val()
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
                const query = {
                    op:"OR", // default yet not introduced
                    not: false, //not yet implemented
                    k: $('#search-keys').val(),
                    data: queryData
                }
                search.panelUpdatesTable[search.panelUpdatesIndex](query)
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
    $('#search-keys').on('click', function(){
        $('#search-keys-selections').toggle()
    })
    const keyNode = $('#search-keys-selections')
    for (const key of search.queryKeys){
        const option = document.createElement('option')
        option.innerText = key
        option.onclick = ()=>{
            $('#search-keys').val(key)
            $('#search-keys-selections').toggle()
        }
        keyNode.append(option)
    }
}



/**
 * @callback searchAssertion
 * @param {unknow} data
 * @param {string} queryData
 *  
 * @returns {boolean} did it matched?
 * 
 * @typedef {Object.<string, searchAssertion>} SearchMap
 * 
 * @typedef {Object} QueryElements
 * 
 * @typedef {Object} Query - a query
 * @property {string} op - Operation to do to all direct sub element
 * @property {keyof SearchMap} k - a key for the searchmap
 * @property {Query} queryData - data of the query
 * @param {boolean} [not=false] - should it not match
 * 
 * @property {string} queryData - string to compare it to the data
 * 
 * @param {Query|Query[]} query - a query or multiple to resolve against the data thanks to the keymap
 * @param {Object} data - the data to query on
 * @param {SearchMap} keymap - a map with key (k) which points to a function return a function
 * @returns {boolean} - did the object matched?
 */
//! NOT READY YET <= in cooking
export function queryFilter(query, data, keymap){
    const queryNot = (notFlag, value) => {
        return notFlag ? !value : value
    }

    if (query.constructor === Array){
        //'break it down until it is no longer an array and solve using the parent op'
        const subQueriesAnswer = []
        for (const subQuery of query){
            subQueriesAnswer.push(query(subQuery, data, keymap))
        }
        if (query.op === "XOR"){
            let flag = false
            for (const answer of subQueriesAnswer){
                if (flag == true && answer) return queryNot(query.not, false)
                if (answer) flag = true
            }
            return queryNot(query.not, flag)
        } else if (query.op === "OR"){
            for (const answer of subQueriesAnswer){
                if (answer) return queryNot(query.not, true)
            }
            return queryNot(query.not, false)
        } else { //Default AND
            for (const answer of subQueriesAnswer){
                if (!answer) queryNot(query.not, false)
            }
            return queryNot(query.not, true)
        }
    } else {
        //we can break this one down'
        const execFn = keymap[query.k]
        if (execFn) {
            return query.not ? !execFn(query.data, data) : execFn(query.data, data)
        }
        else return true // true i suppose?
    }
    

}