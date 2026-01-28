/* Erf- & Schenkingsrecht NL/FR — Gids (V0.1)
   Doel V0.1: wizard + nudges + Franse schenk/erf-belasting (basis) + export JSON/HTML.

   Bronnen (in UI zichtbaar):
   - Service-Public (succession): Vérifié le 31 juillet 2025 (barème/abattements + exonération époux/PACS)
   - Service-Public (donation): Vérifié le 07 novembre 2024 (abattements + barèmes)
   - Service-Public (PACS): Vérifié le 27 janvier 2026 (testament nodig; exonération de droits de succession)
   - Légifrance (Code civil art. 912): Version en vigueur depuis le 01 janvier 2007 (reserve/quotité disponible)
   - EUR-Lex (Règlement (UE) 650/2012): 04 July 2012 (aanknopingspunten / toepasselijk erfrecht)
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
      date: "Vérifié le 31 juillet 2025",
      url: "https://www.service-public.fr/particuliers/vosdroits/F35794",
    },
    sp_donation_2024: {
      id: "sp_donation_2024",
      name: "Service-Public — Droits de donation",
      date: "Vérifié le 07 novembre 2024",
      url: "https://www.service-public.fr/particuliers/vosdroits/F14203",
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
  // State
  // -------------------------
  const STORAGE_KEY = "nlfr_erf_schenk_v01";

  const state = loadState() || {
    meta: {
      version: "0.1.0",
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
      wantsChoiceOfLaw: false, // EU 650/2012 (stap voorbereid)
    },
    estate: {
      assetsTotal: 500000,
      debtsTotal: 50000,
      includesMainHome: true,
      includesLifeInsurance: false,
    },
    scenario: {
      mode: "succession", // succession | donation | mixed
      allocateToPartnerPct: 50, // % van netto massa (V0.1)
      allocateToChildrenPct: 50, // resterend
      donationType: "standard", // standard | cash_gift_31865 (V0.1 indicatief)
    },
    report: {},
    ui: {
      stepIndex: 0,
    },
  };

  // -------------------------
  // Steps config
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

  const elBtnExportJson = document.getElementById("btnExportJson");
  const elBtnExportHtml = document.getElementById("btnExportHtml");
  const elBtnCopySummary = document.getElementById("btnCopySummary");
  const elBtnReset = document.getElementById("btnReset");
  const elExportHint = document.getElementById("exportHint");

  // -------------------------
  // Init
  // -------------------------
  renderSources();
  render();

  elBtnExportJson.addEventListener("click", () => exportJson());
  elBtnExportHtml.addEventListener("click", () => exportHtmlReport());
  elBtnCopySummary.addEventListener("click", () => copySummary());
  elBtnReset.addEventListener("click", () => hardReset());

  // -------------------------
  // Rendering
  // -------------------------
  function render() {
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
      btn.className = "step" + (idx === state.ui.stepIndex ? " step--active" : "") + (idx < state.ui.stepIndex ? " step--done" : "");
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

  function renderFamily() {
    elPanel.innerHTML = `
      <h2>Gezinssituatie</h2>
      <p class="muted">V0.1 gebruikt deze stap om erfgenamen/schenkontvangers te modelleren (partner + kinderen).</p>

      <div class="form">
        <div class="field">
          <label>Relatievorm</label>
          <select id="relation">
            <option value="married">Gehuwd</option>
            <option value="pacs">PACS</option>
            <option value="cohab">Samenwonend (concubinage)</option>
            <option value="single">Geen partner</option>
          </select>
          <div class="help">Belangrijk voor fiscale behandeling en (bij PACS) noodzaak testament voor erven.</div>
        </div>

        <div class="field">
          <label>Aantal kinderen</label>
          <input id="childrenCount" type="number" min="0" step="1" />
          <div class="help">V0.1 verdeelt kinderdeel gelijk over alle kinderen.</div>
        </div>

        <div class="field">
          <label><input id="hasStepchildren" type="checkbox" /> Stiefkinderen aanwezig</label>
          <div class="help">V0.1 rekent dit nog niet apart door, maar triggert wel waarschuwingen.</div>
        </div>

        <div class="field">
          <label><input id="hasAdoptedChildren" type="checkbox" /> Adoptiekinderen aanwezig</label>
          <div class="help">Kan relevant zijn voor abattements afhankelijk van adoptievorm (V0.1: waarschuwing, geen detailberekening).</div>
        </div>

        <div class="field">
          <label><input id="hasMinorChildren" type="checkbox" /> Minderjarige kinderen</label>
          <div class="help">V0.1: extra nudge (planning/voogdij/executeur zijn separate juridische laag).</div>
        </div>
      </div>

      <div class="actions">
        <span class="badge">Stap 1/5</span>
        <div class="btnrow">
          <button class="btn" id="next">Volgende</button>
        </div>
      </div>
    `;

    bindSelect("relation", state.family.relation, (v) => (state.family.relation = v));
    bindNumber("childrenCount", state.family.childrenCount, 0, 20, (v) => (state.family.childrenCount = v));
    bindCheckbox("hasStepchildren", state.family.hasStepchildren, (v) => (state.family.hasStepchildren = v));
    bindCheckbox("hasAdoptedChildren", state.family.hasAdoptedChildren, (v) => (state.family.hasAdoptedChildren = v));
    bindCheckbox("hasMinorChildren", state.family.hasMinorChildren, (v) => (state.family.hasMinorChildren = v));

    document.getElementById("next").addEventListener("click", () => next());
  }

  function renderAnchors() {
    elPanel.innerHTML = `
      <h2>Woon-/aanknopingspunten (juridische laag)</h2>
      <p class="muted">
        V0.1 rekent vooral FR fiscale gevolgen. Deze stap legt de aanknopingspunten vast zodat V0.2+ toepasselijk erfrecht (EU 650/2012) kan meenemen.
      </p>

      <div class="form">
        <div class="field">
          <label>Gewone verblijfplaats bij overlijden (habitual residence)</label>
          <select id="habitualResidenceAtDeath">
            <option value="fr">Frankrijk</option>
            <option value="nl">Nederland</option>
            <option value="other">Anders</option>
          </select>
          <div class="help">In EU-context is dit vaak bepalend voor toepasselijk erfrecht (niet automatisch voor belasting).</div>
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
          <div class="help">V0.1: registreert dit; V0.2+ werkt dit uit incl. checks/voorwaarden.</div>
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

    bindSelect("habitualResidenceAtDeath", state.anchors.habitualResidenceAtDeath, (v) => (state.anchors.habitualResidenceAtDeath = v));
    bindSelect("nationality", state.anchors.nationality, (v) => (state.anchors.nationality = v));
    bindSelect("mainAssetsLocation", state.anchors.mainAssetsLocation, (v) => (state.anchors.mainAssetsLocation = v));
    bindCheckbox("wantsChoiceOfLaw", state.anchors.wantsChoiceOfLaw, (v) => (state.anchors.wantsChoiceOfLaw = v));

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  function renderEstate() {
    elPanel.innerHTML = `
      <h2>Vermogen</h2>
      <p class="muted">V0.1 rekent op netto massa: assets − schulden. Detail-assetklassen (bv. assurance-vie, SCI, entreprise) volgen in V0.2+.</p>

      <div class="form">
        <div class="field">
          <label>Totaal bezittingen (€)</label>
          <input id="assetsTotal" type="number" min="0" step="1000" />
        </div>

        <div class="field">
          <label>Totaal schulden (€)</label>
          <input id="debtsTotal" type="number" min="0" step="1000" />
        </div>

        <div class="field">
          <label><input id="includesMainHome" type="checkbox" /> Hoofdwoning / woonhuis in massa</label>
          <div class="help">V0.1: alleen signaal voor nudges (bv. partnerbescherming is complex).</div>
        </div>

        <div class="field">
          <label><input id="includesLifeInsurance" type="checkbox" /> Assurance-vie aanwezig</label>
          <div class="help">V0.1: waarschuwing; fiscale behandeling is eigen regime (V0.2+).</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__item">
          <strong>Netto massa (indicatief)</strong>
          <span id="netEstate"></span>
        </div>
        <div class="kpi__item">
          <strong>Rekenmodus (V0.1)</strong>
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

    bindNumber("assetsTotal", state.estate.assetsTotal, 0, 1e12, (v) => (state.estate.assetsTotal = v));
    bindNumber("debtsTotal", state.estate.debtsTotal, 0, 1e12, (v) => (state.estate.debtsTotal = v));
    bindCheckbox("includesMainHome", state.estate.includesMainHome, (v) => (state.estate.includesMainHome = v));
    bindCheckbox("includesLifeInsurance", state.estate.includesLifeInsurance, (v) => (state.estate.includesLifeInsurance = v));

    document.getElementById("netEstate").textContent = formatEUR(calcNetEstate());

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  function renderScenario() {
    elPanel.innerHTML = `
      <h2>Scenario: koude hand / warme hand</h2>
      <p class="muted">
        Kies het traject. V0.1 rekent basis FR heffing voor partner/kinderen en toont nominale netto-impact.
      </p>

      <div class="form">
        <div class="field">
          <label>Traject</label>
          <select id="mode">
            <option value="succession">Erfenis (koude hand)</option>
            <option value="donation">Schenking (warme hand)</option>
            <option value="mixed">Combinatie (V0.1: beperkt)</option>
          </select>
        </div>

        <div class="field">
          <label>Schenking-type (alleen bij ‘Schenking’)</label>
          <select id="donationType">
            <option value="standard">Standaard schenking</option>
            <option value="cash_gift_31865">Familiale geldschenking 31.865€-regime (indicatief)</option>
          </select>
          <div class="help">Dit is een extra vrijstelling onder voorwaarden; V0.1 toont vooral het effect en geeft waarschuwingen.</div>
        </div>
      </div>

      <hr />

      <h3>Verdeling (V0.1: % van netto massa)</h3>
      <p class="muted">V0.1 verdeelt: partnerdeel + kinderdeel (gelijk over kinderen). Bij 0 kinderen gaat alles naar partner (indien aanwezig).</p>

      <div class="form">
        <div class="field">
          <label>Partner: <strong><span id="pPct"></span>%</strong></label>
          <input id="allocateToPartnerPct" type="range" min="0" max="100" step="1" />
          <div class="help">Let op: juridische rechten/reserve zijn niet gelijk aan deze slider; dit is planning/what-if.</div>
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
          <span class="badge">Stap 4/5</span>
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

    // init
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
    document.getElementById("next").addEventListener("click", () => {
      // Force calc before report
      computeReport();
      next();
    });
  }

  function renderReport() {
    computeReport();
    const r = state.report;

    elPanel.innerHTML = `
      <h2>Rapport (V0.1)</h2>
      <p class="muted">
        Dit rapport toont nominale bedragen op basis van de ingevoerde netto massa en de gekozen verdeling.
        Voor complexe regimes (assurance-vie, stiefkind, internationale knopen) geeft V0.1 vooral waarschuwingen.
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
        Barèmes/abattements: Service-Public (donation: vérifié 07/11/2024; succession: vérifié 31/07/2025).
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

  // -------------------------
  // Nudges engine (V0.1)
  // -------------------------
  function buildNudges() {
    const out = [];

    // PACS: testament nodig om te erven + vrijstelling successierechten
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
        body: "PACS-partner kan (fiscaal) zijn vrijgesteld van successierechten, maar dat zegt niets over civielrechtelijke verdeling zonder testament.",
        sourceId: "sp_pacs_2026",
      });
    }

    // Kinderen: reserve/quotité (civielrecht)
    if (state.family.childrenCount > 0) {
      out.push({
        level: "warn",
        title: "Kinderen → reserve/quotité (civielrecht)",
        body: "Als er reservataire erfgenamen zijn (vaak kinderen), is niet alles vrij te bestemmen; plan scenario’s met reserve/quotité in het achterhoofd.",
        sourceId: "legi_cc_912",
      });
    }

    // Samenwonend: geen automatische bescherming (algemene waarschuwing; bron niet volledig in V0.1)
    if (state.family.relation === "cohab") {
      out.push({
        level: "bad",
        title: "Samenwonend (concubinage): risico op ‘vreemde’ behandeling",
        body: "Zonder huwelijk/PACS kunnen bescherming en fiscale behandeling zeer ongunstig zijn. V0.1 rekent dit nog niet exact door; zie notaris/fiscalist bij serieuze bedragen.",
        sourceId: "sp_succession_2025",
      });
    }

    // Assurance-vie: aparte logica (V0.2+)
    if (state.estate.includesLifeInsurance) {
      out.push({
        level: "warn",
        title: "Assurance-vie: eigen regime",
        body: "Assurance-vie volgt vaak niet dezelfde logica als ‘gewone’ nalatenschap. V0.1 geeft daarom geen betrouwbare eindbelasting op dit onderdeel.",
        sourceId: "sp_succession_2025",
      });
    }

    // Stiefkinderen/adoptie: aparte paden
    if (state.family.hasStepchildren) {
      out.push({
        level: "warn",
        title: "Stiefkinderen: niet ‘automatisch’ gelijk aan kinderen",
        body: "Stiefkinderen kunnen fiscaal/civielrechtelijk anders vallen. V0.1 waarschuwt; V0.2+ krijgt aparte modeling per kindtype.",
        sourceId: "sp_donation_2024",
      });
    }
    if (state.family.hasAdoptedChildren) {
      out.push({
        level: "warn",
        title: "Adoptie: abattements kunnen afhangen van adoptievorm",
        body: "Voor adoptie kunnen regels/abattements verschillen. V0.1 rekent niet per adoptievorm door; plan controle in V0.2+.",
        sourceId: "sp_donation_2024",
      });
    }

    // International
    if (state.anchors.habitualResidenceAtDeath !== "fr" || state.anchors.mainAssetsLocation !== "fr" || state.anchors.nationality !== "fr") {
      out.push({
        level: "warn",
        title: "Internationale knoop: toepasselijk erfrecht vs belasting",
        body: "Bij grensoverschrijdende situaties moet je meestal apart kijken naar (1) toepasselijk erfrecht en (2) fiscale heffing. V0.1 zet dit klaar, maar rekent het nog niet volledig door.",
        sourceId: "eurlex_650_2012",
      });
    }

    // Minderjarigen
    if (state.family.hasMinorChildren) {
      out.push({
        level: "warn",
        title: "Minderjarige kinderen: extra planning nodig",
        body: "Dit raakt voogdij/executeur/beheer. V0.1 geeft geen juridisch eindadvies; neem dit expliciet mee in dossier/akte.",
        sourceId: "legi_cc_912",
      });
    }

    // Netto massa check
    if (calcNetEstate() <= 0) {
      out.push({
        level: "bad",
        title: "Netto massa ≤ 0",
        body: "Met huidige assets/schulden is er (indicatief) geen positieve massa om te verdelen. Controleer invoer.",
        sourceId: "sp_succession_2025",
      });
    }

    return out;
  }

  // -------------------------
  // Calculation engine (V0.1)
  // -------------------------
  function computeReport() {
    const net = calcNetEstate();
    const rows = [];

    const hasPartner = state.family.relation === "married" || state.family.relation === "pacs" || state.family.relation === "cohab";
    const childrenCount = Math.max(0, toInt(state.family.childrenCount));

    // Allocation
    let partnerGross = 0;
    let childrenGrossTotal = 0;

    if (net > 0) {
      if (childrenCount === 0 && hasPartner) {
        partnerGross = net;
        childrenGrossTotal = 0;
      } else {
        partnerGross = hasPartner ? (net * (state.scenario.allocateToPartnerPct / 100)) : 0;
        childrenGrossTotal = Math.max(0, net - partnerGross);
      }
    }

    // Partner row (tax model depends on mode + relation)
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

    // Children rows
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
        "V0.1: verdeling obv sliders (% netto massa).",
        "V0.1: kinderen gelijk verdeeld.",
        "V0.1: geen assurance-vie/SCI/bedrijf/complexe internationale doorsnijdingen.",
        "V0.1: FR barèmes/abattements volgens Service-Public (dates in bronnenlijst).",
      ],
    };

    saveState(state);
  }

  function calcTaxForPerson({ mode, relation, gross, donationType }) {
    const g = Math.max(0, Number(gross) || 0);

    // Default
    let allowance = 0;
    let taxable = g;
    let tax = 0;
    let notes = [];

    // If international: V0.1 still computes as if FR tax applies (flag is nudges)
    // Keep calculation consistent.

    if (mode === "succession") {
      // Successions (Service-Public verified 31/07/2025)
      if (relation === "married") {
        // spouse exempt (succession)
        allowance = g;
        taxable = 0;
        tax = 0;
        notes.push("V0.1: époux exonéré de droits de succession (indicatief).");
        return finalize();
      }
      if (relation === "pacs") {
        // PACS partner exempt (succession) but needs testament for civil law; nudge handles
        allowance = g;
        taxable = 0;
        tax = 0;
        notes.push("V0.1: partenaire de PACS exonéré de droits de succession (indicatief).");
        return finalize();
      }
      if (relation === "child") {
        allowance = 100000; // abattement enfant (succession)
        taxable = Math.max(0, g - allowance);
        tax = progressiveTax(taxable, BRACKETS_LINE_DIRECT);
        return finalize();
      }

      // fallback unknown relation
      notes.push("V0.1: relatie niet uitgewerkt → geen betrouwbare belastingberekening.");
      allowance = 0;
      taxable = g;
      tax = 0;
      return finalize();
    }

    if (mode === "donation") {
      // Donations (Service-Public verified 07/11/2024)
      if (relation === "married" || relation === "pacs") {
        allowance = 80724; // abattement époux / PACS (donation)
        taxable = Math.max(0, g - allowance);
        tax = progressiveTax(taxable, BRACKETS_SPOUSE_DONATION);
        return finalize();
      }
      if (relation === "child") {
        allowance = 100000; // abattement enfant (donation)
        taxable = Math.max(0, g - allowance);

        // Optional: cash gift regime note (impots.gouv has 31 865 under conditions)
        if (donationType === "cash_gift_31865") {
          // V0.1 simplified: apply extra 31,865 exemption up to that amount
          const extra = Math.min(31865, taxable);
          taxable = Math.max(0, taxable - extra);
          notes.push("V0.1: extra vrijstelling 31.865€ alleen onder voorwaarden; hier indicatief toegepast.");
        }

        tax = progressiveTax(taxable, BRACKETS_LINE_DIRECT);
        return finalize();
      }

      notes.push("V0.1: relatie niet uitgewerkt → geen betrouwbare belastingberekening.");
      allowance = 0;
      taxable = g;
      tax = 0;
      return finalize();
    }

    // mixed
    notes.push("V0.1: ‘Combinatie’ is beperkt; reken kern gebruikt huidige mode niet volledig. Gebruik ‘Erfenis’ of ‘Schenking’ voor consistente output.");
    // For mixed, approximate as succession
    if (relation === "child") {
      allowance = 100000;
      taxable = Math.max(0, g - allowance);
      tax = progressiveTax(taxable, BRACKETS_LINE_DIRECT);
      return finalize();
    }
    if (relation === "married" || relation === "pacs") {
      allowance = g;
      taxable = 0;
      tax = 0;
      return finalize();
    }
    return finalize();

    function finalize() {
      return {
        allowance,
        taxable,
        tax,
        net: Math.max(0, g - tax),
        notes,
      };
    }
  }

  // Brackets (Service-Public): line directe (succession + donation enfant)
  const BRACKETS_LINE_DIRECT = [
    { upTo: 8072, rate: 0.05 },
    { upTo: 12109, rate: 0.10 },
    { upTo: 15932, rate: 0.15 },
    { upTo: 552324, rate: 0.20 },
    { upTo: 902838, rate: 0.30 },
    { upTo: 1805677, rate: 0.40 },
    { upTo: Infinity, rate: 0.45 },
  ];

  // Brackets donation between spouses/PACS (Service-Public F14203)
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
    render();
  }
  function next() {
    goTo(state.ui.stepIndex + 1);
  }
  function prev() {
    goTo(state.ui.stepIndex - 1);
  }

  // -------------------------
  // Export
  // -------------------------
  function exportJson() {
    computeReport();
    const payload = buildDossierPayload();

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    downloadBlob(blob, `dossier-erf-schenking-v01-${stamp()}.json`);
    elExportHint.textContent = "JSON geëxporteerd. Tip: upload dit bestand naar dossierfrankrijk.nl bij de betreffende cliënt/zaak.";
  }

  function exportHtmlReport() {
    computeReport();
    const html = buildHtmlReport();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    downloadBlob(blob, `rapport-erf-schenking-v01-${stamp()}.html`);
    elExportHint.textContent = "HTML-rapport geëxporteerd.";
  }

  function copySummary() {
    computeReport();
    const r = state.report;

    const lines = [];
    lines.push("Erf-/Schenkingsrecht NL/FR — samenvatting (V0.1)");
    lines.push(`Traject: ${labelMode(state.scenario.mode)}`);
    lines.push(`Netto massa: ${formatEUR(r.netEstate)}`);
    lines.push(`Relatie: ${labelRelation(state.family.relation)}`);
    lines.push(`Kinderen: ${toInt(state.family.childrenCount)}`);
    lines.push("");
    (r.rows || []).forEach((row) => {
      lines.push(`${row.person} (${row.relationLabel}): bruto ${formatEUR(row.gross)} | tax ${formatEUR(row.tax)} | netto ${formatEUR(row.net)}`);
    });
    lines.push("");
    lines.push("Bronnen: Service-Public (succession 31/07/2025; donation 07/11/2024); Service-Public PACS 27/01/2026; Légifrance art. 912; EUR-Lex 650/2012.");

    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      elExportHint.textContent = "Samenvatting gekopieerd.";
    }).catch(() => {
      elExportHint.textContent = "Kopiëren niet gelukt (browser).";
    });
  }

  function buildDossierPayload() {
    return {
      tool: "nlfr-erf-schenkingsrecht",
      version: state.meta.version,
      generatedAt: new Date().toISOString(),
      inputs: {
        family: state.family,
        anchors: state.anchors,
        estate: state.estate,
        scenario: state.scenario,
      },
      report: state.report,
      sources: Object.values(SOURCES),
      disclaimer:
        "V0.1: informatietool. Complexe situaties (internationaal, assurance-vie, stiefkinderen, grote vermogens) vereisen controle door notaris/fiscalist.",
    };
  }

  function buildHtmlReport() {
    const r = state.report;
    const rows = (r.rows || []).map((row) => {
      return `
        <tr>
          <td>${escapeHtml(row.person)}</td>
          <td>${escapeHtml(row.relationLabel)}</td>
          <td>${escapeHtml(formatEUR(row.gross))}</td>
          <td>${escapeHtml(formatEUR(row.allowance))}</td>
          <td>${escapeHtml(formatEUR(row.taxable))}</td>
          <td>${escapeHtml(formatEUR(row.tax))}</td>
          <td><strong>${escapeHtml(formatEUR(row.net))}</strong></td>
        </tr>
      `;
    }).join("");

    const sourcesHtml = Object.values(SOURCES).map((s) => {
      return `<li><strong>${escapeHtml(s.name)}</strong> — ${escapeHtml(s.date)} — <a href="${escapeAttr(s.url)}">${escapeHtml(s.url)}</a></li>`;
    }).join("");

    return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Rapport — Erf- & Schenkingsrecht NL/FR (V0.1)</title>
  <style>
    body{ font-family: Arial, sans-serif; color:#111; line-height:1.6; }
    h1,h2{ color:#800000; }
    table{ width:100%; border-collapse: collapse; font-size: 13px; }
    th,td{ border-bottom: 1px solid #ddd; padding: 8px 6px; text-align:left; }
    th{ background: #f6f6f6; }
    .muted{ color:#666; }
    .box{ border: 1px solid #ddd; border-radius: 10px; padding: 12px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>Rapport — Erf- &amp; Schenkingsrecht NL/FR (V0.1)</h1>
  <p class="muted">Gegenereerd: ${escapeHtml(new Date().toISOString())}</p>

  <div class="box">
    <h2>Input (samenvatting)</h2>
    <ul>
      <li>Traject: <strong>${escapeHtml(labelMode(state.scenario.mode))}</strong></li>
      <li>Relatie: <strong>${escapeHtml(labelRelation(state.family.relation))}</strong></li>
      <li>Kinderen: <strong>${escapeHtml(String(toInt(state.family.childrenCount)))}</strong></li>
      <li>Netto massa: <strong>${escapeHtml(formatEUR(r.netEstate))}</strong></li>
    </ul>
  </div>

  <div class="box">
    <h2>Resultaten</h2>
    <table>
      <thead>
        <tr>
          <th>Ontvanger</th><th>Relatie</th><th>Bruto</th><th>Abattement</th><th>Belastbaar</th><th>Belasting</th><th>Netto</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="box">
    <h2>Bronnen</h2>
    <ul>${sourcesHtml}</ul>
  </div>

  <p class="muted">
    Disclaimer: dit rapport is informatief. V0.1 rekent een basis-schatting op basis van publiek gepubliceerde barèmes/abattements.
    Bij internationale situaties en bijzondere vermogenscomponenten is notariële/fiscale controle noodzakelijk.
  </p>
</body>
</html>`;
  }

  function hardReset() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (_) { /* ignore */ }
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

  function downloadBlob(blob, filename) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
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

  function stamp() {
    const d = new Date();
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
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
    // basic attribute escaping
    return escapeHtml(s).replaceAll("`", "&#096;");
  }
})();
