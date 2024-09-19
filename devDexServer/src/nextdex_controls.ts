import { exec } from "node:child_process"
import config from "../config"


export function updateData(){
    const cmd = `npm run run -- -o ${config.version} -rd -ip devDexServer/${config.projectName} -sv 1`
    console.log(`Running ${cmd}`)
    exec(cmd, {cwd: '../'}, (err, stdout, stderr)=>{
        console.log(stdout)
        console.error(stderr)
        if (err){
            console.error(`Failed when executing ${cmd}\nerror:`, err)
        }
        
    })
}