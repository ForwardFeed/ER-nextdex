import { gameData } from "./data_version.js";
import { setFullTeam } from "./panels/team_builder.js";

export function setupLoadSave(){
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
    $('#open-team-savefile').before(input).on('click', function(){
        input.click()
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

function readTeamSize(teamOffset, bytes){
    var oft = teamOffset + 564;
    var sizeTeam = readNbytes(oft,4,bytes);
    return sizeTeam; 
}

function readBox(ofs ,bytes, missedBytes, remainingUnread, maxOfs) {
    var monList = []
    if (missedBytes){
        var nbToFill = 80 - missedBytes.length
        var bytesFilling = bytes.slice(ofs, ofs + nbToFill)
        var mergedBytes = new Uint8Array(80)
        mergedBytes.set(missedBytes);
        mergedBytes.set(bytesFilling, missedBytes.length);
        ofs += nbToFill;
        var mon = readMonBox(0, mergedBytes);
        if (mon) monList.push(createGEN3mon(mon))
        if (! remainingUnread--) return {list: monList, mof: null, remainingUnread: 0};
    }
    for (; (ofs + 80) <= maxOfs; ofs+=80){
        var mon = readMonBox(ofs, bytes);
        if (mon) monList.push(createGEN3mon(mon))
        if (! remainingUnread--) return {list: monList, mof: null, remainingUnread: 0};
    }
    if (ofs != maxOfs) {
        missedBytes = bytes.slice(ofs, maxOfs)
    } else {
        missedBytes = null
    }
    return { list: monList, mof: missedBytes, remainingUnread: remainingUnread}
}

function getFooterData(startOffset, endOffset, bytes) {
    var SIZE_SECTOR = 4096;
    var TI, //TEAM / ITEM
        SI, //Save index
        PC = [], // PC
        GS = [] // Game Sector testing purpose
        
    for (var ofs = startOffset; ofs < endOffset; ofs += SIZE_SECTOR){
        var off = ofs + 4084 //offset footer
        var sID = readNbytes(off,2,bytes)//Sector ID
        if (sID == 1){
            TI = ofs
        } else if (sID >= 5){
            PC[sID - 5] = ofs
        } else {
            GS[sID] = ofs
        }
        var CS = readNbytes(off +2 ,2,bytes); //Checksum
        var SG = readNbytes(off +4 ,2,bytes); //Signature
        SI =readNbytes(off +8 ,2,bytes); //Save Index
    }
    if (SI == 65535) SI = 0; //javascript aint build for binary
    return {
        SI: SI,
        TI: TI,
        PC: PC,
        GS: GS,
    }
}
var comp = []
function readSubStructure(OTID, personV, start, bytes){
    var key = OTID ^ personV;
    var substructSelector = [
		[0, 1, 2, 3],
		[0, 1, 3, 2],
		[0, 2, 1, 3],
		[0, 3, 1, 2],
		[0, 2, 3, 1],
		[0, 3, 2, 1],
		[1, 0, 2, 3],
		[1, 0, 3, 2],
		[2, 0, 1, 3],
		[3, 0, 1, 2],
		[2, 0, 3, 1],
		[3, 0, 2, 1],
		[1, 2, 0, 3],
		[1, 3, 0, 2],
		[2, 1, 0, 3],
		[3, 1, 0, 2],
		[2, 3, 0, 1],
		[3, 2, 0, 1],
		[1, 2, 3, 0],
		[1, 3, 2, 0],
		[2, 1, 3, 0],
		[3, 1, 2, 0],
		[2, 3, 1, 0],
		[3, 2, 1, 0],
    ]
    var selected = substructSelector[(personV >>> 0) % 24]
    var ss0 = [0,0]
	var ss1 = [0,0]
	var ss2 = [0,0]
	var ss3 = [0,0]
    for (var i = 0; i<3; i++){
        ss0[i] = readNbytes(start + 32 + selected[0] * 12 + i * 4 ,4, bytes) ^ key;
        ss1[i] = readNbytes(start + 32 + selected[1] * 12 + i * 4 ,4, bytes) ^ key;
        ss2[i] = readNbytes(start + 32 + selected[2] * 12 + i * 4 ,4, bytes) ^ key;
        ss3[i] = readNbytes(start + 32 + selected[3] * 12 + i * 4 ,4, bytes) ^ key;
    }
    //var 
    var mon = {};

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

//80 bytes
function readMonBox(start, bytes){
    var personality = readNbytes(start, 4, bytes);
    if (!personality) return false
    var otId = readNbytes(start + 4, 4, bytes);
    //var nickName = readNbytes(start + 8, 10, bytes);
    //var lang = readNbytes(start + 18, 1, bytes);
    //var eggName = readNbytes(start + 19, 1, bytes);
    //var OTname = readNbytes(start + 20, 7, bytes);
    //var markings = readNbytes(start + 27, 1, bytes);
    //var checksum = readNbytes(start + 28, 2, bytes);
    //var wtf = readNbytes(start + 30, 2, bytes);
    //var data = readNbytes(start + 32, 48, bytes);
    var mon = readSubStructure(otId, personality, start,bytes);
    mon.personality = personality;
    mon.otId = otId;
    //Box trick
    mon.level = getGEN3level(mon.experience, mon.species);
    return mon
}
//100 bytes
function readMonParty(start, bytes){
    var personality = readNbytes(start, 4, bytes);
    var otId = readNbytes(start + 4, 4, bytes);
    //var nickName = readNbytes(start + 8, 10, bytes);
    //var lang = readNbytes(start + 18, 1, bytes);
    //var eggName = readNbytes(start + 19, 1, bytes);
    //var OTname = readNbytes(start + 20, 7, bytes);
    //var markings = readNbytes(start + 27, 1, bytes);
    //var checksum = readNbytes(start + 28, 2, bytes);
    //var wtf = readNbytes(start + 30, 2, bytes);
    //var data = readNbytes(start + 32, 48, bytes);
    var mon = readSubStructure(otId, personality, start,bytes);
    mon.personality = personality;
    mon.otId = otId;
    //var status = readNbytes(start + 80, 4, bytes);
    mon.level = readNbytes(start + 84, 1, bytes);
    //var pkrs = readNbytes(start + 85, 1, bytes);
    mon.liveStat = {}
    mon.liveStat.currentHP = readNbytes(start + 86, 2, bytes);
    mon.liveStat.totalHP = readNbytes(start + 88, 2, bytes);
    mon.liveStat.atk = readNbytes(start + 90, 2, bytes);
    mon.liveStat.def = readNbytes(start + 92, 2, bytes);
    mon.liveStat.spe = readNbytes(start + 94, 2, bytes);
    mon.liveStat.spa = readNbytes(start + 96, 2, bytes);
    mon.liveStat.spd = readNbytes(start + 98, 2, bytes);
    return mon
}
function slowCurve(n){
    return Math.floor((5*(n**3))/4)
}
function fastCurve(n){
    return Math.floor((4*(n**3))/5)
}
function medfastCurve(n){
    return n**3
}
function medslowCurve(n){
    return Math.floor((6 * (n)**3) / 5) - (15 * (n)**2) + (100 * n) - 140
}
function erraticCurve(n){
    if (n<=50) return Math.floor(((100 - n)*n**3)/50)
    if (n<=68) return Math.floor(((150 - n)*n**3)/100)
    if (n<=98) return Math.floor(Math.floor((1911 - 10 * n) / 3) * n**3 / 500)
    return Math.floor((160 - n) * n**3 / 100)
}
function flutuatingCurve(n){
    if (n<15) return Math.floor((Math.floor((n + 1) / 3) + 24) * n**3 / 50)
	if (n<=36) return Math.floor((n + 14) * n**3 / 50)
	return Math.floor((Math.floor(n / 2) + 32) * n**3 / 50)
}
const curveMap = {
    'GROWTH_MEDIUM_SLOW': medslowCurve,
    'GROWTH_FAST': fastCurve,
    'GROWTH_MEDIUM_FAST': medfastCurve,
    'GROWTH_SLOW': slowCurve,
    'GROWTH_ERRATIC': erraticCurve,
}
function getGEN3expRequired(species,level) {
	const fn  = curveMap[gameData.growT[species.stats.grow]]
    if (!fn){
        flutuatingCurve(level)
    } else {
        fn(level)
    }
}

function getGEN3level(exp, species){
    var level = 1
	while (exp >= getGEN3expRequired(species,level+1)) {
        level=level+1
    }
	return level
}

function getGEN3Ability(mon){
    return mon.altAbility
}
function getRandomAbi(mon, ability){
    //wrong will not correct because meh flemme
    ability = gameData.abilities.indexOf(ability)
    var randomizedAbility = (ability + mon.species + mon.personality) % abilities.length 
    randomizedAbility += 1
    return gameData.abilities[randomizedAbility]
}

function getGEN3Nature(mon){
    //mon.hiddenNature = mon.personality % 25;
    if (mon.hiddenNature == 26){
        return gameData.natureT[mon.personality % 25]
    }
    return gameData.natureT[mon.hiddenNature]
}
const HPTYPE = [
    "Fighting",
    "Flying",
    "Poison",
    "Ground",
    "Rock",
    "Bug",
    "Ghost",
    "Steel",
    "Fire",
    "Water",
    "Grass",
    "Electric",
    "Psychic",
    "Ice",
    "Dragon",
    "Dark",
]
export function getGEN3HP(mon) {
    var hptype = ((mon.hpIV%2 + (2*(mon.attackIV%2))+(4*(mon.defenseIV%2))+(8*(mon.speedIV%2))+(16*(mon.spAttackIV%2))+(32*(mon.spDefenseIV%2)))*5)/21 
    return HPTYPE[Math.floor(hptype)]
}
function createGEN3mon(mon){
    var poke = {};
    poke.person = mon.personality;
    poke.item = 0; //lazy but i could parse that eventually
    const speciesLen = gameData.species.length
    for (let i =0; i < speciesLen; i++){
        const specie = gameData.species[i]
        if (mon.species === specie.dex.id) {
            poke.species = i
            break
        }
    }
    /*if (window.randomAbi){
        var ability = pokedex[poke.species].abilities[mon.altAbility]
        poke.ability = getRandomAbi(mon, ability)
        poke.innates = [
            getRandomAbi(mon, pokedex[poke.species].innates[0]),
            getRandomAbi(mon, pokedex[poke.species].innates[1]),
            getRandomAbi(mon, pokedex[poke.species].innates[2]),
        ]
    } else {*/
        poke.ability = getGEN3Ability(mon);
    //}
    
    poke.level = mon.level;
    poke.nature = getGEN3Nature(mon);
    poke.ivs = {
        hp: mon.hpIV,
        at: mon.attackIV,
        df: mon.defenseIV,
        sa: mon.spAttackIV,
        sd: mon.spDefenseIV,
        sp: mon.speedIV
    };
    poke.evs = {
        hp: mon.hpEV,
        at: mon.attackEV,
        df: mon.defenseEV,
        sa: mon.spAttackEV,
        sd: mon.spDefenseEV,
        sp: mon.speedEV
    };
    poke.hPWR = getGEN3HP(mon)
    poke.moves = [];
    for (var i=0; i<4; i++) {
        var move = gameData.moves[mon.moves[i]]
        if (move.id === mon.moves[i]){
            poke.moves[i] = mon.moves[i]
        } else {
            const movesLen = gameData.moves.length
            for (let m=0; m < movesLen; m++){
                if (gameData.moves[m].id === mon.moves[i]) {
                    poke.moves[i] = m
                    break
                }
            }
        }
        /*if (move == "Hidden Power") {
            move = move + " " + poke.hPWR;
        }*/
        
    }
    poke.zeroSpe = mon.zeroSpe;
    var genderRatio = gameData.species[poke.species].stats.gender
    var pGender = mon.personality % 256
    if (genderRatio == 255){
        poke.gender = 'N'
    } else if (genderRatio != 0 && genderRatio < pGender ){
        poke.gender = 'F'
    } else {
        poke.gender = 'M'
    }
    return poke
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
        var SIZE_SECTOR = 4096;
        var DATA_FIELD = 3968;
        var COUNT_MAIN = 14; 
        var SIZE_MAIN = COUNT_MAIN * SIZE_SECTOR;
        var GameA = getFooterData(0, 57344, bytes);
        var GameB = getFooterData(57344, 114688, bytes)
        var RSave = GameA.SI > GameB.SI ? GameA : GameB; //recent Save
        //GS[0] = SaveBlock2
        //var gameSets = RSave.GS[0] + 0x97
        //gameSets = readNbytes(gameSets, 2, bytes)
        //(gameSets & 1 ? "Autorun" : "Manual run")
        //gameSets & 2 ? "Permanent repel" : "Manual Repel")
        //(gameSets & 64 ? "Enable EV" : "Disable EV") 
        /*if (gameSets & 64){
            $('#no-ev-off').prop("checked", true);
        } else {
            $('#no-ev-on').prop("checked", true);
        }*/
        //(gameSets & 128 ? "Player AI" : "Player Human") 
        /*var randomSets = bytes[RSave.GS[0] + 0xF30]
        var randomAbi = randomSets & 4
        if (randomAbi) {
            window.randomAbi = true
            $('#all-abis-on').prop("checked", true)
            $('#all-abis-on').change()
        }*/
        try {
            var teamsize = readTeamSize(RSave.TI, bytes)
            var teamOffset = RSave.TI + 568;
            var teamList = []
            for (var i = 0; i< teamsize; i++){
                var mon = readMonParty(teamOffset + (i * 100), bytes)
                mon = createGEN3mon(mon)
                const evs = mon.evs
                teamList.push({
                    spc: mon.species,
                    isShiny: false,
                    abi: mon.ability,
                    moves: mon.moves,
                    item: undefined,
                    ivs: [31, 31, 31, 31, 31, mon.zeroSpe ? 0 : 31],
                    evs: [evs.hp, evs.at, evs.df, evs.sa, evs.sd, evs.sp],
                    nature: gameData.natureT.indexOf(mon.nature)
                });
            }
            setFullTeam(teamList)            
           
            // get the numbers of pokemon to read from the settings
            /*var remainingUnread = +$('#sv-nb-pkm').val();
            var missedBytes = null
            var monList = [];
            for (var boxI = 0; boxI < RSave.PC.length; boxI++){
                var boxOfs = RSave.PC[boxI];
                var maxOfs = RSave.PC[boxI] + 3968;
                if (boxI == 0) {
                    boxOfs += 4
                }
                if (boxI == 8) {
                    maxOfs = RSave.PC[boxI] + 2000;
                }
                var box = readBox(boxOfs, bytes, missedBytes, remainingUnread, maxOfs)
                missedBytes = box.mof
                monList = monList.concat(box.list)
                remainingUnread = box.remainingUnread
                if (remainingUnread == 0) break;
            }
            dispatchPlayerMon(monList);*/
        } catch (e) {
            console.warn(e)
        }
    }
    reader.readAsArrayBuffer(file);
};

/*
function gen3_loadsave (){
    var importZone = $('#import-zone')
    importZone.val("");
    importZone.prop("placeholder", "you can also drop your save file here");
    importZone.on({
        dragenter: function(e){
            if (pokeDragged){
                return
            }
            importZone.css("background-color", "var(--button-hover)")
        },
        dragleave: function(e){
            if (pokeDragged){ // don't show the visual hint for a non-file, should make this more robust tho
                return
            }
            importZone.css("background-color", "var(--background)")
        },
        drop: function(e){
            if(e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
                parseFileGen3(e.originalEvent.dataTransfer.files[0]);
                importZone.css("background-color", "var(--background)")
            }
        }
    })
    var input = document.createElement("input");
    input.id = "savefile-upload";
    input.type = "file";
    input.accept = ".sav";
    input.className = "visually-hidden";
    input.onchange = parseFileGen3;
    var button = document.createElement("button");
    button.innerText = "Import from savefile";
    button.onclick = ()=>{input.click()}
    var importDiv = document.getElementById("import-1_wrapper");
    importDiv.append(input);
    importDiv.append(button);
};
*/