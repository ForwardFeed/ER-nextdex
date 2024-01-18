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

    TrainerNamesResult.trainers.forEach((trainerdata, trainerName)=>{
        let name = Xtox('TRAINER_', trainerName)
        if (!name.includes('Grunt')){
            //grunts in pokemon are only recognizeable by their 1
            // however trainers have random numbers in them
            const trainerNumberRegArray = name.match(/(?<= )\d+$/)
            if (trainerNumberRegArray){
                const trainerNumber = trainerNumberRegArray[0]
                name = name.replace(/\s\d+$/,'')
                //let's hope that the 1 is always first declared
                if (trainerNumber === "1"){
                    rematchIntegratedTrainers.set(name, trainerdata)
                } else {
                    let trainer1 = rematchIntegratedTrainers.get(name)
                    if (!trainer1){
                        console.warn(`couldn't find the key of ${trainerName} as key ${name}`)
                        rematchIntegratedTrainers.set(name, trainerdata)
                    } else {
                        trainer1.rematches.push(trainerdata)
                        rematchIntegratedTrainers.set(name, trainer1)
                    }
                }
            }
        }
    })
    const trainers: Trainer[] = []
    rematchIntegratedTrainers.forEach((value, key)=>{
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