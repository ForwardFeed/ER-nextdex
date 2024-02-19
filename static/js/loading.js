import {e, JSHAC} from "./utils.js"

const loadMsgs = []
let error = false

export function load(callback, msg, lastOne=false){
    loadMsgs.push(msg)
    setTimeout(()=>{
        try{
            $('#loading').append(JSHAC([
                e('div', 'loading-row'),[ 
                    e('div', 'loading-text', `loading ${msg}`),
                    e('div', 'loading-icons', '⟳'),
                ]
            ]))
            callback()
            loaded(msg, true)
        } catch(_e){
            loaded(msg, false)
        } finally{
            if (lastOne) endLoad()
        }
    }) //this settimeout is to escape fastdom forcing the render into a single frame
    
    
}

function loaded(msg, success){
    const jNode = $('#loading').children().eq(loadMsgs.indexOf(msg))
    jNode.find('.loading-icons').text(success ? '✅' : '❌')
    jNode.find('.loading-text').text(`${msg}`)
    error = !success || error
}

function onErrorAskContinue(){
    $('#loading').append(e('div', 'loading-ask', 'An error occured, click to continue'))
    
    $('#loading').on('click', function(){
        $('#loading-screen').hide(),
        $('#loading').off('click')
    })
}

function endLoad(){
    if (!error) {
        $('#loading-screen').hide()
    } else {
        onErrorAskContinue()
    }
}