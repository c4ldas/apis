
// Comando para criar palpite/aposta:
// https://repl.c4ldas.com.br/api/twitch/prediction/create/CODE/?channel=${channel}&option1=${1}&option2=${2}&question=${queryescape ${3:|Quem ganha esse mapa?}}

// Comando para fechar palpite/aposta:
// https://repl.c4ldas.com.br/api/twitch/prediction/close/CODE/?channel=${channel}&winner=${1}

// Comando para cancelar palpite/aposta:
// https://repl.c4ldas.com.br/api/twitch/prediction/cancel/CODE/?channel=${channel}

// Comando para verificar último palpite/aposta (JSON response): 
// https://repl.c4ldas.com.br/api/twitch/prediction/get/CODE?channel=${channel}

const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const Database = require("@replit/database")
const db = new Database()


router.get('/', async (req, res) => {
  res.status(302).redirect('../twitch/')
})


// Create prediction
router.get('/create/:code', async (req, res) => {
  const channel = req.query.channel
  const question = req.query.question || null
  const option1 = req.query.option1
  const option2 = req.query.option2
  const option3 = req.query.option3 || null
  const code = req.params.code
  const newPrediction = await createNewPrediction(code, channel, question, option1, option2, option3)

  console.log(`${new Date().toLocaleTimeString('en-UK')} - Channel: ${channel} - ${newPrediction}`)
  res.status(200).send(newPrediction)
})


// Close prediction
router.get('/close/:code', async (req, res) => {
  const channel = req.query.channel
  const winner = req.query.winner
  const code = req.params.code
  const result = await closePrediction(code, channel, winner)

  console.log(`${new Date().toLocaleTimeString('en-UK')} - Channel: ${channel} - ${result}`)
  res.status(200).send(result)
})

// Cancel prediction
router.get('/cancel/:code', async (req, res) => {
  const channel = req.query.channel
  const code = req.params.code
  const result = await cancelPrediction(code, channel)

  console.log(`${new Date().toLocaleTimeString('en-UK')} - Channel: ${channel} - ${result}`)
  res.status(200).send(result)
})



// [TESTE] Get open prediction
router.get('/get/:code', async (req, res) => {
  const channel = req.query.channel
  const code = req.params.code
  const result = await getOpenPrediction(channel, code)

  console.log(`${new Date().toLocaleTimeString('en-UK')} - Channel: ${channel} - ${JSON.stringify(result, null, 2)}`)
  res.status(200).send(result.currentPrediction)
})


/*************************************************
//                 Functions                    //
*************************************************/

// Database
async function databaseQuery(channel, code) {
  const values = await db.get(`twitch_${channel}`)
  const dbCode = values ? values.code : null
  if (dbCode !== code) {
    return { erro: 'Code inválido!' }
  }
  return { access_token: values.access_token, refresh_token: values.refresh_token, id: values.id }
}


// Create Prediction
async function createNewPrediction(code, channel, question, option1, option2, option3) {

  const values = await databaseQuery(channel, code)
  if (values.erro) return values.erro

  const newToken = await generateNewToken(channel, values.refresh_token)

  const possibleOutcomes = [
    { 'title': option1 },
    { 'title': option2 },
    ...(option3 != null ? [{ 'title': option3 }] : [])
  ];

  const createPredictionFetch = await fetch('https://api.twitch.tv/helix/predictions', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${newToken.access_token}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'broadcaster_id': values.id,
      'title': question !== null ? question : 'Quem ganha esse mapa?',
      'prediction_window': 300,
      'outcomes': possibleOutcomes
    })
  });

  const createPrediction = await createPredictionFetch.json()

  if (createPrediction.status) {
    //console.log(createPrediction)
    return 'Erro: Já existe aposta/palpite ativo, não é possível abrir novamente!'
  }
  // console.log(createPrediction)
  const options = `${option1} / ${option2}${option3 ? ` / ${option3}` : ''}`;
  return `Aposta/Palpite criado. Opções: ${options}`
}


async function generateNewToken(channel, refreshToken) {
  const newTokenFetch = await fetch(`https://id.twitch.tv/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken,
      'client_id': process.env.TWITCH_CLIENT_ID,
      'client_secret': process.env.TWITCH_CLIENT_SECRET
    })
  })

  const newToken = await newTokenFetch.json()
  const newAccessToken = newToken.access_token
  const newRefreshToken = newToken.refresh_token

  const values = await db.get(`twitch_${channel}`)

  values.access_token = newAccessToken
  values.refresh_token = newRefreshToken

  const newTokenDb = await db.set(`twitch_${channel}`, values).then(async () => {
    const newValues = await db.get(`twitch_${channel}`)
    return newValues
  })
  return newTokenDb
}


// Get Open Prediction
async function getOpenPrediction(channel, code) {

  const values = await databaseQuery(channel, code)
  if (values.erro) return values.erro

  const buscaFetch = await fetch(`https://api.twitch.tv/helix/predictions?broadcaster_id=${values.id}`, {
    "method": "GET",
    "headers": {
      "authorization": `Bearer ${values.access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID
    }
  })

  const busca = await buscaFetch.json()
  return { currentPrediction: busca.data[0], broadcasterId: values.id, access_token: values.access_token }
}


// Close Prediction
async function closePrediction(code, channel, winner) {

  const getPrediction = await getOpenPrediction(channel, code)
  if (getPrediction === 'Code inválido!') return getPrediction

  const broadcasterId = getPrediction.broadcasterId
  const getCurrentPrediction = getPrediction.currentPrediction
  const predictionId = getCurrentPrediction.id

  if (winner === getCurrentPrediction.outcomes[0].title || winner === "1") {
    outcomeWinner = winner
    outcomeWinnerId = getCurrentPrediction.outcomes[0].id
    outcomeWinnerTitle = getCurrentPrediction.outcomes[0].title
    
  } else if (winner === getCurrentPrediction.outcomes[1].title || winner === "2") {
    outcomeWinner = winner
    outcomeWinnerId = getCurrentPrediction.outcomes[1].id
    outcomeWinnerTitle = getCurrentPrediction.outcomes[1].title
    
  } else if (winner === getCurrentPrediction.outcomes[2].title || winner === "3") {
    outcomeWinner = winner
    outcomeWinnerId = getCurrentPrediction.outcomes[2].id
    outcomeWinnerTitle = getCurrentPrediction.outcomes[2].title
    
  } else {
    return `Opção inválida ${winner}`
  }

  const fecharAposta = await fetch(`https://api.twitch.tv/helix/predictions?broadcaster_id=${broadcasterId}`, {
    "method": "PATCH",
    "headers": {
      'authorization': `Bearer ${getPrediction.access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID,
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      'broadcaster_id': broadcasterId,
      'status': 'RESOLVED',
      'id': predictionId,
      'winning_outcome_id': outcomeWinnerId
    })
  });

  const result = await fecharAposta.json();
  //console.log(result)

  if (result.status) {
    return 'Não há palpites para encerrar!'
  }
  return `Resultado pago e encerrado! Opção vencedora: ${outcomeWinnerTitle}`
}


// Cancel Prediction
async function cancelPrediction(code, channel) {

  const getPrediction = await getOpenPrediction(channel, code)
  if (getPrediction === 'Code inválido!') return getPrediction

  const broadcasterId = getPrediction.broadcasterId
  const getCurrentPrediction = getPrediction.currentPrediction
  const predictionId = getCurrentPrediction.id

  const cancelarAposta = await fetch(`https://api.twitch.tv/helix/predictions?broadcaster_id=${broadcasterId}`, {
    "method": "PATCH",
    "headers": {
      'authorization': `Bearer ${getPrediction.access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID,
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      'broadcaster_id': broadcasterId,
      'status': 'CANCELED',
      'id': predictionId,
    })
  });

  const result = await cancelarAposta.json();
  // console.log(result)

  if (result.status) {
    // console.log({ erro: 'Não há palpites para encerrar!' })
    return 'Não há palpites para cancelar!'
  }
  return `Aposta/Palpite cancelado`
}

module.exports = router;
