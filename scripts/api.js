export async function obterTempo(lat, lon, unidade) {
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
  if (!resposta.ok) throw new Error(`A API respondeu com erro ${resposta.status}`);

  const dados = await resposta.json();
  if (!dados.current) throw new Error('A API não devolveu os dados atuais');
  return dados;
}

export async function procurarCidade(nome) {
  const parametros = new URLSearchParams({ name: nome, count: 1, language: 'pt' });
  const resposta = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${parametros}`);
  if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

  const dados = await resposta.json();
  if (!dados.results || dados.results.length === 0) {
    throw new Error(`Não encontrei "${nome}"`);
  }
  return dados.results[0];
}