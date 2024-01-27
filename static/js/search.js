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
        "map",
    ],
    operators: [
        "AND",
        "OR",
        "XOR",
    ],
    defrosting: true,
    callbackAfterFilters: null,
    timeoutAutoComplete: null,
    maxSuggestion: 5,
    suggestions: [],
    suggestionNode: null,
    suggestionInput: null,
    suggestionSaved: "",
    suggestionData: "",
    suggestionPreviousNode: null,
    addSuggestion : function(suggestion){
        if (this.suggestions.length == this.maxSuggestion) return
        if (this.suggestions.includes(suggestion)) return
        if (this.suggestionInput.value === suggestion) return
        this.suggestions.push(suggestion)
    },
    clearSuggestion: function(){
        this.suggestions = []
        if( this.suggestionNode) this.suggestionNode.dataset.suggestion = null
    },
    showSuggestion: function(){
        if (!this.suggestionNode) return
        this.suggestionNode.innerText = "" //remove all previous suggestions
        for (const suggestion of this.suggestions){
            const option = document.createElement('div')
            option.innerText = suggestion
            option.onclick = ()=>{
                this.suggestionInput.value = suggestion
                this.suggestionNode.style.display = "none"
            }
            this.suggestionNode.style.display = "block"
            this.suggestionNode.append(option)
        }
    },
    defrostFuturePanel: function(){
        //tells all panels that once they get to switch in they have to do an update
        search.panelFrozenUpdate = search.panelFrozenUpdate.map((x, index)=>{
            return search.panelUpdatesIndex != index
        })
    }

}
/**
 * Will execute all filters query so far
 */
function executeAllFilters(){
    let allQueries = [{ //this is the top bar search
        op:"AND",
        not: false, //not yet implemented
        k: $('#search-keys').val().toLowerCase(),
        data: $('#search-bar').val().toLowerCase(),
        suggestion: $('#search-bar')[0] === search.suggestionInput
    }]
    
    $('.filter-field').map(function(){
        allQueries.push({
            op:"AND",
            //if you use data('state') jquery util here you're fucked for no acceptable reason
            not: $(this).find('.filter-not')[0].dataset.state === "on" ? true : false,
            k: $(this).find('.filter-key').val().toLowerCase(),
            data: $(this).find('.filter-search').val().toLowerCase(),
            suggestion: $(this).find('.filter-search')[0] === search.suggestionInput
        })
    })
    //filters the empty queries
    allQueries = allQueries.filter((x)=> x.data)
    let finalQuery
    if (allQueries.length == 1){
        // don't wrap the query
        finalQuery = allQueries[0]
    } else {
        // wrap the query
        finalQuery = {
            op: $('#filter-main-operator').val(),
            not: false,
            k: "",
            data: allQueries, 
        }
    }
    //execute the update of the active panel
    search.panelUpdatesTable[search.panelUpdatesIndex](finalQuery)
}

export function activateSearch(callback){
    if (search.defrosting) search.defrostFuturePanel()
    if (search.updateGuard) {
        search.updateQueue = true
        return
    }
    search.updateGuard = true
    while(true){
        fastdom.mutate(() => {
            search.clearSuggestion()
            executeAllFilters()
            search.showSuggestion()
            if (callback) callback()
            /** Because the function is async
             *  I sometimes need to ensure a function is right after the 
             *  filtering has finished
             */
            if (search.callbackAfterFilters) {
                search.callbackAfterFilters()
                search.callbackAfterFilters = null
            }
        })
        if (!search.updateQueue) break
        search.updateQueue = false
    }
    search.updateGuard = false    
}
/**
 * will work as long no future event.stop propagation is written in the code
 */

function clickOutsideToRemoveList(htmlNodeToHide, htmlNodeClickedOn){
    const clickToHide = (ev)=>{
        if (htmlNodeClickedOn == ev.target) return 
        htmlNodeToHide.style.display = "none"
        $(document).off('click', clickToHide)
    }
    $(document).on('click', clickToHide)
}

// non-text key that affect the searching bar 
// made for the suggestion system
const evKeymap = {
    /*"Backspace": ()=>{
        if (!inputSearch.placeholder){
            inputSearch.placeholder = "Delete filter with backspace"
        } else {
            divField.remove()
        }
    },*/
    "Enter": ()=>{
        search.suggestionNode.style.display = "none"
        if (search.suggestionData) search.suggestionInput.value = search.suggestionData
    },
    "ArrowUp": ()=>{
        let preValue = +search.suggestionNode.dataset.suggestion
        if (isNaN(preValue)) preValue = 0
        const value = (preValue ? preValue : search.maxSuggestion ) -1
        const suggestionSelected = search.suggestions[value]
        if (suggestionSelected && search.suggestionNode.children.length > value) {
            search.suggestionData = suggestionSelected
            if (search.suggestionPreviousNode) search.suggestionPreviousNode.className = ""
            const node = search.suggestionNode.children[value]
            node.className = "filter-option-selected"
            search.suggestionNode.dataset.suggestion = value
            search.suggestionPreviousNode = node
        }
        return true
    },  
    "ArrowDown": ()=>{
        let preValue = +search.suggestionNode.dataset.suggestion
        if (isNaN(preValue)) preValue = search.maxSuggestion - 1
        const value = (preValue + 1) % search.maxSuggestion
        const suggestionSelected = search.suggestions[value]
        if (suggestionSelected && search.suggestionNode.children.length > value) {
            search.suggestionData = suggestionSelected
            if (search.suggestionPreviousNode) search.suggestionPreviousNode.className = ""
            const node = search.suggestionNode.children[value]
            node.className = "filter-option-selected"
            search.suggestionNode.dataset.suggestion = value
            search.suggestionPreviousNode = node
        }
        return true //means don't activate the search
    },
    "ArrowRight": ()=>{
        // use first active Selection
        const suggestionSelected = search.suggestions[search.suggestionNode.dataset.suggestion]
        if (suggestionSelected) search.suggestionInput.value = suggestionSelected
    },
    "ArrowLeft": ()=>{
        // return to prio value before selection
        search.suggestionNode.dataset.suggestion = "0"
        search.suggestionInput.value = search.suggestionSaved
    },
}

function onkeySearchFilter(ev, divSuggestions, inputSearch){
    search.suggestionNode = divSuggestions
    search.suggestionInput = inputSearch
    divSuggestions.style.display = "block"
    if (search.timeoutAutoComplete) clearTimeout(search.timeoutAutoComplete)
    search.timeoutAutoComplete = setTimeout(()=>{
        divSuggestions.style.display = "none"
    }, 3000) // 3 secs
    if (evKeymap[ev.key] && evKeymap[ev.key]()) return
    const callback = ()=>{
        clickOutsideToRemoveList(search.suggestionNode)
        search.suggestionSaved = search.suggestionInput.value
    }
    activateSearch(callback)
}

export function setupSearch(){
    $('#search-keys').on('change', activateSearch)
    $('#search-bar').on('keyup search', (ev)=>{
        onkeySearchFilter(ev, $('#search-suggestion')[0], $('#search-bar')[0])
    })
    $('#filter-icon').on('click', function(){
        $('#filter-frame').toggle()
    })
    $('#search-keys').on('click', function(ev){
        ev.stopPropagation()
        clickOutsideToRemoveList($('#search-keys-selections')[0], $('#search-keys')[0])
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
        const option = document.createElement('div')
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
        const option = document.createElement('div')
        option.innerText = key
        option.onclick = ()=>{
            inputKey.value = key
            $(divKeySelection).hide()
            activateSearch()
        }
        divKeySelection.append(option)
    }

    inputKey.onclick = (ev) =>{
        $(divKeySelection).show()
        //ev.stopPropagation()
        clickOutsideToRemoveList(divKeySelection, inputKey)
    }

    const divLabel = document.createElement('label')
    divLabel.className = "filter-label"
    divField.append(divLabel)

    const inputSearch = document.createElement('input')
    inputSearch.className = "filter-search"
    inputSearch.type = "search"
    inputSearch.onclick = ()=>{
        if (search.suggestionNode) search.suggestionNode.style.display = "none"
        search.suggestionNode = divSuggestions
    }
    divLabel.append(inputSearch)

    const divSuggestions = document.createElement('div')
    divSuggestions.style.display = "none"
    divSuggestions.className = "filter-suggestions"
    divLabel.append(divSuggestions)

    inputSearch.onkeyup = (ev)=>{onkeySearchFilter(ev, divSuggestions, inputSearch)}

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
 * @returns {string} what did it matched
 * 
 * @typedef {Object.<string, searchAssertion>} SearchMap
 * 
 * @typedef {Object} QueryElements
 * 
 * @typedef {Object} Query - a query
 * @property {string} op - Operation to do to all direct sub element
 * @property {keyof SearchMap} k - a key for the searchmap
 * @property {Query} queryData - data of the query
 * @property {boolean} suggestion - should it add to suggestions?
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
            const answer = queryFilter(subQuery, data, keymap)
            if (query.suggestion && answer) {
                search.addSuggestion(answer)
            }
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
        const execFn = keymap[query.k]
        if (execFn) {
            const answer = execFn(query.data, data)
            const isValid = queryNot(query.not, answer)
            if (query.suggestion && isValid) {
                search.addSuggestion(answer)
            }
            return isValid

        }
        else return true // true i suppose?
    }
}