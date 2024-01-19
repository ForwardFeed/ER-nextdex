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
        "Name",
        "Type",
        "Ability",
        "Move",
        "Move-effect",
    ],
    operators: [
        "OR",
        "AND",
        "XOR",
    ]
}
/**
 * Will execute all filters query so far
 */
function executeAllFilters(){
    const allQueries = [{
        op:"AND",
        not: false, //not yet implemented
        k: $('#search-keys').val().toLowerCase(),
        data: $('#search-bar').val().toLowerCase()
    }]
    $('.filter-field').each(function(){ 
        allQueries.push({
            op:"AND",
            //if you use data('state') jquery util here you're fucked for no acceptable reason
            not: $(this).find('.filter-not')[0].dataset.state === "on" ? true : false,
            k: $(this).find('.filter-key').val().toLowerCase(),
            data: $(this).find('.filter-search').val().toLowerCase()
        })
    })
    // set everything into a big AND //TODO implement the UI change for that
    const megaQuery = {
        op: $('#filter-main-operator').val(),
        not: false,
        k: "",
        data: allQueries.filter((x)=> x.data) //filters the empty query 
    }
    //execute the update of the active panel
    search.panelUpdatesTable[search.panelUpdatesIndex](megaQuery)
}

export function activateSearch(){
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
            executeAllFilters()
        })
        if (!search.updateQueue) break
        search.updateQueue = false
    }
    search.updateGuard = false    
}

export function setupSearch(){
    $('#search-bar, #search-keys').on('keyup search', activateSearch)
    
    $('#filter-icon').on('click', function(){
        $('#filter-frame').toggle()
    })
    $('#search-keys').on('click', function(){
        $('#search-keys-selections').toggle()
    })
    $('.filter-add').on('click', function(){
        appendFilter()
    })
    $('#filter-clear-all').on('click', function(){
        $(this).closest('.filter-panel').find('.filter-field').remove()
        activateSearch()
    })
    for(const operator of search.operators){
        const option = document.createElement('option')
        option.value = operator
        option.innerText =  operator
        $('#filter-main-operator').append(option)
    }
    $('#filter-main-operator').on('change', function(){
        activateSearch()
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

function appendFilter(){    
    const divField = document.createElement('div')
    divField.className = "filter-field"

    const divNot = document.createElement('div')
    divNot.className = "filter-not"
    divNot.innerText = "¿?"
    divNot.type = "button"
    divNot.dataset.state = "off"
    divField.append(divNot)

    const divKeyWrapper = document.createElement('div')
    divKeyWrapper.className = "filter-key-wrapper"
    divField.append(divKeyWrapper)

    const inputKey = document.createElement('input')
    inputKey.className = "filter-key"
    inputKey.type = "button"
    inputKey.value = search.queryKeys[0] || "Name"
    inputKey.onchange = activateSearch
    divKeyWrapper.append(inputKey)

    divNot.onclick = ()=>{
        if (divNot.dataset.state === "off"){
            divNot.dataset.state = "on"
            divNot.classList.add('filter-not-not')
            inputKey.classList.add('filter-not-not')
        } else {
            divNot.dataset.state = "off"
            divNot.classList.remove('filter-not-not')
            inputKey.classList.remove('filter-not-not')
        }
        activateSearch()
    }

    const divAbsolute = document.createElement('div')
    divAbsolute.className = "filter-key-absolute"
    divKeyWrapper.append(divAbsolute)

    const divKeySelection = document.createElement('div')
    divKeySelection.className = "filter-key-selection"
    divKeySelection.style.display = "none"
    divAbsolute.append(divKeySelection)
    for (const key of search.queryKeys){
        const option = document.createElement('option')
        option.innerText = key
        option.onclick = ()=>{
            inputKey.value = key
            $(divKeySelection).toggle()
            $(inputKey).toggle()
        }
        divKeySelection.append(option)
    }

    inputKey.onclick = () =>{
        $(divKeySelection).toggle()
        $(inputKey).toggle()
    }

    const divLabel = document.createElement('label')
    divLabel.className = "filter-label"
    divField.append(divLabel)

    const inputSearch = document.createElement('input')
    inputSearch.className = "filter-search"
    inputSearch.type = "search"
    inputSearch.onkeyup = activateSearch
    divLabel.append(inputSearch)

    const divRemove = document.createElement('div')
    divRemove.className = "filter-remove"
    divRemove.innerText = "X"
    divRemove.style.color = "red"
    divRemove.onclick = ()=>{
        divField.remove()
    }
    divField.append(divRemove)

    $('#filter-data').find('.filter-add').before(divField)
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
    if (query.data.constructor === Array){
        //'break it down until it is no longer an array and solve using the parent op'
        const subQueriesAnswer = []
        for (const subQuery of query.data){
            subQueriesAnswer.push(queryFilter(subQuery, data, keymap))
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
                if (!answer) return queryNot(query.not, false)
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