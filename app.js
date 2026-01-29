/* Erf- & Schenkingsrecht NL/FR — Gids (V0.1.1)
   Patchdoelen:
   - FIX: invoervelden niet “kapot renderen” tijdens typen (geen full re-render op elke input)
   - Vermogen als sliders (educatieve indicatie)
   - Exports verwijderd; 1 actie: “📁 Opslaan in Dossier” via postMessage
   - Bronnen uitgebreid met impots.gouv.fr abattement 100k/15 jaar

   Bronnen in UI:
   - impots.gouv.fr: 100k/15 jaar (18 décembre 2025)
   - Service-Public: donation (Vérifié le 07 novembre 2024)
   - Service-Public: territorialité donation (Vérifié le 01 janvier 2026)
   - Service-Public: PACS (Vérifié le 27 janvier 2026)
   - Légifrance: Code civil art. 912 (Version en vigueur depuis le 01 janvier 2007)
   - EUR-Lex: Règlement (UE) 650/2012 (04 July 2012)
*/

(function () {
  "use strict";

  // -------------------------
  // Sources (UI)
  // -------------------------
  const SOURCES = {
    impots_abattements_2025: {
      id: "impots_abattements_2025",
      name: "impots.gouv.fr — Abattements donations (100k/15 ans)",
      date: "18 décembre 2025",
      url: "https://www.impots.gouv.fr/particulier/questions/que-puis-je-donner-mes-enfants-petits-enfants-sans-avoir-payer-de-droits",
    },
    sp_donation_2024: {
      id: "sp_donation_2024",
      name: "Service-Public — Droits de donation (barèmes/abattements)",
      date: "Vérifié le 07 novembre 2024",
      url: "https://www.service-public.fr/particuliers/vosdroits/F14203",
    },
    sp_donation_territ_2026: {
      id: "sp_donation_territ_2026",
      name: "Service-Public — Droits de donation (territorialité / biens imposables)",
      date: "Vérifié le 01 janvier 2026",
      url: "https://www.service-public.fr/particuliers/vosdroits/F10203",
    },
    sp_pacs_2026: {
      id: "sp_pacs_2026",
      name: "Service-Public — Effets d'un PACS",
      date: "Vérifié le 27 janvier 2026",
      url: "https://www.service-public.fr/particuliers/vosdroits/F1026",
    },
    legi_cc_912: {
      id: "legi_cc_912",
      name: "Légifrance — Code civil, art. 912 (réserve/quotité)",
      date: "Version en vigueur depuis le 01 janvier 2007",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006435530",
    },
    eurlex_650_2012: {
      id: "eurlex_650_2012",
      name: "EUR-Lex — Règlement (UE) n°650/2012 (successions)",
      date: "04 July 2012",
      url: "https://eur-lex.europa.eu/eli/reg/2012/650/oj/eng",
    },
  };

  // -------------------------
  // DossierFrankrijk integration config
  // -------------------------
  const TOOL_NAME = "Erf- & Schenkingsrecht NL/FR";
  const TOOL_SLUG = "erf-schenkingsrecht-nl-fr"; // ⚙️ icoon (niet in reserved list)

  // -------------------------
  // State
  // -------------------------
  const STORAGE_KEY = "nlfr_erf_schenk_v011";

  const state = loadState() || {
    meta: {
      version: "0.1.1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    family: {
      relation: "married", // married | pacs | cohab | single
      childrenCount: 2,
      hasStepchildren: false,
      hasAdoptedChildren: false,
      hasMinorChildren: false,
    },
    anchors: {
      habitualResidenceAtDeath: "fr", // fr | nl | other
      nationality: "nl", // nl | fr | other
      mainAssetsLocation: "fr", // fr | nl | mixed
      wantsChoiceOfLaw: false,
    },
    estate: {
      assetsTotal: 533000,
      debtsTotal: 50000,
      includesMainHome: true,
      includesLifeInsurance: false,
      // slider ranges (educatief)
      assetsMax: 2000000,
      debtsMax: 500000,
    },
    scenario: {
      mode: "succession", // succession | donation | mixed
      allocateToPartnerPct: 50,
      allocateToChildrenPct: 50,
      donationType: "standard", // standard | cash_gift_31865
    },
    report: {},
    ui: {
      stepIndex: 0,
    },
  };

  // -------------------------
  // Steps
  // -------------------------
  const STEPS = [
    { key: "family", title: "1. Gezin" },
    { key: "anchors", title: "2. Woon-/aanknopingspunten" },
    { key: "estate", title: "3. Vermogen" },
    { key: "scenario", title: "4. Scenario" },
    { key: "report", title: "5. Rapport" },
  ];

  // -------------------------
  // DOM refs
  // -------------------------
  const elStepper = document.getElementById("stepper");
  const elPanel = document.getElementById("panel");
  const elNudges = document.getElementById("nudges");
  const elSources = document.getElementById("sources");
  const elSaveBtn = document.getElementById("save-dossier-btn");
  const elSaveHint = document.getElementById("saveHint");

  // -------------------------
  // Init
  // -------------------------
  renderSources();
  renderAll();

  if (elSaveBtn) {
    elSaveBtn.addEventListener("click", () => saveToDossier());
  }

  // -------------------------
  // Rendering (full)
  // -------------------------
  function renderAll() {
    state.meta.updatedAt = new Date().toISOString();
    saveState(state);

    renderStepper();
    renderStepPanel();
    renderNudges();
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
    if (key === "scenario") return renderScenario();
    if (key === "report") return renderReport();
  }

  // -------------------------
  // Soft refresh (no re-render of panel)
  // -------------------------
  function softRefresh() {
    state.meta.updatedAt = new Date().toISOString();
    saveState(state);
    renderNudges();

    // Als we op rapport staan: update alleen tabel/kpi door full render van report step
    if (STEPS[state.ui.stepIndex].key === "report") {
      renderAll();
    }
  }

  // -------------------------
  // Step panels
  // -------------------------
  function renderFamily() {
    elPanel.innerHTML = `
      <h2>Gezinssituatie</h2>
      <p class="muted">V0.1.1 modelleert partner + kinderen. Stief/adoptie triggert vooral waarschuwingen (detail volgt V0.2+).</p>

      <div class="form">
        <div class="field">
          <label>Relatievorm</label>
          <select id="relation">
            <option value="married">Gehuwd</option>
            <option value="pacs">PACS</option>
            <option value="cohab">Samenwonend (concubinage)</option>
            <option value="single">Geen partner</option>
          </select>
          <div class="help">Belangrijk voor fiscale behandeling en (bij PACS) noodzaak testament voor erven. (Service-Public, Vérifié le 27 janvier 2026)</div>
        </div>

        <div class="field">
          <label>Aantal kinderen</label>
          <input id="childrenCount" type="number" min="0" step="1" />
          <div class="help">V0.1.1 verdeelt het kinderdeel gelijk over alle kinderen.</div>
        </div>

        <div class="field">
          <label><input id="hasStepchildren" type="checkbox" /> Stiefkinderen aanwezig</label>
          <div class="help">V0.1.1 rekent dit nog niet apart door (wel flags).</div>
        </div>

        <div class="field">
          <label><input id="hasAdoptedChildren" type="checkbox" /> Adoptiekinderen aanwezig</label>
          <div class="help">V0.1.1: waarschuwing; adoptievorm kan relevant zijn.</div>
        </div>

        <div class="field">
          <label><input id="hasMinorChildren" type="checkbox" /> Minderjarige kinderen</label>
          <div class="help">V0.1.1: extra planning-nudge (voogdij/executeur).</div>
        </div>
      </div>

      <div class="actions">
        <span class="badge">Stap 1/5</span>
        <div class="btnrow">
          <button class="btn" id="next">Volgende</button>
        </div>
      </div>
    `;

    bindSelectSoft("relation", state.family.relation, (v) => (state.family.relation = v));
    bindNumberSoft("childrenCount", state.family.childrenCount, 0, 20, (v) => (state.family.childrenCount = v));
    bindCheckboxSoft("hasStepchildren", state.family.hasStepchildren, (v) => (state.family.hasStepchildren = v));
    bindCheckboxSoft("hasAdoptedChildren", state.family.hasAdoptedChildren, (v) => (state.family.hasAdoptedChildren = v));
    bindCheckboxSoft("hasMinorChildren", state.family.hasMinorChildren, (v) => (state.family.hasMinorChildren = v));

    document.getElementById("next").addEventListener("click", () => next());
  }

  function renderAnchors() {
    elPanel.innerHTML = `
      <h2>Woon-/aanknopingspunten (juridische laag)</h2>
      <p class="muted">
        V0.1.1 rekent vooral FR fiscale basis. Deze stap zet de aanknopingspunten klaar voor V0.2+ (EU 650/2012).
      </p>

      <div class="form">
        <div class="field">
          <label>Gewone verblijfplaats bij overlijden (habitual residence)</label>
          <select id="habitualResidenceAtDeath">
            <option value="fr">Frankrijk</option>
            <option value="nl">Nederland</option>
            <option value="other">Anders</option>
          </select>
          <div class="help">Aanknopingspunt voor toepasselijk erfrecht in EU-context. (EUR-Lex, 04 July 2012)</div>
        </div>

        <div class="field">
          <label>Nationaliteit</label>
          <select id="nationality">
            <option value="nl">Nederlands</option>
            <option value="fr">Frans</option>
            <option value="other">Anders</option>
          </select>
        </div>

        <div class="field">
          <label>Waar zit het grootste deel van de bezittingen?</label>
          <select id="mainAssetsLocation">
            <option value="fr">Voornamelijk Frankrijk</option>
            <option value="nl">Voornamelijk Nederland</option>
            <option value="mixed">Gemengd</option>
          </select>
        </div>

        <div class="field">
          <label><input id="wantsChoiceOfLaw" type="checkbox" /> Keuze voor toepasselijk recht (via testament) overwegen</label>
          <div class="help">V0.1.1: registreert dit; V0.2+ werkt dit uit incl. checks.</div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge">Stap 2/5</span>
          <button class="btn" id="next">Volgende</button>
        </div>
      </div>
    `;

    bindSelectSoft("habitualResidenceAtDeath", state.anchors.habitualResidenceAtDeath, (v) => (state.anchors.habitualResidenceAtDeath = v));
    bindSelectSoft("nationality", state.anchors.nationality, (v) => (state.anchors.nationality = v));
    bindSelectSoft("mainAssetsLocation", state.anchors.mainAssetsLocation, (v) => (state.anchors.mainAssetsLocation = v));
    bindCheckboxSoft("wantsChoiceOfLaw", state.anchors.wantsChoiceOfLaw, (v) => (state.anchors.wantsChoiceOfLaw = v));

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  function renderEstate() {
    elPanel.innerHTML = `
      <h2>Vermogen (indicatief, educatief)</h2>
      <p class="muted">
        Dit is een grove simulatie. In V0.2+ komen asset-klassen (assurance-vie, SCI, bedrijf, etc.) en fijnere fiscaliteit.
      </p>

      <div class="form">
        <div class="field">
          <label>Totaal bezittingen: <strong><span id="assetsDisp"></span></strong></label>
          <input id="assetsRange" type="range" min="0" max="${escapeAttr(String(state.estate.assetsMax))}" step="1000" />
          <div class="help">Schuif om snel scenario’s te verkennen.</div>
        </div>

        <div class="field">
          <label>Totaal schulden: <strong><span id="debtsDisp"></span></strong></label>
          <input id="debtsRange" type="range" min="0" max="${escapeAttr(String(state.estate.debtsMax))}" step="1000" />
          <div class="help">Alleen globale schuldenpositie (V0.1.1).</div>
        </div>

        <div class="field">
          <label><input id="includesMainHome" type="checkbox" /> Hoofdwoning / woonhuis in massa</label>
          <div class="help">V0.1.1: signaal voor nudges (partnerbescherming is complex).</div>
        </div>

        <div class="field">
          <label><input id="includesLifeInsurance" type="checkbox" /> Assurance-vie aanwezig</label>
          <div class="help">Assurance-vie kent vaak een eigen regime (V0.2+). (Service-Public, Vérifié le 01 janvier 2026)</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__item">
          <strong>Netto massa (indicatief)</strong>
          <span id="netEstate"></span>
        </div>
        <div class="kpi__item">
          <strong>Rekenmodus (V0.1.1)</strong>
          <span>FR schenk-/erfbelasting (basis) + nudges</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge">Stap 3/5</span>
          <button class="btn" id="next">Volgende</button>
        </div>
      </div>
    `;

    const assetsRange = document.getElementById("assetsRange");
    const debtsRange = document.getElementById("debtsRange");
    const assetsDisp = document.getElementById("assetsDisp");
    const debtsDisp = document.getElementById("debtsDisp");
    const netEl = document.getElementById("netEstate");

    assetsRange.value = String(toInt(state.estate.assetsTotal));
    debtsRange.value = String(toInt(state.estate.debtsTotal));

    function syncEstateUI() {
      assetsDisp.textContent = formatEUR(state.estate.assetsTotal);
      debtsDisp.textContent = formatEUR(state.estate.debtsTotal);
      netEl.textContent = formatEUR(calcNetEstate());
    }
    syncEstateUI();

    assetsRange.addEventListener("input", () => {
      state.estate.assetsTotal = clampInt(assetsRange.value, 0, state.estate.assetsMax);
      syncEstateUI();
      softRefresh();
    });

    debtsRange.addEventListener("input", () => {
      state.estate.debtsTotal = clampInt(debtsRange.value, 0, state.estate.debtsMax);
      syncEstateUI();
      softRefresh();
    });

    bindCheckboxSoft("includesMainHome", state.estate.includesMainHome, (v) => (state.estate.includesMainHome = v));
    bindCheckboxSoft("includesLifeInsurance", state.estate.includesLifeInsurance, (v) => (state.estate.includesLifeInsurance = v));

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  function renderScenario() {
    elPanel.innerHTML = `
      <h2>Scenario: koude hand / warme hand</h2>
      <p class="muted">
        V0.1.1 rekent basis FR heffing voor partner/kinderen en toont nominale netto-impact (educatief).
      </p>

      <div class="form">
        <div class="field">
          <label>Traject</label>
          <select id="mode">
            <option value="succession">Erfenis (koude hand)</option>
            <option value="donation">Schenking (warme hand)</option>
            <option value="mixed">Combinatie (beperkt)</option>
          </select>
        </div>

        <div class="field">
          <label>Schenking-type (alleen bij ‘Schenking’)</label>
          <select id="donationType">
            <option value="standard">Standaard schenking</option>
            <option value="cash_gift_31865">Familiale geldschenking 31.865€-regime (indicatief)</option>
          </select>
          <div class="help">Extra vrijstelling bestaat onder voorwaarden; V0.1.1 past dit indicatief toe. (impots.gouv.fr, 18 décembre 2025)</div>
        </div>
      </div>

      <div class="box" style="margin-top:14px;">
        <strong>Educatieve sleutelregel (FR):</strong><br/>
        Elke ouder kan tot <strong>€100.000 per kind</strong> schenken zonder schenkbelasting, en dit kan opnieuw <strong>elke 15 jaar</strong>. (impots.gouv.fr, 18 décembre 2025)
      </div>

      <hr />

      <h3>Verdeling (V0.1.1: % van netto massa)</h3>
      <p class="muted">Slider = what-if. Civielrechtelijke reserve/quotité kan anders uitpakken. (Légifrance, Version en vigueur depuis le 01 janvier 2007)</p>

      <div class="form">
        <div class="field">
          <label>Partner: <strong><span id="pPct"></span>%</strong></label>
          <input id="allocateToPartnerPct" type="range" min="0" max="100" step="1" />
        </div>

        <div class="field">
          <label>Kinderen: <strong><span id="cPct"></span>%</strong></label>
          <input id="allocateToChildrenPct" type="range" min="0" max="100" step="1" />
        </div>
      </div>

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge">Stap 4/5</span>
          <button class="btn" id="next">Naar rapport</button>
        </div>
      </div>
    `;

    const modeEl = document.getElementById("mode");
    const donationTypeEl = document.getElementById("donationType");
    modeEl.value = state.scenario.mode;
    donationTypeEl.value = state.scenario.donationType;

    modeEl.addEventListener("change", () => {
      state.scenario.mode = modeEl.value;
      softRefresh();
    });

    donationTypeEl.addEventListener("change", () => {
      state.scenario.donationType = donationTypeEl.value;
      softRefresh();
    });

    const p = document.getElementById("allocateToPartnerPct");
    const c = document.getElementById("allocateToChildrenPct");
    const pPct = document.getElementById("pPct");
    const cPct = document.getElementById("cPct");

    p.value = String(state.scenario.allocateToPartnerPct);
    c.value = String(state.scenario.allocateToChildrenPct);
    pPct.textContent = String(state.scenario.allocateToPartnerPct);
    cPct.textContent = String(state.scenario.allocateToChildrenPct);

    function syncPct(pv, cv) {
      state.scenario.allocateToPartnerPct = pv;
      state.scenario.allocateToChildrenPct = cv;
      p.value = String(pv);
      c.value = String(cv);
      pPct.textContent = String(pv);
      cPct.textContent = String(cv);
    }

    p.addEventListener("input", () => {
      const pv = clampInt(p.value, 0, 100);
      const cv = 100 - pv;
      syncPct(pv, cv);
      softRefresh();
    });

    c.addEventListener("input", () => {
      const cv = clampInt(c.value, 0, 100);
      const pv = 100 - cv;
      syncPct(pv, cv);
      softRefresh();
    });

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => {
      computeReport();
      next();
    });
  }

  function renderReport() {
    computeReport();
    const r = state.report;

    elPanel.innerHTML = `
      <h2>Rapport (V0.1.1)</h2>
      <p class="muted">
        Dit rapport is educatief. Voor internationale situaties, stief/adoptie, assurance-vie en grote vermogens: laat toetsen.
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

      <h3>Uitkomst per ontvanger</h3>
      ${renderResultsTable(r)}

      <div class="actions">
        <button class="btn btn--ghost" id="prev">Vorige</button>
        <div class="btnrow">
          <span class="badge badge--ok">Stap 5/5</span>
        </div>
      </div>
    `;

    document.getElementById("prev").addEventListener("click", () => prev());
  }

  function renderResultsTable(r) {
    if (!r || !r.rows || r.rows.length === 0) {
      return `<p class="badge badge--warn">Onvoldoende invoer om te rekenen.</p>`;
    }

    const rowsHtml = r.rows.map((row) => {
      return `
        <tr>
          <td>${escapeHtml(row.person)}</td>
          <td>${escapeHtml(row.relationLabel)}</td>
          <td>${formatEUR(row.gross)}</td>
          <td>${formatEUR(row.allowance)}</td>
          <td>${formatEUR(row.taxable)}</td>
          <td>${formatEUR(row.tax)}</td>
          <td><strong>${formatEUR(row.net)}</strong></td>
        </tr>
      `;
    }).join("");

    return `
      <table class="table" aria-label="Resultaten">
        <thead>
          <tr>
            <th>Ontvanger</th>
            <th>Relatie</th>
            <th>Bruto</th>
            <th>Abattement</th>
            <th>Belastbaar</th>
            <th>Belasting</th>
            <th>Netto</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <p class="tiny muted" style="margin-top:10px;">
        Abattement 100k/15 jaar: impots.gouv.fr (18 décembre 2025). Barèmes/abattements donation: Service-Public (Vérifié le 07 novembre 2024).
      </p>
    `;
  }

  function renderSources() {
    const list = Object.values(SOURCES).map((s) => {
      return `
        <div class="source">
          <div class="source__top">
            <div class="source__name">${escapeHtml(s.name)}</div>
            <div class="source__date">${escapeHtml(s.date)}</div>
          </div>
          <div style="margin-top:6px;">
            <a href="${escapeAttr(s.url)}" target="_blank" rel="noopener">Open bron</a>
          </div>
        </div>
      `;
    }).join("");
    elSources.innerHTML = list;
  }

  // -------------------------
  // Nudges
  // -------------------------
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

  function buildNudges() {
    const out = [];

    if (state.family.relation === "pacs") {
      out.push({
        level: "warn",
        title: "PACS ≠ automatisch erven",
        body: "Bij PACS moet je in principe een testament maken als je wilt dat je partner (een deel van) je nalatenschap krijgt.",
        sourceId: "sp_pacs_2026",
      });
      out.push({
        level: "ok",
        title: "PACS: fiscaal bij overlijden",
        body: "PACS-partner kan fiscaal zijn vrijgesteld van successierechten, maar dat zegt niets over civielrechtelijke verdeling zonder testament.",
        sourceId: "sp_pacs_2026",
      });
    }

    if (state.family.childrenCount > 0) {
      out.push({
        level: "warn",
        title: "Kinderen → reserve/quotité (civielrecht)",
        body: "Als er reservataire erfgenamen zijn (vaak kinderen), is niet alles vrij te bestemmen; plan scenario’s met reserve/quotité in het achterhoofd.",
        sourceId: "legi_cc_912",
      });
    }

    if (state.family.relation === "cohab") {
      out.push({
        level: "bad",
        title: "Samenwonend (concubinage): verhoogd risico",
        body: "Zonder huwelijk/PACS kunnen bescherming en fiscale behandeling ongunstig uitpakken. V0.1.1 rekent dit niet volledig door: laat toetsen bij serieuze bedragen.",
        sourceId: "sp_donation_2024",
      });
    }

    if (state.estate.includesLifeInsurance) {
      out.push({
        level: "warn",
        title: "Assurance-vie: eigen regime",
        body: "Assurance-vie volgt vaak niet dezelfde logica als ‘gewone’ nalatenschap. V0.1.1 geeft daarom geen betrouwbare eindbelasting op dit onderdeel.",
        sourceId: "sp_donation_territ_2026",
      });
    }

    if (state.family.hasStepchildren) {
      out.push({
        level: "warn",
        title: "Stiefkinderen: aparte fiscale/civielrechtelijke logica",
        body: "V0.1.1 waarschuwt; V0.2+ krijgt modeling per kindtype.",
        sourceId: "sp_donation_2024",
      });
    }
    if (state.family.hasAdoptedChildren) {
      out.push({
        level: "warn",
        title: "Adoptie: adoptievorm kan verschil maken",
        body: "V0.1.1 rekent niet per adoptievorm door; plan controle in V0.2+.",
        sourceId: "sp_donation_2024",
      });
    }

    if (state.anchors.habitualResidenceAtDeath !== "fr" || state.anchors.mainAssetsLocation !== "fr" || state.anchors.nationality !== "fr") {
      out.push({
        level: "warn",
        title: "Internationale knoop: erfrecht vs belasting",
        body: "Bij grensoverschrijdende situaties moet je meestal apart kijken naar (1) toepasselijk erfrecht en (2) fiscale heffing. V0.1.1 zet dit klaar, maar rekent het nog niet volledig door.",
        sourceId: "eurlex_650_2012",
      });
    }

    // Donation education nudge
    if (state.scenario.mode === "donation" && toInt(state.family.childrenCount) > 0) {
      out.push({
        level: "ok",
        title: "Warme hand: 100k/15 jaar (FR)",
        body: "Elke ouder kan tot €100.000 per kind schenken zonder schenkbelasting; dit kan opnieuw elke 15 jaar.",
        sourceId: "impots_abattements_2025",
      });
      out.push({
        level: "warn",
        title: "Territorialiteit: ‘in Frankrijk wonen’ is niet genoeg als vuistregel",
        body: "De Franse heffing kan afhangen van o.a. de residentie van de begiftigde en het aantal jaren residentie in de 10 jaar vóór de schenking.",
        sourceId: "sp_donation_territ_2026",
      });
    }

    if (calcNetEstate() <= 0) {
      out.push({
        level: "bad",
        title: "Netto massa ≤ 0",
        body: "Met huidige assets/schulden is er indicatief geen positieve massa om te verdelen. Controleer invoer.",
        sourceId: "sp_donation_2024",
      });
    }

    if (state.family.hasMinorChildren) {
      out.push({
        level: "warn",
        title: "Minderjarige kinderen: extra planning nodig",
        body: "Dit raakt voogdij/executeur/beheer. V0.1.1 geeft geen juridisch eindadvies; neem dit expliciet mee in dossier/akte.",
        sourceId: "legi_cc_912",
      });
    }

    return out;
  }

  // -------------------------
  // Calculation engine (V0.1.1)
  // -------------------------
  function computeReport() {
    const net = calcNetEstate();
    const rows = [];

    const hasPartner = state.family.relation === "married" || state.family.relation === "pacs" || state.family.relation === "cohab";
    const childrenCount = Math.max(0, toInt(state.family.childrenCount));

    let partnerGross = 0;
    let childrenGrossTotal = 0;

    if (net > 0) {
      if (childrenCount === 0 && hasPartner) {
        partnerGross = net;
      } else {
        partnerGross = hasPartner ? (net * (state.scenario.allocateToPartnerPct / 100)) : 0;
        childrenGrossTotal = Math.max(0, net - partnerGross);
      }
    }

    if (hasPartner && partnerGross > 0) {
      const relationLabel = labelRelation(state.family.relation);
      const res = calcTaxForPerson({
        mode: state.scenario.mode,
        relation: state.family.relation,
        gross: partnerGross,
        donationType: state.scenario.donationType,
      });
      rows.push({
        person: "Partner",
        relationLabel,
        gross: partnerGross,
        allowance: res.allowance,
        taxable: res.taxable,
        tax: res.tax,
        net: res.net,
        notes: res.notes,
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
          notes: res.notes,
        });
      }
    }

    state.report = {
      netEstate: net,
      rows,
      computedAt: new Date().toISOString(),
      assumptions: [
        "V0.1.1: verdeling obv sliders (% netto massa).",
        "V0.1.1: kinderen gelijk verdeeld.",
        "V0.1.1: geen assurance-vie/SCI/bedrijf/complexe internationale doorsnijdingen.",
        "V0.1.1: FR barèmes/abattements o.b.v. Service-Public + impots.gouv.fr (zie bronnen).",
      ],
    };

    saveState(state);
  }

  function calcTaxForPerson({ mode, relation, gross, donationType }) {
    const g = Math.max(0, Number(gross) || 0);

    let allowance = 0;
    let taxable = g;
    let tax = 0;
    let notes = [];

    if (mode === "succession") {
      // V0.1.1: successie detailbronnen niet uitgebreid; partner vrijstelling hier indicatief
      if (relation === "married" || relation === "pacs") {
        allowance = g;
        taxable = 0;
        tax = 0;
        notes.push("V0.1.1: partner vrijgesteld bij overlijden (indicatief; zie notaris bij complexiteit).");
        return finalize();
      }
      if (relation === "child") {
        allowance = 100000; // lijnrecht (abattement) – consistent met public sources
        taxable = Math.max(0, g - allowance);
        tax = progressiveTax(taxable, BRACKETS_LINE_DIRECT);
        return finalize();
      }
      notes.push("V0.1.1: relatie niet uitgewerkt → geen betrouwbare belastingberekening.");
      return finalize();
    }

    if (mode === "donation") {
      if (relation === "married" || relation === "pacs") {
        allowance = 80724; // époux/PACS donation (Service-Public 07/11/2024)
        taxable = Math.max(0, g - allowance);
        tax = progressiveTax(taxable, BRACKETS_SPOUSE_DONATION);
        return finalize();
      }
      if (relation === "child") {
        allowance = 100000; // parent->enfant (impots.gouv.fr 18/12/2025)
        taxable = Math.max(0, g - allowance);

        if (donationType === "cash_gift_31865") {
          const extra = Math.min(31865, taxable);
          taxable = Math.max(0, taxable - extra);
          notes.push("V0.1.1: extra 31.865€ alleen onder voorwaarden; indicatief toegepast.");
        }

        tax = progressiveTax(taxable, BRACKETS_LINE_DIRECT);
        return finalize();
      }
      notes.push("V0.1.1: relatie niet uitgewerkt → geen betrouwbare belastingberekening.");
      return finalize();
    }

    // mixed (educatief): approx as donation child allowances
    notes.push("V0.1.1: ‘Combinatie’ is beperkt; educatieve benadering.");
    if (relation === "child") {
      allowance = 100000;
      taxable = Math.max(0, g - allowance);
      tax = progressiveTax(taxable, BRACKETS_LINE_DIRECT);
    }
    return finalize();

    function finalize() {
      return {
        allowance,
        taxable,
        tax: round2(tax),
        net: Math.max(0, g - round2(tax)),
        notes,
      };
    }
  }

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
  // Navigation
  // -------------------------
  function goTo(idx) {
    const i = clampInt(idx, 0, STEPS.length - 1);
    state.ui.stepIndex = i;
    renderAll();
  }
  function next() { goTo(state.ui.stepIndex + 1); }
  function prev() { goTo(state.ui.stepIndex - 1); }

  // -------------------------
  // DOSSIERFRANKRIJK: Save via postMessage
  // -------------------------
  function saveToDossier() {
    computeReport();

    const title = buildDossierTitle();
    const summary = buildDossierSummary();

    const payload = {
      type: "saveToDossier",
      title,
      summary,
      source: TOOL_SLUG,
    };

    const inIframe = window.parent !== window;

    if (!inIframe) {
      alert("Deze functie werkt alleen binnen InfoFrankrijk.com (iframe).");
      return;
    }

    const parentOrigin = safeReferrerOrigin() || "*";

    try {
      window.parent.postMessage(payload, parentOrigin);
      if (elSaveHint) {
        elSaveHint.textContent = `Verzonden naar InfoFrankrijk (${parentOrigin === "*" ? "origin: *" : "origin: " + parentOrigin}). Als er geen modal verschijnt: check de WordPress allowlist op event.origin.`;
      }
    } catch (e) {
      if (elSaveHint) elSaveHint.textContent = "Fout bij postMessage. Check console.";
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  function buildDossierTitle() {
    const net = formatEUR(calcNetEstate());
    const mode = labelMode(state.scenario.mode);
    const rel = labelRelation(state.family.relation);
    const kids = toInt(state.family.childrenCount);
    return `${TOOL_NAME}: ${mode} | netto ${net} | ${rel} | kinderen ${kids}`;
  }

  function buildDossierSummary() {
    const r = state.report;
    const nudges = buildNudges();

    const lines = [];
    lines.push("-------------------------------------------");
    lines.push("ERF- & SCHENKINGSRECHT NL/FR — RESULTAAT (V0.1.1)");
    lines.push("Datum: " + new Date().toLocaleDateString("nl-NL"));
    lines.push("-------------------------------------------");
    lines.push("");
    lines.push("INPUT");
    lines.push("• Relatie: " + labelRelation(state.family.relation));
    lines.push("• Kinderen: " + String(toInt(state.family.childrenCount)));
    lines.push("• Habitual residence (bij overlijden): " + labelAnchor(state.anchors.habitualResidenceAtDeath));
    lines.push("• Nationaliteit: " + labelAnchor(state.anchors.nationality));
    lines.push("• Bezittingen-locatie: " + labelAnchor(state.anchors.mainAssetsLocation));
    lines.push("• Traject: " + labelMode(state.scenario.mode));
    lines.push("• Vermogen (bezittingen): " + formatEUR(state.estate.assetsTotal));
    lines.push("• Schulden: " + formatEUR(state.estate.debtsTotal));
    lines.push("• Netto massa (indicatief): " + formatEUR(r.netEstate));
    lines.push("• Verdeling: partner " + state.scenario.allocateToPartnerPct + "% / kinderen " + state.scenario.allocateToChildrenPct + "%");
    lines.push("");

    lines.push("UITKOMST (indicatief)");
    (r.rows || []).forEach((row) => {
      lines.push(`• ${row.person} (${row.relationLabel}): bruto ${formatEUR(row.gross)} | abattement ${formatEUR(row.allowance)} | belastbaar ${formatEUR(row.taxable)} | belasting ${formatEUR(row.tax)} | netto ${formatEUR(row.net)}`);
    });
    lines.push("");

    if (nudges.length > 0) {
      lines.push("CHECKS / WAARSCHUWINGEN");
      nudges.slice(0, 8).forEach((n) => {
        lines.push(`• [${n.level.toUpperCase()}] ${n.title}: ${n.body}`);
      });
      lines.push("");
    }

    lines.push("BRONNEN");
    Object.values(SOURCES).forEach((s) => {
      lines.push(`• ${s.name} — ${s.date} — ${s.url}`);
    });

    lines.push("");
    lines.push("DISCLAIMER");
    lines.push("Educatieve simulatie. Internationale situaties, stief/adoptie, assurance-vie, SCI en grote vermogens: laten toetsen door notaris/fiscalist.");

    return lines.join("\n");
  }

  function safeReferrerOrigin() {
    try {
      if (!document.referrer) return null;
      const u = new URL(document.referrer);
      return u.origin;
    } catch (_) {
      return null;
    }
  }

  // -------------------------
  // Helpers
  // -------------------------
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
    if (mode === "mixed") return "Combinatie";
    return mode;
  }

  function labelAnchor(v) {
    if (v === "fr") return "Frankrijk";
    if (v === "nl") return "Nederland";
    if (v === "mixed") return "Gemengd";
    if (v === "other") return "Anders";
    return String(v || "");
  }

  function bindSelectSoft(id, value, onChange) {
    const el = document.getElementById(id);
    el.value = String(value);
    el.addEventListener("change", () => {
      onChange(el.value);
      softRefresh();
    });
  }

  function bindNumberSoft(id, value, min, max, onChange) {
    const el = document.getElementById(id);
    el.value = String(toInt(value));
    // BELANGRIJK: change/blur i.p.v. input om typing niet te slopen
    el.addEventListener("change", () => {
      const v = clampInt(el.value, min, max);
      el.value = String(v);
      onChange(v);
      softRefresh();
    });
    el.addEventListener("blur", () => {
      const v = clampInt(el.value, min, max);
      el.value = String(v);
      onChange(v);
      softRefresh();
    });
  }

  function bindCheckboxSoft(id, value, onChange) {
    const el = document.getElementById(id);
    el.checked = Boolean(value);
    el.addEventListener("change", () => {
      onChange(el.checked);
      softRefresh();
    });
  }

  function saveState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) { /* ignore */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function formatEUR(n) {
    const v = Number(n) || 0;
    return v.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
  }

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

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
})();
