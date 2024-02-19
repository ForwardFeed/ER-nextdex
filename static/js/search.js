import { updateSpecies,queryMapSpecies } from "./panels/species_panel.js"
import { filterAbilities, queryMapAbilities} from "./panels/abilities_panel.js"
import { updateMoves, queryMapMoves} from "./panels/moves_panel.js"
import { updateLocations, queryMapLocations } from "./panels/locations_panel.js"
import { updateTrainers, queryMapTrainers } from "./panels/trainers_panel.js"
import { activateSearch, appendFilter, spinOnAddFilter} from "./filters.js"
import { clickOutsideToHide } from "./utils.js"

export const search = {
    // memories of all search, to sync with the number of tabs
    searchData: new Array(5).fill(""),
    searchKeys: new Array(5).fill(""),
    // the search guard is here to prevent that while the app is searching
    // no more searching is going, not to overwhelm the app
    updateGuard: false,
    // if a request is done in the mean time, this flag will tell that once it's finished,
    // another request should be scheduled
    updateQueue: false,
    searchIsActive:true,
    // if modified sync it with "siderbar.js > setupPanels() > panelTable" variable
    panelUpdatesTable: [
        updateSpecies,
        filterAbilities,
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
        "category",
        "specie",
        "map",
        "region",
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
        if (this.suggestionNode){
            $(this.suggestionNode).empty()
        }
        this.suggestions = []
        if( this.suggestionNode) this.suggestionNode.dataset.suggestion = null
    },
    showSuggestion: function(){
        if (!this.suggestionNode) return
        if(!this.searchIsActive) {
            this.searchIsActive=true
            this.suggestionInput.blur()
            return
        }
        if(this.suggestions.length == 1){
            this.clearSuggestion()
        }
        this.suggestionNode.innerText = "" //remove all previous suggestions
        for (const suggestion of this.suggestions){
            const option = document.createElement('div')
            option.innerText = suggestion
            option.onclick = ()=>{
                this.suggestionInput.value = suggestion
                this.searchIsActive=false
                activateSearch()
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

export function onkeySearchFilter(ev, divSuggestions, inputSearch, callback){
    search.suggestionNode = divSuggestions
    search.suggestionInput = inputSearch
    // i am required to do this if i want in filters.js > hasFilter()
    // to able to select by HTML attribute, yes it is akward but it works
    inputSearch.setAttribute("value", inputSearch.value)
    divSuggestions.style.display = "block"
    if (search.timeoutAutoComplete) clearTimeout(search.timeoutAutoComplete)
    search.timeoutAutoComplete = setTimeout(()=>{
        divSuggestions.style.display = "none"
    }, 3000) // 3 secs
    if (evKeymap[ev.key] && evKeymap[ev.key]()) return
    callback()
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

export function setupSearch(){
    $('#search-keys').on('change', activateSearch)
    $('#search-bar').on('keyup search', (ev)=>{
        onkeySearchFilter(ev, $('#search-suggestion')[0], $('#search-bar')[0],
        ()=>{
            const callback = ()=>{
                clickOutsideToHide(search.suggestionNode)
                search.suggestionSaved = search.suggestionInput.value
            }
            activateSearch(callback)
        })
    })
    $('#filter-icon').on('click', function(){
        $('#filter-frame').toggle()
    })
    $('#search-keys').on('click', function(ev){
        ev.stopPropagation()
        clickOutsideToHide($('#search-keys-selections')[0], $('#search-keys')[0])
        $('#search-keys-selections').toggle()
    })
    //weird to use onclick here but i have the long click event on it too
    $('#to-filter')[0].onclick = ()=>{
        const data = $('#search-bar').val()
        if (!data) return
        appendFilter(search.panelUpdatesIndex,$('#search-keys').val(), data)
        $('#search-bar').val("")
        spinOnAddFilter()
    }
    for(const operator of search.operators){
        const option = document.createElement('option')
        option.value = operator
        option.innerText =  operator
        $('#filter-main-operator').append(option)
    }
    
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