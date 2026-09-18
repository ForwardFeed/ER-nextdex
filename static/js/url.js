import {is_version_valid, changeVersion} from "./data_version.js"

/**
 * @typedef {Object} URLData
 * @property {string} version
 * @property {string} pokemon
 */

/**
 * @type {URLData}
 */
let default_url_data = {
    version: ""
}

/**
 * 
 * @param {URLData} url_data 
 */
export function update_url_parameters(url_data){

    const current_params = get_url_parameters()

    const version = url_data.version || current_params.version
    const pokemon = url_data.pokemon || current_params.pokemon
    
    const state  = "version_change"
    const unused = ""
    let  url      = `?v=${version}`

    if (pokemon !== undefined){
        url += `&p=${pokemon}`
    }

    if (url === window.location.search){
        return
    }
    window.history.pushState(state, unused, url);
}

/**
 * @returns {(URLData | undefined)}
 */
export function get_url_parameters(){
    if (typeof URLSearchParams === 'undefined'){
        return undefined
    }

    const search_text  = window.location.search
    const search_param = new URLSearchParams(search_text)
    
    return {
        version: search_param.get("v") ?? "",
        pokemon: search_param.get("p") ?? ""
    }
}

export function setup_url_change_watcher(){
    window.addEventListener("popstate", (e)=>{
        if (!e.state) 
            return
        if (e.state != "version_change")
            return

        const params = get_url_parameters()
        if (params === undefined)
            return

        if (is_version_valid(params.version) === false)
            return
        changeVersion(params.version)
        $('#versions').val(params.version)
    })
}