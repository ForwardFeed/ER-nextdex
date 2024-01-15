import * as TrainerNames from './names'
import * as Rematches from './rematches'
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
    const RematchesResult = Rematches.parse(lines, TrainerNamesResult.fileIterator)
    const TrainersTeamResult = TrainersTeam.parse(lines, RematchesResult.fileIterator)

    const trainers: Trainer[] = []
    // put all rematches right
    RematchesResult.rematches.forEach((values, key)=>{
        const baseTrainer = TrainerNamesResult.trainers.get(key)
        if (!baseTrainer) {
            console.warn(`couldn't find ${key} Trainer`)
            return
        }
        for (const rematchTrainer of values){
            const rematchBase = TrainerNamesResult.trainers.get(rematchTrainer)
            if (!rematchBase) continue
            baseTrainer.rematches.push(rematchBase)
            TrainerNamesResult.trainers.delete(rematchTrainer)
        }
    })
    TrainerNamesResult.trainers.forEach((value, key)=>{
        trainers.push({
            name: key,
            category: value.category,
            double: value.double,
            party: TrainersTeamResult.trainers.get(value.partyPtr) || [],
            insane: TrainersTeamResult.trainers.get(value.insanePtr) || [],
            rematches: value.rematches.map((x)=>{
                return {
                    double: x.double,
                    party: TrainersTeamResult.trainers.get(x.partyPtr) || []
                }
            })
        })
    })
    return trainers
}