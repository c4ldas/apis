const express = require('express');
const router = express.Router();

router.use("/login", require("./login"));
router.use("/callback", require("./callback"));
router.use("/auth", require("./auth"));
router.use("/logout", require("./logout"));
router.use("/prediction", require("./prediction"));


router.get('/', async (req, res) => {
  console.log("Sei lá vei");
  res.sendFile(__dirname + '/index.html');
});

module.exports = router;



