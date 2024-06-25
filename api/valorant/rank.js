/*************************************************
This endpoint only works for BR Valorant server
Usage: 
URL: https://repl.c4ldas.com.br/api/valorant/rank?channel=$(channel)&player=PLAYERNAME&tag=TAGLINE&msg=MESSAGE

player = Username of the player
tag = Tagline of the player
msg (optional) - Format the message that will be sent to your chat.
Possible variables for msg: (player), (pontos), (rank)

Example:
https://repl.c4ldas.com.br/api/valorant/rank?channel=$(channel)&player=Loud%20Coreano&tag=LLL&msg='(player) tem (pontos) pontos e tá (rank).'
*************************************************/

const fetch = require("node-fetch"); // Using fetch to collect data from another API
const express = require("express");
const router = express.Router();
const iconv = require("iconv-lite"); // Character decoding
// const clc = require('cli-color') // colors in console

// Defining colors for console:
// const red = clc.red
// const green = clc.green
// const yellow = clc.yellow;

const badges = {
  "Unrated": "Sem rank/elo",
  "Iron 1": "Ferro 1",
  "Iron 2": "Ferro 2",
  "Iron 3": "Ferro 3",
  "Bronze 1": "Bronze 1",
  "Bronze 2": "Bronze 2",
  "Bronze 3": "Bronze 3",
  "Silver 1": "Prata 1",
  "Silver 2": "Prata 2",
  "Silver 3": "Prata 3",
  "Gold 1": "Ouro 1",
  "Gold 2": "Ouro 2",
  "Gold 3": "Ouro 3",
  "Platinum 1": "Platina 1",
  "Platinum 2": "Platina 2",
  "Platinum 3": "Platina 3",
  "Diamond 1": "Diamante 1",
  "Diamond 2": "Diamante 2",
  "Diamond 3": "Diamante 3",
  "Ascendant 1": "Ascendente 1",
  "Ascendant 2": "Ascendente 2",
  "Ascendant 3": "Ascendente 3",
  "Immortal 1": "Imortal 1",
  "Immortal 2": "Imortal 2",
  "Immortal 3": "Imortal 3",
  "Radiant": "Radiante",
};

router.get("/", async (req, res) => {
  const channel = req.query.channel || null;
  // const msg = req.query.msg || '(player) tem (pontos) pontos e tá (rank)'
  const rawMsg = req.query.msg ? decodeURIComponent(req.query.msg) : "(player) tem (pontos) pontos e tá (rank)";
  const msg = iconv.decode(Buffer.from(rawMsg, "latin1"), "latin1"); // Converts the mesage from utf-8 to latin1 (or iso8859-1) to support latin characteres.

  const player = req.query.player;
  const tag = req.query.tag;
  const id = req.query.id;
  const type = req.query.type || "text";
  const server = req.query.server || req.query.region || "br";

  try {
    // Activate maintenance mode
    // if (!req.query.maintenance) {
    //   res.status(200).send('API em manutenção, por favor tente mais tarde')
    //   console.log("Channel:", channel, "- API em manutenção, por favor tente mais tarde")
    //   return
    // }

    // Look for player using ID
    if (id) {
      urlRank = `https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/${server}/${id}`;
      urlLeaderboard = `https://api.henrikdev.xyz/valorant/v2/leaderboard/${server}?puuid=${id}`;

      const rankInfo = await getRankedData(urlRank, urlLeaderboard);
      const { playerName, elo, pontos, posicao, vitorias } = rankInfo;

      sendMessage(playerName, elo, pontos, posicao, vitorias);
    }

    // Look for player using player name and tagname
    if (player) {
      urlRank = `https://api.henrikdev.xyz/valorant/v1/mmr/${server}/${player}/${tag}`;
      urlLeaderboard = `https://api.henrikdev.xyz/valorant/v2/leaderboard/${server}?name=${player}&tag=${tag}`;

      const rankInfo = await getRankedData(urlRank, urlLeaderboard);
      const { playerName, elo, pontos, posicao, vitorias } = rankInfo;

      sendMessage(playerName, elo, pontos, posicao, vitorias);
    }

    

    // Get Ranked elo and points
    async function getRankedData(urlRank, urlLeaderboard) {
      const getRankFetch = await fetch(`${urlRank}`, {
        headers: {
          Authorization: process.env.VALORANT_API_TOKEN,
        },
      });
      const getRank = await getRankFetch.json();

      if (getRank.status != 200) {
        if (getRank.status == 400) {
          console.log(getRank.errors);
          throw new Error(`Infelizmente a API original está fora do ar. Tente novamente mais tarde.`);
        } else {
          throw new Error(`Usuário não encontrado ou não rankeado: ${player}`);
        }
      }

      const playerName = getRank.data.name;
      const currenttierpatched = getRank.data ? getRank.data.currenttierpatched : "Unrated";
      const elo = badges[currenttierpatched];
      const pontos = getRank.data ? getRank.data.ranking_in_tier : 0;

      if (!elo.startsWith("Imortal") && elo != "Radiante") {
        const vitorias = 0;
        const posicao = 0;
        return { playerName, currenttierpatched, elo, pontos, posicao, vitorias };
      }

      const getLeaderboardFetch = await fetch(`${urlLeaderboard}`, {
        headers: {
          Authorization: process.env.VALORANT_API_TOKEN,
        },
      });
      const getLeaderboard = await getLeaderboardFetch.json();

      if (getLeaderboard.status != 200) {
        const posicao = 0;
        const vitorias = 0;
        return { playerName, currenttierpatched, elo, pontos, posicao, vitorias };
      }

      const vitorias = getLeaderboard.data[0].numberOfWins;
      const posicao = getLeaderboard.data[0].leaderboardRank;
      return { playerName, currenttierpatched, elo, pontos, posicao, vitorias };
    }

    //Send message back where it was requested
    async function sendMessage(player, elo, pontos, posicao, vitorias) {
      const finalMessage = msg
        .replace(/\(player\)/g, player)
        .replace(/\(pontos\)/g, pontos)
        .replace(/\(rank\)/g, elo)
        .replace(/\(vitorias\)/g, vitorias)
        .replace(/\(posicao\)/g, posicao);

      const noChannel = `Por favor peça para um moderador alterar o comando para: \.me \${touser} ► \${customapi.https://repl.c4ldas.com.br/api/valorant/rank?channel=\$(channel)&player=${player}&tag=${tag}&msg="${msg}"}`;

      if (!channel || channel == "${channel}") {
        res.send(`${finalMessage} - ${noChannel}`);
        console.log(`Valorant ${type} - ${finalMessage} - ${noChannel}`);
        return;
      }

      if(type == "json" || type == "overlay"){
        const obj = { 
          data: {
            "name": player, 
            "currenttierpatched": Object.keys(badges).find((x) => badges[x] == elo), 
            "ranking_in_tier": pontos, 
            "leaderboardRank": posicao, 
            "numberOfWins": vitorias
          }
        }
        res.status(200).json(obj);
        console.log(`Valorant ${type} - Channel: ${channel} - ${player}#${tag}: ${obj.data.currenttierpatched}`)
        return;
      }
      res.status(200).send(finalMessage);
      console.log(`Valorant ${type} - Channel: ${channel} - ${player}#${tag} - ${finalMessage}`);
    }


    
  } catch (error) {
    if (error.message.includes("Unexpected token < in JSON at position 0")) {
      res.status(200).send("Infelizmente, a API está fora do ar para mostrar o elo. Tente novamente mais tarde.");
      console.log(`${new Date().toLocaleTimeString("en-UK")} - Valorant Rank API - Channel: ${channel} - ${error}`);
      return;
    }
    res.status(200).send(error.message);
    console.log(`${new Date().toLocaleTimeString("en-UK")} - Valorant Rank API - Channel: ${channel} - ${error}`);
  }
});

module.exports = router;
