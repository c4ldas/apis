const express = require('express');
const Database = require("@replit/database");
const db = new Database();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log("/logout");
    console.log(req.body);
    
    const revoke = (token) => `https://id.twitch.tv/oauth2/revoke?client_id=${process.env.TWITCH_CLIENT_ID}&token=${token}`;    
    const userData = await db.get(req.body.user_key);

    const refresh = await fetch(revoke(userData.value.refresh_token), { "method": "POST" });
    if(refresh.status != 200) throw { status: refresh.status, statusText: refresh.statusText };
    
    const removed = await db.delete(req.body.user_key);
    
    res.status(200).json({ status: "success", message: "Integration removed successfully" });
  
  // if(!removed.ok) {
  //   res.status(200).json({ status: "failed", message: "There was an error while removing the integration, try again later"})
  // } else {
  //   res.status(200).json({ status: "success", message: "Integration removed successfully" });
  // }
    
  } catch (error) {
    console.log("Logout error:", error);
    res.status(500).json({ status: "failed", message: "There was an error while removing the integration. Try again later"})
  }

   // const removed = await db.delete(req.body.user_key);
   // console.log(removed);
   // 
   // if(!removed.ok) {
   //   res.status(200).json({ status: "failed", message: "There was an error while removing the integration, try again later"})
   // } else {
   //   res.status(200).json({ status: "success", message: "Integration removed successfully" });
   // }

})

module.exports = router;

/*
curl -X POST "https://id.twitch.tv/oauth2/revoke?client_id=1mhvnqfp2xtswwqz1p8ol3doqm4t26&token=iwpth8f683wpr63bn2zjcz5nubu7prdcn9ownikg69gmmv60m0"


curl -X POST 'https://id.twitch.tv/oauth2/revoke' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'client_id=<client id goes here>&token=<access token goes here>'

*/

