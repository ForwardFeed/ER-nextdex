import { search, onkeySearchFilter } from "./search.js"
import { e, JSHAC, clickOutsideToRemove } from "./utils.js"

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


export function appendFilter(initKey = "", initData = ""){  
    const divField = e("div", "filter-field")

    const divNot = e("div", "filter-not", "¿?")
    divNot.type = "button"
    divNot.dataset.state = "off"

    const divKeyWrapper = e("div", "filter-key-wrapper")

    const inputKey = e('input', "filter-key")
    inputKey.type = "button"
    inputKey.value = initKey || search.queryKeys[0] || "Name"
    inputKey.onchange = activateSearch

    const divKeySelection = e('div', "filter-key-selection")
    divKeySelection.style.display = "none"

    const createSelectable = (key)=>{
        const option = e('div','', key)
        option.onclick = ()=>{
            inputKey.value = key
            $(divKeySelection).hide()
            activateSearch()
        }
        return option
    }

    const divLabel = e('label', "filter-label")

    const inputSearch = e('input', "filter-search")
    inputSearch.type = "search"
    inputSearch.value = initData

    const divSuggestions = e('div', "filter-suggestions")
    divSuggestions.style.display = "none"

    const divRemove = e('div', "filter-remove", "X")

    const frag = JSHAC([
        divField, [
            divNot,
            divKeyWrapper, [
                inputKey,
                divKeySelection,
                search.queryKeys.map(createSelectable)
            ],
            divLabel, [
                inputSearch,
                divSuggestions
            ],
            divRemove

        ]
    ])
    
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

    inputKey.onclick = () =>{
        $(divKeySelection).show()
        //ev.stopPropagation()
        clickOutsideToRemove(divKeySelection, inputKey)
    }

    inputSearch.onclick = ()=>{
        if (search.suggestionNode) search.suggestionNode.style.display = "none"
        search.suggestionNode = divSuggestions
    }

    inputSearch.onkeyup = (ev)=>{onkeySearchFilter(ev, divSuggestions, inputSearch)}

    divRemove.onclick = ()=>{
        divField.remove()
        activateSearch()
    }
    
    $('#filter-data').find('.filter-add').before(frag)
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

export function setupFilters(){
    $('#filter-clear-all').on('click', function(){
        $(this).closest('.filter-panel').find('.filter-field').remove()
        activateSearch()
    })
    $('.filter-help-btn').on('click', function(){
        $('#filter-help').toggle()
        $('.filter-panel').toggle()
    })

    $('.filter-add').on('click', function(){
        appendFilter()
    })

    $('#filter-main-operator').on('change', function(){
        activateSearch()
    })
}

