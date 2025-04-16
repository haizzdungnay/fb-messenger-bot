'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', process.env.PORT || 5000)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Route gốc
app.get('/', (req, res) => {
  res.send('Hello world, I am a chat bot')
})

// Route xác thực Webhook
app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// Route nhận tin nhắn
app.post('/webhook/', (req, res) => {
  let messaging_events = req.body.entry[0].messaging
  for (let event of messaging_events) {
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
    }
  }
  res.sendStatus(200)
})

// Gửi lại tin nhắn
const token = "<PAGE_ACCESS_TOKEN>"

function sendTextMessage(sender, text) {
  let messageData = { text: text }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData
    }
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending message:', error)
    } else if (response.body.error) {
      console.log('Response body error:', response.body.error)
    }
  })
}

// Khởi động server
app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'))
})
