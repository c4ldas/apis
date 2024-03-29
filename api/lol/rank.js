// https://repl.c4ldas.com.br/api/lol/rank?channel=$(channel)&region=br1&player=kzc&tag=123&type=json

const fetch = require('node-fetch') // Using fetch to collect data from another API
const express = require('express')
const router = express.Router()
// const clc = require("cli-color") // colors in console

// Defining colors for console:
// const red = clc.red
// const green = clc.green

router.get('/', async (req, res) => {

  const player = req.query.player
  const tag = req.query.tag || null
  const channel = req.query.channel || null
  const apiURL = 'api.riotgames.com'

  try {
    switch (req.query.region) {
      case 'br1': case 'la1': case 'la2': case 'na1':
        region = 'americas';
        break;
      case 'jp1': case 'kr': case 'oc1':
        region = 'asia';
        break;
      case 'eun1': case 'euw1': case 'ru1': case 'tr1':
        region = 'europe';
        break;
      default:
        res.send('Parameter "region" missing or invalid. Please check valid regions in https://c4ldas.com.br/api/lol')
        return
    }

    const summonerId = tag ? await getRankTag(player, tag) : await getRankNoTag(player)

    async function getRankTag(player, tag) {
      const getPuuidFetch = await fetch(`https://${region}.${apiURL}/riot/account/v1/accounts/by-riot-id/${player}/${tag}?api_key=${process.env.LOL_TOKEN}`)
      const getPuuid = await getPuuidFetch.json()

      const getSummonerIdFetch = await fetch(`https://${req.query.region}.${apiURL}/lol/summoner/v4/summoners/by-puuid/${getPuuid.puuid}?api_key=${process.env.LOL_TOKEN}`)
      const getSummonerId = await getSummonerIdFetch.json()
      return getSummonerId.id
    }

    async function getRankNoTag(player) {
      const getSummonerIdFetch = await fetch(`https://${req.query.region}.${apiURL}/lol/summoner/v4/summoners/by-name/${player}?api_key=${process.env.LOL_TOKEN}`)
      const getSummonerId = await getSummonerIdFetch.json()
      return getSummonerId.id
    }

    const getRankFetch = await fetch(`https://${req.query.region}.${apiURL}/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${process.env.LOL_TOKEN}`)
    const getRank = await getRankFetch.json()

    if (!getRank[0]) {
      throw new Error(`Player not found or not ranked!`)
    }

    for (response of getRank) {
      if (response.queueType == 'RANKED_SOLO_5x5') {
        var { tier, rank, summonerName, leaguePoints, wins, losses } = response
      }
    }

    switch (req.query.type) {
      case "text":
        res.status(200).send(`${summonerName}: ${tier} ${rank} - ${leaguePoints} points`)
        console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL Channel: ${channel} - ${summonerName}: ${tier} ${rank} - ${leaguePoints} points`)
        break;

      case "overlay":
        res.status(200).json({ tier, rank, summonerName, leaguePoints, wins, losses })
        console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL Overlay - ${summonerName}: ${tier} ${rank} - ${leaguePoints} points`)
        break;

      case "json":
      default:
        res.status(200).json({ tier, rank, summonerName, leaguePoints, wins, losses })
        console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL JSON - ${JSON.stringify(response, null, 2)}`)
        break;
    }
  }
  catch (error) {
    if (error.message.includes('RGAPI')) {
      res.status(400).send('Wrong parameter values')
      console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL ${channel} - ${error} Player: ${player}`)
      return
    }
    res.status(400).send({ error: error.message, player: player })
    console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL ${channel} - ${error} Player: ${player}`)
  }
})

module.exports = router;

