const express = require('express');
const router = express.Router()


router.use(express.static(__dirname))

router.get('/', async (req, res) => { 
  res.sendFile(__dirname + '/index.html');
  
})

module.exports = router;
