# ☀️ App do Tempo

Uma aplicação web simples que mostra o tempo atual e a previsão para 7 dias, usando a tua localização ou qualquer cidade do mundo.

🔗 **Ver a app online:** https://O-TEU-UTILIZADOR.github.io/app-tempo/

## ✨ Funcionalidades

- 📍 Deteta automaticamente a tua localização
- 🔍 Pesquisa de qualquer cidade pelo nome
- 🌡️ Tempo atual: temperatura, sensação térmica, humidade e vento
- 📅 Previsão para 7 dias com máximas, mínimas e probabilidade de chuva
- 🕒 Hora local do sítio pesquisado
- 🎨 Fundo que muda consoante o tempo (sol, chuva, neve, noite…)
- 🔄 Alternar entre °C e °F
- 💾 Lembra a última cidade e a unidade escolhida (localStorage)

## 🛠️ Tecnologias

- HTML, CSS e JavaScript (sem frameworks)
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs): dados meteorológicos
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api): converter nomes de cidades em coordenadas
- Geolocation API do navegador
- localStorage para guardar preferências

Nenhuma das APIs precisa de chave nem de registo.

## 🚀 Como correr localmente

1. Clona o repositório:
   ```bash
   git clone https://github.com/O-TEU-UTILIZADOR/app-tempo.git
   ```
2. Abre a pasta no VS Code.
3. Abre o `index.html` com a extensão **Live Server**.

> A geolocalização só funciona em `https://` ou `localhost`, por isso abrir o ficheiro diretamente (`file://`) não funciona.

## 📚 O que aprendi

- Ler documentação de APIs e construir URLs com parâmetros (`URLSearchParams`)
- Fazer pedidos com `fetch`, `async/await` e tratar erros
- Encadear duas APIs (geocoding → previsão)
- Navegar em respostas JSON, incluindo listas paralelas
- Gerir estado e guardar preferências no `localStorage`
- Usar Git, GitHub e publicar com GitHub Pages

## 🙏 Créditos

Dados meteorológicos fornecidos por [Open-Meteo.com](https://open-meteo.com/), sob a licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
