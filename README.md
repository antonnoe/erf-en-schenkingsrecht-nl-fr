# Erf- en schenkingsrecht NL/FR

Educatieve scenariotool voor Franse schenk- en erfbelasting (GitHub Pages, ingebed op Infofrankrijk). Versie 0.4.

Tests draaien: `node tests/erf.test.mjs` (geen afhankelijkheden, alleen Node).

## Bron van de bedragen

De bedragen, tarieven en drempels in deze tool worden bijgehouden in Peil, het (privé) parameterregister van Communities Abroad. De tool hangt niet af van een openbare Peil-site of API: de waarden staan als eigen kopie in `peil/waarden.json` (met `stand`, per parameter de waarde, de bron en de verificatiedatum). Die kopie wordt bijgewerkt door de Peil-agent. `node tests/peil.test.mjs` vergelijkt de bedragen in `app.js` met `peil/waarden.json` (geen netwerk) en meldt welke constante mee moet; de workflow `peil-controle.yml` draait die controle bij elke push en elke maandag. De standdatum staat in `PEIL_STAND` in `app.js` en moet gelijk zijn aan `stand` in `peil/waarden.json`. De uitlegpagina waarnaar "Peil" linkt staat in `PEIL_UITLEG_URL` (tijdelijk een pagina op Infofrankrijk).

Alles tegelijk draaien: `npm test`.
