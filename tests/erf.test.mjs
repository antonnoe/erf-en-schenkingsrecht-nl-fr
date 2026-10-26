// Tests voor de rekenregels van erf-en-schenkingsrecht-nl-fr (V0.4).
// Laadt de echte app.js in een vm met een minimale DOM-stub; geen npm-afhankelijkheden.
// Draaien: node tests/erf.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(here, "..", "app.js"), "utf8");

function makeElement() {
  const el = {
    innerHTML: "",
    textContent: "",
    value: "",
    checked: false,
    style: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener() {},
    appendChild() {},
    setAttribute() {},
  };
  return el;
}

function loadEngine() {
  const store = new Map();
  const ctx = {
    console,
    Date,
    Math,
    JSON,
    URL,
    Intl,
    Number,
    String,
    Object,
    Array,
    Set,
    Infinity,
    parseInt,
    parseFloat,
    isFinite,
    Error,
    document: {
      referrer: "",
      getElementById: () => makeElement(),
      createElement: () => makeElement(),
      head: { appendChild() {} },
      documentElement: { classList: { add() {}, remove() {} } },
    },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
    },
  };
  ctx.window = ctx;
  ctx.window.parent = ctx;
  ctx.window.addEventListener = () => {};
  ctx.window.print = () => {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx, { filename: "app.js" });
  assert.ok(ctx.ERF_ENGINE, "ERF_ENGINE niet beschikbaar");
  return { E: ctx.ERF_ENGINE, store };
}

const { E, store } = loadEngine();
const ON = new Date("2026-10-19"); // peildatum van de regelspecificatie

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}\n     ${e.message}`);
  }
}
function near(actual, expected, msg) {
  assert.ok(Math.abs(actual - expected) < 0.005, `${msg || ""} verwacht ${expected}, kreeg ${actual}`);
}

// Zet de state voor een scenario (alleen de genoemde velden worden overschreven).
function setup(o) {
  const s = E.state;
  Object.assign(s.family, { relation: "single", childrenCount: 0, hasStepchildren: false, hasAdoptedChildren: false, hasMinorChildren: false, stepchildrenCount: 1, adoptedSimpleCount: 0 }, o.family || {});
  Object.assign(
    s.scenario,
    { mode: "succession", donationType: "standard", allocateToPartnerPct: 50, allocateToChildrenPct: 50, donor: "one", donorSplitPct: 50, donorAge: 65, donor2Age: 65, recipientStatus: "adult", cashAmount: null, priorChildGifts: 0, priorChild790G: 0, priorPartnerGifts: 0 },
    o.scenario || {}
  );
  // Basisscenario: overlijdt en woont in Frankrijk, zonder hoofdwoning. Bij overlijden komt het forfait begrafeniskosten (art. 775 CGI) eraf: tel het erbij, zodat "net" de netto massa is.
  Object.assign(s.anchors, { habitualResidenceAtDeath: "fr", nationality: "fr", mainAssetsLocation: "fr", recipientFrResident: "yes", frAssetsPct: 50, leftNlSince: "gte10" }, o.anchors || {});
  s.estate.includesMainHome = false;
  s.estate.mainHomeValue = 250000;
  s.estate.debtsTotal = 0;
  s.estate.assetsTotal = s.scenario.mode === "donation" ? o.net : o.net + E.FORFAIT_BEGRAFENIS;
  E.computeReport();
  return s.report;
}
const pair = (o) => E.calcPair(Object.assign({ mode: "donation", onDate: ON, donorAge: 65, recipientStatus: "adult" }, o));

// ---- T1
test("T1 schenking gehuwd, 2 kinderen, 380.000, partner 50 %", () => {
  const r = setup({ net: 380000, family: { relation: "married", childrenCount: 2 }, scenario: { mode: "donation", allocateToPartnerPct: 50, allocateToChildrenPct: 50 } });
  near(r.rowsDesired[0].tax, 19062, "partner");
  near(r.rowsDesired[1].tax, 0, "kind 1");
  near(r.rowsDesired[2].tax, 0, "kind 2");
  near(r.totalsDesired.totalTax, 19062, "totaal");
});

// ---- T2 t/m T5
test("T2 don familial toepasbaar (65 jaar, kind 30)", () => {
  const p = pair({ relation: "child", gross: 150000, cashPart: 150000, useDonFamilial: true, donorAge: 65 });
  near(p.vrij790G, 31865, "790 G");
  near(p.taxable, 18135, "belastbaar");
  near(p.tax, 1821, "belasting");
});
test("T3 geen don familial: schenker 82 jaar", () => {
  const p = pair({ relation: "child", gross: 150000, cashPart: 150000, useDonFamilial: true, donorAge: 82 });
  near(p.vrij790G, 0);
  near(p.tax, 8194);
  assert.ok(p.notes.some((n) => n.startsWith("Geen vrijstelling voor geldschenking")));
});
test("T4 geen don familial: kind 17, niet geëmancipeerd", () => {
  const p = pair({ relation: "child", gross: 150000, cashPart: 150000, useDonFamilial: true, recipientStatus: "minor" });
  near(p.tax, 8194);
});
test("T4 variant: kind geëmancipeerd, dan wel vrijstelling", () => {
  const p = pair({ relation: "child", gross: 150000, cashPart: 150000, useDonFamilial: true, recipientStatus: "emancipated" });
  near(p.tax, 1821);
});
test("T4 extra: minderjarige kinderen aangegeven en niet geëmancipeerd, geen vrijstelling", () => {
  const p = pair({ relation: "child", gross: 150000, cashPart: 150000, useDonFamilial: true, recipientStatus: "adult", minorFlag: true });
  near(p.tax, 8194);
});
test("T5 gedeeltelijk geld: 20.000 van 150.000", () => {
  const p = pair({ relation: "child", gross: 150000, cashPart: 20000, useDonFamilial: true });
  near(p.vrij790G, 20000);
  near(p.taxable, 30000);
  near(p.tax, 4194);
});

// ---- T6 t/m T9 rappel
test("T6 rappel: 60.000 aan kind 10 jaar geleden, nu 100.000", () => {
  const p = pair({ relation: "child", gross: 100000, priorGifts: [{ amount: 60000, date: "2016-10-01" }] });
  near(p.remainingAllowance, 40000, "resterende aftrek");
  near(p.taxable, 60000);
  near(p.tax, 10194);
});
test("T7 eerdere schenking 20 jaar geleden telt niet mee", () => {
  const p = pair({ relation: "child", gross: 100000, priorGifts: [{ amount: 60000, date: "2006-10-01" }] });
  near(p.taxable, 0);
  near(p.tax, 0);
});
test("T8 rappel met eerder belast deel (schijven doorgeteld)", () => {
  const p = pair({ relation: "child", gross: 100000, priorGifts: [{ amount: 160000, date: "2016-10-01" }] });
  near(p.remainingAllowance, 0);
  near(p.tax, 20000);
  assert.ok(p.notes.some((n) => n.includes("Begint in schijf: 20 %")), "toont beginschijf");
});
test("T9 rappel en 790 G samen: 790 G telt niet mee voor 784", () => {
  const p = pair({
    relation: "child",
    gross: 100000,
    cashPart: 100000,
    useDonFamilial: true,
    priorGifts: [{ amount: 31865, vrij790G: 31865, date: "2021-06-01" }],
  });
  near(p.vrij790G, 0, "plafond al benut");
  near(p.taxable, 0);
  near(p.tax, 0);
});

// ---- T10, T11 beide ouders
test("T10 beide ouders schenken 300.000 aan 1 kind (50/50, geen geld)", () => {
  const r = setup({ net: 300000, family: { relation: "married", childrenCount: 1 }, scenario: { mode: "donation", donor: "both", donorSplitPct: 50 } });
  assert.equal(r.rowsDesired.length, 1);
  near(r.rowsDesired[0].tax, 16388);
});
test("T10 variant in geld: beide ouders onder 80, kind meerderjarig", () => {
  const r = setup({ net: 300000, family: { relation: "married", childrenCount: 1 }, scenario: { mode: "donation", donor: "both", donationType: "cash_gift_31865" } });
  near(r.rowsDesired[0].tax, 3642);
});
test("T10 extra: ouder 2 is 80 of ouder, alleen ouder 1 krijgt 790 G", () => {
  const r = setup({ net: 300000, family: { relation: "married", childrenCount: 1 }, scenario: { mode: "donation", donor: "both", donationType: "cash_gift_31865", donor2Age: 80 } });
  near(r.rowsDesired[0].tax, 1821 + 8194);
});
// ---- B1 beide ouders met stiefkind
test("B1 gehuwd, 1 stiefkind, beide ouders, 300.000: eigen ouder rechte lijn, stiefouder 60 %", () => {
  const r = setup({ net: 300000, family: { relation: "married", childrenCount: 1, hasStepchildren: true, stepchildrenCount: 1 }, scenario: { mode: "donation", donor: "both", donorSplitPct: 50 } });
  assert.equal(r.rowsDesired.length, 1);
  near(r.rowsDesired[0].tax, 98194);
});

// ---- K1 plafond 790 G bij eerdere schenkingen
test("K1 eerdere 790 G-schenking boven 31.865: het meerdere telt als gewone schenking", () => {
  const p = pair({ relation: "child", gross: 100000, priorGifts: [{ amount: 40000, vrij790G: 40000, date: "2021-06-01" }] });
  near(p.remainingAllowance, 100000 - 8135, "resterende aftrek");
  near(p.tax, 410);
  const r = setup({ net: 100000, family: { relation: "single", childrenCount: 1 }, scenario: { mode: "donation", priorChildGifts: 40000, priorChild790G: 40000 } });
  near(r.rowsDesired[0].tax, 410);
});
test("K1 scherm: veld 1 totaal, veld 2 waarvan 790 G (niet optellen)", () => {
  const a = setup({ net: 100000, family: { relation: "single", childrenCount: 1 }, scenario: { mode: "donation", priorChildGifts: 40000, priorChild790G: 40000 } });
  near(a.rowsDesired[0].tax, 410, "40.000 / 40.000");
  const b = setup({ net: 100000, family: { relation: "single", childrenCount: 1 }, scenario: { mode: "donation", priorChildGifts: 20000, priorChild790G: 10000 } });
  near(b.rowsDesired[0].tax, 596, "20.000 / 10.000");
});
test("Stiefkind en geldschenking: reden voor ontbreken 790 G verschijnt", () => {
  const p = pair({ relation: "stepchild", gross: 50000, cashPart: 50000, useDonFamilial: true });
  assert.ok(p.notes.some((n) => n.startsWith("Geen vrijstelling voor geldschenking") && n.includes("stiefkind")), p.notes.join("|"));
});
test("Beide ouders: geen uitspraak over gunstigste verdeling, wel nudge bij stiefkind", () => {
  const r = setup({ net: 200000, family: { relation: "married", childrenCount: 2, hasStepchildren: true, stepchildrenCount: 1 }, scenario: { mode: "donation", donor: "both", donorSplitPct: 50 } });
  assert.equal(r.gap, null);
  assert.ok(r.gapSkipped);
  assert.ok(r.nudges.some((n) => n.title === "Stiefkind: wie schenkt?"));
});
test("Zonder partner geen 'partner 0 %' in de gap-tekst", () => {
  const r = setup({ net: 100000, family: { relation: "single", childrenCount: 2 }, scenario: { mode: "donation" } });
  assert.ok(r.gap && !/partner 0/.test(r.gap.body), r.gap && r.gap.body);
  assert.ok(!/rechten van de partner/.test(r.gap.body));
});

test("T11 300.000 uit eigen vermogen van een ouder", () => {
  const r = setup({ net: 300000, family: { relation: "single", childrenCount: 1 }, scenario: { mode: "donation", donor: "one" } });
  near(r.rowsDesired[0].tax, 38194);
});

// ---- T12, T13 samenwonend
test("T12 schenking aan samenwonende partner 50.000", () => {
  const r = setup({ net: 50000, family: { relation: "cohab", childrenCount: 0 }, scenario: { mode: "donation" } });
  near(r.rowsDesired[0].tax, 30000);
  assert.equal(r.rowsDesired[0].allowance, 0);
});
test("T13 overlijden, samenwonende partner erft 50.000", () => {
  const r = setup({ net: 50000, family: { relation: "cohab", childrenCount: 0 }, scenario: { mode: "succession" } });
  near(r.rowsDesired[0].tax, 29044);
});

// ---- T14 PACS
test("T14 PACS schenking 100.000", () => {
  const r = setup({ net: 100000, family: { relation: "pacs", childrenCount: 0 }, scenario: { mode: "donation" } });
  near(r.rowsDesired[0].tax, 1691);
});
test("T14 PACS overlijden 100.000: vrijgesteld", () => {
  const r = setup({ net: 100000, family: { relation: "pacs", childrenCount: 0 }, scenario: { mode: "succession" } });
  near(r.rowsDesired[0].tax, 0);
});

// ---- T15
test("T15 overlijden, gehuwd, 2 kinderen, netto 483.000", () => {
  const r = setup({ net: 483000, family: { relation: "married", childrenCount: 2 }, scenario: { mode: "succession" } });
  near(r.rowsDesired[0].tax, 0, "partner");
  near(r.rowsDesired[1].tax, 2344, "kind 1");
  near(r.rowsDesired[2].tax, 2344, "kind 2");
  near(r.totalsDesired.totalTax, 4688);
});

// ---- T16 stiefkind
test("T16 stiefkind, overlijden 50.000", () => {
  const r = setup({ net: 50000, family: { relation: "single", childrenCount: 1, hasStepchildren: true, stepchildrenCount: 1 }, scenario: { mode: "succession" } });
  assert.equal(r.rowsDesired[0].relationLabel, "Stiefkind (niet geadopteerd)");
  near(r.rowsDesired[0].tax, 29044);
});
test("T16 stiefkind, schenking 50.000", () => {
  const r = setup({ net: 50000, family: { relation: "single", childrenCount: 1, hasStepchildren: true, stepchildrenCount: 1 }, scenario: { mode: "donation" } });
  near(r.rowsDesired[0].tax, 30000);
});

// ---- T17 benchmark samenwonend
test("T17 samenwonend, overlijden 483.000, geen kinderen: gunstigste verdeling is niet 0", () => {
  const r = setup({ net: 483000, family: { relation: "cohab", childrenCount: 0 }, scenario: { mode: "succession" } });
  near(r.rowsDesired[0].tax, 288844);
  near(r.totalsMin.totalTax, 288844, "benchmark");
  assert.ok(r.totalsMin.totalTax > 0);
});
test("T17 extra: samenwonend met kinderen, benchmark gebruikt 60 % voor de partner", () => {
  const r = setup({ net: 483000, family: { relation: "cohab", childrenCount: 2 }, scenario: { mode: "succession", allocateToPartnerPct: 50, allocateToChildrenPct: 50 } });
  // partner 0 % is voor kinderen het gunstigst (aftrek 100.000 per kind, lage tarieven)
  assert.equal(r.gap.minPartnerPct, 0);
  assert.ok(r.gap.taxGap > 0);
  assert.ok(r.relationComparison && r.relationComparison.marriedOrPacsTax < r.relationComparison.cohabTax);
});

// ---- T18 en niet-berekende gevallen
test("T18 broer of zus: relatie niet ondersteund, dus niet berekend (geen 0)", () => {
  const p = pair({ relation: "sibling", gross: 50000 });
  assert.equal(p.computed, false);
  assert.ok(p.reason);
});
test("adoption simple: niet berekend, melding uit de spec, geen bedrag", () => {
  const r = setup({ net: 100000, family: { relation: "single", childrenCount: 1, hasAdoptedChildren: true, adoptedSimpleCount: 1 }, scenario: { mode: "succession" } });
  assert.equal(r.rowsDesired[0].computed, false);
  assert.ok(r.rowsDesired[0].reason.startsWith("Adoption simple"));
  assert.equal(r.totalsDesired.totalTax, 0);
  assert.equal(r.gap, null, "geen vergelijking als een ontvanger niet berekend is");
});
test("niet-berekende rij telt niet mee in de totalen en is geen uitkomst 0", () => {
  const r = setup({ net: 200000, family: { relation: "single", childrenCount: 2, hasAdoptedChildren: true, adoptedSimpleCount: 1 }, scenario: { mode: "succession" } });
  const nc = r.rowsDesired.filter((x) => x.computed === false);
  assert.equal(nc.length, 1);
  assert.equal(r.totalsDesired.totalGross, 100000);
});

// ---- H: wat moet blijven
test("H tabel I en II ongewijzigd", () => {
  near(E.progressiveTax(15932, E.BRACKETS_LINE_DIRECT), 1380.75);
  near(E.progressiveTax(109276, E.BRACKETS_SPOUSE_DONATION), 19061.75);
});
test("H geen 790 G voor echtgenoot, PACS of samenwonende", () => {
  for (const relation of ["married", "pacs", "cohab"]) {
    const c = E.check790G({ relation, cashPart: 50000, donorAge: 60, recipientStatus: "adult", used790G: 0 });
    assert.equal(c.eligible, false, relation);
  }
});

// ---- beveiliging en opslag
test("saveToDossier: toegestane en onbekende herkomst", () => {
  assert.equal(E.resolveParentOrigin("https://infofrankrijk.com/dossier?x=1", ""), "https://infofrankrijk.com");
  assert.equal(E.resolveParentOrigin("https://www.infofrankrijk.com/", ""), "https://www.infofrankrijk.com");
  assert.equal(E.resolveParentOrigin("http://localhost:3000/pagina", ""), "http://localhost:3000");
  assert.equal(E.resolveParentOrigin("", "https://www.infofrankrijk.com"), "https://www.infofrankrijk.com");
  assert.equal(E.resolveParentOrigin("https://evil.example/", ""), "");
  assert.equal(E.resolveParentOrigin("", ""), "");
  assert.equal(E.resolveParentOrigin("https://infofrankrijk.com.evil.example/", ""), "");
});
test("opgeslagen oude state krijgt standaardwaarden voor nieuwe velden", () => {
  const merged = E.mergeDefaults(E.DEFAULT_STATE, { family: { relation: "pacs", childrenCount: 3 }, scenario: { mode: "donation" }, meta: { version: "0.3.0" } });
  assert.equal(merged.family.relation, "pacs");
  assert.equal(merged.family.childrenCount, 3);
  assert.equal(merged.family.stepchildrenCount, 1);
  assert.equal(merged.scenario.donor, "one");
  assert.equal(merged.scenario.donorAge, 65);
  assert.equal(merged.scenario.cashAmount, null);
});
test("STORAGE_KEY ongewijzigd", () => {
  assert.ok(store.has("nlfr_erf_schenk_v02"));
});

// ---- schermen renderen zonder fouten
test("alle stappen en het printrapport renderen zonder fout", () => {
  for (const mode of ["succession", "donation"]) {
    setup({
      net: 400000,
      family: { relation: "cohab", childrenCount: 3, hasStepchildren: true, hasAdoptedChildren: true, adoptedSimpleCount: 1 },
      scenario: { mode, donor: "both", donationType: "cash_gift_31865", priorChildGifts: 5000 },
    });
    for (let i = 0; i < 6; i++) E.goTo(i);
    E.renderPrintReport(E.buildReportContract());
  }
});

// ---- Herstel rekenwijze (keuring 26-10-2026)
// Hulp: basisscenario via setup(), daarna estate, anchors en scenario aanpassen en opnieuw rekenen.
function herreken(o, estate, anchors) {
  setup(o);
  Object.assign(E.state.estate, estate || {});
  Object.assign(E.state.anchors, anchors || {});
  E.computeReport();
  return E.state.report;
}
const kind = { relation: "single", childrenCount: 1 };

test("H1 territorialiteit: overledene en vermogen in Nederland, verkrijger geen 6 van 10 jaar in Frankrijk: Frankrijk heft niet (art. 750 ter CGI)", () => {
  const r = herreken({ net: 400000, family: kind }, { assetsTotal: 401500 }, { habitualResidenceAtDeath: "nl", mainAssetsLocation: "nl", recipientFrResident: "no" });
  assert.equal(r.totalsDesired.totalTax, 0);
  assert.equal(r.taxBase, 0);
  assert.ok(r.nudges.some((n) => /Frankrijk heft hier niet/.test(n.title)));
});
test("H1 territorialiteit: verkrijger woont ten minste 6 van de 10 jaar in Frankrijk: alles belast", () => {
  const r = herreken({ net: 400000, family: kind }, { assetsTotal: 401500 }, { habitualResidenceAtDeath: "nl", mainAssetsLocation: "nl", recipientFrResident: "yes" });
  assert.equal(r.totalsDesired.totalTax, 58194);
});
test("H1 territorialiteit: overledene in Frankrijk: alles belast, ongeacht de verkrijger", () => {
  const r = herreken({ net: 400000, family: kind }, { assetsTotal: 401500 }, { habitualResidenceAtDeath: "fr", mainAssetsLocation: "nl", recipientFrResident: "no" });
  assert.equal(r.totalsDesired.totalTax, 58194);
});
test("H1 territorialiteit: gemengd vermogen, 50 % in Frankrijk: grondslag 200.000", () => {
  const r = herreken({ net: 400000, family: kind }, { assetsTotal: 401500 }, { habitualResidenceAtDeath: "nl", mainAssetsLocation: "mixed", frAssetsPct: 50, recipientFrResident: "no" });
  assert.equal(r.taxBase, 200000);
  assert.equal(r.totalsDesired.totalTax, 18194); // 100.000 belastbaar na aftrek: 18.194,35 afgerond
});
test("H1 territorialiteit: schenking door niet-ingezetene van Frankrijk met Nederlands vermogen: 0", () => {
  const r = herreken({ net: 150000, family: kind, scenario: { mode: "donation" } }, {}, { habitualResidenceAtDeath: "nl", mainAssetsLocation: "nl", recipientFrResident: "no" });
  assert.equal(r.totalsDesired.totalTax, 0);
});

test("H2 Nederlandse tienjaarsfictie: Nederlander, woont in Frankrijk, vertrokken minder dan 10 jaar geleden: melding, nooit stilzwijgend 0", () => {
  const r = herreken({ net: 1200000, family: { relation: "married", childrenCount: 0 } }, {}, { habitualResidenceAtDeath: "fr", nationality: "nl", mainAssetsLocation: "fr", leftNlSince: "lt10" });
  assert.equal(r.totalsDesired.totalTax, 0);
  assert.ok(E.nlFictie());
  assert.ok(r.nudges.some((n) => n.level === "bad" && /Nederland heft mogelijk ook/.test(n.title) && /art\. 3 lid 1 Successiewet/.test(n.body) && /fiscalist/.test(n.body)));
  assert.ok(r.notComputed.some((t) => /tienjaarsfictie/.test(t)));
});
test("H2 Nederlandse tienjaarsfictie: 10 jaar of langer geleden vertrokken: geen melding", () => {
  const r = herreken({ net: 1200000, family: { relation: "married", childrenCount: 0 } }, {}, { habitualResidenceAtDeath: "fr", nationality: "nl", leftNlSince: "gte10" });
  assert.equal(E.nlFictie(), null);
  assert.ok(!r.nudges.some((n) => /tienjaarsfictie/.test(n.title)));
});
test("H2 Nederlandse tienjaarsfictie: geen Nederlander, overlijden: geen fictie; schenking binnen een jaar na vertrek wel (art. 3 lid 2)", () => {
  herreken({ net: 100000, family: kind }, {}, { habitualResidenceAtDeath: "fr", nationality: "fr", leftNlSince: "lt1" });
  assert.equal(E.nlFictie(), null);
  herreken({ net: 100000, family: kind, scenario: { mode: "donation" } }, {}, { habitualResidenceAtDeath: "fr", nationality: "fr", leftNlSince: "lt1" });
  assert.deepEqual(JSON.parse(JSON.stringify(E.nlFictie())), { grond: "jaar" });
});

test("H3 aftrek 20 % hoofdwoning (art. 764 bis): gehuwd, woning 250.000, kind erft alles: 48.194 in plaats van 58.194", () => {
  const met = herreken({ net: 400000, family: { relation: "married", childrenCount: 1 }, scenario: { allocateToPartnerPct: 0, allocateToChildrenPct: 100 } }, { assetsTotal: 401500, includesMainHome: true, mainHomeValue: 250000 });
  assert.equal(met.netEstate, 350000);
  assert.equal(met.totalsDesired.totalTax, 48194);
  const zonder = herreken({ net: 400000, family: { relation: "married", childrenCount: 1 }, scenario: { allocateToPartnerPct: 0, allocateToChildrenPct: 100 } }, { assetsTotal: 401500, includesMainHome: false });
  assert.equal(zonder.totalsDesired.totalTax, 58194);
});
test("H3 aftrek hoofdwoning alleen onder de wettelijke voorwaarde: alleenstaand zonder minderjarig kind: geen aftrek; met minderjarig kind wel", () => {
  const geen = herreken({ net: 400000, family: kind }, { assetsTotal: 401500, includesMainHome: true, mainHomeValue: 250000 });
  assert.equal(geen.totalsDesired.totalTax, 58194);
  const wel = herreken({ net: 400000, family: { relation: "single", childrenCount: 1, hasMinorChildren: true } }, { assetsTotal: 401500, includesMainHome: true, mainHomeValue: 250000 });
  assert.equal(wel.totalsDesired.totalTax, 48194);
});
test("H3 aftrek hoofdwoning geldt niet bij schenking", () => {
  const r = herreken({ net: 150000, family: { relation: "married", childrenCount: 1 }, scenario: { mode: "donation", allocateToPartnerPct: 0, allocateToChildrenPct: 100 } }, { includesMainHome: true, mainHomeValue: 100000 });
  assert.equal(r.netEstate, 150000);
});

test("H4 forfait begrafeniskosten 1.500 euro (art. 775): 400.000 geeft netto massa 398.500 en 57.894", () => {
  const r = herreken({ net: 400000, family: kind }, { assetsTotal: 400000 });
  assert.equal(E.FORFAIT_BEGRAFENIS, 1500);
  assert.equal(r.netEstate, 398500);
  assert.equal(r.totalsDesired.totalTax, 57894);
});
test("H4 forfait begrafeniskosten is hoogstens het actief", () => {
  const r = herreken({ net: 0, family: kind }, { assetsTotal: 1000, debtsTotal: 0 });
  assert.equal(r.netEstate, 0);
});

test("H5 schenking: schulden verlagen het geschonken bedrag niet", () => {
  const r = herreken({ net: 150000, family: kind, scenario: { mode: "donation" } }, { assetsTotal: 150000, debtsTotal: 50000 });
  assert.equal(r.netEstate, 150000);
  assert.equal(r.totalsDesired.totalTax, 8194);
});
test("H5 overlijden: schulden gaan er wel af", () => {
  const r = herreken({ net: 400000, family: kind }, { assetsTotal: 450000, debtsTotal: 50000 });
  assert.equal(r.netEstate, 398500);
});

test("H6 afronding op hele euro's (art. 1724 CGI): 8.194,35 wordt 8.194; 0,50 telt voor 1", () => {
  const p = pair({ relation: "child", gross: 150000 });
  assert.equal(p.tax, 8194);
  assert.equal(p.net, 141806);
  const q = E.calcPair({ mode: "succession", relation: "child", gross: 400000, onDate: ON });
  assert.equal(q.tax, 58194);
  for (const g of [101234, 250001, 333333, 777777]) assert.equal(E.calcPair({ mode: "succession", relation: "child", gross: g, onDate: ON }).tax % 1, 0);
  // 1.380,75 is de belasting over precies 15.932 euro; 0,75 rondt naar boven
  assert.equal(E.calcPair({ mode: "donation", relation: "child", gross: 100000 + 15932, onDate: ON }).tax, 1381);
});

// ---- Markdown-samenvatting
function summaryFor(setupArgs) {
  setup(setupArgs);
  return E.buildDossierSummary(E.buildReportContract());
}
test("Markdown-samenvatting: indeling, tabel, geen HTML, geen lange streepjes", () => {
  const md = summaryFor({ net: 380000, family: { relation: "married", childrenCount: 2 }, scenario: { mode: "donation" } });
  const lines = md.split("\n");
  assert.equal(lines[0], "## Erf- en schenkingsrecht NL/FR: uw scenario");
  assert.ok(lines[1].startsWith("Schenking, gehuwd, 2 kinderen, netto bedrag"));
  assert.ok(/^Berekend op \d{2}-\d{2}-\d{4} met versie 0\.4\.2$/.test(lines[2]), lines[2]);
  for (const h of ["### In het kort", "### Resultaat per ontvanger", "### Vergelijking", "### Niet meegerekend", "### Uitgangspunten en bronnen"]) {
    assert.ok(md.includes(`\n${h}\n`), h);
  }
  assert.ok(md.includes("| Ontvanger | Bruto | Belasting | Netto |"));
  assert.ok(md.endsWith("Educatieve berekening, geen vervanging van notarieel of fiscaal advies."));
  assert.ok(!/<[a-z\/]/i.test(md), "geen HTML");
  assert.ok(!/[—–•]/.test(md), "geen lange streepjes of opsommingstekens");
  assert.ok(!/JSON|datacontract|data-contract/i.test(md), "geen regel over het JSON-contract");
  assert.ok(!/^[A-ZÉ ,&\/-]{8,}$/m.test(md.replace(/^#.*$/gm, "")), "geen hoofdletterkoppen");
  assert.ok(/\]\(https:\/\//.test(md), "bronnen als Markdown-links");
  assert.ok(!/(^|\s)https?:\/\/\S+/.test(md.replace(/\]\(https?:\/\/[^)]+\)/g, "]")), "geen kale URL's");
  assert.ok(md.length <= 4000, `lengte ${md.length}`);
});
test("Markdown-samenvatting blijft binnen 4.000 tekens in een uitgebreid scenario", () => {
  const md = summaryFor({
    net: 800000,
    family: { relation: "cohab", childrenCount: 3, hasStepchildren: true, hasAdoptedChildren: true, adoptedSimpleCount: 1 },
    scenario: { mode: "donation", donationType: "cash_gift_31865", priorChildGifts: 20000, priorChild790G: 10000 },
  });
  assert.ok(md.length <= 4000, `lengte ${md.length}`);
  assert.ok(md.includes("Niet berekend"));
  assert.ok(md.includes("Totaal (alleen berekende ontvangers)"));
});

console.log(`\n${passed} geslaagd, ${failed} gezakt`);
if (process.argv.includes("--print-md")) {
  console.log("\n" + summaryFor({ net: 380000, family: { relation: "married", childrenCount: 2 }, scenario: { mode: "donation" } }));
}
process.exit(failed ? 1 : 0);
