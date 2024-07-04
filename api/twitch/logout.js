const express = require('express');
const Database = require("@replit/database");
const db = new Database();
const router = express.Router();

router.post('/', async (req, res) => {
  try {    
    const revoke = (token) => `https://id.twitch.tv/oauth2/revoke?client_id=${process.env.TWITCH_CLIENT_ID}&token=${token}`;    
    const userData = await db.get(req.body.user_key);

    const refresh = await fetch(revoke(userData.value.refresh_token), { "method": "POST" });
    if(refresh.status != 200) throw { status: refresh.status, statusText: refresh.statusText };
    
    const removed = await db.delete(req.body.user_key);
    
    res.status(200).json({ status: "success", message: "Integration removed successfully" });
    
  } catch (error) {
    console.log("Logout error:", error);
    res.status(500).json({ status: "failed", message: "There was an error while removing the integration. Try again later"})
  }
})

module.exports = router;
