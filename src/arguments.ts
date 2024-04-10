import { Interface } from "readline"

interface Argument2Option {
    short: string,
    long: string,
    help: string,
    example: string | undefined,
    requiredValue: boolean,
    fn: (arg: string | undefined)=>void,
}

function initArgument2Option(
    short: string,
    long: string,
    help: string,
    requiredValue: boolean,
    example: string | undefined,
    fn: (arg: string)=>void = ()=>{}
): Argument2Option{
    return{
        short: short,
        long: long,
        help: help,
        requiredValue: requiredValue,
        example: example,
        fn: fn
    }
}

export interface ParsedValues{
    output: string,
    inputPath: string,
    structureVersion: number,
    spritesOnly: boolean,
}

export const parsedValues: ParsedValues = {
    output: "",
    inputPath: "",
    structureVersion: 0,
    spritesOnly: false,
}

const parsableArguments = [
    initArgument2Option("h", "help", "print this helping menu", false, "", printHelpStdout),
    initArgument2Option("o", 
                        "output", 
                        "partial name of the output files",
                        true,
                        "-o Alpha to output to gameDataVAlpha.json, default will just be gameData.json",
                        (arg)=>parsedValues.output = arg),
    
    initArgument2Option("ip", 
                        "input-path",
                        "override the path set in nextdex_config.json",
                        true,
                        "-ip /home/james/pokeemeraldproject/",
                        (arg)=>parsedValues.inputPath = arg),

    initArgument2Option("sv",
                        "structure-version",
                        "define the version of the parsing algo",
                        true,
                        "-sv 0 : to use the default",
                        (arg)=>parsedValues.structureVersion = +arg),

    initArgument2Option("so",
                        "sprites-only",
                        "only export the sprites and do not process the data",
                        false,
                        "",
                        (_arg)=>parsedValues.spritesOnly = true),
]

function printHelpStdout(){
    
    const helpText = parsableArguments.map(x => {
        return `    -${x.short}\t--${x.long}${" ".repeat(18 - x.long.length)}: ${x.help} ${x.example ? `(ex: ${x.example}` : ""}`
    }).join('\n')
    console.log("Printing help: \n" + helpText + "\n" + "End of the help. Have a positive day.")
}

export function parseArguments(args: string[]): ParsedValues{
    const argsLeng = args.length
    let errorMessages: string[] = []
    // 0 is the name of the script
    for (let i = 2; i < argsLeng; i++){
        const arg = args[i]
        const startsWithDash = arg.match(/^-+/)
        if (startsWithDash){
            const longOrShort = startsWithDash[0].length == 1 ? "short": "long"
            const argName = arg.replace(/^-+/, '')
            let hasMatchedSomething = false
            for (const parseOption of parsableArguments){
                if (parseOption[longOrShort] === argName){
                    let value: string | undefined = undefined
                    if (parseOption.requiredValue){
                        i++
                        if (i == argsLeng){
                            errorMessages.push(`${parseOption[longOrShort]} requires a value`)
                            break
                        }
                        value = args[i]
                        if (value.match(/^-/)){
                            errorMessages.push(`${parseOption[longOrShort]} requires a value, if you want to start the value by - then use two (\\\\) backslash`)
                            break
                        }
                        //replace starting backslash
                        value = value.replace(/^\\+/, '')
                    }
                    parseOption.fn(value)
                    hasMatchedSomething = true
                    break
                }
            }
            if (!hasMatchedSomething){
                errorMessages.push(`${arg} is not recognized as an option`)
            }
        } else {
            errorMessages.push(`${arg} ? options needs to start with - or -- to be interpreted`)
        }
    }
    if (errorMessages.length){
        console.warn(errorMessages.join('\n'), `You may want to try --help or -h to look more in details on how works the program,
Regardless the program will proceed ignoring all considered misinputs`)
    }
    return parsedValues
}