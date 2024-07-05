// https://repl.c4ldas.com.br/api/spotify/musica/c4ldas?channel=${channel}

const express = require('express');
const Database = require("@replit/database");
const clc = require('cli-color');
const router = express.Router();
const db = new Database();

// Defining colors for console:
const red = clc.red;
const green = clc.green;
const yellow = clc.yellow;

const tokenRaw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
const token = Buffer.from(tokenRaw).toString("base64");

router.get('/:id', async (req, res) => {
  try {
    const channel = req.query.channel || null;
    const type = req.query.type || "text";
    const dbRequest = await db.get(req.params.id);
    
    if(!dbRequest.ok) throw new Error(`Usuário "${req.params.id}" não cadastrado!`);

    const accessToken = await getAccessToken(dbRequest.value._refreshToken);
    const music = await getSong(accessToken);

    if(type == "json") return res.status(200).json(music);
    if(!music.is_playing) throw new Error ("Nenhuma música tocando no momento!");
    
    const song = music.item.name;
    const artists = music.item.artists.map(x => x.name).join(' & ');
    let finalMessage = `${artists} - ${song}`;

    // In case everything goes as expected
    console.log(green(`Spotify Song - Channel: ${req.query.channel} - ${artists} - ${song}`));
    res.status(200).send(`${finalMessage}`);

  } catch (error) {
    console.log(red(`Spotify Song Error - Channel: ${req.query.channel} - ${error.message}`));
    res.status(200).send(error.message);
  };
});


async function getAccessToken(refreshToken){
  try {    
    const request = await fetch('https://accounts.spotify.com/api/token', {
      "method": "POST",
      "body": new URLSearchParams({
        "grant_type": "refresh_token",
        "refresh_token": refreshToken
      }),
      "headers": {
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    
    if(request.status != 200){
      throw ({ status: request.status, statusText: request.statusText, message: "Access token request failed!" });
    }
    const response = await request.json();
    return response.access_token;
    
  } catch (error) {
    console.log(red("Spotify getAccessToken():", error));
    console.log(red(__filename));
    throw error;
  }
}


async function getSong(accessToken){
  try {    
    const request = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      "method": "GET",
      "headers": {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`        
      }
    });

    if (request.status != 200 && request.status != 204) {
      throw({ status: request.status, statusText: request.statusText, message: "Song request failed"})
    }
 
    if (request.status == 204) {
      throw ({ status: request.status, statusText: request.statusText, message: "Nenhuma música tocando no momento!" });
    }
    
    const response = await request.json();
    return response;
    
  } catch (error) {
    console.log(red("Spotify getSong():", error));
    console.log(red(__filename));
    throw error;
  }
}

module.exports = router;


/* 
router.get('/c4ldas/seek', async (req, res) => {

  const dbRequest = await db.get('c4ldas');
  const refreshTokenDB = dbRequest.value;
  const channel = req.query.channel || null

  const accessTokenFetch = await fetch('https://accounts.spotify.com/api/token', {
    "method": "POST",
    "body": new URLSearchParams({
      "grant_type": "refresh_token",
      "refresh_token": refreshTokenDB._refreshToken
    }),
    "headers": {
      "Authorization": `Basic ${token}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
  const accessToken = await accessTokenFetch.json();

  // Push to 30 seconds of the song
  const seek = await fetch('https://api.spotify.com/v1/me/player/seek?position_ms=30000', {
    method: 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken.access_token}`,
      'Content-Type': 'application/json'
    }
  })
  res.send('Enviado!')
})
 */