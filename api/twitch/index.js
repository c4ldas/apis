const express = require('express')
const router = express.Router()

const code = require('./callback.js').code

router.use(express.static(__dirname))

router.get('/', async (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

module.exports = router;
