const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.redirect('https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-currently-playing user-modify-playback-state',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            // redirect_uri: 'https://c4ldas.repl.co/api/spotify/callback',
            show_dialog: false
        }))
})

module.exports = router;
