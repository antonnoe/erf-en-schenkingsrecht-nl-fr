# Erf- en schenkingsrecht NL/FR

Educatieve scenariotool voor Franse schenk- en erfbelasting (GitHub Pages, ingebed op Infofrankrijk). Versie 0.4.

Tests draaien: `node tests/erf.test.mjs` (geen afhankelijkheden, alleen Node).

## Bron van de bedragen

De bedragen, tarieven en drempels in deze tool komen uit [Peil](https://antonnoe.github.io/peil-nl-fr/tools/erf-en-schenkingsrecht-nl-fr/), het openbare parameterregister NL-FR van Communities Abroad. Daar staat per bedrag de officiële bron en de datum van controle. `node tests/peil.test.mjs` vergelijkt de bedragen in `app.js` met Peil (zonder netwerk wordt de test overgeslagen); een GitHub Actions-workflow draait die controle bij elke push en elke maandag. De standdatum staat op één plek: `PEIL_STAND` in `app.js`.

Alles tegelijk draaien: `npm test`.
