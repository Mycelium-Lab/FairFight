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
import tonRouter from './server/ton/controller.js';
import f2pRouter from './server/f2p/controller.js';
import aeonRouter from './server/aeon/controller.js';

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
        'http://13.51.64.57/'
    ],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));
server.use(express.urlencoded({extended: true}))
server.use(express.json());

server.use(express.static(path.join(__dirname,'/lib')))
server.use('/', express.static(path.join(__dirname,'/public')));
server.use('/maintenance', express.static(path.join(__dirname,'/public')));

server.use('/api', inventoryRouter)
server.use('/api', signatureRouter)
server.use('/api', statisticsRouter)
server.use('/api', leaderboardRouter)
server.use('/api', gamePropertiesRouter)
server.use('/api', airdropRouter)
server.use('/api', lootboxRouter)
server.use('/api', tonRouter)
server.use('/api', f2pRouter)
server.use('/api', aeonRouter)

server.listen(5000, async () => {
    console.log(`Server started on port 5000`)
})

