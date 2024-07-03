const express = require("express");
const router = express.Router();
const Database = require("@replit/database");
const db = new Database();

router.get("/", async (req, res) => {
  if (req.query.error) {
    res.send(`Aplicação não foi aceita: ${req.query.error}`);
    return;
  }

  const getTokenFetch = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
  });
  const getTokenJson = await getTokenFetch.json();

  const me = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${getTokenJson.access_token}`,
    },
  });
  const meFetch = await me.json();

  const id = meFetch.id;
  const displayName = meFetch.display_name;
  const token = getTokenJson.access_token;
  const refreshToken = getTokenJson.refresh_token;

  const values = {
    _displayName: displayName,
    _token: token,
    _refreshToken: refreshToken,
  };

  console.log(`ID: ${id}, displayName: ${displayName}`);
  await db.set(id, values);
  res.render(__dirname + "/callback.ejs", { displayName: displayName, id: id });
});

module.exports = router;
