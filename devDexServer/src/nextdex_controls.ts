import { exec } from "node:child_process"
import config from "../config"


export function updateData(){
    const cmd = `npm run run -- -o ${config.version} -rd -ip devDexServer/${config.projectName} -sv ${config.structureVersion} -nc`
    console.log(`Running ${cmd}`)
    exec(cmd, {cwd: '../'}, (err, stdout, stderr)=>{
        if (stdout) console.log('STDOUT: ', stdout)
        if (stderr) console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when executing \nerror:`, err)
        } else {
            console.log(`success updating data`)
        }
    })
}