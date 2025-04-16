'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const token = process.env.PAGE_ACCESS_TOKEN
const verifyToken = process.env.VERIFY_TOKEN

app.set('port', process.env.PORT || 5000)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === verifyToken) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Handling messages
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let event of messaging_events) {
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            sendTextMessage(sender, "Echo: " + text)
        }
    }
    res.sendStatus(200)
})

function sendTextMessage(sender, text) {
    let messageData = { text: text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error || response.body.error) {
            console.log('Error:', error || response.body.error)
        }
    })
}

app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})
