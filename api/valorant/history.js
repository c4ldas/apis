// https://repl.c4ldas.com.br/api/valorant/history?server=na&player=xaiomy&tag=123&channel=$(channel)&msg="Username is (upDown) (mmr)RR. He's (win)-(lose) in the last 24 hours"

const express = require('express')
const router = express.Router()
const clc = require('cli-color') // colors in console
const iconv = require('iconv-lite') // Character decoding


router.get('/', async (req, res) => {

  const channel = req.query.channel || null
  // const msg = req.query.msg || '(player) tem (pontos) pontos e tá (rank)'
  const rawMsg = req.query.msg ? decodeURIComponent(req.query.msg) : '(player) is (upDown) (mmr)RR. Last 12 hours: (win)-(lose)'
  const msg = iconv.decode(Buffer.from(rawMsg, 'latin1'), 'utf-8'); // Converts the mesage from utf-8 to latin1 (or iso8891-1) to support latin characteres. 

  const player = req.query.player;
  const tag = req.query.tag;
  const id = req.query.id;
  const server = req.query.server || 'br';

  const history = await fetch(`https://api.henrikdev.xyz/valorant/v1/lifetime/mmr-history/${server}/${player}/${tag}?size=15`);
  const r = await history.json()
  m = 0;
  win = 0;
  lose = 0;
  c = new Date();

  for (i = 0; r.data.length; i++) {
    d = Math.abs(c - new Date(r.data[i].date));
    p = r.data[i].last_mmr_change;
    if (d > (86400000 / 2)) {
      break;
    }
    p > 0 ? win += 1 : lose += 1;
    m += p;
  }

  const upDown = m > 0 ? "up" : "down"

  const finalMessage = msg
    .replace(/\(player\)/g, player)
    .replace(/\(upDown\)/g, upDown)
    .replace(/\(mmr\)/g, m)
    .replace(/\(win\)/g, win)
    .replace(/\(lose\)/g, lose)

  res.status(200).send(finalMessage)
  console.log(`Channel: ${channel} - ${finalMessage}`)

})

module.exports = router;
