import config from "../config.js"
import express from 'express'
import { Express } from "express"
import path from "path"
import { fetchChanges } from "./git_control.js"
import file_list from "./file_list.js"


export function startServer(){
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
        // this does not track the branch where it has been committed
        if (githubEvent == "push"){
            const data = req.body
            console.log(data.head_commit)
            let shouldUpdate = false
            for (const commit of data.commits){
                for (const mod of commit.modified){
                    if (file_list.list.includes(mod)){
                        console.log(`file ${mod} is a file tracked by nextdex, updating`)
                        shouldUpdate = true
                        break
                    }
                }
                if (shouldUpdate) break
            }
            if (shouldUpdate) fetchChanges()
        }
    })
}