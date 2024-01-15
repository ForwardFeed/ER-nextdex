

/*
// trainer.h
export interface Result{
    fileIterator: number,
    eggMoves: Map<string, string[]>,
}


export interface BaseTrainer {
    name: string,
    double: boolean,
    partyPtr: string,
    insanePtr: string,
}

interface Context{
    current: [],
    execFlag: string,
    stopRead: boolean,
}

function initContext(): Context{
    return {
        currentTrainer: initTrainer(),
        currentPokemon: initTrainerPokemon(),
        trainers: [],
        execFlag: "main",
        stopRead: false
    }
}
const executionMap: {[key: string]: (line: string, context: Context) => void} = {
    "rematch" : (line, context) =>{
        if (line.match('}')){
            context.currentTrainer.team.push(context.currentPokemon)
            context.currentPokemon = initTrainerPokemon()
            context.execFlag = "main"
            context.stopRead = true
        }
    }

}


export function parse(lines: string[], fileIterator: number): BaseTrainer[]{
    const lineLen = lines.length
    const context = initContext()
    for (;fileIterator<lineLen; fileIterator++){
        let line = lines[fileIterator]
        executionMap[context.execFlag](line, context)
        if (context.stopRead) break
    }
    return {
        fileIterator: fileIterator,
        eggMoves: context.eggMoves
    }
}

*/