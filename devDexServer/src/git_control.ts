import { exec } from "child_process";
import config from "../config.js";
import path from "path"
import { existsSync } from "fs";
import { updateData } from "./nextdex_controls.js";
import file_list from "./file_list.js";


const folderPath = path.join('./', config.projectName)

export function setRemoteUrl(callback: ()=> void){
    const cmdSetRemote = `git remote set-url origin https://${config.token}@github.com/${config.remote.owner}/${config.remote.repo} &&\
git config --global http.sslVerify false`
    console.log(`Running ${cmdSetRemote}`)
    exec(cmdSetRemote, {cwd: folderPath}, (err, stdout, stderr)=>{
        if (stdout) console.log('STDOUT: ', stdout)
        if (stderr) console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when setting remote URL \nerror:`, err)
            return
        }
        callback()
    })
}

export function initGitRepoIfDoesNotExist(callback: ()=> void){  
    console.log(`Checking if the ${folderPath} exist`)
    if (existsSync(folderPath)){
        console.log(`Repository confirmed to be existing`)
        callback()
    } else {
        console.log(`Repository does not exist, initializing it`)
        cloneRepository((()=>{setRemoteUrl(callback)}))
    }
        
    
}

function cloneRepository(callback: ()=> void){
    //`mkdir ${config.projectName} && cd ${config.projectName} && git init`
    const cmdClone = `git clone -b ${config.remote.branch} --depth=1 --no-checkout --filter=blob:none https://${config.token}@github.com/${config.remote.owner}/${config.remote.repo} ${config.projectName}\
&& mkdir -p ${config.projectName}/data/maps`
    console.log(`Running ${cmdClone}`)
    exec(cmdClone, (err, stdout, stderr)=>{
        if (stdout) console.log('STDOUT: ', stdout)
        if (stderr) console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when initing git in the subfolder \nerror:`, err)
            return
        }
        callback()
    }) 
}

function sparseCheckout(callback = ()=>{}){
    //this method is rather slow because files are downloaded one by one
    const cmdSparseCheckout = `git checkout origin/${config.remote.branch} -- ${file_list.list.join(' ')}`
    console.log(`Running ${cmdSparseCheckout}`)
    exec(cmdSparseCheckout,{cwd: config.projectName} ,(err, stdout, stderr)=>{
        if (stdout) console.log('STDOUT: ', stdout)
        if (stderr) console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when sparsing checkout the repository \nerror:`, err)
            return
        }
        callback()

    }) 
}

export function fetchChanges(){
    const cmdPull = `git fetch --depth=1`
    console.log(`Running ${cmdPull}`)
    exec(cmdPull, {cwd: folderPath}, (err, stdout, stderr)=>{
        if (stdout) console.log('STDOUT: ', stdout)
        if (stderr) console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when trying to pull git content\nerror:`, err)
            return
        }
        sparseCheckout(updateData)
    })
}

