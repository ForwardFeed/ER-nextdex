document.addEventListener("DOMContentLoaded", function(){
    setupDrop()
});
let fileName
function setupDrop(){
    let timeoutDropper
    $(document.body).on('dragover', function(ev){
        if (ev.originalEvent.dataTransfer.items.length < 1) return
        for (const item of ev.originalEvent.dataTransfer.items){
            if (item.kind !== "file") return
            fileName = "pokeemerald.sav"
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
            fileName = "EliteReduxConverted.sav"
            convertSaveFile(file)
        }
        ev.preventDefault();  
        ev.stopPropagation();
    })
    $('#convert-input').on('change', function(ev){
        console.log($(this)[0].files)
        for (const file of $(this)[0].files){
            fileName = file.name
            convertSaveFile(file)
        }
    })
}
// LITTLE ENDIAN !
function readNbytes(bof, nBytes, bytes){
    var resBytes = bytes[bof];
    for (var i = 1; i< nBytes; i++){
        resBytes = resBytes | (bytes[bof + i] << i*8)
    }
    return (resBytes >>> 0)
}

function changeSectors(bytes, sectorID){
    var off = 0 + 4084 //offset footer
    bytes[4084] = sectorID
    var sID = readNbytes(off,2,bytes)//Sector ID
}


function getFooterData(startOffset, endOffset, bytes) {
    var SIZE_SECTOR = 4096;
    var SB1, // SAVEBLOCK 1
        SB = [], // sectors blocks
        PC = [] // PC start
        
    for (var ofs = startOffset; ofs < endOffset; ofs += SIZE_SECTOR){
        var off = ofs + 4084 //offset footer
        var sID = readNbytes(off,2,bytes)//Sector ID
        if (sID > 28) {
            console.log("Weird sector id:" +  sID + " at offset :" + ofs)
            continue
        }
        
        SB[sID] = ofs
        if (sID == 5){
            SB1 = ofs
        } else if(sID >= 12){
            PC[sID - 12] = ofs
        } 
    }
    return {
        SB1: SB1,
        PC: PC,
        SB: SB,
    }
}

const OLD_SAVE_STRUCTURE = [
    "saveblock2_0",//0
    "SaveBlock2_1", //1
    "SaveBlock2_2", //2
    "SaveBlock2_3", //3
    "SaveBlock2_4", //4
    "saveblock1_0", //5
    "saveblock1_1", //6
    "saveblock1_2", //7
    "saveblock1_3", //8
    "unused_0", //9
    "unused_1", //10
    "unused_2", //11
    "unused_3", //12
    "unused_4", //13
    "unused_5", // 14
    "unused_6", // 15
    "unused_7", // 16
    "unused_8", // 17
    "unused_9", // 18
    "storage_0", // 19
    "storage_1", // 20
    "storage_2", // 21
    "storage_3", // 22
    "storage_4", // 23
    "storage_5", // 24
    "storage_6", // 25
    "storage_7", // 26
    "storage_8", // 27
]
const NEW_SAVE_STRUCTURE = {
    "saveblock2_0": 0, // S2
    "SaveBlock2_1": 1, // S2
    "saveblock1_0": 2, // S1
    "saveblock1_1": 3,
    "saveblock1_2": 4,
    "saveblock1_3": 5,
    "unused_8": 6, // actually is saveblock1_4
    "unused_9": 7, //  actually is saveblock1_5
    "SaveBlock2_2": 8, // unused
    "SaveBlock2_3": 9, 
    "SaveBlock2_4": 10,
    "unused_0": 11, // unused
    "storage_0": 12,
    "storage_1": 13,
    "storage_2": 14,
    "storage_3": 15,
    "storage_4": 16,
    "storage_5": 17,
    "storage_6": 18,
    "storage_7": 19,
    "storage_8": 20,
    "unused_1": 21,
    "unused_2": 22,
    "unused_3": 23,
    "unused_4": 24,
    "unused_5": 25,
    "unused_6": 26,
    "unused_7": 27,
}

function intervertSaveBlock(bytes, RSave){
    const BLOCK_SIZE = 4096
    const convertedSave = structuredClone(bytes)
    for (let i = 0; i < OLD_SAVE_STRUCTURE.length; i++){
        const oldSector = OLD_SAVE_STRUCTURE[i]
        const newSector = NEW_SAVE_STRUCTURE[oldSector]
        const oldOfs = RSave.SB[i]
        const newOfs = newSector * 4096
        const oldSectorBytes = bytes.slice(oldOfs, oldOfs + BLOCK_SIZE)
        changeSectors(oldSectorBytes, newSector)
        convertedSave.set(oldSectorBytes, newOfs)
    }
    downloadBlob(convertedSave, fileName ,'application/octet-stream')
}
const downloadBlob = (data, fileName, mimeType) => {
    const blob = new Blob([data], {
      type: mimeType
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)
} 
function convertSaveFile(file){
    if (!file) return
    if (file.target) file = file.target.files[0]
    var reader = new FileReader();
	reader.onload = function (e) {
		var bytes = new Uint8Array(e.target.result);
        //size check, for now only emerald.
        if (bytes.length != 131072 && bytes.length != 131088) {
            errorWhileConverting("Not a pokemon emerald save")
            return
        }
        try {
            const RSave = getFooterData(0, 114688, bytes)
            intervertSaveBlock(bytes, RSave)
            successConverting()
            
        } catch (e) {
            errorWhileConverting(e)
        }
    }
    reader.readAsArrayBuffer(file);
}

function successConverting(){
    $('#convert-debug').text('')
    $('#convert-sucess').text('Sucessfully converted (auto downloaded)')
}

function errorWhileConverting(msg){
    $('#convert-debug').text(msg)
    $('#convert-sucess').text('')
}
