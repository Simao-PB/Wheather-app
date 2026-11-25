import { obterTempo, procurarCidade } from './api.js';
import { obterLocalizacao } from './localizacao.js';
import { mostrarAtual, mostrarPrevisao, iniciarRelogio, atualizarBotaoUnidade } from './ui.js';
import { lerPreferencias, guardarPreferencias } from './preferencias.js';

const MINHA_LOCALIZACAO = 'A tua localização';
const estado = document.getElementById('estado');

// Estado da app
const preferencias = lerPreferencias();
let unidade = preferencias.unidade ?? 'celsius';
let ultimoLocal = preferencias.ultimoLocal ?? null;

function guardar() {
  guardarPreferencias({ unidade, ultimoLocal });
}

async function carregar(lat, lon, nomeLocal) {
  try {
    estado.textContent = 'A carregar…';
    const dados = await obterTempo(lat, lon, unidade);

    ultimoLocal = { lat, lon, nomeLocal };
    guardar();

    mostrarAtual(dados, nomeLocal);
    mostrarPrevisao(dados);
    iniciarRelogio(dados.timezone);
    estado.textContent = '';
  } catch (erro) {
    estado.textContent = 'Erro ao obter o tempo: ' + erro.message;
  }
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

async function iniciar() {
  atualizarBotaoUnidade(unidade);

  if (ultimoLocal && ultimoLocal.nomeLocal !== MINHA_LOCALIZACAO) {
    await carregar(ultimoLocal.lat, ultimoLocal.lon, ultimoLocal.nomeLocal);
    return;
  }
  await usarMinhaLocalizacao();
}

// Eventos
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

document.getElementById('unidade').addEventListener('click', () => {
  unidade = unidade === 'celsius' ? 'fahrenheit' : 'celsius';
  atualizarBotaoUnidade(unidade);
  guardar();
  if (ultimoLocal) carregar(ultimoLocal.lat, ultimoLocal.lon, ultimoLocal.nomeLocal);
});

document.getElementById('localizacao').addEventListener('click', usarMinhaLocalizacao);

iniciar();