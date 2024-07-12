// https://repl.c4ldas.com.br/api/lol/rank?channel=$(channel)&region=br1&player=kzc&tag=123&type=json

const express = require("express");
const router = express.Router();
const regions = require("../../assets/validRegions");
const { Server } = require("http");

const apiURL = "api.riotgames.com";
const puuidURL = (apiRUL, player, tag) => `https://americas.${apiRUL}/riot/account/v1/accounts/by-riot-id/${player}/${tag}`;
const summonerIdURL = (region, apiURL, puuid) => `https://${region}.${apiURL}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
const rankURL = (region, apiURL, summonerId) => `https://${region}.${apiURL}/lol/league/v4/entries/by-summoner/${summonerId}`;

// Creating null values for players not yet ranked
const nullValues = {
  tier: null,
  rank: null,
  leaguePoints: null,
  wins: null,
  losses: null
};

router.get("/", async (req, res) => {
  const { player = null, tag = null, region = null, type = "json", channel = null } = req.query;

  if (!player || !tag) return res.status(200).json({ error: "'player' and 'tag' are required.", player, tag, region });
  if (!regions.includes(region)) return res.status(200).json({ error: "Invalid region", player, tag, region });

  try {
    const summonerId = await getSummonerId(player, tag, region);
    const rankRequest = await getRank(summonerId, region);
    const rank5x5 = getRank_SOLO_5x5(rankRequest);

    const { tier, rank, leaguePoints, wins, losses } = rank5x5;

    // Return the results based on type requested (text, overlay or json)
    if (type == "text") {
      const response = tier ? `${player}: ${tier} ${rank} - ${leaguePoints} points` : `${player} - Player not ranked!`;
      console.log(`LOL rank - Channel: ${channel} - ${response}`);
      return res.status(200).send(response);
    }
    console.log(`LOL rank ${type} - Channel: ${channel} - ${JSON.stringify({ tier, rank, player, leaguePoints, wins, losses})}`);
    res.status(200).json({ tier, rank, player, leaguePoints, wins, losses });

  } catch (error) {
    console.log(`LOL rank error - Channel: ${channel} - ${JSON.stringify(error)}`);
    return error.message.includes("RGAPI") ? res.status(400).send("Wrong parameter values") : res.status(400).send(error);
  }
});


// Get the Summoner Id using the player name and tag
async function getSummonerId(player, tag, region) {
  try {
    const puuidRequest = await fetch(puuidURL(apiURL, player, tag), {
      method: "GET",
      headers: {
        "X-Riot-Token": process.env.LOL_TOKEN
      }
    });
    const getPuuid = await puuidRequest.json();
    if (puuidRequest.status != 200) throw new Error("Error while getting puuid");

    const summonerIdFetch = await fetch(summonerIdURL(region, apiURL, getPuuid.puuid), {
      method: "GET",
      headers: {
        "X-Riot-Token": process.env.LOL_TOKEN
      }
    });
    const summonerId = await summonerIdFetch.json();
    if (summonerIdFetch.status != 200) throw new Error("Error while getting summonerId");
    return summonerId.id;

  } catch (error) {
    console.log("LOL getSummonerId:", error.message);
    throw { message: error.message, player: player, tag: tag };
  }
}

// Get User Rank
async function getRank(summonerId, region) {
  try {
    const getRankRequest = await fetch(rankURL(region, apiURL, summonerId), {
      method: "GET",
      headers: {
        "X-Riot-Token": process.env.LOL_TOKEN
      }
    });
    const getRank = await getRankRequest.json();
    if (getRankRequest.status != 200) throw new Error("Error while getting rank");
    return getRank;

  } catch (error) {
    console.log("LOL getRank:", error);
    throw { message: error.message, player: player, tag: tag };
  }
}

// Get Solo 5x5 Rank info
function getRank_SOLO_5x5(getRank) {
  try {
    const soloRank = getRank.find((response) => response.queueType === "RANKED_SOLO_5x5");
    if (!soloRank) return nullValues;
    const { tier, rank, leaguePoints, wins, losses } = soloRank;
    return { tier, rank, leaguePoints, wins, losses };

  } catch (error) {
    console.log("LOL getRank_SOLO_5x5:", error);
    throw { message: error.message, player: player, tag: tag };
  }
}

module.exports = router;
