import { exec } from "child_process";
import config from "../config.js";
import path from "path"
import { existsSync } from "fs";
import { updateData } from "./nextdex_controls.js";

const remote = {
    owner: "Elite-Redux",
    repo: "eliteredux-source",
    branch: "upcoming",
}
const folderPath = path.join('./', config.projectName)

export function initGitRepoIfDoesNotExist(){  
    console.log(`Checking if the ${folderPath} exist`)
    if (existsSync(folderPath))
        return console.log(`Repository confirmed to be existing`)
    console.log(`Repository does not exist, initializing it`)
    initRepository()
}

function initRepository(){
    const cmdClone = `git clone https://${config.token}@github.com/${remote.owner}/${remote.repo} ${config.projectName}`
    console.log(`Running ${cmdClone}`)
    exec(cmdClone, (err, stdout, stderr)=>{
        console.log('STDOUT: ', stdout)
        console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when trying to cloning the repository ${cmdClone}\nerror:`, err)
            return
        }
        updateData()
    }) 
}

export function pullChanges(){
    const cmdCheckout = `git checkout ${remote.branch}`
    console.log(`Running ${cmdCheckout}`)
    exec(cmdCheckout, {cwd: folderPath}, (err, stdout, stderr)=>{
        console.log('STDOUT: ', stdout)
        console.error('STDERR: ', stderr)
        /*if (err){
            console.error(`Failed when trying to change branch ${cmdCheckout}\nerror:`, err)
            return
        }*/
        const cmdPull = `git pull https://${config.token}@github.com/`
        console.log(`Running ${cmdPull}`)
        exec(cmdPull, {cwd: folderPath}, (err, stdout, stderr)=>{
            console.log('STDOUT: ', stdout)
            console.error('STDERR: ', stderr)
            if (err){
                console.error(`Failed when trying to pull git content ${cmdPull}\nerror:`, err)
                return
            }
            updateData()
        }) 
    }) 
}

