export function loadFont(fontName){
    const font = new FontFace(fontName, `url(font/${fontName}.ttf) format("truetype")`);
    font.load()
        .then((font)=>{
            document.fonts.add(font)
            document.querySelector('html').style.fontFamily = fontName
        })
        .catch((e)=>{
            console.warn(e)
        })
}