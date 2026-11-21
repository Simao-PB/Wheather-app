const estado = document.getElementById('estado');
const CHAVE = 'app-tempo-preferencias';
const MINHA_LOCALIZACAO = 'A tua localização';

function lerPreferencias() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? {};
  } catch {
    return {};
  }
}

function guardarPreferencias() {
  localStorage.setItem(CHAVE, JSON.stringify({ unidade, ultimoLocal }));
}

const preferencias = lerPreferencias();
let unidade = preferencias.unidade ?? 'celsius';
let ultimoLocal = preferencias.ultimoLocal ?? null;
let relogio = null;

async function obterTempo(lat, lon) {
  const parametros = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: 7,
    temperature_unit: unidade,
  });

  const resposta = await fetch(`https://api.open-meteo.com/v1/forecast?${parametros}`);

  if (!resposta.ok) {
    throw new Error(`A API respondeu com erro ${resposta.status}`);
  }

  return resposta.json();
}

function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      reject,
      { timeout: 10000 }
    );
  });
}

async function iniciar() {
  atualizarBotaoUnidade();

  if (ultimoLocal && ultimoLocal.nomeLocal !== MINHA_LOCALIZACAO) {
    await carregar(ultimoLocal.lat, ultimoLocal.lon, ultimoLocal.nomeLocal);
    return;
  }

  await usarMinhaLocalizacao();
}

async function usarMinhaLocalizacao() {
  try {
    estado.textContent = 'A obter a tua localização…';
    const { lat, lon } = await obterLocalizacao();
    await carregar(lat, lon, MINHA_LOCALIZACAO);
  } catch {
    estado.textContent = 'Sem localização. Pesquisa uma cidade acima.';
  }
}

async function carregar(lat, lon, nomeLocal) {
  try {
    estado.textContent = 'A carregar…';
    const dados = await obterTempo(lat, lon);
    if (!dados.current) throw new Error('A API não devolveu os dados atuais');

    ultimoLocal = { lat, lon, nomeLocal };
    guardarPreferencias();
    mostrarAtual(dados, nomeLocal);
    mostrarPrevisao(dados);
    iniciarRelogio(dados.timezone);
    estado.textContent = '';
  } catch (erro) {
    estado.textContent = 'Erro ao obter o tempo: ' + erro.message;
  }
  
}

function mostrarAtual(dados, nomeLocal) {
  const atual = dados.current;
  const unidades = dados.current_units;

  document.getElementById('local').textContent = nomeLocal;
  document.getElementById('temperatura').textContent =
    `${Math.round(atual.temperature_2m)}${unidades.temperature_2m}`;

  document.getElementById('detalhes').innerHTML = `
    <li>🌡️ Sensação<br>${Math.round(atual.apparent_temperature)}°</li>
    <li>💧 Humidade<br>${atual.relative_humidity_2m}%</li>
    <li>💨 Vento<br>${Math.round(atual.wind_speed_10m)} km/h</li>
  `;
  
  const tempo = descreverTempo(atual.weather_code);
    document.getElementById('icone').textContent = tempo.emoji;
    document.getElementById('descricao').textContent = tempo.texto;

  document.body.className = atual.is_day ? tempo.classe : 'noite';

  document.getElementById('atual').hidden = false;
}

function descreverTempo(codigo) {
  if (codigo === 0) return { emoji: '☀️', texto: 'Céu limpo', classe: 'sol' };
  if (codigo <= 2) return { emoji: '🌤️', texto: 'Pouco nublado', classe: 'sol' };
  if (codigo === 3) return { emoji: '☁️', texto: 'Nublado', classe: 'nublado' };
  if (codigo <= 48) return { emoji: '🌫️', texto: 'Nevoeiro', classe: 'nevoeiro' };
  if (codigo <= 57) return { emoji: '🌦️', texto: 'Chuvisco', classe: 'chuva' };
  if (codigo <= 67) return { emoji: '🌧️', texto: 'Chuva', classe: 'chuva' };
  if (codigo <= 77) return { emoji: '❄️', texto: 'Neve', classe: 'neve' };
  if (codigo <= 82) return { emoji: '🌧️', texto: 'Aguaceiros', classe: 'chuva' };
  if (codigo <= 86) return { emoji: '🌨️', texto: 'Aguaceiros de neve', classe: 'neve' };
  return { emoji: '⛈️', texto: 'Trovoada', classe: 'trovoada' };
}   

function mostrarPrevisao(dados) {
  const diario = dados.daily;
  const contentor = document.getElementById('previsao');
  contentor.innerHTML = '';

  diario.time.forEach((data, i) => {
    const nomeDia = new Date(data).toLocaleDateString('pt-PT', { weekday: 'short' });
    const tempo = descreverTempo(diario.weather_code[i]);
    const prob = diario.precipitation_probability_max[i];   

    const div = document.createElement('div');
    div.className = 'dia';
    div.innerHTML = `
      <div>${i === 0 ? 'Hoje' : nomeDia}</div>
      <div class="emoji">${tempo.emoji}</div>
      <div><b>${Math.round(diario.temperature_2m_max[i])}°</b>
           ${Math.round(diario.temperature_2m_min[i])}°</div>
      <div>💧 ${prob ?? '–'}%</div>
    `;
    contentor.appendChild(div);
  });
}

async function procurarCidade(nome) {
  const parametros = new URLSearchParams({ name: nome, count: 1, language: 'pt' });
  const resposta = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${parametros}`);
  if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

  const dados = await resposta.json();
  if (!dados.results || dados.results.length === 0) {
    throw new Error(`Não encontrei "${nome}"`);
  }
  return dados.results[0];
}

document.getElementById('pesquisa').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const nome = document.getElementById('cidade').value.trim();

  try {
    const cidade = await procurarCidade(nome);
    await carregar(cidade.latitude, cidade.longitude, `${cidade.name}, ${cidade.country}`);
  } catch (erro) {
    estado.textContent = erro.message;
  }
});

function iniciarRelogio(fusoHorario) {
  const elemento = document.getElementById('hora');
  clearInterval(relogio);

  function atualizar() {
    const hora = new Date().toLocaleTimeString('pt-PT', {
      timeZone: fusoHorario,
      hour: '2-digit',
      minute: '2-digit',
    });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    elemento.textContent = `🕒 ${hora} (hora local)`;
  }

  atualizar();
  relogio = setInterval(atualizar, 1000);
}

document.getElementById('unidade').addEventListener('click', () => {
  unidade = unidade === 'celsius' ? 'fahrenheit' : 'celsius';
  atualizarBotaoUnidade();
  guardarPreferencias();

  if (ultimoLocal) {
    carregar(ultimoLocal.lat, ultimoLocal.lon, ultimoLocal.nomeLocal);
  }
});

function atualizarBotaoUnidade() {
  document.getElementById('unidade').textContent = unidade === 'celsius' ? '°F' : '°C';
}

document.getElementById('localizacao').addEventListener('click', usarMinhaLocalizacao);

iniciar();