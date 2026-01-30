/* Erf- & Schenkingsrecht NL/FR — Gids (V0.2)
   Minimal export upgrade:
   1) Data-contract (machine-readable JSON) + sourcesUsed subset
   2) Minimal export: Dossier (postMessage) + Print/PDF (window.print) via print-only report

   LET OP:
   - Geen “extra” berekeningen toegevoegd.
   - Print CSS wordt runtime geïnjecteerd (style.css blijft onaangeraakt).
*/

(function () {
  "use strict";

  // -------------------------
  // Sources (UI + referenties)
  // -------------------------
  const SOURCES = {
    sp_succession_2025: {
      id: "sp_succession_2025",
      name: "Service-Public — Droits de succession",
      date: "Vérifié le 31 juillet 2025 (F35794)",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F35794",
    },
    sp_donation_2024: {
      id: "sp_donation_2024",
      name: "Service-Public — Droits de donation",
      date: "Vérifié le 07 novembre 2024 (F14203)",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14203",
    },
    sp_pacs_2026: {
      id: "sp_pacs_2026",
      name: "Service-Public — Effets d'un PACS",
      date: "Vérifié le 27 janvier 2026 (F1026)",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1026",
    },
    impots_don_enfant_2025: {
      id: "impots_don_enfant_2025",
      name: "impots.gouv.fr — “Que puis-je donner … sans payer de droits”",
      date: "18 Dec 2025",
      url: "https://www.impots.gouv.fr/particulier/questions/que-puis-je-donner-mes-enfants-petits-enfants-sans-avoir-payer-de-droits",
    },
    legi_cc_912: {
      id: "legi_cc_912",
      name: "Légifrance — Code civil, art. 912 (réserve/quotité)",
      date: "Version en vigueur depuis le 01 janvier 2007",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006435530",
    },
    legi_cc_913: {
      id: "legi_cc_913",
      name: "Légifrance — Code civil, art. 913",
      date: "Version en vigueur depuis le 01 novembre 2021",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043982288",
    },
    eurlex_650_2012: {
      id: "eurlex_650_2012",
      name: "EUR-Lex — Règlement (UE) n°650/2012 (successions)",
      date: "04 July 2012",
      url: "https://eur-lex.europa.eu/eli/reg/2012/650/oj/?locale=FR",
    },
  };

  // -------------------------
  // Storage / State
  // -------------------------
  const STORAGE_KEY = "nlfr_erf_schenk_v02";

  const state = loadState() || {
    meta: {
      version: "0.2.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    family: {
      relation: "married", // married | pacs | cohab | single
      childrenCount: 2,
      hasStepchildren: false,
      hasAdoptedChildren: false,
      hasMinorChildren: false,
      hasChildrenFromEarlierRelationship: false,
    },

    anchors: {
      habitualResidenceAtDeath: "fr", // fr | nl | other
      nationality: "nl", // nl | fr | other
      mainAssetsLocation: "fr", // fr | nl | mixed
    },

    estate: {
      assetsTotal: 533000,
      debtsTotal: 50000,
      includesMainHome: true,
      includesLifeInsurance: false,
      includesBusiness: false,
    },

    wishes: {
      goals: {
        protectPartnerLifestyle: true,
        partnerStayInHome: true,
        protectChildren: true,
        includeStepchildren: false,
        includeGrandchildren: false,
        appointExecutor: false,
        appointGuardianOrTrust: false,
        businessSuccession: false,
        charity: false,
      },
    },

    will: {
      type: "fr_will", // none | fr_will | nl_will | eu_choice
      hasChoiceOfLawToNationality: false,
      wantsEuropeanCertificate: false,
    },

    scenario: {
      mode: "succession", // succession | donation
      donationType: "standard", // standard | cash_gift_31865
      allocateToPartnerPct: 50,
      allocateToChildrenPct: 50,
    },

    report: {},
    ui: { stepIndex: 0 },
  };

  // -------------------------
  // Steps
  // -------------------------
  const STEPS = [
    { key: "family", title: "1. Gezin" },
    { key: "anchors", title: "2. Woon-/aanknopingspunten" },
    { key: "estate", title: "3. Vermogen (indicatief)" },
    { key: "will", title: "4. Wensen & testament" },
    { key: "scenario", title: "5. Scenario" },
    { key: "report", title: "6. Rapport" },
  ];

  // -------------------------
  // DOM refs (hard requirements)
  // -------------------------
  const elStepper = must("stepper");
  const elPanel = must("panel");
  const elNudges = must("nudges");
  const elSources = must("sources");
  const elRoutecard = must("routecard");
  const elBtnMakePdf = must("make-pdf-btn");
  const elBtnSaveDossier = must("save-dossier-btn");
  const elActionHint = must("actionHint");
  const elCalcExplain = must("calcExplain");
  const elPrintRoot = must("printRoot");

  // -------------------------
  // Init (guarded)
  // -------------------------
  try {
    injectPrintStyles();
    renderSources();
    render();
    bindGlobalActions();
  } catch (e) {
    showFatal(e);
  }

  function bindGlobalActions() {
    elBtnMakePdf.addEventListener("click", () => {
      try {
        computeReport();
        const contract = buildReportContract();
        renderPrintReport(contract);
        window.print();
      } catch (e) {
        elActionHint.textContent = "PDF/print mislukt. Controleer console.";
        console.error(e);
      }
    });

    elBtnSaveDossier.addEventListener("click", () => {
      try {
        saveToDossier();
      } catch (e) {
        elActionHint.textContent = "Opslaan mislukt. Controleer console.";
        console.error(e);
      }
    });

    // cleanup print root after print (best-effort)
    window.addEventListener("afterprint", () => {
      try {
        elPrintRoot.innerHTML = "";
        document.documentElement.classList.remove("nlfr-printing");
      } catch (_) {}
    });
  }

  // -------------------------
  // Rendering
  // -------------------------
  function render() {
    state.meta.updatedAt = new Date().toISOString();
    saveState(state);

    computeReport();

    renderStepper();
    renderStepPanel();
    renderNudges();
    renderRoutecard();
    renderCalcExplain(); // minimal “educatieve ruggengraat”
  }

  function renderStepper() {
    elStepper.innerHTML = "";
    STEPS.forEach((s, idx) => {
      const btn = document.createElement("div");
      btn.className =
        "step" +
        (idx === state.ui.stepIndex ? " step--active" : "") +
        (idx < state.ui.stepIndex ? " step--done" : "");
      btn.role = "button";
      btn.tabIndex = 0;
      btn.innerHTML = `<div class="step__num">${idx + 1}</div><div>${escapeHtml(s.title)}</div>`;
      btn.addEventListener("click", () => goTo(idx));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") goTo(idx);
      });
      elStepper.appendChild(btn);
    });
  }

  function renderStepPanel() {
    const key = STEPS[state.ui.stepIndex].key;
    if (key === "family") return renderFamily();
    if (key === "anchors") return renderAnchors();
    if (key === "estate") return renderEstate();
    if (key === "will") return renderWillAndWishes();
    if (key === "scenario") return renderScenario();
    if (key === "report") return renderReport();
  }

  // -------------------------
  // Step 1: Family
  // -------------------------
  function renderFamily() {
    elPanel.innerHTML = `
      <h2>Gezinssituatie</h2>
      <p class="muted">V0.2 modelleert partner + kinderen (indicatief). Stief-/adoptie/complexe gezinnen geven extra waarschuwingen (geen harde civielrechtelijke berekening).</p>

      <div class="form">
        <div class="field">
          <label>Relatievorm</label>
          <select id="relation">
            <option value="married">Gehuwd</option>
            <option value="pacs">PACS</option>
            <option value="cohab">Samenwonend (concubinage)</option>
            <option value="single">Geen partner</option>
          </select>
          <div class="help">Belangrijk voor fiscale behandeling; bij PACS is (civiel) vaak testament nodig om te erven.</div>
        </div>

        <div class="field">
          <label>Aantal kinderen</label>
          <input id="childrenCount" type="number" min="0" step="1" />
          <div class="help">V0.2 verdeelt kinderdeel gelijk over alle kinderen.</div>
        </div>

        <div class="field">
          <label><input id="hasChildrenFromEarlierRelationship" type="checkbox" /> Kinderen uit eerdere relatie(s)</label>
          <div class="help">Triggert extra waarschuwingen (reserve/quotité, stiefdynamiek).</div>
        </div>

        <div class="field">
          <label><input id="hasStepchildren" type="checkbox" /> Stiefkinderen aanwezig</label>
          <div class="help">V0.2 rekent niet automatisch “zoals eigen kind”; dit is een notaris-pad.</div>
        </div>

        <div class="field">
          <label><input id="hasAdoptedChildren" type="checkbox" /> Adoptiekinderen aanwezig</label>
          <div class="help">Adoptievorm kan fiscaal/civiel verschil maken → V0.2 waarschuwt.</div>
        </div>

        <div class="field">
          <label><input id="hasMinorChildren" type="checkbox" /> Minderjarige kinderen</label>
          <div class="help">Raakt voogdij/bewind/executeur; V0.2 geeft alleen nudges.</div>
        </div>
      </div>

      <div class="actions">
        <span class="badge">Stap 1/6</span>
        <div class="btnrow">
          <button class="btn" id="next">Volgende</button>
        </div>
      </div>
    `;

    bindSelect("relation", state.family.relation, (v) => (state.family.relation = v));
    bindNumber("childrenCount", state.family.childrenCount, 0, 20, (v) => (state.family.childrenCount = v));
    bindCheckbox("hasChildrenFromEarlierRelationship", state.family.hasChildrenFromEarlierRelationship, (v) => (state.family.hasChildrenFromEarlierRelationship = v));
    bindCheckbox("hasStepchildren", state.family.hasStepchildren, (v) => (state.family.hasStepchildren = v));
    bindCheckbox("hasAdoptedChildren", state.family.hasAdoptedChildren, (v) => (state.family.hasAdoptedChildren = v));
    bindCheckbox("hasMinorChildren", state.family.hasMinorChildren, (v) => (state.family.hasMinorChildren = v));

    document.getElementById("next").addEventListener("click", () => next());
  }

  // -------------------------
  // Step 2: Anchors
  // -------------------------
  function renderAnchors() {
    elPanel.innerHTML = `
      <h2>Woon-/aanknopingspunten (juridische laag)</h2>
      <p class="muted">V0.2 rekent primair FR schenk-/erfbelasting (indicatief). Aanknopingspunten zijn nodig voor EU 650/2012-context (toepasselijk erfrecht ≠ belasting).</p>

      <div class="form">
        <div class="field">
          <label>Gewone verblijfplaats bij overlijden (habitual residence)</label>
          <select id="habitualResidenceAtDeath">
            <option value="fr">Frankrijk</option>
            <option value="nl">Nederland</option>
            <option value="other">Anders</option>
          </select>
          <div class="help">EU 650/2012: dit is vaak de hoofdregel voor toepasselijk erfrecht (art. 21).</div>
        </div>

        <div class="field">
          <label>Nationaliteit</label>
          <select id="nationality">
            <option value="nl">Nederlands</option>
            <option value="fr">Frans</option>
            <option value="other">Anders</option>
          </select>
          <div class="help">EU 650/2012: keuze voor recht van nationaliteit is mogelijk via testament (art. 22).</div>
        </div>

        <div class="field">
          <label>Waar zit het grootste deel van de bezittingen?</label>
          <select id="mainAssetsLocation">
            <option value="fr">Voornamelijk Frankrijk</option>
            <option value="nl">Voornamelijk Nederland</option>
            <option value="mixed">Gemengd</option>
          </select>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge">Stap 2/6</span>
          <button class="btn" id="next">Volgende</button>
        </div>
      </div>
    `;

    bindSelect("habitualResidenceAtDeath", state.anchors.habitualResidenceAtDeath, (v) => (state.anchors.habitualResidenceAtDeath = v));
    bindSelect("nationality", state.anchors.nationality, (v) => (state.anchors.nationality = v));
    bindSelect("mainAssetsLocation", state.anchors.mainAssetsLocation, (v) => (state.anchors.mainAssetsLocation = v));

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  // -------------------------
  // Step 3: Estate (sliders)
  // -------------------------
  function renderEstate() {
    const net = calcNetEstate();

    elPanel.innerHTML = `
      <h2>Vermogen (indicatief)</h2>
      <p class="muted">
        V0.2 gebruikt sliders voor educatieve scenario’s. Netto massa = bezittingen − schulden.
        Detailklassen (assurance-vie, SCI, onderneming, buitenlandse assets) zijn in V0.2 waarschuwingen.
      </p>

      <div class="form">
        <div class="field">
          <label>Totaal bezittingen: <strong><span id="assetsLbl"></span></strong></label>
          <input id="assetsTotal" type="range" min="0" max="5000000" step="1000" />
          <div class="help">Indicatief. Je kunt later verfijnen met notaris/fiscalist.</div>
        </div>

        <div class="field">
          <label>Totaal schulden: <strong><span id="debtsLbl"></span></strong></label>
          <input id="debtsTotal" type="range" min="0" max="2000000" step="1000" />
        </div>

        <div class="field">
          <label><input id="includesMainHome" type="checkbox" /> Hoofdwoning/woonhuis in massa</label>
        </div>

        <div class="field">
          <label><input id="includesLifeInsurance" type="checkbox" /> Assurance-vie aanwezig</label>
          <div class="help">V0.2: eigen regime → niet betrouwbaar doorgerekend.</div>
        </div>

        <div class="field">
          <label><input id="includesBusiness" type="checkbox" /> Onderneming/bedrijf(sopvolging) relevant</label>
          <div class="help">V0.2: niet doorgerekend; alleen route-waarschuwingen.</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__item">
          <strong>Netto massa (indicatief)</strong>
          <span id="netEstate">${formatEUR(net)}</span>
        </div>
        <div class="kpi__item">
          <strong>Wat V0.2 wél rekent</strong>
          <span>Basis FR schenk-/erfbelasting partner/kinderen (indicatief) + “kloof” analyse</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge">Stap 3/6</span>
          <button class="btn" id="next">Volgende</button>
        </div>
      </div>
    `;

    const assetsEl = document.getElementById("assetsTotal");
    const debtsEl = document.getElementById("debtsTotal");
    const assetsLbl = document.getElementById("assetsLbl");
    const debtsLbl = document.getElementById("debtsLbl");
    const netLbl = document.getElementById("netEstate");

    assetsEl.value = String(toInt(state.estate.assetsTotal));
    debtsEl.value = String(toInt(state.estate.debtsTotal));
    assetsLbl.textContent = formatEUR(state.estate.assetsTotal);
    debtsLbl.textContent = formatEUR(state.estate.debtsTotal);

    assetsEl.addEventListener("input", () => {
      state.estate.assetsTotal = clampInt(assetsEl.value, 0, 5000000);
      assetsLbl.textContent = formatEUR(state.estate.assetsTotal);
      netLbl.textContent = formatEUR(calcNetEstate());
      render();
    });

    debtsEl.addEventListener("input", () => {
      state.estate.debtsTotal = clampInt(debtsEl.value, 0, 2000000);
      debtsLbl.textContent = formatEUR(state.estate.debtsTotal);
      netLbl.textContent = formatEUR(calcNetEstate());
      render();
    });

    bindCheckbox("includesMainHome", state.estate.includesMainHome, (v) => (state.estate.includesMainHome = v));
    bindCheckbox("includesLifeInsurance", state.estate.includesLifeInsurance, (v) => (state.estate.includesLifeInsurance = v));
    bindCheckbox("includesBusiness", state.estate.includesBusiness, (v) => (state.estate.includesBusiness = v));

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  // -------------------------
  // Step 4: Wishes & Testament
  // -------------------------
  function renderWillAndWishes() {
    elPanel.innerHTML = `
      <h2>Wensen & testament (cruciaal)</h2>
      <p class="muted">
        V0.2 gebruikt dit om te bepalen wat je <em>beoogt</em> (wensen) en welke juridische route waarschijnlijk nodig is.
        Let op: EU 650/2012 gaat over toepasselijk erfrecht, niet over belasting.
      </p>

      <h3>Testament-keuze (toggle)</h3>
      <div class="form">
        <div class="field">
          <label>Welke situatie benadert jouw keuze?</label>
          <select id="willType">
            <option value="none">Geen testament</option>
            <option value="fr_will">Frans testament (bij Franse notaris)</option>
            <option value="nl_will">Nederlands testament (bij NL-notaris)</option>
            <option value="eu_choice">EU rechtskeuze (testament mét rechtskeuze o.b.v. EU 650/2012)</option>
          </select>
          <div class="help">
            “EU-testament” is geen aparte vorm; hier bedoelen we: testament waarin expliciet een rechtskeuze wordt gemaakt (art. 22 EU 650/2012).
          </div>
        </div>

        <div class="field">
          <label><input id="hasChoiceOfLawToNationality" type="checkbox" /> Rechtskeuze (nationaliteitsrecht) expliciet opnemen (art. 22)</label>
          <div class="help">V0.2 registreert dit en waarschuwt; civielrechtelijke uitwerking blijft notariswerk.</div>
        </div>

        <div class="field">
          <label><input id="wantsEuropeanCertificate" type="checkbox" /> Europese verklaring van erfrecht (EVE) relevant (na overlijden)</label>
          <div class="help">Dit is een document in de afwikkeling (art. 62 e.v.), niet iets dat je “nu” als testament opstelt.</div>
        </div>
      </div>

      <hr />

      <h3>Wensen (route-input)</h3>
      <p class="muted">Gebaseerd op de notaris-vragenlijst: wat wil je in hoofdlijnen bereiken?</p>

      <div class="form">
        <div class="field"><label><input id="g_protectPartnerLifestyle" type="checkbox" /> Partner goed verzorgd (levensstijl)</label></div>
        <div class="field"><label><input id="g_partnerStayInHome" type="checkbox" /> Partner kan in woning blijven</label></div>
        <div class="field"><label><input id="g_protectChildren" type="checkbox" /> Kinderen beschermen / gelijk behandelen</label></div>
        <div class="field"><label><input id="g_includeStepchildren" type="checkbox" /> Stiefkinderen meenemen</label></div>
        <div class="field"><label><input id="g_appointExecutor" type="checkbox" /> Executeur benoemen</label></div>
        <div class="field"><label><input id="g_appointGuardianOrTrust" type="checkbox" /> Voogd/bewind (minderjarig/speciale aandacht)</label></div>
        <div class="field"><label><input id="g_businessSuccession" type="checkbox" /> Bedrijfsopvolging / onderneming</label></div>
        <div class="field"><label><input id="g_charity" type="checkbox" /> Goede doelen</label></div>
      </div>

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge">Stap 4/6</span>
          <button class="btn" id="next">Volgende</button>
        </div>
      </div>
    `;

    bindSelect("willType", state.will.type, (v) => (state.will.type = v));
    bindCheckbox("hasChoiceOfLawToNationality", state.will.hasChoiceOfLawToNationality, (v) => (state.will.hasChoiceOfLawToNationality = v));
    bindCheckbox("wantsEuropeanCertificate", state.will.wantsEuropeanCertificate, (v) => (state.will.wantsEuropeanCertificate = v));

    bindCheckbox("g_protectPartnerLifestyle", state.wishes.goals.protectPartnerLifestyle, (v) => (state.wishes.goals.protectPartnerLifestyle = v));
    bindCheckbox("g_partnerStayInHome", state.wishes.goals.partnerStayInHome, (v) => (state.wishes.goals.partnerStayInHome = v));
    bindCheckbox("g_protectChildren", state.wishes.goals.protectChildren, (v) => (state.wishes.goals.protectChildren = v));
    bindCheckbox("g_includeStepchildren", state.wishes.goals.includeStepchildren, (v) => (state.wishes.goals.includeStepchildren = v));
    bindCheckbox("g_appointExecutor", state.wishes.goals.appointExecutor, (v) => (state.wishes.goals.appointExecutor = v));
    bindCheckbox("g_appointGuardianOrTrust", state.wishes.goals.appointGuardianOrTrust, (v) => (state.wishes.goals.appointGuardianOrTrust = v));
    bindCheckbox("g_businessSuccession", state.wishes.goals.businessSuccession, (v) => (state.wishes.goals.businessSuccession = v));
    bindCheckbox("g_charity", state.wishes.goals.charity, (v) => (state.wishes.goals.charity = v));

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  // -------------------------
  // Step 5: Scenario
  // -------------------------
  function renderScenario() {
    elPanel.innerHTML = `
      <h2>Scenario: koude hand / warme hand</h2>
      <p class="muted">
        V0.2 rekent basis FR heffing voor partner/kinderen en toont nominale impact.
        “100.000€/kind per 15 jaar” is als nudge/assumption opgenomen.
      </p>

      <div class="form">
        <div class="field">
          <label>Traject</label>
          <select id="mode">
            <option value="succession">Erfenis (koude hand)</option>
            <option value="donation">Schenking (warme hand)</option>
          </select>
        </div>

        <div class="field">
          <label>Schenking-type (alleen bij ‘Schenking’)</label>
          <select id="donationType">
            <option value="standard">Standaard schenking</option>
            <option value="cash_gift_31865">Extra vrijstelling geldschenking 31.865€ (indicatief)</option>
          </select>
          <div class="help">V0.2 kan voorwaarden niet verifiëren → toont effect indicatief + waarschuwing.</div>
        </div>
      </div>

      <hr />

      <h3>Verdeling (V0.2: % van netto massa)</h3>
      <p class="muted">
        Sliders tonen jouw <em>gewenste</em> verdeling. Civielrechtelijke beperkingen (reserve/quotité) worden niet hard afgedwongen maar wel gesignaleerd.
      </p>

      <div class="form">
        <div class="field">
          <label>Partner: <strong><span id="pPct"></span>%</strong></label>
          <input id="allocateToPartnerPct" type="range" min="0" max="100" step="1" />
        </div>

        <div class="field">
          <label>Kinderen: <strong><span id="cPct"></span>%</strong></label>
          <input id="allocateToChildrenPct" type="range" min="0" max="100" step="1" />
          <div class="help">Wordt gelijk verdeeld over alle kinderen.</div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge">Stap 5/6</span>
          <button class="btn" id="next">Naar rapport</button>
        </div>
      </div>
    `;

    bindSelect("mode", state.scenario.mode, (v) => (state.scenario.mode = v));
    bindSelect("donationType", state.scenario.donationType, (v) => (state.scenario.donationType = v));

    const p = document.getElementById("allocateToPartnerPct");
    const c = document.getElementById("allocateToChildrenPct");
    const pPct = document.getElementById("pPct");
    const cPct = document.getElementById("cPct");

    p.value = String(state.scenario.allocateToPartnerPct);
    c.value = String(state.scenario.allocateToChildrenPct);
    pPct.textContent = String(state.scenario.allocateToPartnerPct);
    cPct.textContent = String(state.scenario.allocateToChildrenPct);

    p.addEventListener("input", () => {
      const pv = clampInt(p.value, 0, 100);
      const cv = 100 - pv;
      state.scenario.allocateToPartnerPct = pv;
      state.scenario.allocateToChildrenPct = cv;
      c.value = String(cv);
      pPct.textContent = String(pv);
      cPct.textContent = String(cv);
      render();
    });

    c.addEventListener("input", () => {
      const cv = clampInt(c.value, 0, 100);
      const pv = 100 - cv;
      state.scenario.allocateToChildrenPct = cv;
      state.scenario.allocateToPartnerPct = pv;
      p.value = String(pv);
      pPct.textContent = String(pv);
      cPct.textContent = String(cv);
      render();
    });

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  // -------------------------
  // Step 6: Report
  // -------------------------
  function renderReport() {
    computeReport();
    const r = state.report;

    elPanel.innerHTML = `
      <h2>Rapport (V0.2)</h2>
      <p class="muted">
        Nominale bedragen op basis van netto massa en sliders. V0.2 rekent alleen wat het onderbouwd kan doen (basis FR barèmes/abattements).
      </p>

      <div class="kpi">
        <div class="kpi__item">
          <strong>Netto massa</strong>
          <span>${formatEUR(r.netEstate)}</span>
        </div>
        <div class="kpi__item">
          <strong>Traject</strong>
          <span>${escapeHtml(labelMode(state.scenario.mode))}</span>
        </div>
      </div>

      <hr />

      <h3>Uitkomst per ontvanger (gewenst scenario)</h3>
      ${renderResultsTable(r.rowsDesired)}

      <hr />

      <h3>Kloof-analyse (benchmark vs gewenst)</h3>
      ${renderGapBlock(r.gap, r.benchmarkLabel)}

      <hr />

      <h3>Wat V0.2 níet kan doorrekenen</h3>
      ${renderNotComputed(r.notComputed)}

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge badge--ok">Stap 6/6</span>
        </div>
      </div>
    `;

    document.getElementById("prev").addEventListener("click", () => prev());
  }

  function renderResultsTable(rows) {
    if (!rows || rows.length === 0) return `<p class="badge badge--warn">Onvoldoende invoer om te rekenen.</p>`;

    const rowsHtml = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.person)}</td>
        <td>${escapeHtml(row.relationLabel)}</td>
        <td>${formatEUR(row.gross)}</td>
        <td>${formatEUR(row.allowance)}</td>
        <td>${formatEUR(row.taxable)}</td>
        <td>${formatEUR(row.tax)}</td>
        <td><strong>${formatEUR(row.net)}</strong></td>
      </tr>
    `).join("");

    return `
      <table class="table" aria-label="Resultaten">
        <thead>
          <tr>
            <th>Ontvanger</th><th>Relatie</th><th>Bruto</th><th>Abattement</th><th>Belastbaar</th><th>Belasting</th><th>Netto</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p class="tiny muted" style="margin-top:10px;">
        Bronnen: Service-Public (donation: F14203; succession: F35794). Zie “Bronnen gebruikt” in het zijpaneel/print.
      </p>
    `;
  }

  function renderGapBlock(gap, benchLabel) {
    if (!gap) return `<p class="badge badge--warn">Kloof-analyse niet beschikbaar.</p>`;

    const badge = gap.level === "bad" ? "badge--bad" : (gap.level === "warn" ? "badge--warn" : "badge--ok");
    const benchTxt = benchLabel ? `Benchmark: ${escapeHtml(benchLabel)}.` : "Benchmark: (indicatief).";

    return `
      <div class="nudge">
        <div class="nudge__title">
          <strong>${escapeHtml(gap.title)}</strong>
          <span class="badge ${badge}">${escapeHtml(gap.level.toUpperCase())}</span>
        </div>
        <div class="nudge__body">${escapeHtml(gap.body)}</div>
        <div class="tiny muted" style="margin-top:8px;">${benchTxt}</div>

        <div class="kpi" style="margin-top:10px;">
          <div class="kpi__item">
            <strong>Belasting (gewenst)</strong>
            <span>${formatEUR(gap.taxDesired)}</span>
          </div>
          <div class="kpi__item">
            <strong>Belasting (benchmark, indicatief)</strong>
            <span>${formatEUR(gap.taxMin)}</span>
          </div>
          <div class="kpi__item">
            <strong>“Kloof” (meer belasting)</strong>
            <span><strong>${formatEUR(gap.taxGap)}</strong></span>
          </div>
          <div class="kpi__item">
            <strong>Opmerking</strong>
            <span>${escapeHtml(gap.note)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderNotComputed(list) {
    if (!list || list.length === 0) return `<div class="badge badge--ok">Geen extra beperkingen op basis van huidige invoer.</div>`;
    const items = list.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    return `<ul style="margin:8px 0 0 18px;">${items}</ul>`;
  }

  // -------------------------
  // Sources / Nudges / Routecard / CalcExplain
  // -------------------------
  function renderSources() {
    const list = Object.values(SOURCES).map((s) => `
      <div class="source">
        <div class="source__top">
          <div class="source__name">${escapeHtml(s.name)}</div>
          <div class="source__date">${escapeHtml(s.date)}</div>
        </div>
        <div style="margin-top:6px;">
          <a href="${escapeAttr(s.url)}" target="_blank" rel="noopener">Open bron</a>
        </div>
      </div>
    `).join("");
    elSources.innerHTML = list;
  }

  function renderNudges() {
    const nudges = buildNudges();
    if (nudges.length === 0) {
      elNudges.innerHTML = `<div class="badge badge--ok">Geen directe flags op basis van huidige invoer.</div>`;
      return;
    }

    elNudges.innerHTML = nudges.map((n) => {
      const badgeClass = n.level === "bad" ? "badge--bad" : (n.level === "warn" ? "badge--warn" : "badge--ok");
      const src = SOURCES[n.sourceId];
      return `
        <div class="nudge">
          <div class="nudge__title">
            <strong>${escapeHtml(n.title)}</strong>
            <span class="badge ${badgeClass}">${escapeHtml(n.level.toUpperCase())}</span>
          </div>
          <div class="nudge__body">${escapeHtml(n.body)}</div>
          ${src ? `<div class="nudge__src">Bron: <a href="${escapeAttr(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.name)}</a> — ${escapeHtml(src.date)}</div>` : ``}
        </div>
      `;
    }).join("");
  }

  function renderRoutecard() {
    const r = state.report || {};
    const net = r.netEstate || calcNetEstate();

    const lines = [];
    lines.push(routeRow("Traject", labelMode(state.scenario.mode)));
    lines.push(routeRow("Relatie", labelRelation(state.family.relation)));
    lines.push(routeRow("Kinderen", String(toInt(state.family.childrenCount))));
    lines.push(routeRow("Testament", labelWill(state.will.type)));
    lines.push(routeRow("Netto massa", formatEUR(net)));

    if (r.totalsDesired) lines.push(routeRow("Belasting (gewenst)", formatEUR(r.totalsDesired.totalTax)));
    if (r.gap) lines.push(routeRow("Kloof (meer belasting)", formatEUR(r.gap.taxGap)));

    if (r.notComputed && r.notComputed.length > 0) {
      lines.push(routeRow("Niet doorgerekend", `${r.notComputed.length} item(s)`));
    }

    elRoutecard.innerHTML = lines.join("");
  }

  function renderCalcExplain() {
    // Minimal educatieve ruggengraat: “wat doet V0.2 wel/niet”, plus bronnen gebruikt in huidige toestand.
    const r = state.report || {};
    const sourcesUsed = computeSourcesUsed();
    const sourcesHtml = sourcesUsed.length
      ? `<ul class="nlfr-mini-list">${sourcesUsed.map(s => `<li><a href="${escapeAttr(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a> — ${escapeHtml(s.date)}</li>`).join("")}</ul>`
      : `<div class="badge badge--warn">Geen bronnen gedetecteerd (onverwacht). Controleer sourceId’s.</div>`;

    const notComputedHtml = (r.notComputed && r.notComputed.length)
      ? `<ul class="nlfr-mini-list">${r.notComputed.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
      : `<div class="badge badge--ok">Geen extra beperkingen op basis van huidige invoer.</div>`;

    elCalcExplain.innerHTML = `
      <div class="nlfr-explain">
        <div><strong>Wat V0.2 wél doet:</strong></div>
        <ul class="nlfr-mini-list">
          <li>Netto massa: <code>bezittingen − schulden</code> (indicatief).</li>
          <li>Basis FR barèmes/abattements voor <code>partner (gehuwd/PACS)</code> en <code>kind (lijn recht)</code>.</li>
          <li>Kloof: vergelijking <em>gewenst</em> vs <em>benchmark</em> binnen V0.2 scope.</li>
        </ul>

        <div style="margin-top:10px;"><strong>Wat V0.2 niet doet:</strong></div>
        ${notComputedHtml}

        <div style="margin-top:10px;"><strong>Bronnen gebruikt (huidige invoer):</strong></div>
        ${sourcesHtml}

        <div style="margin-top:10px;" class="tiny muted">
          Tip: “Opslaan in Dossier” bewaart ook een JSON-contract (machine-readable) naast de tekstsamenvatting.
        </div>
      </div>
    `;
  }

  function routeRow(label, value) {
    return `
      <div class="route__row">
        <div class="route__label">${escapeHtml(label)}</div>
        <div class="route__value">${escapeHtml(value)}</div>
      </div>
    `;
  }

  // -------------------------
  // Nudges engine (V0.2)
  // -------------------------
  function buildNudges() {
    const out = [];

    if (state.family.relation === "pacs") {
      out.push({
        level: "warn",
        title: "PACS ≠ automatisch erven",
        body: "Bij PACS is (civiel) vaak een testament nodig als je wilt dat je partner (een deel van) je nalatenschap krijgt.",
        sourceId: "sp_pacs_2026",
      });
      out.push({
        level: "ok",
        title: "PACS: fiscaal bij overlijden",
        body: "PACS-partner kan fiscaal zijn vrijgesteld van successierechten; dit zegt niets over civielrechtelijke verdeling zonder testament.",
        sourceId: "sp_succession_2025",
      });
    }

    if (state.family.relation === "cohab") {
      out.push({
        level: "bad",
        title: "Samenwonend (concubinage): vaak ongunstig",
        body: "Zonder huwelijk/PACS kunnen bescherming en fiscale behandeling zeer ongunstig zijn. V0.2 rekent dit niet betrouwbaar door.",
        sourceId: "sp_succession_2025",
      });
    }

    if (toInt(state.family.childrenCount) > 0) {
      out.push({
        level: "warn",
        title: "Kinderen → reserve/quotité (civielrecht)",
        body: "Als er reservataire erfgenamen zijn (vaak kinderen), is niet alles vrij te bestemmen. V0.2 signaleert, maar rekent civiel niet hard door.",
        sourceId: "legi_cc_912",
      });
    }

    if (state.family.hasChildrenFromEarlierRelationship) {
      out.push({
        level: "warn",
        title: "Eerdere relatie(s): verhoogde complexiteit",
        body: "Kinderen uit eerdere relaties kunnen de verdeling sterk beïnvloeden. V0.2 is een scenario-tool; notariscontrole aanbevolen.",
        sourceId: "legi_cc_912",
      });
    }

    if (state.family.hasStepchildren || state.wishes.goals.includeStepchildren) {
      out.push({
        level: "warn",
        title: "Stiefkinderen: aparte route (V0.2 rekent dit niet hard)",
        body: "Stiefkinderen zijn zonder specifieke juridische basis niet automatisch gelijk aan eigen kinderen. V0.2 rekent daarom niet als ‘lijn recht’ door.",
        sourceId: "sp_succession_2025",
      });
    }

    if (state.estate.includesLifeInsurance) {
      out.push({
        level: "warn",
        title: "Assurance-vie: eigen regime",
        body: "Assurance-vie volgt vaak niet dezelfde logica als ‘gewone’ nalatenschap. V0.2 geeft daarom geen betrouwbare eindbelasting op dit onderdeel.",
        sourceId: "sp_succession_2025",
      });
    }

    if (state.estate.includesBusiness || state.wishes.goals.businessSuccession) {
      out.push({
        level: "warn",
        title: "Onderneming/bedrijf: niet doorgerekend",
        body: "Bedrijfsopvolging en waardering zijn notaris/fiscalist-werk. V0.2 geeft route-waarschuwingen, geen harde euro-berekening.",
        sourceId: "sp_succession_2025",
      });
    }

    if (state.anchors.habitualResidenceAtDeath !== "fr" || state.anchors.mainAssetsLocation !== "fr" || state.anchors.nationality !== "fr") {
      out.push({
        level: "warn",
        title: "Internationale knoop: erfrecht vs belasting",
        body: "EU 650/2012 gaat over toepasselijk erfrecht (art. 21/22). Belasting blijft een aparte laag. V0.2 rekent primair FR basisheffing indicatief.",
        sourceId: "eurlex_650_2012",
      });
    }

    if (calcNetEstate() <= 0) {
      out.push({
        level: "bad",
        title: "Netto massa ≤ 0",
        body: "Met huidige bezittingen/schulden is er indicatief geen positieve massa om te verdelen. Controleer invoer.",
        sourceId: "sp_succession_2025",
      });
    }

    if (state.will.type === "none") {
      out.push({
        level: "warn",
        title: "Geen testament: standaardregels gelden",
        body: "Zonder testament is je ‘gewenste’ verdeling mogelijk niet uitvoerbaar. V0.2 signaleert dit; civiele uitwerking is notariswerk.",
        sourceId: "eurlex_650_2012",
      });
    }

    if (state.will.hasChoiceOfLawToNationality) {
      out.push({
        level: "warn",
        title: "Rechtskeuze: civiel effect ≠ fiscaal effect",
        body: "Rechtskeuze kan civielrechtelijke verdeling beïnvloeden, maar belastingheffing kan alsnog (deels) nationaal blijven. V0.2 rekent fiscaal basis FR.",
        sourceId: "eurlex_650_2012",
      });
      out.push({
        level: "warn",
        title: "Reserve-bescherming (FR) is complex bij internationale successies",
        body: "FR regels rond reserve/quotité en internationale situaties kunnen complex zijn. V0.2 toont scenario’s, geen juridisch eindadvies.",
        sourceId: "legi_cc_913",
      });
    }

    if (state.scenario.mode === "donation" && toInt(state.family.childrenCount) > 0) {
      out.push({
        level: "ok",
        title: "Indicatie: 100.000€ per kind per 15 jaar (FR)",
        body: "Impots.gouv.fr noemt 100.000€ abattement per ouder per kind, hernieuwbaar per 15 jaar. V0.2 gebruikt dit als basis voor kind-donaties (indicatief).",
        sourceId: "impots_don_enfant_2025",
      });
    }

    return out;
  }

  // -------------------------
  // Calculation engine (V0.2) — basis FR
  // -------------------------
  function computeReport() {
    const net = calcNetEstate();

    const desired = computeRowsForAllocation(net, state.scenario.allocateToPartnerPct, state.scenario.allocateToChildrenPct);
    const totalsDesired = sumTotals(desired);

    const bench = computeBenchmarkMin(net);
    const totalsMin = sumTotals(bench.rows);

    const gap = buildGap(totalsDesired.totalTax, totalsMin.totalTax);

    const notComputed = buildNotComputed();
    const nudges = buildNudges();
    const sourcesUsed = computeSourcesUsed(nudges, notComputed);

    state.report = {
      netEstate: net,
      rowsDesired: desired,
      totalsDesired,

      benchmarkLabel: bench.label,
      rowsMin: bench.rows,
      totalsMin,

      gap,
      notComputed,
      nudges,
      sourcesUsed,

      computedAt: new Date().toISOString(),
      assumptions: [
        "V0.2: verdeling via sliders (% netto massa).",
        "V0.2: kinderdeel gelijk verdeeld.",
        "V0.2: basis FR barèmes/abattements (Service-Public/impots.gouv.fr).",
        "V0.2: civielrechtelijke uitvoerbaarheid (reserve/quotité, rechten partner, testament) wordt niet hard afgedwongen.",
      ],
    };

    saveState(state);
  }

  function computeRowsForAllocation(net, partnerPct, childrenPct) {
    const rows = [];
    const hasPartner = hasPartnerInFamily();
    const childrenCount = Math.max(0, toInt(state.family.childrenCount));

    let partnerGross = 0;
    let childrenGrossTotal = 0;

    if (net > 0) {
      if (childrenCount === 0 && hasPartner) {
        partnerGross = net;
        childrenGrossTotal = 0;
      } else {
        partnerGross = hasPartner ? (net * (partnerPct / 100)) : 0;
        childrenGrossTotal = Math.max(0, net - partnerGross);
      }
    }

    if (hasPartner && partnerGross > 0) {
      const res = calcTaxForPerson({
        mode: state.scenario.mode,
        relation: state.family.relation,
        gross: partnerGross,
        donationType: state.scenario.donationType,
      });
      rows.push({
        person: "Partner",
        relationLabel: labelRelation(state.family.relation),
        gross: partnerGross,
        allowance: res.allowance,
        taxable: res.taxable,
        tax: res.tax,
        net: res.net,
      });
    }

    if (childrenCount > 0 && childrenGrossTotal > 0) {
      const perChild = childrenGrossTotal / childrenCount;
      for (let i = 1; i <= childrenCount; i++) {
        const res = calcTaxForPerson({
          mode: state.scenario.mode,
          relation: "child",
          gross: perChild,
          donationType: state.scenario.donationType,
        });
        rows.push({
          person: `Kind ${i}`,
          relationLabel: "Kind",
          gross: perChild,
          allowance: res.allowance,
          taxable: res.taxable,
          tax: res.tax,
          net: res.net,
        });
      }
    }

    return rows;
  }

  function computeBenchmarkMin(net) {
    const hasPartner = hasPartnerInFamily();
    const mode = state.scenario.mode;

    if (mode === "succession" && hasPartner) {
      return { label: "Partner 100% (fiscaal-minimum, indicatief)", rows: computeRowsForAllocation(net, 100, 0) };
    }
    return { label: "Kinderen 100% (benchmark, indicatief)", rows: computeRowsForAllocation(net, 0, 100) };
  }

  function buildGap(taxDesired, taxMin) {
    const d = Number(taxDesired) || 0;
    const m = Number(taxMin) || 0;
    const gap = Math.max(0, d - m);

    let level = "ok";
    if (gap > 0 && gap <= 5000) level = "warn";
    if (gap > 5000) level = "bad";

    return {
      level,
      title: "Gezocht: fiscale ‘kloof’ tussen wens en benchmark",
      body:
        gap === 0
          ? "Op basis van V0.2-benchmark is er geen extra belasting t.o.v. de benchmark binnen deze (beperkte) rekenwereld."
          : "Jouw gewenste verdeling leidt (indicatief) tot meer belasting dan de V0.2-benchmark. Let op: civielrecht kan ‘benchmark/minimum’ onuitvoerbaar maken (reserve/quotité, partnerrechten, testament).",
      taxDesired: d,
      taxMin: m,
      taxGap: gap,
      note: "Benchmark is indicatief en negeert civiele constraints; gebruik dit als signaal om scenario’s met notaris te bespreken.",
    };
  }

  function buildNotComputed() {
    const list = [];
    if (state.family.relation === "cohab") list.push("Samenwonend (concubinage): fiscale/civiele behandeling niet betrouwbaar doorgerekend in V0.2.");
    if (state.family.hasStepchildren || state.wishes.goals.includeStepchildren) list.push("Stiefkinderen: abattements/tarieven en civiele positie vereisen notaris-dossier (V0.2 rekent dit niet door).");
    if (state.family.hasAdoptedChildren) list.push("Adoptie: adoptievorm kan gevolgen hebben; V0.2 rekent dit niet per adoptievorm door.");
    if (state.estate.includesLifeInsurance) list.push("Assurance-vie: eigen regime; V0.2 rekent geen betrouwbare eindbelasting.");
    if (state.estate.includesBusiness || state.wishes.goals.businessSuccession) list.push("Onderneming/bedrijfsopvolging: waardering en fiscale regimes zijn notaris/fiscalist-werk (niet doorgerekend).");
    if (state.anchors.mainAssetsLocation !== "fr" || state.anchors.habitualResidenceAtDeath !== "fr") list.push("Internationale doorsnijdingen (NL/FR): V0.2 rekent primair FR basis; dubbele heffing/verdragen niet doorgerekend.");
    if (state.will.type === "none") list.push("Zonder testament kan jouw ‘gewenste’ verdeling civiel niet uitvoerbaar zijn (V0.2 signaleert, rekent niet civiel).");
    if (state.will.hasChoiceOfLawToNationality) list.push("Rechtskeuze (EU 650/2012) beïnvloedt civiele verdeling; belasting blijft separate laag (V0.2 rekent fiscaal basis FR).");
    return list;
  }

  function sumTotals(rows) {
    let totalGross = 0, totalTax = 0, totalNet = 0;
    (rows || []).forEach(r => {
      totalGross += Number(r.gross) || 0;
      totalTax += Number(r.tax) || 0;
      totalNet += Number(r.net) || 0;
    });
    return { totalGross: round2(totalGross), totalTax: round2(totalTax), totalNet: round2(totalNet) };
  }

  function calcTaxForPerson({ mode, relation, gross, donationType }) {
    const g = Math.max(0, Number(gross) || 0);

    let allowance = 0;
    let taxable = g;
    let tax = 0;

    if (mode === "succession") {
      if (relation === "married" || relation === "pacs") {
        allowance = g;
        taxable = 0;
        tax = 0;
        return finalize();
      }
      if (relation === "child") {
        allowance = 100000;
        taxable = Math.max(0, g - allowance);
        tax = progressiveTax(taxable, BRACKETS_LINE_DIRECT);
        return finalize();
      }
      return finalizeUnknown();
    }

    // donation
    if (relation === "married" || relation === "pacs") {
      allowance = 80724;
      taxable = Math.max(0, g - allowance);
      tax = progressiveTax(taxable, BRACKETS_SPOUSE_DONATION);
      return finalize();
    }

    if (relation === "child") {
      allowance = 100000;
      taxable = Math.max(0, g - allowance);

      if (donationType === "cash_gift_31865") {
        const extra = Math.min(31865, taxable);
        taxable = Math.max(0, taxable - extra);
      }

      tax = progressiveTax(taxable, BRACKETS_LINE_DIRECT);
      return finalize();
    }

    return finalizeUnknown();

    function finalize() {
      return { allowance, taxable, tax: round2(tax), net: Math.max(0, g - tax) };
    }
    function finalizeUnknown() {
      return { allowance: 0, taxable: g, tax: 0, net: g };
    }
  }

  // Barèmes (Service-Public)
  const BRACKETS_LINE_DIRECT = [
    { upTo: 8072, rate: 0.05 },
    { upTo: 12109, rate: 0.10 },
    { upTo: 15932, rate: 0.15 },
    { upTo: 552324, rate: 0.20 },
    { upTo: 902838, rate: 0.30 },
    { upTo: 1805677, rate: 0.40 },
    { upTo: Infinity, rate: 0.45 },
  ];

  const BRACKETS_SPOUSE_DONATION = [
    { upTo: 8072, rate: 0.05 },
    { upTo: 15932, rate: 0.10 },
    { upTo: 31865, rate: 0.15 },
    { upTo: 552324, rate: 0.20 },
    { upTo: 902838, rate: 0.30 },
    { upTo: 1805677, rate: 0.40 },
    { upTo: Infinity, rate: 0.45 },
  ];

  function progressiveTax(amount, brackets) {
    let remaining = Math.max(0, Number(amount) || 0);
    let tax = 0;
    let lastCap = 0;

    for (const b of brackets) {
      if (remaining <= 0) break;
      const cap = b.upTo;
      const slice = Math.min(remaining, cap - lastCap);
      if (slice > 0) {
        tax += slice * b.rate;
        remaining -= slice;
        lastCap = cap;
      }
    }
    return round2(tax);
  }

  // -------------------------
  // Data-contract builder (machine-readable)
  // -------------------------
  function buildReportContract() {
    computeReport();
    const r = state.report || {};

    return {
      schema: "nlfr.erf_schenk.report.v1",
      tool: { id: "erf-en-schenkingsrecht-nl-fr", version: state.meta.version },
      generatedAt: new Date().toISOString(),
      meta: { createdAt: state.meta.createdAt, updatedAt: state.meta.updatedAt },

      inputs: {
        family: {
          relation: state.family.relation,
          childrenCount: toInt(state.family.childrenCount),
          flags: {
            hasStepchildren: !!state.family.hasStepchildren,
            hasAdoptedChildren: !!state.family.hasAdoptedChildren,
            hasMinorChildren: !!state.family.hasMinorChildren,
            hasChildrenFromEarlierRelationship: !!state.family.hasChildrenFromEarlierRelationship,
          },
        },
        anchors: { ...state.anchors },
        estate: { ...state.estate },
        will: { ...state.will },
        scenario: { ...state.scenario },
      },

      outputs: {
        netEstate: r.netEstate ?? calcNetEstate(),
        rowsDesired: r.rowsDesired || [],
        totalsDesired: r.totalsDesired || { totalGross: 0, totalTax: 0, totalNet: 0 },

        benchmark: {
          label: r.benchmarkLabel || "",
          rows: r.rowsMin || [],
          totals: r.totalsMin || { totalGross: 0, totalTax: 0, totalNet: 0 },
        },

        gap: r.gap || null,
        notComputed: r.notComputed || [],
        nudges: r.nudges || [],
        assumptions: r.assumptions || [],
        sourcesUsed: r.sourcesUsed || computeSourcesUsed(),
      },
    };
  }

  function computeSourcesUsed(nudgesOverride, notComputedOverride) {
    // Minimal en conservatief: bronnen die direct in nudges zitten + kernbronnen voor berekening.
    const set = new Set();

    // Kernbronnen (omdat rekenengine daarop leunt)
    set.add("sp_succession_2025");
    set.add("sp_donation_2024");

    // EU-context
    if (state.anchors.habitualResidenceAtDeath !== "fr" || state.anchors.mainAssetsLocation !== "fr" || state.anchors.nationality !== "fr") {
      set.add("eurlex_650_2012");
    }
    if (state.will.hasChoiceOfLawToNationality || state.will.type === "eu_choice" || state.will.type === "none") {
      set.add("eurlex_650_2012");
    }

    // Civiele signaalbronnen
    if (toInt(state.family.childrenCount) > 0 || state.family.hasChildrenFromEarlierRelationship) set.add("legi_cc_912");
    if (state.will.hasChoiceOfLawToNationality) set.add("legi_cc_913");
    if (state.family.relation === "pacs") set.add("sp_pacs_2026");

    // Donation nudge bron
    if (state.scenario.mode === "donation" && toInt(state.family.childrenCount) > 0) set.add("impots_don_enfant_2025");

    // Nudges explicit
    const nudges = nudgesOverride || buildNudges();
    nudges.forEach(n => { if (n && n.sourceId) set.add(n.sourceId); });

    // NotComputed: voeg geen nieuwe bronnen toe (te speculatief), kernbronnen zijn genoeg.

    return Array.from(set)
      .map(id => SOURCES[id])
      .filter(Boolean);
  }

  // -------------------------
  // DossierFrankrijk integration (postMessage)
  // -------------------------
  function saveToDossier() {
    computeReport();
    const contract = buildReportContract();
    const payload = buildDossierMessage(contract);

    const allowed = [
      "https://infofrankrijk.com",
      "https://www.infofrankrijk.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ];

    let parentOrigin = "*";
    try {
      if (document.referrer) {
        const u = new URL(document.referrer);
        const origin = u.origin;
        if (allowed.includes(origin)) parentOrigin = origin;
      }
    } catch (_) {}

    if (window.parent === window) {
      alert("Deze functie werkt alleen binnen InfoFrankrijk.com (iframe).");
      return;
    }

    try {
      window.parent.postMessage(payload, parentOrigin);
      elActionHint.textContent = "Opslaan-verzoek verzonden (modal verschijnt in InfoFrankrijk).";
    } catch (e) {
      elActionHint.textContent = "Opslaan mislukt (postMessage error).";
      console.error(e);
    }
  }

  function buildDossierMessage(contract) {
    const title = buildDossierTitle(contract);
    const summary = buildDossierSummary(contract);

    return {
      type: "saveToDossier",
      title,
      summary,
      data: contract, // machine-readable contract (V1 reporting-ready)
      source: "erf-en-schenkingsrecht-nl-fr",
      toolVersion: state.meta.version,
      generatedAt: new Date().toISOString(),
    };
  }

  function buildDossierTitle(contract) {
    const mode = state.scenario.mode === "donation" ? "Schenking" : "Erfenis";
    const kids = toInt(state.family.childrenCount);
    const rel = labelRelation(state.family.relation);
    const net = formatEUR(contract.outputs.netEstate);
    const gap = contract.outputs.gap ? ` | kloof ${formatEUR(contract.outputs.gap.taxGap)}` : "";
    return `Erf-/Schenkingsrecht: ${mode} | ${rel} | kids ${kids} | netto ${net}${gap}`;
  }

  function buildDossierSummary(contract) {
    const o = contract.outputs;
    const lines = [];

    lines.push("-------------------------------------------");
    lines.push("ERF- & SCHENKINGSRECHT NL/FR — RESULTAAT (V0.2)");
    lines.push(`Datum: ${new Date().toLocaleDateString("nl-NL")}`);
    lines.push("-------------------------------------------");
    lines.push("");

    lines.push("SCOPE");
    lines.push("• Educatieve scenario-tool; geen vervanging van notarieel/fiscaal advies.");
    lines.push("• V0.2 rekent alleen basis FR heffing voor partner (gehuwd/PACS) en kind (lijn recht).");
    lines.push("");

    lines.push("INPUT (KERN)");
    lines.push(`• Traject: ${labelMode(state.scenario.mode)}`);
    lines.push(`• Relatie: ${labelRelation(state.family.relation)}`);
    lines.push(`• Kinderen: ${toInt(state.family.childrenCount)}`);
    lines.push(`• Testament-toggle: ${labelWill(state.will.type)}`);
    lines.push(`• Netto massa (indicatief): ${formatEUR(o.netEstate)}`);
    lines.push("");

    lines.push("GEWENST SCENARIO (SLIDERS)");
    lines.push(`• Partner: ${state.scenario.allocateToPartnerPct}%`);
    lines.push(`• Kinderen: ${state.scenario.allocateToChildrenPct}%`);
    lines.push("");

    lines.push("RESULTATEN PER ONTVANGER (GEWENST)");
    (o.rowsDesired || []).forEach(row => {
      lines.push(`• ${row.person} (${row.relationLabel}): bruto ${formatEUR(row.gross)} | belasting ${formatEUR(row.tax)} | netto ${formatEUR(row.net)}`);
    });
    lines.push("");

    lines.push("BENCHMARK & KLOOF (INDICATIEF)");
    if (o.gap) {
      lines.push(`• Benchmark: ${o.benchmark?.label || contract.outputs.benchmark.label || "(indicatief)"}`);
      lines.push(`• Belasting (gewenst): ${formatEUR(o.gap.taxDesired)}`);
      lines.push(`• Belasting (benchmark): ${formatEUR(o.gap.taxMin)}`);
      lines.push(`• Kloof (meer belasting): ${formatEUR(o.gap.taxGap)}`);
      lines.push(`• Opmerking: ${o.gap.note}`);
    } else {
      lines.push("• Niet beschikbaar.");
    }
    lines.push("");

    lines.push("NIET DOORGEREKEND (V0.2)");
    (o.notComputed || []).forEach(x => lines.push(`• ${x}`));
    lines.push("");

    lines.push("AANNAMES (V0.2)");
    (o.assumptions || []).forEach(x => lines.push(`• ${x}`));
    lines.push("");

    lines.push("BRONNEN GEBRUIKT (OFFICIEEL)");
    (o.sourcesUsed || []).forEach(s => lines.push(`• ${s.name} — ${s.date} — ${s.url}`));
    lines.push("");

    lines.push("TECHNISCH");
    lines.push("• Dit dossier bevat ook een JSON data-contract (nlfr.erf_schenk.report.v1) in het saveToDossier payloadveld 'data'.");
    return lines.join("\n");
  }

  // -------------------------
  // Print/PDF export (minimal report)
  // -------------------------
  function renderPrintReport(contract) {
    const o = contract.outputs;
    const sources = o.sourcesUsed || [];
    const nudges = o.nudges || [];

    document.documentElement.classList.add("nlfr-printing");

    elPrintRoot.innerHTML = `
      <section class="nlfr-print">
        <header class="nlfr-print__header">
          <div class="nlfr-print__h1">Erf- & Schenkingsrecht NL/FR — rapport</div>
          <div class="nlfr-print__meta">
            <div>Versie: ${escapeHtml(contract.tool.version)}</div>
            <div>Datum: ${escapeHtml(new Date().toLocaleDateString("nl-NL"))}</div>
            <div>Schema: ${escapeHtml(contract.schema)}</div>
          </div>
          <div class="nlfr-print__note">
            Educatieve scenario-tool. Bedoeld voor begrip, vergelijking en routekeuze — geen vervanging van notarieel/fiscaal advies.
          </div>
        </header>

        <hr class="nlfr-print__hr" />

        <h2 class="nlfr-print__h2">1) Input (kern)</h2>
        ${printKeyValues([
          ["Traject", labelMode(state.scenario.mode)],
          ["Relatie", labelRelation(state.family.relation)],
          ["Kinderen", String(toInt(state.family.childrenCount))],
          ["Testament-toggle", labelWill(state.will.type)],
          ["Netto massa (indicatief)", formatEUR(o.netEstate)]
        ])}

        <h2 class="nlfr-print__h2">2) Gewenste verdeling</h2>
        ${printKeyValues([
          ["Partner", `${state.scenario.allocateToPartnerPct}%`],
          ["Kinderen", `${state.scenario.allocateToChildrenPct}%`],
        ])}

        <h2 class="nlfr-print__h2">3) Resultaten (gewenst)</h2>
        ${printResultsTable(o.rowsDesired || [])}

        <h2 class="nlfr-print__h2">4) Benchmark & kloof</h2>
        ${printBenchmarkGap(o)}

        <h2 class="nlfr-print__h2">5) Checks & waarschuwingen (actief)</h2>
        ${printNudges(nudges)}

        <h2 class="nlfr-print__h2">6) Niet doorgerekend (V0.2)</h2>
        ${printList(o.notComputed || [], "Geen extra beperkingen op basis van huidige invoer.")}

        <h2 class="nlfr-print__h2">7) Aannames</h2>
        ${printList(o.assumptions || [], "Geen aannames geregistreerd (onverwacht).")}

        <h2 class="nlfr-print__h2">8) Bronnen gebruikt</h2>
        ${printSources(sources)}

        <footer class="nlfr-print__footer">
          <div>Tool: ${escapeHtml(contract.tool.id)} • ${escapeHtml(contract.tool.version)}</div>
        </footer>
      </section>
    `;
  }

  function printKeyValues(items) {
    return `
      <table class="nlfr-print__kv" role="presentation">
        <tbody>
          ${items.map(([k, v]) => `
            <tr>
              <td class="nlfr-print__kvk">${escapeHtml(k)}</td>
              <td class="nlfr-print__kvv">${escapeHtml(v)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  function printResultsTable(rows) {
    if (!rows.length) return `<div class="nlfr-print__badge nlfr-print__badge--warn">Onvoldoende invoer om te rekenen.</div>`;
    const body = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.person)}</td>
        <td>${escapeHtml(r.relationLabel)}</td>
        <td>${formatEUR(r.gross)}</td>
        <td>${formatEUR(r.allowance)}</td>
        <td>${formatEUR(r.taxable)}</td>
        <td>${formatEUR(r.tax)}</td>
        <td><strong>${formatEUR(r.net)}</strong></td>
      </tr>
    `).join("");

    return `
      <table class="nlfr-print__table">
        <thead>
          <tr>
            <th>Ontvanger</th><th>Relatie</th><th>Bruto</th><th>Abattement</th><th>Belastbaar</th><th>Belasting</th><th>Netto</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  function printBenchmarkGap(o) {
    if (!o.gap) return `<div class="nlfr-print__badge nlfr-print__badge--warn">Kloof-analyse niet beschikbaar.</div>`;

    const benchLabel = (o.benchmark && o.benchmark.label) ? o.benchmark.label : (state.report.benchmarkLabel || "(indicatief)");
    return `
      <div class="nlfr-print__box">
        <div><strong>Benchmark:</strong> ${escapeHtml(benchLabel)}</div>
        <div style="margin-top:6px;">Belasting (gewenst): <strong>${formatEUR(o.gap.taxDesired)}</strong></div>
        <div>Belasting (benchmark): <strong>${formatEUR(o.gap.taxMin)}</strong></div>
        <div>Kloof (meer belasting): <strong>${formatEUR(o.gap.taxGap)}</strong></div>
        <div style="margin-top:6px;" class="nlfr-print__muted">${escapeHtml(o.gap.note)}</div>
      </div>
    `;
  }

  function printNudges(nudges) {
    if (!nudges.length) return `<div class="nlfr-print__badge nlfr-print__badge--ok">Geen directe flags op basis van huidige invoer.</div>`;
    return nudges.map(n => {
      const src = SOURCES[n.sourceId];
      return `
        <div class="nlfr-print__nudge">
          <div class="nlfr-print__nudgeTitle">${escapeHtml(n.title)} <span class="nlfr-print__pill nlfr-print__pill--${escapeHtml(n.level)}">${escapeHtml(n.level.toUpperCase())}</span></div>
          <div class="nlfr-print__nudgeBody">${escapeHtml(n.body)}</div>
          ${src ? `<div class="nlfr-print__muted">Bron: ${escapeHtml(src.name)} — ${escapeHtml(src.date)} — ${escapeHtml(src.url)}</div>` : ``}
        </div>
      `;
    }).join("");
  }

  function printList(items, emptyText) {
    if (!items.length) return `<div class="nlfr-print__badge nlfr-print__badge--ok">${escapeHtml(emptyText)}</div>`;
    return `<ul class="nlfr-print__ul">${items.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  }

  function printSources(sources) {
    if (!sources.length) return `<div class="nlfr-print__badge nlfr-print__badge--warn">Geen bronnen gedetecteerd (onverwacht).</div>`;
    return `
      <ul class="nlfr-print__ul">
        ${sources.map(s => `<li>${escapeHtml(s.name)} — ${escapeHtml(s.date)} — ${escapeHtml(s.url)}</li>`).join("")}
      </ul>
    `;
  }

  function injectPrintStyles() {
    if (document.getElementById("nlfrPrintStyles")) return;

    const css = `
      /* Print-only rendering (minimal, stable; avoids touching style.css) */
      #printRoot { display: none; }
      html.nlfr-printing #printRoot { display: block; }

      @media print {
        body * { visibility: hidden !important; }
        #printRoot, #printRoot * { visibility: visible !important; }
        #printRoot { position: absolute; left: 0; top: 0; width: 100%; }
      }

      .nlfr-print {
        font-family: Mulish, Arial, sans-serif;
        line-height: 1.6;
        color: #111;
        background: #fff;
        padding: 18px 22px;
      }

      .nlfr-print__header { margin-bottom: 12px; }
      .nlfr-print__h1 {
        font-family: Poppins, Arial, sans-serif;
        font-weight: 700;
        font-size: 20px;
        color: #800000;
        margin: 0 0 6px 0;
      }
      .nlfr-print__h2 {
        font-family: Poppins, Arial, sans-serif;
        font-weight: 700;
        font-size: 14px;
        color: #800000;
        margin: 14px 0 8px 0;
      }
      .nlfr-print__meta { font-size: 11px; opacity: .85; }
      .nlfr-print__note { margin-top: 8px; font-size: 11px; opacity: .9; }

      .nlfr-print__hr { border: none; border-top: 1px solid rgba(0,0,0,.15); margin: 12px 0; }

      .nlfr-print__kv { width: 100%; border-collapse: collapse; font-size: 12px; }
      .nlfr-print__kvk { width: 32%; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.08); font-weight: 700; }
      .nlfr-print__kvv { padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.08); }

      .nlfr-print__table { width: 100%; border-collapse: collapse; font-size: 11px; }
      .nlfr-print__table th, .nlfr-print__table td {
        border: 1px solid rgba(0,0,0,.15);
        padding: 6px 6px;
        vertical-align: top;
      }
      .nlfr-print__table th { background: rgba(128,0,0,.06); color: #111; }

      .nlfr-print__box {
        border: 1px solid rgba(128,0,0,.25);
        background: rgba(128,0,0,.04);
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 12px;
      }

      .nlfr-print__nudge {
        border: 1px solid rgba(0,0,0,.12);
        border-radius: 10px;
        padding: 10px 12px;
        margin: 8px 0;
        font-size: 12px;
      }
      .nlfr-print__nudgeTitle { font-weight: 700; margin-bottom: 4px; }
      .nlfr-print__nudgeBody { margin-bottom: 6px; }

      .nlfr-print__pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 10px;
        margin-left: 6px;
        border: 1px solid rgba(0,0,0,.15);
      }
      .nlfr-print__pill--ok { background: rgba(0,0,0,.04); }
      .nlfr-print__pill--warn { background: rgba(0,0,0,.07); }
      .nlfr-print__pill--bad { background: rgba(0,0,0,.10); }

      .nlfr-print__ul { margin: 6px 0 0 18px; font-size: 12px; }
      .nlfr-print__muted { font-size: 11px; opacity: .85; }

      .nlfr-print__badge {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(0,0,0,.15);
        font-size: 12px;
        margin: 4px 0;
      }
      .nlfr-print__badge--ok { background: rgba(0,0,0,.04); }
      .nlfr-print__badge--warn { background: rgba(0,0,0,.07); }
      .nlfr-print__badge--bad { background: rgba(0,0,0,.10); }

      .nlfr-print__footer {
        margin-top: 18px;
        font-size: 10px;
        opacity: .8;
        border-top: 1px solid rgba(0,0,0,.12);
        padding-top: 10px;
      }

      /* Small helper list styling inside calcExplain (no dependency on your CSS) */
      .nlfr-mini-list { margin: 6px 0 0 18px; }
      .nlfr-mini-list li { margin: 4px 0; }
      .nlfr-explain code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    `;

    const style = document.createElement("style");
    style.id = "nlfrPrintStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // -------------------------
  // Navigation
  // -------------------------
  function goTo(idx) {
    const i = clampInt(idx, 0, STEPS.length - 1);
    state.ui.stepIndex = i;
    render();
  }
  function next() { goTo(state.ui.stepIndex + 1); }
  function prev() { goTo(state.ui.stepIndex - 1); }

  // -------------------------
  // Helpers
  // -------------------------
  function hasPartnerInFamily() {
    return state.family.relation === "married" || state.family.relation === "pacs" || state.family.relation === "cohab";
  }

  function calcNetEstate() {
    const a = Math.max(0, Number(state.estate.assetsTotal) || 0);
    const d = Math.max(0, Number(state.estate.debtsTotal) || 0);
    return round2(Math.max(0, a - d));
  }

  function labelRelation(rel) {
    if (rel === "married") return "Gehuwd";
    if (rel === "pacs") return "PACS";
    if (rel === "cohab") return "Samenwonend (concubinage)";
    if (rel === "single") return "Geen partner";
    return rel;
  }

  function labelMode(mode) {
    if (mode === "succession") return "Erfenis (koude hand)";
    if (mode === "donation") return "Schenking (warme hand)";
    return mode;
  }

  function labelWill(t) {
    if (t === "none") return "Geen testament";
    if (t === "fr_will") return "Frans testament";
    if (t === "nl_will") return "NL testament";
    if (t === "eu_choice") return "EU rechtskeuze (testament met rechtskeuze)";
    return t;
  }

  function bindSelect(id, value, onChange) {
    const el = document.getElementById(id);
    el.value = String(value);
    el.addEventListener("change", () => {
      onChange(el.value);
      render();
    });
  }

  function bindNumber(id, value, min, max, onChange) {
    const el = document.getElementById(id);
    el.value = String(toInt(value));
    el.addEventListener("input", () => {
      const v = clampInt(el.value, min, max);
      onChange(v);
      render();
    });
  }

  function bindCheckbox(id, value, onChange) {
    const el = document.getElementById(id);
    el.checked = Boolean(value);
    el.addEventListener("change", () => {
      onChange(el.checked);
      render();
    });
  }

  function saveState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) { return null; }
  }

  function formatEUR(n) {
    const v = Number(n) || 0;
    return v.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
  }

  function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

  function toInt(v) {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : 0;
  }

  function clampInt(v, min, max) {
    const n = toInt(v);
    return Math.min(max, Math.max(min, n));
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("`", "&#096;");
  }

  function must(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`DOM element ontbreekt: #${id}`);
    return el;
  }

  function showFatal(err) {
    console.error(err);
    try {
      elPanel.innerHTML = `
        <h2>Fout bij laden</h2>
        <p class="muted">Er is een JavaScript-fout opgetreden. Dit voorkomt renderen (white screen).</p>
        <pre style="white-space:pre-wrap; background:#fff; border:1px solid rgba(0,0,0,.12); padding:12px; border-radius:10px;">${escapeHtml(String(err && err.stack ? err.stack : err))}</pre>
      `;
    } catch (_) {}
  }
})();
