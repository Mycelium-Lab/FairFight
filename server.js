import express from 'express'
import cors from "cors"
import path from 'path'
import cron from 'node-cron'
import { fileURLToPath } from 'url';

import inventoryRouter from './server/inventory/index.js'
import signatureRouter from './server/signatures/controller.js'
import statisticsRouter from './server/statistics/controller.js'
import leaderboardRouter from './server/leaderboard/controller.js'
import gamePropertiesRouter from './server/gameproperties/controller.js'
import airdropRouter from './server/airdrop/controller.js'
import lootboxRouter from './server/lootbox/controller.js'
import { createLeaderboard } from './server/leaderboard/service.js';
import { createMixingPicture } from './mixing/mixing.js';

cron.schedule("6 6 6 * * *", async () => {
    try {
        await createLeaderboard(42161)
    } catch (error) {
        console.log(error)
    }
}, {
    timezone: 'Europe/Moscow'
})

const server = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const maintenance = false

server.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'origin': [
        'http://localhost:5000',
        'https://fairfight.fairprotocol.solutions/',
        'http://16.170.248.135/',
    ],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));
server.use(express.urlencoded({extended: true}))
server.use(express.json());

server.use(express.static(path.join(__dirname,'/lib')))
server.use('/', express.static(path.join(__dirname,'/public')));
server.use('/maintenance', express.static(path.join(__dirname,'/public')));

server.use(inventoryRouter)
server.use(signatureRouter)
server.use(statisticsRouter)
server.use(leaderboardRouter)
server.use(gamePropertiesRouter)
server.use(airdropRouter)
server.use(lootboxRouter)

server.get('/', (req, res) => {
    maintenance
    ?
    res.redirect('/maintenance')
    :
    res.sendFile(__dirname+'/public/index.html')
})

server.get('/game', (req, res) => {
    maintenance
    ?
    res.redirect('/maintenance')
    :
    res.sendFile(__dirname+'/public/game.html')
})

server.get('/maintenance', async (req, res) => {
    !maintenance
    ?
    res.redirect('/')
    :
    res.sendFile(__dirname+'/public/maintenance.html')
})

server.listen(5000, async () => {
    console.log(`Server started on port 5000`)
})

