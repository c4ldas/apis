const fetch = require('node-fetch')
const express = require('express')
const router = express.Router()
const Database = require("@replit/database")
const db = new Database()

router.get('/', async (req, res) => {
  if (req.query.error) {
    res.send(`Aplicação não foi aceita: ${req.query.error}`)
    return
  }
   
  const getTokenFetch = await fetch('https://accounts.spotify.com/api/token', {
    'method': 'POST',
    'headers': {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`
    },
    'body': new URLSearchParams({
      'grant_type': "authorization_code",
      'code': req.query.code,
      'redirect_uri': process.env.SPOTIFY_REDIRECT_URI
      //'redirect_uri': 'https://c4ldas.repl.co/api/spotify/callback'
    })
  })
  const getTokenJson = await getTokenFetch.json();

  console.log("getTokenJson: ", getTokenJson)
  
  const me = await fetch('https://api.spotify.com/v1/me', {
    'method': 'GET',
    'headers': {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${getTokenJson.access_token}`
    },    
  })
  const meFetch = await me.json()
  // console.log('About me: ', meFetch)

  const id = meFetch.id
  const displayName = meFetch.display_name
  const token = getTokenJson.access_token
  const refreshToken = getTokenJson.refresh_token

  
  const values = {
    _displayName: displayName,
    _token: token,
    _refreshToken: refreshToken,
  }

  console.log("Line 52 values");
  console.log("id: ", id);
  console.log("values: ", values);
  console.log(db)
  console.log("await db.set(id, values)");
  await db.set(id, values);
  console.log(values);
  res.render(__dirname + '/callback.ejs', { displayName: displayName, id: id });

  
})

module.exports = router;
