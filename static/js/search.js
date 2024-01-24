import { updateSpecies,queryMapSpecies } from "./panels/species_panel.js"
import { updateAbilities, queryMapAbilities} from "./panels/abilities_panel.js"
import { updateMoves, queryMapMoves} from "./panels/moves_panel.js"
import { updateLocations, queryMapLocations } from "./panels/locations_panel.js"
import { updateTrainers, queryMapTrainers } from "./panels/trainers_panel.js"


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
    // !IMPORTANT sync it with search.panelUpdatesTable
    queryMapList: [
        queryMapSpecies,
        queryMapAbilities,
        queryMapMoves,
        queryMapLocations,
        queryMapTrainers
    ],
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
        "specie",
    ],
    operators: [
        "AND",
        "OR",
        "XOR",
    ],
    maxSuggestion: 5,
    suggestions: [],
    suggestionNode: null,
    suggestionInput: null,
    suggestionSaved: "",
    addSuggestion : function(suggestion){
        if (this.suggestions.length == this.maxSuggestion) return
        if (this.suggestions.includes(suggestion)) return
        this.suggestions.push(suggestion)
    },
    clearSuggestion: function(){
        this.suggestions = []
    },

}
/**
 * Will execute all filters query so far
 */
function executeAllFilters(){
    const allQueries = [{ //this is the top bar search
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
    if(megaQuery.data.length<1) megaQuery.op="AND"
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
            if (!search.suggestionNode) return
            search.suggestionNode.innerText = "" //remove all previous suggestions
            for (const suggestion of search.suggestions){
                const option = document.createElement('option')
                option.innerText = suggestion
                option.onclick = ()=>{
                    search.suggestionInput.value = suggestion
                    search.suggestionNode.style.display = "none"
                }
                search.suggestionNode.style.display = "block"
                search.suggestionNode.append(option)
            }
        })
        if (!search.updateQueue) break
        search.updateQueue = false
    }
    search.updateGuard = false    
}

function clickOutsideToRemoveList(){
    const clickToHide = (ev)=>{
        console.log(ev.target)
        search.suggestionNode.style.display = "none"
        $(document).off('click', clickToHide)
    }
    $(document).on('click', clickToHide)
}

export function setupSearch(){
    $('#search-keys').on('change', activateSearch)
    $('#search-bar').on('keyup search', (ev)=>{
        activateSearch()
        search.suggestionNode = $('#search-suggestion')[0]
        search.suggestionInput = $('#search-bar')[0]
        if (evKeymap[ev.key]){
            evKeymap[ev.key]()
            // reacted to a non-text key
            return
        }
        clickOutsideToRemoveList()
        search.suggestionSaved = search.suggestionInput.value
        search.clearSuggestion()
    })
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
    $('.filter-help-btn').on('click', function(){
        $('#filter-help').toggle()
        $('.filter-panel').toggle()
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
            activateSearch()
        }
        keyNode.append(option)
    }
    updateMainSearchKey(search.queryMapList[search.panelUpdatesIndex])
}

// non-text key that affect the searching bar 
// made for the suggestion systeme
const evKeymap = {
    /*"Backspace": ()=>{
        if (!inputSearch.placeholder){
            inputSearch.placeholder = "Delete filter with backspace"
        } else {
            divField.remove()
        }
    },*/
    "ArrowUp": ()=>{
        let value = +search.suggestionNode.dataset.suggestion
        search.suggestionNode.dataset.suggestion = (value ? value : search.maxSuggestion ) -1
        const suggestionSelected = search.suggestions[search.suggestionNode.dataset.suggestion]
        if (suggestionSelected) search.suggestionInput.value = suggestionSelected
    },  
    "ArrowDown": ()=>{
        search.suggestionNode.dataset.suggestion = (+search.suggestionNode.dataset.suggestion + 1) % search.maxSuggestion
        const suggestionSelected = search.suggestions[search.suggestionNode.dataset.suggestion]
        if (suggestionSelected) search.suggestionInput.value = suggestionSelected
    },
    "ArrowRight": ()=>{
        // use first active Selection
        const suggestionSelected = search.suggestions[search.suggestionNode.dataset.suggestion]
        if (suggestionSelected) search.suggestionInput.value = suggestionSelected
    },
    "ArrowLeft": ()=>{
        // return to prio value before selection
        search.suggestionInput.value = search.suggestionSaved
    },
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

    const divKeySelection = document.createElement('div')
    divKeySelection.className = "filter-key-selection"
    divKeySelection.style.display = "none"
    divKeyWrapper.append(divKeySelection)
    for (const key of search.queryKeys){
        const option = document.createElement('option')
        option.innerText = key
        option.onclick = ()=>{
            inputKey.value = key
            $(divKeySelection).toggle()
            $(inputKey).toggle()
            activateSearch()
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
    divLabel.append(inputSearch)

    const divSuggestions = document.createElement('div')
    divSuggestions.style.display = "none"
    divSuggestions.className = "filter-suggestions"
    divSuggestions.dataset.suggestion = 0
    divLabel.append(divSuggestions)

    let timeoutAutoComplete
    inputSearch.onkeyup = (ev)=>{
        divSuggestions.style.display = "block"
        if (timeoutAutoComplete) clearTimeout(timeoutAutoComplete)
        timeoutAutoComplete = setTimeout(()=>{
            divSuggestions.style.display = "none"
        }, 3000) // 3 secs
        activateSearch()
        search.suggestionNode = divSuggestions
        search.suggestionInput = inputSearch
        if (evKeymap[ev.key]){
            evKeymap[ev.key]()
            // reacted to a non-text key
            return
        }
        search.suggestionSaved = search.suggestionInput.value
        search.clearSuggestion()
        // due to the async nature of activate search
        // the first letter and the first letters if typed quickly won't have a suggestion
    }

    const divRemove = document.createElement('div')
    divRemove.className = "filter-remove"
    divRemove.innerText = "X"
    divRemove.style.color = "red"
    divRemove.onclick = ()=>{
        divField.remove()
        activateSearch()
    }
    divField.append(divRemove)

    $('#filter-data').find('.filter-add').before(divField)
}


export function updateMainSearchKey(queryMap){
    const nodes = $('#search-keys-selections').children()
    let validID = null
    search.queryKeys.forEach((key, index)=>{
        key = key.toLowerCase()
        if (queryMap[key]){
            if (validID === null) validID = index
            
            nodes.eq(index).show()
        } else {
            nodes.eq(index).hide()
        }
    })
    if (validID) {
        $('#search-keys').val(nodes.eq(validID).text())
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
        } else { //Default ANDk
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