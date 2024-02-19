import {e, JSHAC} from "./utils.js"

const loadMsgs = []
let error = false

export function load(callback, msg){
    loadMsgs.push(msg)
    setTimeout(()=>{
        try{
            callback()
            $('#loading').append(JSHAC([
                e('div', 'loading-row'),[ 
                    e('div', 'loading-text', `loading ${msg}`),
                    e('div', 'loading-icons', '⟳'),
                ]
            ]))
            loaded(msg, true)
        } catch(_e){
            loaded(msg, false)
        }
    }) //this settimeout is to escape fastdom forcing the render into a single frame
    
    
}

function loaded(msg, success){
    const jNode = $('#loading').children().eq(loadMsgs.indexOf(msg))
    jNode.find('.loading-icons').text(success ? '✅' : '❌')
    jNode.find('.loading-text').text(`${msg}`)
}

function onErrorAskContinue(){
    $('#loading').append(e('div', 'loading-ask', 'An error occured, click to continue'))
    
    $('#loading').on('click', function(){
        $('#loading-screen').hide(),
        $('#loading').off('click')
    })
}

export function endLoad(){
    if (!error) {
        $('#loading-screen').hide()
    } else {
        onErrorAskContinue()
    }
}