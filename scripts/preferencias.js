const CHAVE = 'app-tempo-preferencias';

export function lerPreferencias() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? {};
  } catch {
    return {};
  }
}

export function guardarPreferencias(preferencias) {
  localStorage.setItem(CHAVE, JSON.stringify(preferencias));
}