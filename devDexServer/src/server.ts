import config from "../config.js"
import express from 'express'
import { Express } from "express"
import path from "path"
import { fetchChanges } from "./git_control.js"
import SmeeClient from "smee-client"


export function startServer(){
    console.log('init smee')
    const smee = new SmeeClient({
        source: 'https://smee.io/elitereduxtest',
        target: `http://localhost:${config.port}/webooks`,
        logger: console
    })
    smee.start()
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
    //nextdex serving
    app.get('/', (req, res)=>{
        res.status(301)
        res.redirect('/index.html')
    })
    //github webhooks
    app.post('/webooks', express.json({type: 'application/json'}), (req, res)=>{
        console.log(`POST incomming on / from ${req.ip}`)
        res.status(202).send('Accepted');
        const githubEvent = req.headers['x-github-event'];
        console.log("githubEvent", githubEvent)
        if (githubEvent == "push"){
            const data = req.body
            const actions = data.actions
            console.log(data, actions)
            fetchChanges()
        }
    })
}