let relogio = null;

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

export function mostrarAtual(dados, nomeLocal) {
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
  document.body.className = atual.is_day === 0 ? 'noite' : tempo.classe;

  document.getElementById('atual').hidden = false;
}

export function mostrarPrevisao(dados) {
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

export function iniciarRelogio(fusoHorario) {
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

export function atualizarBotaoUnidade(unidade) {
  document.getElementById('unidade').textContent = unidade === 'celsius' ? '°F' : '°C';
}