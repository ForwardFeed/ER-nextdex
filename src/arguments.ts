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
    redirectData: boolean,
    comparify: string[],
    comparifyAdditional: string[],
    noConfig: boolean,
}

export const parsedValues: ParsedValues = {
    output: "",
    inputPath: "",
    structureVersion: 0,
    spritesOnly: false,
    redirectData: false,
    comparify: [],
    comparifyAdditional: [],
    noConfig: false,
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

    initArgument2Option("rd",
                        "redirect-data",
                        "do not output to out/ but directly to static/js/data/",
                        false,
                        "",
                        (_arg)=>parsedValues.redirectData = true),
    
    initArgument2Option("c",
                        "comparify",
                        `comparify at minimun two compactified files to create files\
 that highlights differences, space is used as separator, like sprites-only does it prevent the program from\
 process the data usually`,
                        true,
                        "-c \"./out/gameDataVAlpha.json ./out/gameDataVAnteriorVersion.json\"",
                        (arg)=>parsedValues.comparify = arg.split(' ')),

    initArgument2Option("ca",
                        "comparify-additional",
                        `used in comparify but only as a to compare with an never as\
 a to be compared with (sorry if that causes confusion), ignored if -c isn't used too`,
                        true,
                        "-ca \"./out/gameDataVvanilla.json\"",
                        (arg)=>parsedValues.comparifyAdditional = arg.split(' ')),
    initArgument2Option("nc",
                            "no-config",
                            `prevent the program from fetching and using the configuration file\ `,
                            false,
                            "",
                            ()=>parsedValues.noConfig = true),
    ]

function printHelpStdout(){
    
    const helpText = parsableArguments.map(x => {
        return `    -${x.short}\t--${x.long}${" ".repeat(Math.max(0, 18 - x.long.length))}: \
${x.help} ${x.example ? `(ex: ${x.example}` : ""} ${x.requiredValue ? "a value is REQUIRED": "NO value required"}`
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
                    //on help stop the program
                    if(parseOption.long == "help"){
                        process.exit(0)
                    }
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