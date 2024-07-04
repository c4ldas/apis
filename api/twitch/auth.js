const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => { 
  console.log("/authenticated");
  const code = req.session['code'];
  const user_key = req.session['user_key'];
  res.status(200).render(__dirname + '/authenticated.ejs', { code: code, user_key: user_key });
});


module.exports = router;
