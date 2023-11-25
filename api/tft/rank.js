// https://repl.c4ldas.com.br/api/tft/rank?channel=$(channel)&region=br1&player=kzc&type=json

const fetch = require('node-fetch') // Using fetch to collect data from another API
const express = require('express')
const router = express.Router()
const clc = require("cli-color") // colors in console

// Defining colors for console:
const red = clc.red
const green = clc.green

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
      const getPuuidFetch = await fetch(`https://${region}.${apiURL}/riot/account/v1/accounts/by-riot-id/${player}/${tag}?api_key=${process.env.TFT_TOKEN}`)
      const getPuuid = await getPuuidFetch.json()

      const getSummonerIdFetch = await fetch(`https://${req.query.region}.${apiURL}/tft/summoner/v1/summoners/by-puuid/${getPuuid.puuid}?api_key=${process.env.TFT_TOKEN}`)
      const getSummonerId = await getSummonerIdFetch.json()
      return getSummonerId.id
    }


    async function getRankNoTag(player) {
      const getSummonerIdFetch = await fetch(`https://${req.query.region}.${apiURL}/tft/summoner/v1/summoners/by-name/${player}?api_key=${process.env.TFT_TOKEN}`)
      const getSummonerId = await getSummonerIdFetch.json()
      return getSummonerId.id
    }
    
/*     if(!region) {
      throw new Error("Parameter 'region' missing. Go to https://repl.c4ldas.com.br/api/tft/ to check the regions available.")
    }
    if(!channel && req.query.type !== "overlay"){
      throw new Error("Parameter 'channel' missing. Please add '&channel=$(channel)' at the end of the URL.")
    }
    if(!validRegions.includes(req.query.region)){
      throw new Error("Invalid region. Go to https://repl.c4ldas.com.br/api/tft/ to check the regions available.")
    } */

/*     const getUserFetch = await fetch(`${url}/summoner/v1/summoners/by-name/${player}?api_key=${process.env.TFT_TOKEN}`)
    const getUser = await getUserFetch.json() */

/*     const getRankFetch = await fetch(`${url}/league/v1/entries/by-summoner/${getUser.id}?api_key=${process.env.TFT_TOKEN}`)
    const getRank = await getRankFetch.json() */

    const getRankFetch = await fetch(`https://${req.query.region}.${apiURL}/tft/league/v1/entries/by-summoner/${summonerId}?api_key=${process.env.TFT_TOKEN}`)
    const getRank = await getRankFetch.json()

    if (!getRank[0]) {
      throw new Error(`Player not found or not ranked!`)
    }

    const response = {
      tier: getRank[0].tier,
      rank: getRank[0].rank,
      summonerName: getRank[0].summonerName,
      leaguePoints: getRank[0].leaguePoints,
      wins: getRank[0].wins,
      losses: getRank[0].losses
    }

    switch (req.query.type) {

      case "text":
        res.status(200).send(`${getRank[0].summonerName}: ${getRank[0].tier} ${getRank[0].rank} - ${getRank[0].leaguePoints} points`)
        console.log(green(`${new Date().toLocaleTimeString('en-UK')} - TFT Channel: ${channel} - ${getRank[0].summonerName}: ${getRank[0].tier} ${getRank[0].rank} - ${getRank[0].leaguePoints} points`))
        break;

      case "overlay":
        res.status(200).json(response)
        console.log(`${new Date().toLocaleTimeString('en-UK')} - TFT Overlay - ${getRank[0].summonerName}: ${getRank[0].tier} ${getRank[0].rank} - ${getRank[0].leaguePoints} points`)
        break;

      case "json":
      default:
        res.status(200).json(response)
        console.log(`${new Date().toLocaleTimeString('en-UK')} - TFT JSON - ${JSON.stringify(response)}`)
        break;
    }
  }
  catch (error) {
    if(error.message.includes('RGAPI')){
      res.status(400).send('Wrong parameter values')
      console.log(red(`${new Date().toLocaleTimeString('en-UK')} - TFT ${channel} - ${error} Player: ${player}`))
      return
    }
    res.status(400).send({ error: error.message, player: player })
    console.log(red(`${new Date().toLocaleTimeString('en-UK')} - TFT ${channel} - ${error} Player: ${player}`))
  }
})

module.exports = router;

