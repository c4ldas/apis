const express = require('express')
const router = express.Router()


router.use(express.static(__dirname))

router.get('/', async (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

router.get('/puuid', async (req, res) => {
  res.sendFile(__dirname + '/puuid.html')
})

router.get('/verify', async (req, res) => {
  res.sendFile(__dirname + '/verify.html')
})

router.get('/scheduler', async (req, res) => {
  res.sendFile(__dirname + '/scheduler.html')
})

module.exports = router;
