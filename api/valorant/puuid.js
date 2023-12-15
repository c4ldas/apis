let username = document.getElementById('username')
let tagline = document.getElementById('tagline')
const button = document.getElementById('button')
const reset = document.getElementById('reset')

button.addEventListener('click', obterPuuid)
reset.addEventListener('click', clear)

async function obterPuuid(event) {
  event.preventDefault();
  document.getElementById('puuid').style.display = 'block'
  document.getElementById('puuid').innerText = 'Obtendo... Por favor aguarde...'

  if (username.value == '' || tagline.value == '') {
    document.getElementById('puuid').innerText = 'Por favor, preencha todos os campos!'
    document.getElementById('puuid').style.color = 'red'
    document.getElementById('puuid').style.display = 'block'
    return
  }

  const getPuuidFetch = await fetch(`https://api.henrikdev.xyz/valorant/v1/account/${username.value}/${tagline.value}`)
  const getPuuid = await getPuuidFetch.json()
  console.log(getPuuid)

  if (getPuuid.status !== 200) {
    document.getElementById('puuid').innerText = 'Não encontrado! Verifique se o nick está correto ou tente mais tarde.'
    document.getElementById('puuid').style.color = 'red'
    document.getElementById('puuid').style.display = 'block'
    document.getElementById('img').style.display = 'none'
    document.getElementById('img').src = ''
    return
  }

  document.getElementById('puuid').innerText = `puuid: ${getPuuid.data.puuid}`
  document.getElementById('puuid').style.display = 'block'
  document.getElementById('puuid').style.color = 'blue'
  document.getElementById('img').src = getPuuid.data.card.large
  document.getElementById('img').style.display = 'block'
}

function clear() {
  username.value = ''
  tagline.value = ''
  document.getElementById('puuid').innerText = ''
  document.getElementById('puuid').style.display = 'none'
  document.getElementById('img').style.display = 'none'
  document.getElementById('img').src = ''
}
