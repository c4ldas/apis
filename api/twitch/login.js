const express = require('express')
const router = express.Router()

const TWITCH_REDIRECT_URI = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/twitch/callback` 
  : `${process.env.TWITCH_CLIENT_ID}`;

router.get('/', async (req, res) => {
  res.redirect('https://id.twitch.tv/oauth2/authorize?' +
    new URLSearchParams({
      force_verify: false,
      client_id: process.env.TWITCH_CLIENT_ID,
      redirect_uri: TWITCH_REDIRECT_URI,
      response_type: 'code',
      scope: 'channel:read:predictions channel:manage:predictions',
      state: ''
    }))
})

module.exports = router;
