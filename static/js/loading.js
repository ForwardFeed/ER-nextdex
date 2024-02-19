import {e, JSHAC} from "./utils.js"

const loadMsgs = []

export function load(msg){
    loadMsgs.push(msg)
    $('#loading').append(JSHAC([
        e('div', 'loading-row'),[ 
            e('div', 'loading-text', `loading ${msg}`),
            e('div', 'loading-icons', '⟳'),
        ]
    ]))
}

export function loaded(msg, success){
    const jNode = $('#loading').children().eq(loadMsgs.indexOf(msg))
    jNode.find('.loading-icons').text(success ? '✅' : '❌')
    jNode.find('.loading-text').text(`${msg}`)
}

export function onErrorAskContinue(){
    $('#loading').append(e('div', 'loading-ask', 'An error occured, click to continue'))
    
    $('#loading').on('click', function(){
        $('#loading-screen').hide(),
        $('#loading').off('click')
    })
    
    
}