import { Config } from "./src/types.js"
// just rename this file to config.ts and you can compile
const config: Config =  {
    port: "3000",
    hostname: "localhost",
    protocol: "http",
    projectName: "eliteredux", //care to put well that into the .gitignore
    token: "",
    version: "2.1",
    structureVersion: 2,
    remote:  {
        owner: "Elite-Redux",
        repo: "eliteredux-source",
        branch: "upcoming",
    }
}

export default config