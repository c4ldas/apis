// https://repl.c4ldas.com.br/api/lol/rank?channel=$(channel)&region=br1&player=kzc&tag=123&type=json

const fetch = require('node-fetch')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  
  const player = req.query.player
  const tag = req.query.tag || null
  const channel = req.query.channel || null
  const apiURL = 'api.riotgames.com'

  // Creating null values for players not yet ranked
  const nullValues = {
    "tier": null,
    "rank": null,
    "leaguePoints": null,
    "wins": null,
    "losses": null
  }
  
  try {

    // Checking the regions requested
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

    // Getting Summoner Id
    const summonerId = tag ? await getRankTag(player, tag) : await getRankNoTag(player)

    // Obtaining the rank based on the Summoner Id
    const getRank = await (await fetch(`https://${req.query.region}.${apiURL}/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${process.env.LOL_TOKEN}`)).json()

    // Checking if the user has Solo 5x5 rank
    const response = await getRank_SOLO_5x5(getRank)
    const { tier, rank, leaguePoints, wins, losses } = response;

    // Return the results based on type requested (text, overlay or json)
    switch (req.query.type) {        
      case "text":
        if(!tier){
          res.status(200).send(`${player} - Player not ranked!`)
          break;
        }
        res.status(200).send(`${player}: ${tier} ${rank} - ${leaguePoints} points`)
        console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL Channel: ${channel} - ${player}: ${tier} ${rank} - ${leaguePoints} points`)
        break;

      case "overlay":
        res.status(200).json({ tier, rank, player, leaguePoints, wins, losses })
        console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL Overlay - ${player}: ${tier} ${rank} - ${leaguePoints} points`)
        break;

      case "json":
      default:
        res.status(200).json({ tier, rank, player, leaguePoints, wins, losses })
        console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL JSON - ${JSON.stringify(response, null, 2)}`)
        break;
    }    

    ///////////////
    // Functions //
    ///////////////
    
    // Get the Summoner Id using the player name and tag
    async function getRankTag(player, tag) {
      const getPuuidFetch = await fetch(`https://${region}.${apiURL}/riot/account/v1/accounts/by-riot-id/${player}/${tag}?api_key=${process.env.LOL_TOKEN}`)
      const getPuuid = await getPuuidFetch.json()

      const getSummonerIdFetch = await fetch(`https://${req.query.region}.${apiURL}/lol/summoner/v4/summoners/by-puuid/${getPuuid.puuid}?api_key=${process.env.LOL_TOKEN}`)
      const getSummonerId = await getSummonerIdFetch.json()
      return getSummonerId.id      
    }

    // Get the Summoner Id using the player name (old)
    async function getRankNoTag(player) {
      const getSummonerIdFetch = await fetch(`https://${req.query.region}.${apiURL}/lol/summoner/v4/summoners/by-name/${player}?api_key=${process.env.LOL_TOKEN}`)
      const getSummonerId = await getSummonerIdFetch.json()
      return getSummonerId.id
    }

    // Get Solo 5x5 Rank info
    function getRank_SOLO_5x5(getRank){
      if(getRank.length === 0){
        return (nullValues)
      }
      for (let response of getRank) {
        if (response.queueType == 'RANKED_SOLO_5x5') {
          const { tier, rank, leaguePoints, wins, losses } = response;
          return { tier, rank, leaguePoints, wins, losses };
        }       
      }
      return (nullValues);
    }
    
    
  } catch (error) {
    if (error.message.includes('RGAPI')) {
      console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL ${channel} - ${error} Player: ${player}`)
      res.status(400).send('Wrong parameter values')      
      return
    }
    console.log(error)
    res.status(400).send({ error: error.message, player: player })
    console.log(`${new Date().toLocaleTimeString('en-UK')} - LOL ${channel} - ${error} Player: ${player}`)
  }
})

module.exports = router;
