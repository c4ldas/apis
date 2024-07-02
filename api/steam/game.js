const express = require("express");
const router = express.Router();

const appIdURL = (key, steamId) => `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`;
const gameURL = (appId, region)  => `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${region}&l=${region}`;
const playTimeURL = (key, steamId, appId) => `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}&include_appinfo=true&appids_filter[0]=${appId}`;

router.get("/", async (req, res) => {
  const key = process.env.STEAM_KEY;
  const steamId = req.query.id;
  const region = req.query.region;

  try {
    const appIdFetch = await fetch(appIdURL(key, steamId));
    
    const appIdResponse = await appIdFetch.json();
    const appId = appIdResponse.response.players[0] ? appIdResponse.response.players[0].gameid : null;
    
    if(!appId) return res.status(200).json({ name: "" });
    
    const gameFetch = await fetch(gameURL(appId, region));
    const playTimeFetch = await fetch(playTimeURL(key, steamId, appId));
    const game = await gameFetch.json();    
    const playTimeResponse = await playTimeFetch.json();
    
    const playTime = parseInt(playTimeResponse.response.games[0].playtime_forever / 60);
    const gameName = game[appId].data.name;
    const image = game[appId].data.header_image;
    const price = game[appId].data.price_overview ? game[appId].data.price_overview.final_formatted : "0";

    const data = {
      name: gameName,
      price: price,
      header_image: image,
      timePlayed: playTime,
    };

    console.log(`Steam widget - Game: ${data.name}, Price: ${data.price}`);    
    res.status(200).json(data);
    
  } catch (error) {
    console.log(`Steam error: ${error}`);
    res.status(400).json({ error: "error" });
  }
});

module.exports = router;
