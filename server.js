const express = require('express')
const server = express()
const path = require('path')

server.use(express.static(path.join(__dirname,'/lib')))
server.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

server.get('/game', (req, res) => {
    console.log(req.query)
    res.sendFile(__dirname + '/public/game.html')
})

server.get('/sign', (req, res) => {
    res.json({v: 21, r: 'sss', s: 'sssaaaaa'})
})

server.listen(5000)

