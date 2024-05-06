document.addEventListener("DOMContentLoaded", function(){
    setupDrop()
});

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
            //parseFile(file)
            convertSaveFile(file)
        }
        ev.preventDefault();  
        ev.stopPropagation();
    })
    /*var input = document.createElement("input");
        input.id = "savefile-upload";
        input.type = "file";
        input.accept = ".sav";
        input.style.display = "none";
        input.onchange = parseFile;
    $('body').append(input).on('click', function(){
        input.click()
    })*/
}
// LITTLE ENDIAN !
function readNbytes(bof, nBytes, bytes){
    var resBytes = bytes[bof];
    for (var i = 1; i< nBytes; i++){
        resBytes = resBytes | (bytes[bof + i] << i*8)
    }
    return (resBytes >>> 0)
}

/**
 * 
 * @param {number} int // number to apply
 * @param {number} boffset // bit(s) offset 
 * @param {number} blen // bit(s) length
 */
function readbits(int, boffset, blen){
    return (int >>> boffset) & blen;
}
// just an utility wrapper
function readBitsInU32(int, boffset, blen){
    return readbits(int, boffset, Math.pow(2, blen) - 1)
}
// field, numbers of bits
const BoxPokemon = [
    ["personality", 32],
    ["otID", 32],
    ["nickname", 12 * 8],
    ["move1", 10],
    ["experience", 21],
    ["attackDown", 1],
    ["move2", 10],
    ["move3", 10],
    ["language", 3],
    ["isAlpha", 1],
    ["friendship", 8],
    ["species", 16],
    ["move4", 10],
    ["hpType",5 ],
    ["isEventMon", 1],
    ["hpEV", 8],
    ["attackEV", 8],
    ["defenseEV", 8],
    ["speedEV", 8],
    ["spAttackEV", 8],
    ["spDefenseEV", 8],
    ["heldItem", 10],
    ["nature", 5],
    ["isEgg", 1],
    ["metLevel", 7],
    ["pokeball", 5],
    ["isShiny", 3],
    ["filler", 1],
    ["metLocation", 8],
    ["otName", 7 * 8],
    ["markings", 4],
    ["abilityNum", 2],
    ["speedDown", 1],
    ["otGender", 1],
]

// now unencrypted
function readMonBoxed(start, bytes){
    const getNextWord = ()=>{
        const u32 = readNbytes(start + (wordIndex * 4),4, bytes)
        wordIndex++
        return u32
    }
    const setValueToField = (field, value) => {
        if (field.nbits > 32){
            if (!mon[field.name]){
                mon[field.name] = []
            }
            mon[field.name].push(value)
        } else {
            mon[field.name] = value
        }
    }
    const mon = {}
    let wordIndex = 0
    let word
    let bitsReaden
    for (const fieldArray of BoxPokemon){
        const field = {
            name: fieldArray[0],
            nbits: fieldArray[1]
        }
        if (field.nbits > 32) mon[field.name] = []
        let bitsLeftToRead = field.nbits
        while(bitsLeftToRead){
            if (!word) {
                word = getNextWord()
                bitsReaden = 0
            }
            // needs to read more than just what's left in the word
            // if 18 bits were read, and you need to read 32, then you need to read 14 now
            
            if (32 - bitsReaden - bitsLeftToRead < 0){
                // remove how many bits that have been read already
                let bitsThatGonnaBeRead = 32 - bitsReaden
                setValueToField(field, readBitsInU32(word, bitsReaden, bitsThatGonnaBeRead))
                bitsLeftToRead -= bitsThatGonnaBeRead
                word = undefined // will trigger a word read next loop
            } else {
               // there's enough bits left to read them all
               let bitsThatGonnaBeRead = bitsLeftToRead
               setValueToField(field, readBitsInU32(word, bitsReaden, bitsThatGonnaBeRead))
               bitsReaden += bitsLeftToRead
               bitsLeftToRead = 0 // will trigger the next field to be read
            }  
        }
    }
    return mon
}

function readMonParty(start, bytes){
    var mon = readMonBoxed(start,bytes); // 0
    mon.pp = [
        readNbytes(start + 52, 1, bytes),
        readNbytes(start + 53, 1, bytes),
        readNbytes(start + 54, 1, bytes),
        readNbytes(start + 55, 1, bytes),
    ];
    mon.status = readNbytes(start + 56, 4, bytes);
    mon.level = readNbytes(start + 60, 1, bytes);
    mon.mail = readNbytes(start + 61, 1, bytes);
    mon.liveStat = {}
    mon.liveStat.currentHP = readNbytes(start + 62, 2, bytes);
    mon.liveStat.totalHP = readNbytes(start + 64, 2, bytes);
    mon.liveStat.atk = readNbytes(start + 66, 2, bytes);
    mon.liveStat.def = readNbytes(start + 68, 2, bytes);
    mon.liveStat.spe = readNbytes(start + 70, 2, bytes);
    mon.liveStat.spa = readNbytes(start + 72, 2, bytes);
    mon.liveStat.spd = readNbytes(start + 74, 2, bytes);
    return mon
}

const SaveBlock1 = {
    playerPartyCount: 0x234,
    playerParty: 0x238,
}
function readParty(bytes, SB1){
    const teamsize = readNbytes(SB1 + SaveBlock1.playerPartyCount, 4, bytes)
    const teamList = []
    for (let i = 0; i< teamsize; i++){
        const mon = readMonParty(SB1 + SaveBlock1.playerParty + (i * 76), bytes)
        teamList.push(mon)
        /*const evs = mon.evs
        teamList.push({
            spc: mon.species,
            isShiny: mon.isShiny,
            abi: mon.ability,
            moves: mon.moves,
            item: undefined,
            ivs: [31, 31, 31, 31, 31, mon.zeroSpe ? 0 : 31],
            evs: [evs.hp, evs.at, evs.df, evs.sa, evs.sd, evs.sp],
            nature: gameData.natureT.indexOf(mon.nature)
        });*/
    }
}

function readBox(bytes, PC, nbToRead=30*26){
    const boxedMons = []
    const DATA_BLOCK_SIZE = 4084
    // some pokemon are streched between two saveblocks
    let strechUnder = 0
    for (let i = 0; i < nbToRead; i++){
        let mon
        // the first 4 bytes are the active box nb, not valuable here
        const relativeOffset     = 4 + (i * 52)
        const saveblockNb        = Math.floor(relativeOffset / DATA_BLOCK_SIZE)
        const boxRelativeOffset  = relativeOffset % DATA_BLOCK_SIZE
        const absoluteOffset     = PC[saveblockNb] + boxRelativeOffset
        if (boxRelativeOffset + 52 > DATA_BLOCK_SIZE){
            strechUnder = DATA_BLOCK_SIZE - boxRelativeOffset
            const strechOver = 52 - strechUnder
            const strechedUnderBytes    = bytes.slice(absoluteOffset, absoluteOffset + strechUnder)
            const strechOverBytes       = bytes.slice(PC[saveblockNb + 1], PC[saveblockNb + 1] + strechOver)
            const reconstitutedBytes = new Uint16Array(strechedUnderBytes.length + strechOverBytes.length)
            reconstitutedBytes.set(strechedUnderBytes)
            reconstitutedBytes.set(strechOverBytes, strechedUnderBytes.length)
            mon = readMonBoxed(0, reconstitutedBytes)
        } else {
            mon = readMonBoxed(absoluteOffset , bytes)
        }
        if (!mon.personality) continue
        boxedMons.push(mon)
    }
    return boxedMons
}

function getFooterData(startOffset, endOffset, bytes) {
    var SIZE_SECTOR = 4096;
    var SB1, // SAVEBLOCK 1
        //SI, //Save index
        SB = [],
        PC = [] // PC start
        //GS = [] // Game Sector testing purpose
        
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
        /*else if (sID >= 5){
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
        PC: PC,
        SB: SB,
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
            const storage = readBox(bytes, RSave.PC)
            console.log(storage)
            
        } catch (e) {
            console.warn(e)
        }
    }
    reader.readAsArrayBuffer(file);
};

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

function changeSectors(bytes, sectorID){
    var off = 0 + 4084 //offset footer
    bytes[4084] = sectorID
    var sID = readNbytes(off,2,bytes)//Sector ID
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
    /*RSave = getFooterData(0, 114688, convertedSave)
    readParty(convertedSave, RSave.SB1)
    const storage = readBox(convertedSave, RSave.PC)*/
    downloadBlob(convertedSave, "pokeemerald.sav" ,'application/octet-stream')
}
function downloadURL (data, fileName) {
    var a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  };
  
const downloadBlob = (data, fileName, mimeType) => {

    const blob = new Blob([data], {
      type: mimeType
    })
    const url = window.URL.createObjectURL(blob)
    downloadURL(url, fileName)
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
            console.warn("Not a pokemon emerald game", bytes.length)
            return
        }
        try {
            const RSave = getFooterData(0, 114688, bytes)
            intervertSaveBlock(bytes, RSave)
            
        } catch (e) {
            console.warn(e)
        }
    }
    reader.readAsArrayBuffer(file);
}