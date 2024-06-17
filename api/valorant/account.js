const fetch = require("node-fetch"); // Using fetch to collect data from another API
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {

  const player = req.query.player;
  const tag = req.query.tag;
  const type = req.query.type || "text";
  
  try {
    const urlRank = `https://api.henrikdev.xyz/valorant/v1/account/${player}/${tag}?force=true`;

    const accountRequest = await fetch(urlRank, {
      headers: {
        Authorization: process.env.VALORANT_API_TOKEN,
      },
    });
    const account = await accountRequest.json();
    res.status(200).send(account);
    
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send({ error: "Internal server error" });
  }
})

module.exports = router;

/* 
{
  "status": 200,
  "data": {
    "puuid": "9fe721ed-4a11-5549-8387-e2d3d5ea76d9",
    "region": "na",
    "account_level": 839,
    "name": "FUT DannyJones",
    "tag": "TOP1",
    "card": {
      "small": "https://media.valorant-api.com/playercards/29d6aced-4f66-e000-15eb-71b1906a113a/smallart.png",
      "large": "https://media.valorant-api.com/playercards/29d6aced-4f66-e000-15eb-71b1906a113a/largeart.png",
      "wide": "https://media.valorant-api.com/playercards/29d6aced-4f66-e000-15eb-71b1906a113a/wideart.png",
      "id": "29d6aced-4f66-e000-15eb-71b1906a113a"
    },
    "last_update": "Now",
    "last_update_raw": 1718638172
  }
}
*/