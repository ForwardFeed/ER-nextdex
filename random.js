// parse gbapal color to rgb
function gbaCtoRgB(code){ 
    let gbaRBG = parseInt(code, 16)
    const blue = (gbaRBG & 31) * 8
    gbaRBG = gbaRBG >> 5
    const green = (gbaRBG & 31) * 8
    gbaRBG = gbaRBG >> 5
    const red = (gbaRBG & 31) * 8
    console.log(red, green, blue)
    return `rgb(${red}, ${green}, ${blue})`
}
gbaCtoRgB(0xc076)
