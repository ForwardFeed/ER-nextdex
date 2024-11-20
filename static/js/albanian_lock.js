
/**
 * a lock for a clown problem (we live a society)
 * (it's actually extremely weak, but as long it stops at least 90% of people it's fine)
 * Sorry If any albanian feels offended by reading this code but please don't
 * send a pipebomb in my mailbox.
*/

export function activateLock(){
    
    $('#clown-enter').on('click',function(){
        trytry(document.getElementById('clown-input').value)
    })
    function antiHTMLRemoval(event){
        if ($(event.target).closest('#clown-lock').length) return
        event.stopImmediatePropagation()
        event.stopPropagation()
    }
    function deActivateLock(){
        document.removeEventListener('click', antiHTMLRemoval, true)
        document.getElementById('clown-lock').remove()
    }
    function basicAntiSpam(){
        $('#clown-input').hide()
        $('#clown-bad-pass').show()
        setTimeout(function(){
            $('#clown-bad-pass').hide()
            $('#clown-input').show().trigger('focus')
        }, 1000)
    }

    function trytry(key, fromStorage){
        // hold and behold absolute secrecy.
        if (key === "ilovetrolleychan") {
            if (localStorage) localStorage.setItem('ERdexPass', key)
            deActivateLock()
        } else {
            if (fromStorage){
                localStorage.setItem('ERdexPass', '')
                document.getElementById('clown-input').value = ''
            } else {
                basicAntiSpam()
            }
        }
    }
    document.addEventListener('click', antiHTMLRemoval, true)
    document.getElementById('clown-input').onkeydown = function(ev){
        if (ev.key === 'Enter') {
            trytry(this.value)
        }
    }
    document.getElementById('clown-input').value = localStorage.getItem('ERdexPass') || ""
    if (document.getElementById('clown-input').value) trytry(document.getElementById('clown-input').value, true)
}