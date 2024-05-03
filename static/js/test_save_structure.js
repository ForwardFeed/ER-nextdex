document.addEventListener("DOMContentLoaded", function(){
    setupDrop()
});


// LITTLE ENDIAN !
function readNbytes(bof, nBytes, bytes){
    var resBytes = bytes[bof];
    for (var i = 1; i< nBytes; i++){
        resBytes = resBytes | (bytes[bof + i] << i*8)
    }
    return (resBytes >>> 0)
}

function setupDrop(){
    let timeoutDropper
    $(document.body).on('dragover', function(ev){
        if (ev.originalEvent.dataTransfer.items.length < 1) return
        for (const item of ev.originalEvent.dataTransfer.items){
            if (item.kind !== "file") return
        }
        $('#drop-savefile-frame').show()
        ev.preventDefault();  
        ev.stopPropagation();
    })
    $(document.body).on('drop', function(ev){
        $('#drop-savefile-frame').hide()
        clearTimeout(timeoutDropper)
        for (const item of ev.originalEvent.dataTransfer.items){
            if (item.kind !== "file") return
            const file = item.getAsFile();
            //file.name
            parseFile(file)
        }
        ev.preventDefault();  
        ev.stopPropagation();
    })
    var input = document.createElement("input");
        input.id = "savefile-upload";
        input.type = "file";
        input.accept = ".sav";
        input.style.display = "none";
        input.onchange = parseFile;
    $('body').append(input).on('click', function(){
        input.click()
    })
}
// the new saveFileStructure is now tottally static in memory
const staticPtrs = {
    gPokemonStorage: 0x2029714,
    gSaveblock1: 4096,
    playerPartyCount: 4096 + 0x0234,
    gSaveblock2: 0x20259d8,
    gGameVersion: 0x83ad298,
}
const SaveBlock1 = {
    playerPartyCount: 0x0234
}
function readParty(bytes, SB1){
    console.log(readNbytes(SaveBlock1.playerPartyCount + SB1, 4, bytes))
}

function getFooterData(startOffset, endOffset, bytes) {
    var SIZE_SECTOR = 4096;
    var SB1, // SAVEBLOCK 1
        //SI, //Save index
        PC = [] // PC start
        //GS = [] // Game Sector testing purpose
        
    for (var ofs = startOffset; ofs < endOffset; ofs += SIZE_SECTOR){
        var off = ofs + 4084 //offset footer
        var sID = readNbytes(off,2,bytes)//Sector ID
        //console.log(sID, readNbytes(ofs + 0x234, 4, bytes), ofs)
        if (sID == 5){
            SB1 = ofs
        } /*else if (sID >= 5){
            PC[sID - 5] = ofs
        } else {
            //GS[sID] = ofs
        }*/
        //var CS = readNbytes(off +2 ,2,bytes); //Checksum
        //var SG = readNbytes(off +4 ,2,bytes); //Signature
        //SI = readNbytes(off +8 ,2,bytes); //Save Index
    }
   // if (SI == 65535) SI = 0; //javascript aint build for binary
    return {
        SB1: SB1,
    }
}

function parseFile(file){
    if (!file) return
    if (file.target) file = file.target.files[0]
    var reader = new FileReader();
	reader.onload = function (e) {
		var bytes = new Uint8Array(e.target.result);
        //size check, for now only emerald.
        if (bytes.length != 131072 && bytes.length != 131088) {
            console.warn("Not a pokemon emerald game", bytes.length)
            return
        }
        try {
            const RSave = getFooterData(0, 114688, bytes)
            readParty(bytes, RSave.SB1)
        } catch (e) {
            console.warn(e)
        }
    }
    reader.readAsArrayBuffer(file);
};