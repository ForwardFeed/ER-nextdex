import { Xtox } from "../parse_utils";
import * as TrainerNames from './names'
//import * as Rematches from './rematches'
import * as TrainersTeam from './teams'



export interface Trainer{
    name: string,
    category: string,
    double: boolean,
    party: TrainersTeam.TrainerPokemon[],
    insane: TrainersTeam.TrainerPokemon[],
    rematches: RematchTrainer[]
}

export interface RematchTrainer{
    double: boolean,
    party: TrainersTeam.TrainerPokemon[]
}

export function parse(fileData: string): Trainer[]{
    const lines = fileData.split('\n')
    const TrainerNamesResult = TrainerNames.parse(lines,0)
    //const RematchesResult = Rematches.parse(lines, TrainerNamesResult.fileIterator)
    const TrainersTeamResult = TrainersTeam.parse(lines, TrainerNamesResult.fileIterator)
    // put all rematches right
    const rematchIntegratedTrainers: Map<string, TrainerNames.BaseTrainer> = new Map()

    const trainers: Trainer[] = []
    TrainerNamesResult.trainers.forEach((value, key)=>{
        trainers.push({
            name: key,
            category: value.category,
            double: value.double,
            party: TrainersTeamResult.trainers.get(value.partyPtr) || [],
            insane: TrainersTeamResult.trainers.get(value.insanePtr) || [],
            rematches: value.rematches
                .filter((x)=> { 
                    if (TrainersTeamResult.trainers.get(x.partyPtr)){
                        return TrainersTeamResult.trainers.get(x.partyPtr).length > 0
                    } else {
                        return false
                    }     
                })
                .map((x)=>{
                    return {
                        double: x.double,
                        party: TrainersTeamResult.trainers.get(x.partyPtr) || []
                    }
                })
        })
    })
    return trainers
}