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
const Database = require("@replit/database")
const db = new Database()

router.get('/', async (req, res) => {
  res.status(302).redirect('../twitch/')
})


// Create prediction
router.get('/create/:code', async (req, res) => {
  const channel = req.query.channel;
  const time = parseInt(req.query.time) || 300;
  const question = req.query.question || null;
  const option1 = req.query.option1;
  const option2 = req.query.option2;
  const option3 = req.query.option3 || null;
  const code = req.params.code;
  const newPrediction = await createNewPrediction(code, time, channel, question, option1, option2, option3);

  console.log(`Twitch Prediction - Channel: ${channel} - ${newPrediction}`)
  res.status(200).send(newPrediction)
})


// Close prediction
router.get('/close/:code', async (req, res) => {
  const channel = req.query.channel
  const winner = req.query.winner
  const code = req.params.code
  const result = await closePrediction(code, channel, winner)

  console.log(`Twitch Prediction - Channel: ${channel} - ${result}`)
  res.status(200).send(result)
})

// Cancel prediction
router.get('/cancel/:code', async (req, res) => {
  const channel = req.query.channel
  const code = req.params.code
  const result = await cancelPrediction(code, channel)

  console.log(`Twitch Prediction - Channel: ${channel} - ${result}`)
  res.status(200).send(result)
})

// [TESTE] Get open prediction
router.get('/get/:code', async (req, res) => {
  const channel = req.query.channel
  const code = req.params.code
  const result = await getOpenPrediction(channel, code)

  console.log(`Twitch Prediction - Channel: ${channel} - ${JSON.stringify(result, null, 2)}`)
  res.status(200).send(result.currentPrediction)
})


/************************************************/
//                 Functions                    //
/************************************************/

// Database
async function databaseQuery(channel, code) {
  
  const request = await db.get(`twitch_${channel}`);
  const values = request.value;
  const dbCode = request.ok ? request.value.code : null
  if (dbCode !== code) {
    return { erro: 'Code inválido!' }
  }
  return { access_token: values.access_token, refresh_token: values.refresh_token, id: values.id }
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


// Create Prediction
async function createNewPrediction(code, time, channel, question, option1, option2, option3) {

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
      'prediction_window': time,
      'outcomes': possibleOutcomes
    })
  });

  const createPrediction = await createPredictionFetch.json();
  console.log("CreatePrediction:", createPrediction);

  if (createPrediction.status) {
    return 'Erro: Já existe aposta/palpite ativo, não é possível abrir novamente!'
  }
  
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

  const request = await db.get(`twitch_${channel}`);
  const values = request.value;

  values.access_token = newAccessToken
  values.refresh_token = newRefreshToken

  const newTokenDb = await db.set(`twitch_${channel}`, values).then(async () => {
    const request = await db.get(`twitch_${channel}`);
    const newValues = request.value;
    return newValues
  })
  return newTokenDb
}


// Cancel Prediction
async function cancelPrediction(code, channel) {
  const values = await getOpenPrediction(channel, code);
  if (values.erro) return values.erro

  const broadcasterId = values.broadcasterId
  const getCurrentPrediction = values.currentPrediction
  const predictionId = getCurrentPrediction.id

  const cancelarAposta = await fetch(`https://api.twitch.tv/helix/predictions?broadcaster_id=${broadcasterId}`, {
    "method": "PATCH",
    "headers": {
      'authorization': `Bearer ${values.access_token}`,
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

  if (result.status) {
    return 'Não há palpites para cancelar!'
  }
  return `Aposta/Palpite cancelado`
}


// Close Prediction
async function closePrediction(code, channel, winner) {
  const values = await getOpenPrediction(channel, code);
  if (values.erro) return values.erro

  const broadcasterId = values.broadcasterId;
  const getCurrentPrediction = values.currentPrediction;
  const predictionId = getCurrentPrediction.id;

  // Map outcomes with corresponding index strings
  const outcomesMap = getCurrentPrediction.outcomes.map((outcome, index) => ({
    ...outcome,
    indexStr: (index + 1).toString()
  }));

  const outcome = outcomesMap.find(outcome => 
    winner === outcome.title || winner === outcome.indexStr
  );

  if (!outcome) {
    return `Opção inválida ${winner}`;
  }

  const outcomeWinnerId = outcome.id;
  const outcomeWinnerTitle = outcome.title;

  const fecharAposta = await fetch(`https://api.twitch.tv/helix/predictions?broadcaster_id=${broadcasterId}`, {
    "method": "PATCH",
    "headers": {
      'authorization': `Bearer ${values.access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID,
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      "broadcaster_id": broadcasterId,
      "status": "RESOLVED",
      "id": predictionId,
      "winning_outcome_id": outcomeWinnerId
    })
  });

  const result = await fecharAposta.json();

  if (result.status) {
    return 'Não há palpites para encerrar!';
  }

  return `Resultado pago e encerrado! Opção vencedora: ${outcomeWinnerTitle}`;
}


module.exports = router;
