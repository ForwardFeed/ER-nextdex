
const insanity = {
    interval: 0,
    audio: false
}
const insaneAnimation = [
    "boink",
    "spinnySkirt",
    "spinnySkirt",
    "texxxt"
]
export function activateInsanity(){
    clearInterval(insanity.interval)
    
    if (!insanity.audio){ // play only once
        insanity.audio = true
        var audio = new Audio('./js/data/playInsanity.webm');
        const loopPlay = function(){
            audio.play();
        }
        audio.addEventListener('ended', loopPlay)
        audio.play();
    }

    const all = $("body").find('*')
    const len = all.length
    insanity.interval = setInterval(()=>{
        const random = Math.floor((Math.random() * len))
        const randomCSSVars = `
            --random0: ${Math.round(Math.random() * 10) + 3}s;
            --random1: ${Math.round(Math.random() * 360)}deg;
            --random2: ${Math.round(Math.random() * 360)}deg;
            --random3: ${(Math.random() * 1).toPrecision(2)}em;
            --random4: ${(Math.random() * 3).toPrecision(2)}em;
        `
        document.documentElement.style.cssText = randomCSSVars
        const bazinga = all.eq(random)
        const nekoArc = insaneAnimation[Math.floor((Math.random() * insaneAnimation.length))]
        bazinga.addClass(nekoArc)
    }, 100)
}

export function restoreOrder(){
    clearInterval(insanity.interval)
}