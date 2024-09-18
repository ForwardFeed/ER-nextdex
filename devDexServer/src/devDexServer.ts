import config from "../config"
import express from 'express'
import { Express } from "express"
import path from "path"
import { exec } from "child_process"

export function startServer(){
    updateData()
    return
    console.log('Initialize express server')
    const app = express()
    console.log('Adding routes')
    addRoutes(app)
    const staticPath = path.join(__dirname, '../../../static')
    console.log(`Preparing static files from ${staticPath} on /`)
    app.use("/", express.static(staticPath))
    console.log('Initialize listening')
    app.listen(config.port, ()=>{
        console.log(`Listening on port ${config.protocol}:/${config.hostname}:${config.port}/`)
    })
    
}

function addRoutes(app: Express){
    app.get('/', (req, res)=>{
        res.status(301)
        res.redirect('/index.html')
    })
    app.post('/webhook', express.json({type: 'application/json'}), (req, res)=>{
        console.log(`POST incomming on / from ${req.ip}`)
        res.status(202).send('Accepted');
        const githubEvent = req.headers['x-github-event'];
        console.log("githubEvent", githubEvent)
        if (githubEvent == "push"){
            const data = req.body
            const actions = data.actions
            //console.log(data, actions)
        }
    })
}

function updateData(){
    const cmd = `npm run run -- -o 2.1 -rd -ip ${config.projectPath} -sv 1`
    console.log(cmd)
    return
    exec(cmd, {cwd: '../'}, (err, stdout, stderr)=>{
        if (err){
            console.error(`Failed when executing ${cmd}\nerror:`, err)
        }
        console.log(stdout)
        console.error(stderr)
    })
}