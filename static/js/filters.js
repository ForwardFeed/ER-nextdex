import { search, onkeySearchFilter } from "./search.js"
import { e, JSHAC, clickOutsideToHide, setLongClickSelection } from "./utils.js"
import { setAllMoves } from "./panels/species_panel.js"
import { capitalizeFirstLetter } from "./utils.js"
// Sync it with search.js => panelUpdatesTable
export const filterDatas = [
    {
        name: "Species",
        filters: [],
        modify: function(){
            trickFilterSearch(0)
        },
    },
    {
        name: "Abilities",
        filters: [],
        modify: function(){
            trickFilterSearch(1)
        },
    },
    {
        name: "Moves",
        filters: [],
        modify: function(){
            trickFilterSearch(2)
            setAllMoves()
        },
    },
    {
        name: "Locations",
        filters: [],
        modify: function(){
            trickFilterSearch(3)
        },
    },
    {
        name: "Trainers",
        filters: [],
        modify: function(){
            trickFilterSearch(4)
        },
    },
]

//trick the search to show suggestions
export function trickFilterSearch(panelID){
    const current = search.panelUpdatesIndex
    search.panelUpdatesIndex = panelID
    search.clearSuggestion()
    search.panelUpdatesTable[panelID](getQueries())
    search.showSuggestion()
    search.panelUpdatesIndex = current
}

let allQueries = []

export function getQueries(){
    allQueries = [{ //this is the top bar search
        op:"AND",
        not: false, //not yet implemented
        k: $('#search-keys').val().toLowerCase(),
        data: $('#search-bar').val().toLowerCase(),
        suggestion: $('#search-bar')[0] === search.suggestionInput
    }]
    $('.filter-row').map(function(index, row){
        filterDatas[index].filters = []
        const allFields = row.querySelectorAll('.filter-field')
        const allFieldsLength = allFields.length
        if (!allFieldsLength) return
        for (let fieldIndex = 0; fieldIndex < allFieldsLength; fieldIndex++){
            const field = allFields[fieldIndex]
            const toAddQuery = {
                op:"AND",
                //if you use data('state') jquery util here you're fucked for no acceptable reason
                not: field.querySelector('.filter-not').dataset.state === "on" ? true : false,
                k: field.querySelector('.filter-key').value.toLowerCase(),
                data: field.querySelector('.filter-search').value.toLowerCase(),
                suggestion: field.querySelector('.filter-search') === search.suggestionInput
            }
            filterDatas[index].filters.push(toAddQuery)
        }
    })
    //filters the empty queries
    allQueries.push(...filterDatas[search.panelUpdatesIndex].filters)
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
    return finalQuery
}

/**
 * Will fetch and execute all filters queries
 */
function executeAllFilters(){
    //execute the update of the active panel
    search.panelUpdatesTable[search.panelUpdatesIndex](getQueries())
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
            //save it there so it's written only once
            search.searchKeys[search.panelUpdatesIndex] = $('#search-keys').val()
            search.searchData[search.panelUpdatesIndex] = $('#search-bar').val()
        })
        if (!search.updateQueue) break
        search.updateQueue = false
    }
    search.updateGuard = false
}


export function appendFilter(panelID, initKey = "", initData = ""){ 
    const divField = e("div", "filter-field")

    const divNot = e("div", "filter-not", "¿?")
    divNot.type = "button"
    divNot.dataset.state = "off"

    const divKeyWrapper = e("div", "filter-key-wrapper")

    const inputKey = e('input', "filter-key")
    inputKey.type = "button"
    inputKey.value = initKey || search.queryKeys[0] || "Name"
    inputKey.onchange = ()=>{
        filterDatas[panelID].modify()
    }

    const divKeySelection = e('div', "filter-key-selection")
    divKeySelection.style.display = "none"

    const createSelectable = (key)=>{
        const option = e('div','', key)
        option.onclick = ()=>{
            inputKey.value = key
            $(divKeySelection).hide()
            filterDatas[panelID].modify()
        }
        return option
    }

    const divLabel = e('label', "filter-label")

    const inputSearch = e('input', "filter-search")
    inputSearch.type = "search"
    inputSearch.value = initData
    // i am required to do this if i want in filters.js > hasFilter()
    // to able to select by HTML attribute, yes it is akward but it works
    inputSearch.setAttribute("value", inputSearch.value)

    const divSuggestions = e('div', "filter-suggestions")
    divSuggestions.style.display = "none"

    const divRemove = e('div', "filter-remove", "X")

    const frag = JSHAC([
        divField, [
            divNot,
            divKeyWrapper, [
                inputKey,
                divKeySelection, [
                    ...Object.keys(search.queryMapList[panelID]).map(createSelectable)
                ]
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
        filterDatas[panelID].modify()
    }

    inputKey.onclick = () =>{
        $(divKeySelection).show()
        //ev.stopPropagation()
        clickOutsideToHide(divKeySelection, inputKey)
    }

    inputSearch.onclick = ()=>{
        if (search.suggestionNode) search.suggestionNode.style.display = "none"
        search.suggestionNode = divSuggestions
    }

    inputSearch.onkeyup = (ev)=>{
        onkeySearchFilter(ev, divSuggestions, inputSearch, filterDatas[panelID].modify)
    }

    divRemove.onclick = ()=>{
        divField.remove()
        filterDatas[panelID].modify()
        spinOnRemoveFilter()
        
    }
    
    $('#filter-data').find('.filter-add').eq(panelID).before(frag)
    
    spinOnAddFilter()
    return divField
}

/**
 * @callback searchAssertion - compare the data from the query and the data from the data
 * @param {unknow} data -- data from the data
 * @param {string} queryData -- data from the query
 * @returns {string | undefined} what did it matched or nothing
 * 
 * @typedef {Object.<string, searchAssertion>} SearchMap
 * 
 * 
 * @typedef {Object} Query - a query
 * @property {string} op - Operation to do to all direct sub element
 * @property {keyof SearchMap} k - a key for the searchmap
 * @property {Query} queryData - data of the query
 * @property {boolean} suggestion - should it add to suggestions?
 * @property {boolean} [not=false] - should it not match
 * 
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
        } else { //Default AND
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
/**
 * 
 * @param {*} query 
 * @param {*} datas 
 * @param {*} keymap 
 * @returns {number[]}the list of element that matched by index
 */
export function queryFilter2(query, datas, keymap){
    const queryNot = (notFlag, value) => {
        return notFlag ? !value : value
    }
    if (query.data.constructor === Array){
        // break it down until it is no longer an array
        // resolve all using the parent operator
        const subQueriesAnswers = query.data.map((subQuery)=>{
            return queryFilter2(subQuery, datas, keymap)
        }).filter(x => x)
        // if the is nothing to compare to, then just shrug

        if (subQueriesAnswers.length < 1) return undefined
        // just one?
        if (subQueriesAnswers.length == 1) return subQueriesAnswers[0]
        // okay now it's we get to use our operators
        let allIndexes = subQueriesAnswers.splice(0,1)[0]
        const subQlen = subQueriesAnswers.length
        for (let i = 0; i < subQlen; i++){
            const answers = subQueriesAnswers[i]
            allIndexes.push(...answers)
            if (query.op === "OR"){
                // or is basically a concatenation + a unique values
                allIndexes = [...new Set(allIndexes)]
            } else if (query.op === "XOR"){
                const onlyUniq = []
                const len = allIndexes.length
                for (let i = 0; i < len; i++){
                    const checkUniq = allIndexes.splice(0,1)[0]
                    if (allIndexes.indexOf(checkUniq) == -1) onlyUniq.push(checkUniq)
                    allIndexes.push(checkUniq)
                }
                allIndexes = onlyUniq
            } else { //Default AND
                // concatenation + only duplicate
                const duplicates = []
                const len = allIndexes.length
                for (let i = 0; i < len; i++){
                    const checkDupli = allIndexes.splice(0,1)[0]
                    if (allIndexes.indexOf(checkDupli) != -1) duplicates.push(checkDupli)
                }
                allIndexes = duplicates
            }
        }
        return allIndexes
    } else {
        const execFn = keymap[query.k]
        // if the is nothing to compare to, then just shrug
        if (!execFn) return undefined
        const allElementsIndexesThatMatched = []
        const  perfectMatches = [] //for not unique properties like abilities or move that can be shared by multiple pokemons
        const dataLen = datas.length
        for (let i = 0; i < dataLen; i++){
            const data = datas[i]
            const answer = execFn(query.data, data)
            let suggestion
            // when asking for object it's because the function may support perfect matching
            // Which means that ignore any other, this is to fix this case:
            // powder and powder poison, if the string is "pow" both may trigger
            // but if it's "powder" then no, only powder may show
            // in the case of generator or generator as abilities, it's the ability that should be uniq
            // not the first pokemon to hit it, that's why there is isNotUnique
            if (typeof answer === "object"){
                const perfectMatch = answer[0]
                suggestion = answer[1]
                if (perfectMatch) {
                    const isUnique = answer[2]
                    // a name is unique
                    if (isUnique) {
                        // invert the unique search
                        if (query.not){
                            const inverted = [...Array(dataLen).keys()]
                            inverted.splice(i, 1)
                            return inverted
                        }
                        return [i]
                    }
                    // an ability or a move isn't
                    perfectMatches.push(i)

                }
            } else {
                suggestion = answer
            }
            if (queryNot(query.not, suggestion)){
                allElementsIndexesThatMatched.push(i)
                if (query.suggestion){
                    search.addSuggestion(suggestion)
                }
            }
        }
        return perfectMatches.length ? perfectMatches : allElementsIndexesThatMatched
    }
}

function removeAllFilters(){
    $('#filter-frame').find('.filter-field').remove()
    spinOnRemoveFilter()
    activateSearch()
}

export function spinOnAddFilter(){
    $('#filter-icon')[0].animate([
        { rotate: "0deg"},
        { backgroundColor: "green"},
        { rotate: "360deg"},
    ],{
        duration: 750,
        iterations: 1,
    })
}

export function spinOnRemoveFilter(){
    $('#filter-icon')[0].animate([
        { rotate: "0deg"},
        { backgroundColor: "red"},
        { rotate: "-360deg"},
    ],{
        duration: 750,
        iterations: 1,
    })
}
/**
 * 
 * @param {string} key - lower case!!!
 * @param {string} data 
 * @returns 
 */
export function hasFilter(key, data, panelID){
    const row = $('#filter-data').children().eq(panelID)
    return row.find(`.filter-key[value="${key.toLowerCase()}"]`) &&
        row.find(`.filter-search[value="${data}"]`)[0]
}

export function setupFilters(){
    $('#filter-clear-all').on('click', function(){
        removeAllFilters()
    })
    $('.filter-help-btn').on('click', function(){
        $('#filter-help').toggle()
        $('.filter-panel').toggle()
    })

    $('#filter-main-operator').on('change', function(){
        activateSearch()
    })

    setLongClickSelection($('#to-filter')[0], ()=>{
        removeAllFilters()
    })

    setupFiltersRow()
}

export function longClickToFilter(panelID, node, key, data = ()=>{return node.innerText}, callback = false){
    let filterDiv, color
    let extendableDiv = setLongClickSelection(node, () => {
        if (hasFilter(key, data(), panelID)) {
            if (!filterDiv){
                $('.filter-search').each((index, val)=>{
                    if (val.value === data()){
                        $(val).closest(".filter-field").remove()
                    }
                })
            } else {
                filterDiv.remove()
            }
            spinOnRemoveFilter()
            color = "green";
        } else {
            filterDiv = appendFilter(panelID, key, data())
            color = "red"
        }
        activateSearch()
        extendableDiv.style.backgroundColor = color
        if (callback) callback()
    }, 450, hasFilter(key, data(), panelID) ? "red" : "green")
}

function setupFiltersRow(){

    $('#filter-data').append(filterDatas.map((rowData, index)=>{
        const filterAdd = (ev) => {
            appendFilter(index)
        }
        return JSHAC([
            e('div', 'filter-row'),[
                e('div', 'filter-target'),[
                    e('span', '', rowData.name)
                ],
                e('div', 'filter-list'), [
                    e('div', 'filter-add', null, {onclick:filterAdd}),[
                        e('span', 'filter-plus', '+'),
                        e('span', '', 'Add a filter')
                    ]
                ]
            ]
        ])
    }))
}