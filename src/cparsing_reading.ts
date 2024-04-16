
const CParsingNodes: [string, ()=>void][] = [
    ["type", function(){
        //wait until you find a keyword
        //or wait until you find a type
        //or wait until you found an identifier
        //go totype
    }],
    ["id", function(){
        
    }],
]
const CParsingSwitch = CParsingNodes.map(x => x[0])