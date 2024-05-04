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
    /*["", ],
    ["", ],
    ["", ],
    ["", ],
    ["", ],
    ["", ],
    ["", ],
    ["", ],
    ["", ],*/
]

// now unencrypted
function readSubStructure(start, bytes){
    const getWord = ()=>{
        const u32 = readNbytes(start + (wordIndex * 4),4, bytes)
        let u32ToLittleEndian = 0
        for (let i = 0; i < 4; i++){
            const u8 = (u32 >>> (24 - (i * 8))) & 0xFF
            u32ToLittleEndian |= (u8 << (i * 8))
        }
        console.log(u32ToLittleEndian, u32)
        wordIndex++
        return u32ToLittleEndian
    }
    const getNextField = ()=>{
        const field = BoxPokemon[fieldDataIndex]
        if (!field) return undefined
        fieldDataIndex++
        return {
            name: field[0],
            nbits: field[1]
        }
    }

    const mon = {}
    let fieldDataIndex = 0
    let wordIndex = 0

    while(true){
        let field = getNextField()
        if (!field) break
        let bitsLeft = 32
        let word;
        if (field.nbits > 32){
            bitsLeft = field.nbits
            mon[field.name] = []
            while( bitsLeft >= 32){
                word = getWord()
                mon[field.name].push(word)
                bitsLeft -= 32
            }
            if (!bitsLeft) continue
        }
        if (!word) word = getWord()
        // this will bug if a field is between two words
        while(bitsLeft > 0){
            bitsLeft = bitsLeft - field.nbits
            console.log(field.name, bitsLeft, field.nbits)
            mon[field.name] = readBitsInU32(word, bitsLeft, field.nbits)
            if (bitsLeft) {
                field = getNextField()
                if (!field) break
            } else {
                break
            }
        }
    }
    console.log(mon)
    return mon
}

function readMonParty(start, bytes){
    var mon = readSubStructure(start,bytes); // 20
    //var status = readNbytes(start + 60, 4, bytes);
    //mon.level = readNbytes(start + 60, 1, bytes);
    //var pkrs = readNbytes(start + 85, 1, bytes);
   /* mon.liveStat = {}
    mon.liveStat.currentHP = readNbytes(start + 62, 2, bytes);
    mon.liveStat.totalHP = readNbytes(start + 64, 2, bytes);
    mon.liveStat.atk = readNbytes(start + 66, 2, bytes);
    mon.liveStat.def = readNbytes(start + 68, 2, bytes);
    mon.liveStat.spe = readNbytes(start + 70, 2, bytes);
    mon.liveStat.spa = readNbytes(start + 72, 2, bytes);
    mon.liveStat.spd = readNbytes(start + 74, 2, bytes);*/
    return mon
}

const SaveBlock1 = {
    playerPartyCount: 0x234,
    playerParty: 0x238,
}
function readParty(bytes, SB1){
    const teamsize = readNbytes(SB1 + SaveBlock1.playerPartyCount, 4, bytes)
    var teamList = []
    for (var i = 0; i< teamsize; i++){
        var mon = readMonParty(SB1 + SaveBlock1.playerParty + (i * 80), bytes)
        teamList.push(mon)
        break
        /*const evs = mon.evs
        teamList.push({
            spc: mon.species,
            isShiny: false,
            abi: mon.ability,
            moves: mon.moves,
            item: undefined,
            ivs: [31, 31, 31, 31, 31, mon.zeroSpe ? 0 : 31],
            evs: [evs.hp, evs.at, evs.df, evs.sa, evs.sd, evs.sp],
            nature: gameData.natureT.indexOf(mon.nature)
        });*/
    }
    // console.log(teamList.map(x => x.experience))
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

