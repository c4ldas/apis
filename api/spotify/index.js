const express = require('express');
const router = express.Router()

router.use("/login", require("./login"));
router.use("/callback", require("./callback"));
router.use("/musica", require("./musica"));

// router.get('/', async (req, res) => { 
//   console.log("This route is not needed if there is an index.html in the folder")
//   res.sendFile(__dirname + '/index.html');
// }

module.exports = router;
