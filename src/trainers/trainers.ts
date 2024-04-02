import { GameData } from "../main";
import { autojoinFilePath, getMulFilesData } from "../utils";
import * as TrainerNames from './names'
import * as Rematches from './rematches'
import * as TrainersTeam from './teams'



export interface Trainer{
    realName: string,
    name: string,
    NAME: string,
    tclass: string,
    double: boolean,
    party: TrainersTeam.TrainerPokemon[],
    insane: TrainersTeam.TrainerPokemon[],
    rematches: RematchTrainer[],
    ptr: string,
    ptrInsane: string,
    gender: boolean, // true w*man
    music: string,
    pic: string,
    rematchM: string,
}

export interface RematchTrainer{
    double: boolean,
    party: TrainersTeam.TrainerPokemon[],
    ptr: string,
    NAME: string,
}


function parse(fileData: string): Map<string, Trainer>{
    const lines = fileData.split('\n')
    const RematchesResult = Rematches.parse(lines, 0)
    const TrainerNamesResult = TrainerNames.parse(lines, RematchesResult.fileIterator)
    const TrainersTeamResult = TrainersTeam.parse(lines, TrainerNamesResult.fileIterator)
    const trainers: Map<string, Trainer> = new Map()
    TrainerNamesResult.trainers.forEach((value, key)=>{
        if (RematchesResult.rematched.indexOf(key) != -1) return
        const rematchList = RematchesResult.rematches.get(key) || []
        let rematchM: string= ""
        const rematchs = rematchList.map((x, i)=> {
            const rem = TrainerNamesResult.trainers.get(x)
            if (!i) rematchM = x
            if (!rem) return 
            return {
                double: rem.double,
                party: TrainersTeamResult.trainers.get(rem.partyPtr) || [],
                ptr: rem.partyPtr,
                NAME: rem.NAME
            } as RematchTrainer
        }).filter(x => x) as RematchTrainer[]

        trainers.set(value.NAME, {
            name: value.NAME,
            realName: value.name,
            NAME: value.NAME,
            tclass: value.tclass,
            double: value.double,
            party: TrainersTeamResult.trainers.get(value.partyPtr) || [],
            insane: TrainersTeamResult.trainers.get(value.insanePtr) || [],
            rematches: rematchs,
            ptr: value.partyPtr,
            ptrInsane: value.insanePtr,
            gender: value.gender, // true w*man
            music: value.music,
            pic: value.pic,
            rematchM: rematchM
        })
    })
    return trainers
}

export function getTrainers(ROOT_PRJ: string, gameData: GameData): Promise<void>{
    return new Promise((resolve: ()=>void, reject)=>{
        const filepaths = autojoinFilePath(ROOT_PRJ, [  
                                                        'src/battle_setup.c',
                                                        'src/data/trainers.h',
                                                        'src/data/trainer_parties.h'])
        getMulFilesData(filepaths, {filterComments: true, filterMacros: true, macros: new Map()})
        .then((fileData)=>{
                gameData.trainers = parse(fileData)
                resolve()
        })
        .catch((reason)=>{
            const err = 'Failed at getting trainers reason: ' + reason
            reject(err)
        })
    })
    
}