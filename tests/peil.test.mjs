// Controle van de bedragen in app.js tegen Peil, het openbare parameterregister NL-FR van Communities Abroad.
// Draaien: node tests/peil.test.mjs (Node 22 of nieuwer, fetch ingebouwd, geen afhankelijkheden).
// Zonder netwerk wordt de test overgeslagen met een melding (geen fout), zodat offline werken kan.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appCode = fs.readFileSync(path.join(here, "..", "app.js"), "utf8");
const indexHtml = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

const PEIL = "https://antonnoe.github.io/peil-nl-fr";
const PEIL_TOOL_PAGINA = `${PEIL}/tools/erf-en-schenkingsrecht-nl-fr/`;
const TOOL_URL = `${PEIL}/api/v1/tools/erf-en-schenkingsrecht-nl-fr.json`;

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

async function haal(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status} bij ${url}`), { http: true });
  return res.json();
}

const fouten = [];
const fout = (m) => fouten.push(m);

// Eerst de vaste onderdelen die geen netwerk nodig hebben.
if (!indexHtml.includes(`href="${PEIL_TOOL_PAGINA}"`)) fout("De voettekst in index.html verwijst niet naar de Peil-pagina van deze tool.");
if (!indexHtml.includes("De bedragen, tarieven en drempels in deze tool komen uit")) fout("De Peil-tekst in de voettekst van index.html ontbreekt.");
if (E.PEIL_URL !== PEIL_TOOL_PAGINA) fout(`PEIL_URL in app.js is ${E.PEIL_URL}, verwacht ${PEIL_TOOL_PAGINA}.`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(E.PEIL_STAND)) fout(`PEIL_STAND in app.js (${E.PEIL_STAND}) is geen datum als JJJJ-MM-DD.`);

let tool;
try {
  tool = await haal(TOOL_URL);
} catch (e) {
  if (!e.http) {
    console.log(`OVERGESLAGEN Peil-controle: Peil is niet bereikbaar (${e.message}). De vergelijking is niet uitgevoerd.`);
    if (fouten.length) {
      console.log(fouten.map((m) => `FOUT ${m}`).join("\n"));
      process.exit(1);
    }
    process.exit(0);
  }
  fout(`Peil gaf een foutmelding bij het ophalen van de lijst met parameters: ${e.message}`);
}

if (tool) {
  const lijst = tool.parameters || [];
  if (!lijst.length) fout("Peil geeft geen parameters terug voor deze tool.");
  const perId = new Map(lijst.map((p) => [p.id, p]));

  // Peil moet voor de stand van de tool dezelfde datum noemen als de tool zelf toont.
  if (tool.laatste_controle && tool.laatste_controle !== E.PEIL_STAND) {
    fout(`Peil meldt als laatste controle ${tool.laatste_controle}, maar de tool toont als stand ${E.PEIL_STAND} (PEIL_STAND in app.js). Controleer de bedragen en werk PEIL_STAND bij.`);
  }

  for (const [id, koppeling] of Object.entries(KOPPELING)) {
    const kop = perId.get(id);
    if (!kop) {
      fout(`${id}: deze parameter staat niet meer in Peil, maar de tool gebruikt hem nog (${koppeling.constante}).`);
      continue;
    }
    if (kop.status !== "vastgesteld") {
      fout(`${id} (${kop.naam_nl}): de status in Peil is "${kop.status}" in plaats van "vastgesteld". De tool gebruikt dit bedrag nog (${koppeling.constante}).`);
    }
    let detail;
    try {
      detail = (await haal(`${PEIL}${kop.pad}`)).parameter;
    } catch (e) {
      if (!e.http) {
        console.log(`OVERGESLAGEN Peil-controle: Peil werd onderweg onbereikbaar (${e.message}).`);
        process.exit(fouten.length ? 1 : 0);
      }
      fout(`${id}: de parameter kon niet worden opgehaald (${e.message}).`);
      continue;
    }
    for (const [wat, app, peil] of koppeling.vergelijk(detail.waarde)) {
      if (!gelijk(app, peil)) {
        fout(`${id} (${kop.naam_nl}), ${wat}: app.js heeft ${JSON.stringify(app)}, Peil heeft ${JSON.stringify(peil)}. Constante in app.js: ${koppeling.constante}.`);
      }
    }
    console.log(`ok   ${id} <-> ${koppeling.constante}`);
  }

  const ongebruikt = lijst.filter((p) => !KOPPELING[p.id]).map((p) => p.id);
  if (ongebruikt.length) console.log(`info Peil-parameters die app.js niet gebruikt (niet vergeleken): ${ongebruikt.join(", ")}`);
}

if (fouten.length) {
  console.log(`\n${fouten.length} afwijking(en) tussen de tool en Peil:`);
  fouten.forEach((m) => console.log(`FOUT ${m}`));
  process.exit(1);
}
console.log(`\nAlle ${Object.keys(KOPPELING).length} gebruikte parameters komen overeen met Peil (stand ${E.PEIL_STAND}).`);
