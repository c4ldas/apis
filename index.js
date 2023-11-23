const express = require('express') // Express server
const app = express()
const cors = require('cors')
const fetch = require('node-fetch')
app.use(cors())
app.set('view engine', 'ejs')
app.use(express.static(__dirname))


// Database things
app.use("/api/database", require('./api/database'))

// Spotify things
app.use("/api/spotify", require('./api/spotify'))
app.use("/api/spotify/login", require('./api/spotify/login'))
app.use("/api/spotify/callback", require('./api/spotify/callback'))
app.use("/api/spotify/musica", require('./api/spotify/musica'))

// Steam things
app.use("/api/steam", require('./api/steam'))
app.use("/api/steam/game", require('./api/steam/game'))


// Valorant things
app.use('/api/valorant', require('./api/valorant'))
app.use('/api/valorant/rank', require('./api/valorant/rank'))
app.use('/api/valorant/schedule', require('./api/valorant/schedule'))

// Twitch things
app.use('/api/twitch', require('./api/twitch'))
app.use('/api/twitch/prediction', require('./api/twitch/prediction'))
app.use('/api/twitch/callback', require('./api/twitch/callback'))
app.use('/api/twitch/login', require('./api/twitch/login'))

// TFT things
app.use('/api/tft', require('./api/tft'))
app.use('/api/tft/rank', require('./api/tft/rank'))

// LOL things
app.use('/api/lol', require('./api/lol'))
app.use('/api/lol/rank', require('./api/lol/rank'))

// Youtube things
app.use('/api/youtube', require('./api/youtube'))

// Home page
app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.get('/api', async (req, res) => {
  res.redirect('../')
})

// app.get('/teste', async (req, res) => {
//   const message = "hello, how are you?"
//   const seconds = 5
//     setTimeout( () => {
//     res.send(message)
//   }, seconds * 1000)
// })

// Starting server
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on port " + listener.address().port);

  // Starting my other repository seapi every 5 minutes
  setInterval(async () => {
    // fetch('https://seapi.c4ldas.com.br/ping')
    fetch('https://teste.spellfiretv.repl.co')
  }, 300000)
});


