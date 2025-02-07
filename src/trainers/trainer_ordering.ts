import { readFile } from "fs";
import { GameData } from "../main";

export function getTrainerOrder(gameData: GameData): Promise<void>{
    return new Promise((resolved, rejected)=>{
        readFile('./src/trainers/trainer_order.json', 'utf-8', (err_exist, data)=>{
            if (err_exist){
                return rejected(err_exist)
            }
            gameData.trainerOrder = JSON.parse(data).order
            resolved()
        })
    })
    
}