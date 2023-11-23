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
  "Radiant": "Radiante"
}

let msg
const username = document.getElementById('username')
const tagline = document.getElementById('tagline')
const formatted = document.getElementById('formatted')
const codigo = document.getElementById('codigo')
const phrase = document.getElementById('phrase')

document.getElementById('mensagem').style.display = 'none'
document.getElementById('mensagem-codigo').style.display = 'none'

formatted.addEventListener('click', showFormatted)
codigo.addEventListener('click', generateCode)

async function showFormatted(event) {
  event.preventDefault();
  document.getElementById('mensagem').style.display = 'block'
  document.getElementById('mensagem').innerText = 'Obtendo... Por favor aguarde...'
  document.getElementById('mensagem').style.color = 'blue'

  if (username.value == '' || tagline.value == '') {
    document.getElementById('mensagem').innerText = 'Por favor, preencha os campos Username e Tagline!'
    document.getElementById('mensagem').style.color = 'red'
    return
  }

  const getRankFetch = await fetch(`https://api.henrikdev.xyz/valorant/v1/mmr/br/${username.value}/${tagline.value}`)
  const getRank = await getRankFetch.json()
  console.log(getRank)

  // If the rank keys do not exist, create a temporary value
  const currenttierpatched = getRank.data ? getRank.data.currenttierpatched : "Unrated"
  const elo = badges[currenttierpatched]
  const pontos = getRank.data ? getRank.data.ranking_in_tier : 0
  const vitorias = 17
  const posicao = 35

  msg = phrase.value ? phrase.value : phrase.placeholder.replace('Mensagem: ', '')

  const finalMsg = msg
    .replace(/\(player\)/g, username.value)
    .replace(/\(pontos\)/g, pontos)
    .replace(/\(rank\)/g, elo)
    .replace(/\(vitorias\)/g, vitorias)
    .replace(/\(posicao\)/g, posicao)
    .replace('Mensagem: ', '')

  document.getElementById('mensagem').innerText = `${finalMsg}`
  document.getElementById('mensagem').style.color = 'blue'

}

function generateCode(event) {
  event.preventDefault();

  if (!msg) {
    document.getElementById('mensagem').innerText = `Clique em ${formatted.value} primeiro!`
    document.getElementById('mensagem').style.color = 'red'
    document.getElementById('mensagem').style.display = 'block'
    return
  }

  if (username.value == '' || tagline.value == '') {
    document.getElementById('mensagem').innerText = 'Por favor, preencha ao menos os campos Username e Tagline!'
    document.getElementById('mensagem').style.color = 'red'
    document.getElementById('mensagem').style.display = 'block'
    return
  }

  document.getElementById('mensagem-codigo').style.display = 'block'
  document.getElementById('mensagem-codigo').innerText = ''
  document.getElementById('mensagem-codigo').innerText = `.me \${touser} ► \${customapi.https://repl.c4ldas.com.br/api/valorant/rank?channel=\$(channel)&player=${encodeURIComponent(username.value)}&tag=${tagline.value}&msg="${msg}"}`
  document.getElementById('mensagem-codigo').style.fontFamily = 'monospace'
}
