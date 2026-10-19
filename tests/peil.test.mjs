// Controle van de bedragen in app.js tegen peil/waarden.json, de kopie van de waarden uit Peil (het parameterregister van Communities Abroad).
// NB: peil/waarden.json wordt later door de Peil-agent bijgewerkt. Na een update draait deze test en laat zien welke constante in app.js mee moet.
// Draaien: node tests/peil.test.mjs (geen netwerk, geen afhankelijkheden).
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appCode = fs.readFileSync(path.join(here, "..", "app.js"), "utf8");
const indexHtml = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

const WAARDEN = JSON.parse(fs.readFileSync(path.join(here, "..", "peil", "waarden.json"), "utf8"));
const UITLEG_URL = "https://infofrankrijk.com/categorie/over-ons/";

// ---- Motor laden (zelfde werkwijze als tests/erf.test.mjs)
function loadEngine() {
  const el = () => ({ innerHTML: "", textContent: "", value: "", checked: false, style: {}, classList: { add() {}, remove() {}, contains() { return false; } }, addEventListener() {}, appendChild() {}, setAttribute() {} });
  const store = new Map();
  const ctx = {
    console, Date, Math, JSON, URL, Intl, Number, String, Object, Array, Set, Infinity, parseInt, parseFloat, isFinite, Error,
    document: { referrer: "", getElementById: el, createElement: el, head: { appendChild() {} }, documentElement: { classList: { add() {}, remove() {} } } },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
  };
  ctx.window = ctx;
  ctx.window.parent = ctx;
  ctx.window.addEventListener = () => {};
  ctx.window.print = () => {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(appCode, ctx, { filename: "app.js" });
  if (!ctx.ERF_ENGINE) throw new Error("ERF_ENGINE niet beschikbaar: app.js laadt niet.");
  return ctx.ERF_ENGINE;
}
const E = loadEngine();

// ---- Schijven omzetten naar een vergelijkbare vorm (Infinity en null zijn "geen bovengrens")
const schijvenApp = (b) => b.map((s) => ({ tot: s.upTo === Infinity ? null : s.upTo, tarief: s.rate }));
const schijvenPeil = (b) => (Array.isArray(b) ? b.map((s) => ({ tot: s.tot === null ? null : s.tot, tarief: s.tarief })) : null);
const eur = (n) => Number(n).toLocaleString("nl-NL");

// ---- De koppeling tussen Peil-id en de constante in app.js. Elke regel levert fouten (lege lijst = in orde).
// "app" is de waarde in app.js, "peil" de waarde uit het register (veld "waarde" van de parameter).
const KOPPELING = {
  "p.fr.succ.abattement_per_kind": { constante: "ALLOWANCE_CHILD (779 I)", vergelijk: (w) => [["aftrek per kind per ouder", E.ALLOWANCE_CHILD, w]] },
  "p.fr.don.abattement_echtgenoot_pacs": { constante: "ALLOWANCE_SPOUSE_DONATION (790 E/F)", vergelijk: (w) => [["aftrek bij schenking aan echtgenoot of PACS-partner", E.ALLOWANCE_SPOUSE_DONATION, w]] },
  "p.fr.don.barema_lijn_directe": { constante: "BRACKETS_LINE_DIRECT (777 tabel I)", vergelijk: (w) => [["schijven en tarieven rechte lijn", schijvenApp(E.BRACKETS_LINE_DIRECT), schijvenPeil(w)]] },
  "p.fr.succ.barema_lijn_directe": { constante: "BRACKETS_LINE_DIRECT (zelfde tabel bij overlijden)", vergelijk: (w) => [["schijven en tarieven rechte lijn bij overlijden", schijvenApp(E.BRACKETS_LINE_DIRECT), schijvenPeil(w)]] },
  "p.fr.don.barema_echtgenoot_pacs": { constante: "BRACKETS_SPOUSE_DONATION (777 tabel II)", vergelijk: (w) => [["schijven en tarieven echtgenoot of PACS-partner", schijvenApp(E.BRACKETS_SPOUSE_DONATION), schijvenPeil(w)]] },
  "p.fr.succ.tarief_stiefkind": { constante: "BRACKETS_FLAT_60 (777 tabel III)", vergelijk: (w) => [["vlak tarief niet-verwanten en stiefkind", E.BRACKETS_FLAT_60[0].rate, w]] },
  "p.fr.succ.abattement_niet_verwanten": {
    constante: "ALLOWANCE_DEATH_NONRELATIVE (788 IV) en BRACKETS_FLAT_60",
    vergelijk: (w) => [["aftrek niet-verwant bij overlijden", E.ALLOWANCE_DEATH_NONRELATIVE, w && w.abattement_overlijden], ["aftrek niet-verwant bij schenking", 0, w && w.abattement_schenking], ["tarief niet-verwant", E.BRACKETS_FLAT_60[0].rate, w && w.tarief]],
  },
  "p.fr.succ.abattement_stiefkind": { constante: "ALLOWANCE_DEATH_NONRELATIVE (788 IV, ook voor stiefkind)", vergelijk: (w) => [["aftrek stiefkind bij overlijden", E.ALLOWANCE_DEATH_NONRELATIVE, w]] },
  "p.fr.don.vrijstelling_geldschenking": { constante: "DON_FAMILIAL_MAX (790 G)", vergelijk: (w) => [["vrijstelling geldschenking", E.DON_FAMILIAL_MAX, w]] },
  "p.fr.succ.hernieuwingstermijn": { constante: "RAPPEL_YEARS (784)", vergelijk: (w) => [["hernieuwingstermijn in jaren", E.RAPPEL_YEARS, w]] },
  "p.fr.don.voorwaarden_geldschenking": { constante: "DONOR_MAX_AGE (790 G I)", vergelijk: (w) => [["schenker jonger dan", E.DONOR_MAX_AGE, w && w.schenker_leeftijd_kleiner_dan]] },
  // De tool rekent 790 A bis niet door, maar noemt de bedragen in een waarschuwing; die tekst moet dus kloppen.
  "p.fr.don.vrijstelling_nieuwbouw_renovatie": {
    constante: "tekst van de waarschuwing over 790 A bis in app.js",
    vergelijk: (w) => [
      ["790 A bis: bedrag per schenker in de waarschuwing", true, !!w && appCode.includes(`${eur(w.per_schenker_per_ontvanger)} euro per schenker`)],
      ["790 A bis: bedrag per ontvanger in de waarschuwing", true, !!w && appCode.includes(`${eur(w.per_ontvanger_totaal)} euro per ontvanger`)],
    ],
  },
  // Gedrag, geen constante: de tool laat de langstlevende echtgenoot en PACS-partner bij overlijden belastingvrij.
  "p.fr.succ.vrijstelling_echtgenoot": {
    constante: "gedrag van calcPair bij overlijden (gehuwd en PACS: 0 belasting)",
    vergelijk: () => {
      const tax = (relation) => E.calcPair({ mode: "succession", relation, gross: 500000, onDate: new Date("2026-10-19"), donorAge: 65, recipientStatus: "adult" }).tax;
      return [["belasting echtgenoot bij overlijden", 0, tax("married")], ["belasting PACS-partner bij overlijden", 0, tax("pacs")]];
    },
  },
};

// Parameters in Peil voor deze tool die app.js niet gebruikt (alleen ter informatie).
const gelijk = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const fouten = [];
const fout = (m) => fouten.push(m);

// Vaste onderdelen
if (!indexHtml.includes(`<a href="${UITLEG_URL}" target="_blank" rel="noopener">Peil</a>, het parameterregister van Communities Abroad. Elk bedrag is geverifieerd bij de officiële bron; de laatste controle was op`)) fout("De Peil-alinea in de voettekst van index.html ontbreekt of wijkt af.");
if (/antonnoe\.github\.io\/peil-nl-fr/.test(appCode) || /antonnoe\.github\.io\/peil-nl-fr/.test(indexHtml)) fout("De tool verwijst nog naar de openbare Peil-site.");
if (E.PEIL_UITLEG_URL !== UITLEG_URL) fout(`PEIL_UITLEG_URL in app.js is ${E.PEIL_UITLEG_URL}, verwacht ${UITLEG_URL}.`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(E.PEIL_STAND)) fout(`PEIL_STAND in app.js (${E.PEIL_STAND}) is geen datum als JJJJ-MM-DD.`);
if (WAARDEN.stand !== E.PEIL_STAND) fout(`stand in peil/waarden.json is ${WAARDEN.stand}, maar PEIL_STAND in app.js is ${E.PEIL_STAND}.`);
const voet = new RegExp(`laatste controle was op ${E.peilStandNl().replace(/ /g, " ")}\\.</p>`);
if (!voet.test(indexHtml)) fout(`De datum in de voettekst van index.html is niet ${E.peilStandNl()} (PEIL_STAND).`);
if (E.peilRegelMd() !== `Bedragen geverifieerd via [Peil](${UITLEG_URL})`) fout("De korte Peil-regel in de Markdown-samenvatting is niet 'Bedragen geverifieerd via Peil'.");
if (!E.peilRegelHtml().includes(">Peil</a></p>") || !E.peilRegelHtml().includes("Bedragen geverifieerd via <a")) fout("De korte Peil-regel in HTML (scherm en printrapport) is niet 'Bedragen geverifieerd via Peil'.");

const lijst = WAARDEN.parameters || [];
if (!lijst.length) fout("peil/waarden.json bevat geen parameters.");
const perId = new Map(lijst.map((p) => [p.id, p]));

for (const [id, koppeling] of Object.entries(KOPPELING)) {
  const kop = perId.get(id);
  if (!kop) {
    fout(`${id}: deze parameter staat niet in peil/waarden.json, maar de tool gebruikt hem (${koppeling.constante}).`);
    continue;
  }
  for (const [wat, app, peil] of koppeling.vergelijk(kop.waarde)) {
    if (!gelijk(app, peil)) {
      fout(`${id} (${kop.naam}), ${wat}: app.js heeft ${JSON.stringify(app)}, peil/waarden.json heeft ${JSON.stringify(peil)}. Constante in app.js: ${koppeling.constante}.`);
    }
  }
  console.log(`ok   ${id} <-> ${koppeling.constante}`);
}
const ongebruikt = lijst.filter((p) => !KOPPELING[p.id]).map((p) => p.id);
if (ongebruikt.length) console.log(`info parameters in waarden.json die app.js niet gebruikt (niet vergeleken): ${ongebruikt.join(", ")}`);

if (fouten.length) {
  console.log(`\n${fouten.length} afwijking(en) tussen de tool en peil/waarden.json:`);
  fouten.forEach((m) => console.log(`FOUT ${m}`));
  process.exit(1);
}
console.log(`\nAlle ${Object.keys(KOPPELING).length} gebruikte parameters komen overeen met peil/waarden.json (stand ${E.PEIL_STAND}).`);
