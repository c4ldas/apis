// https://repl.c4ldas.com.br/api/tft/rank?channel=$(channel)&player=yoda&tag=br1&region=br1&type=text

const express = require("express");
const router = express.Router();
const regions = require("../../assets/validRegions");

const apiURL = "api.riotgames.com";
const puuidURL = (apiRUL, player, tag) => `https://americas.${apiRUL}/riot/account/v1/accounts/by-riot-id/${player}/${tag}`;
const summonerIdURL = (region, apiURL, puuid) => `https://${region}.${apiURL}/tft/summoner/v1/summoners/by-puuid/${puuid}`;
const rankURL = (region, apiURL, summonerId) => `https://${region}.${apiURL}/tft/league/v1/entries/by-summoner/${summonerId}`;

// Creating null values for players not yet ranked
const nullValues = {
  tier: null,
  rank: null,
  leaguePoints: null,
  wins: null,
  losses: null
};

router.get('/', async (req, res) => {
  const { player = null, tag = null, region = null, type = "json", channel = null } = req.query;

  if (!player || !tag) {
    return res.status(200)
      .json({
        error: "'player' and 'tag' are required.",
        player: player,
        tag: tag,
        region: region
      });
  }

  if (!regions.includes(region)) {
    return res.status(200)
      .json({
        error: "Invalid region",
        player: player,
        tag: tag,
        region: region
      });
  }

  try {
    const summonerId = await getSummonerId(player, tag, region);
    const rankRequest = await getRank(summonerId, region);
    const rankTFT = getRank_TFT(rankRequest);

    const { tier, rank, leaguePoints, wins, losses } = rankTFT;
    const jsonResponse = { tier, rank, leaguePoints, wins, losses };

    // Return the results based on type requested (text, overlay or json)
    if (type == "text") {
      const txtResponse = tier
        ? `${player}: ${tier} ${rank} - ${leaguePoints} points`
        : `${player} - Player not ranked!`;

      console.log(`TFT rank - Channel: ${channel} - ${txtResponse}`);
      return res.status(200).send(txtResponse);
    }

    console.log(`TFT rank ${type} - Channel: ${channel} - ${JSON.stringify(jsonResponse)}`);
    res.status(200).json(jsonResponse);

  } catch (error) {
    console.log(`TFT rank error - Channel: ${channel} - ${JSON.stringify(error)}`);
    return error.message.includes("RGAPI")
      ? res.status(400).send("Wrong parameter values")
      : res.status(400).send(error);
  }
});

// Get the Summoner Id using the player name and tag
async function getSummonerId(player, tag, region) {
  try {
    const puuidRequest = await fetch(puuidURL(apiURL, player, tag), {
      method: "GET",
      headers: {
        "X-Riot-Token": process.env.TFT_TOKEN
      }
    });
    const getPuuid = await puuidRequest.json();
    if (puuidRequest.status != 200) throw new Error("Error while getting puuid");

    const summonerIdFetch = await fetch(summonerIdURL(region, apiURL, getPuuid.puuid), {
      method: "GET",
      headers: {
        "X-Riot-Token": process.env.TFT_TOKEN
      }
    });
    const summonerId = await summonerIdFetch.json();
    if (summonerIdFetch.status != 200) throw new Error("Error while getting summonerId");
    return summonerId.id;

  } catch (error) {
    console.log("TFT getSummonerId:", error.message);
    throw { message: error.message, player: player, tag: tag };
  }
}

// Get User Rank
async function getRank(summonerId, region) {
  try {
    const getRankRequest = await fetch(rankURL(region, apiURL, summonerId), {
      method: "GET",
      headers: {
        "X-Riot-Token": process.env.TFT_TOKEN
      }
    });
    const getRank = await getRankRequest.json();
    if (getRankRequest.status != 200) throw new Error("Error while getting rank");
    return getRank;

  } catch (error) {
    console.log("TFT getRank:", error);
    throw { message: error.message, player: player, tag: tag };
  }
}

// Get Solo 5x5 Rank info
function getRank_TFT(getRank) {
  try {
    const tftRank = getRank.find((response) => response.queueType === "RANKED_TFT");
    if (!tftRank) return nullValues;
    const { tier, rank, leaguePoints, wins, losses } = tftRank;
    return { tier, rank, leaguePoints, wins, losses };

  } catch (error) {
    console.log("TFT getRank_TFT:", error);
    throw { message: error.message, player: player, tag: tag };
  }
}

module.exports = router;
