const express = require('express')
const router = express.Router()

router.use("/rank", require("./rank"));

router.get('/', async (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

module.exports = router;
