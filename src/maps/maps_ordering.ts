import { readFile } from "fs";
import { GameData } from "../main";

export function getMapOrder(gameData: GameData): Promise<void>{
    return new Promise((resolved, rejected)=>{
        readFile('./src/maps/map_order.json', 'utf-8', (err_exist, data)=>{
            if (err_exist){
                return rejected(err_exist)
            }
            gameData.trainerOrder = JSON.parse(data)
            resolved()
        })
    })
    
}