const express = require('express');
const router = express.Router();

router.use("/game", require("./game"));

// When accessing twitch home, it doesn't access this function,
// By default, express will look for index.html 
// In case index.html is not found, it checks the route "/"
router.get('/', async (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

module.exports = router;

