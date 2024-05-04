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
    return readbits(int, (32 - boffset), Math.pow(2, blen) - 1)
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
    const mon = {}
    let fieldDataIndex = 0
    let i = 0
    const readWord = ()=>{
        const u32 = readNbytes(start + (i * 4),4, bytes)
        i++
        return u32
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
    while(true){
        let field = getNextField()
        console.log(field)
        if (!field) break
        if (field.nbits > 32){
            let bitsLeft = field.nbits
            mon[field.name] = []
            while( bitsLeft >= 32){
                mon[field.name].push(readWord())
                bitsLeft -= 2
            }
            console.log(bitsLeft)
        } else {
            let bitsLeft = 32
            const word = readWord()
            // this will bug if a field is between two words
            while(bitsLeft > 0){
                //console.log(field)
                bitsLeft = bitsLeft - field.nbits
                mon[field.name] = readBitsInU32(word, bitsLeft, field.nbits)
                if (bitsLeft) {
                    field = getNextField()
                    if (!field) break
                }
                break
                
            }
            
        }
    }
    console.log(mon)
    return mon
    //var 
    let word6 = undecoded[0];
    const move1 = word6 >>> (32 - 10) & (Math.pow(2, 10) - 1);
    const experience = (word6 >>> 10 ) & (Math.pow(2, 21) - 1);
    console.log(read32Bits(word6, ))
    const attackDown = word6 & 1;
    let word7 = ss0[1];
    const move2 = word7  >> (32 - 10)
    const move3 = word7  >> (32 - 20) & (Math.pow(2, 10) - 1)
    let word8 = ss0[2];
    let word9 = undecoded[3];
    mon.hpEV = word9 >>> 24;
    mon.attackEV = (word9 >>> 16) & 0xFF;
    mon.defenseEV = (word9 >>> 8) & 0xFF;
	mon.speedEV = word9 & 0xFF;
    console.log(experience, mon.hpEV, mon.attackEV, mon.defenseEV, mon.speedEV)
	/*mon.spAttackEV = 
	mon.spDefenseEV = */
    let word10 = ss1[1];
    let word11 = ss1[2];
    let word12 = ss2[0];
    let word13 = ss2[1];
    let word14 = ss2[2];
    //console.log(word13 & 0xFF, experience)
    
    mon.species = ss0[0] & 0xFFFF;
	mon.heldItem = ss0[0] >> 16;
	mon.experience = ss0[1];
	mon.ppBonuses = ss0[2] & 0xFF;
	mon.friendship = (ss0[2] >> 8) & 0xFF;

    mon.moves = [
		ss1[0] & 0xFFFF,
		ss1[0] >> 16,
		ss1[1] & 0xFFFF,
		ss1[1] >> 16
    ]
	mon.pp = [
		ss1[2] & 0xFF,
		(ss1[2] >> 8) & 0xFF,
		(ss1[2] >> 16) & 0xFF,
		(ss1[2] >> 24) & 0xFF
    ]

    mon.hpEV = ss2[0] & 0xFF
	mon.attackEV = (ss2[0] >> 8) & 0xFF
	mon.defenseEV = (ss2[0] >> 16) & 0xFF
	mon.speedEV = (ss2[0] >> 24) & 0xFF
	mon.spAttackEV = ss2[1] & 0xFF
	mon.spDefenseEV = (ss2[1] >> 8) 
    
	mon.cool = (ss2[1] >> 16) & 0xFF
	mon.beauty = (ss2[1] >> 24) & 0xFF
	mon.cute = ss2[2] & 0xFF
	mon.smart = (ss2[2] >> 8) & 0xFF
	mon.tough = (ss2[2] >> 16) & 0xFF
	mon.sheen = (ss2[2] >> 24) & 0xFF
	mon.pokerus = ss3[0] & 0xFF
	mon.metLocation = (ss3[0] >> 8) & 0xFF

	let flags = ss3[0] >> 16
	mon.metLevel = flags & 0x7F
	mon.metGame = (flags >> 7) & 0xF
    mon.hiddenNature = (flags >> 10);
	mon.otGender = (flags >> 15) & 0x1
    flags = ss3[1]
	mon.hpIV = flags >> 1 & 0x1F
	mon.attackIV = (flags >> 5) & 0x1F
	mon.defenseIV = (flags >> 10) & 0x1F
	mon.speedIV = (flags >> 15) & 0x1F
	mon.spAttackIV = (flags >> 20) & 0x1F
	mon.spDefenseIV = (flags >> 25) & 0x1F
    mon.isEgg = (flags >> 30) & 0x1
    mon.zeroSpe = (flags >> 31) & 0x1
    
    flags = ss3[2]
    mon.pokeball = flags & 0xF;
    mon.altAbility = (flags >> 5) & 3;
	mon.coolRibbon = flags & 7
	mon.beautyRibbon = (flags >> 3) & 7
	mon.cuteRibbon = (flags >> 6) & 7
	mon.smartRibbon = (flags >> 9) & 7
	mon.toughRibbon = (flags >> 12) & 7
	mon.championRibbon = (flags >> 15) & 1
	mon.winningRibbon = (flags >> 16) & 1
	mon.victoryRibbon = (flags >> 17) & 1
	mon.artistRibbon = (flags >> 18) & 1
	mon.effortRibbon = (flags >> 19) & 1
	mon.marineRibbon = (flags >> 20) & 1
	mon.landRibbon = (flags >> 21) & 1
	mon.skyRibbon = (flags >> 22) & 1
	mon.countryRibbon = (flags >> 23) & 1
	mon.nationalRibbon = (flags >> 24) & 1
	mon.earthRibbon = (flags >> 25) & 1
	mon.worldRibbon = (flags >> 26) & 1
    return mon
}

function readMonParty(start, bytes){
    var mon = readSubStructure(start,bytes); // 20
    //var status = readNbytes(start + 60, 4, bytes);
    mon.level = readNbytes(start + 60, 1, bytes);
    //var pkrs = readNbytes(start + 85, 1, bytes);
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

