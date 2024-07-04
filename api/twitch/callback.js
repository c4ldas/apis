const express = require('express');
const router = express.Router();
const Database = require("@replit/database");
const db = new Database();

router.get('/', async (req, res) => {
  if (!req.query.code || req.query.error) {
    res.send(`Aplicação não foi aceita: ${req.query.error}
              <br/>
              <a href="./index.html">Voltar para a página inicial</a>
              `)
    return
  }

  // Get the access and refresh tokens
  const getTokenFetch = await fetch('https://id.twitch.tv/oauth2/token?' +
    new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TWITCH_REDIRECT_URI
    }), { method: 'POST' })

  const tokenInfo = await getTokenFetch.json();

  // Get user information based on access token
  const getchannelInfoFetch = await fetch(`https://api.twitch.tv/helix/users`, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${tokenInfo.access_token}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID,
      'Content-Type': 'application/json',
    },
  })
  const getChannelInfo = await getchannelInfoFetch.json();
  const id = getChannelInfo.data[0].id;
  const username = getChannelInfo.data[0].login;

  // Check if the user is already on database.
  const userDb = await db.get(`twitch_${username}`);

  // If it is already registered, do not generate new code but save the new token information
  code = userDb.ok ? userDb.value.code : crypto.randomUUID().replace(/-/g, '');

  // Saving data to add to database
  const dbStore = { code: code, username: username, id: id, access_token: tokenInfo.access_token, refresh_token: tokenInfo.refresh_token };

  // Saving the ID as key and the data object (code, username, access token and refresh token) as values
  db.set(`twitch_${username}`, dbStore).then(() => {
    req.session['code'] = code;
    req.session['user_key'] = `twitch_${username}`;
    req.session.cookie.maxAge = 600000; // 10 minutes

    res.redirect('/api/twitch/auth');
  })

})

module.exports = router;
