// https://repl.c4ldas.com.br/api/spotify/musica/c4ldas?channel=${channel}

const express = require('express')
const router = express.Router()
const Database = require("@replit/database")
const db = new Database()
const clc = require('cli-color')

// Defining colors for console:
const red = clc.red
const green = clc.green
const yellow = clc.yellow;

router.get('/:id', async (req, res) => {

  const refreshTokenDB = await db.get(req.params.id) || null
  const channel = req.query.channel || null
  const type = req.query.type || "text"

  try {
    // User not registered in the API
    if (!refreshTokenDB) {
      throw new Error(`Usuário '${req.params.id}' não cadastrado!`);
    }

    const accessTokenFetch = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: new URLSearchParams({
        'grant_type': 'refresh_token',
        'refresh_token': refreshTokenDB._refreshToken
      }),
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const accessToken = await accessTokenFetch.json();

    const musicFetch = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      method: 'GET',
      'headers': {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    // Spotify not running (no song playing)
    if (musicFetch.status == 204) throw new Error("Nenhuma música tocando no momento!");

    const music = await musicFetch.json();
    const song = music.item.name;
    const isPlaying = music.is_playing;
    const artists = music.item.artists.map(x => x.name).join(' & ');
    let finalMessage = `${artists} - ${song}`;
    /* const noChannel = `Por favor peça para um moderador alterar o comando para: \
    .me \${touser} ► \${customapi.https://repl.c4ldas.com.br/api/spotify/musica/${req.params.id}?channel=\$(channel)}`; */

    if(type == "json"){
      res.status(200).json(music);
      return;
    }

    if(!isPlaying) throw new Error("Nenhuma música tocando no momento!");
      
    // Channel not sent in the request
    /*     
    if (!channel) {
      throw new Error(`${finalMessage} - ${noChannel}`);
    }
    */

    // In case everything goes as expected
    console.log(`${new Date().toLocaleTimeString('en-UK')} - Channel: ${req.query.channel} - ${artists} - ${song}`);
    res.status(200).send(`${finalMessage}`);

  } catch (error) {
    console.log(red(`${new Date().toLocaleTimeString('en-UK')} - Channel: ${req.query.channel} - ${error.message}`));
    res.status(200).send(error.message)
  };
});

router.get('/c4ldas/seek', async (req, res) => {

  const refreshTokenDB = await db.get('c4ldas') || null
  const channel = req.query.channel || null

  const accessTokenFetch = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': refreshTokenDB._refreshToken
    }),
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  const accessToken = await accessTokenFetch.json();

  const seek = await fetch('https://api.spotify.com/v1/me/player/seek?position_ms=25000', {
    method: 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken.access_token}`,
      'Content-Type': 'application/json'
    }
  })
  res.send('Enviado!')
})



module.exports = router;
