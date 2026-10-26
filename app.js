/* Erf- & schenkingsrecht NL/FR, gids (V0.4.2)
   Minimal export upgrade:
   1) Data-contract (machine-readable JSON) + sourcesUsed subset
   2) Minimal export: Dossier (postMessage) + Print/PDF (window.print) via print-only report
*/

(function () {
  "use strict";

  // -------------------------
  // Sources (UI + referenties)
  // -------------------------
  const SOURCES = {
    sp_succession_2025: {
      id: "sp_succession_2025",
      name: "Service-Public, droits de succession",
      short: "Service-Public, droits de succession (F35794)",
      date: "Vérifié le 19 août 2026 (F35794)",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F35794",
    },
    sp_donation_2024: {
      id: "sp_donation_2024",
      name: "Service-Public, droits de donation",
      short: "Service-Public, droits de donation (F14203)",
      date: "Vérifié le 13 mai 2026 (F14203)",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14203",
    },
    sp_pacs_2026: {
      id: "sp_pacs_2026",
      name: "Service-Public, effets d'un PACS",
      short: "Service-Public, effets d'un PACS (F1026)",
      date: "Vérifié le 27 janvier 2026 (F1026)",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1026",
    },
    impots_don_enfant_2025: {
      id: "impots_don_enfant_2025",
      name: "impots.gouv.fr, que puis-je donner à mes enfants sans payer de droits",
      short: "impots.gouv.fr, donner à ses enfants",
      date: "18 Dec 2025",
      url: "https://www.impots.gouv.fr/particulier/questions/que-puis-je-donner-mes-enfants-petits-enfants-sans-avoir-payer-de-droits",
    },
    legi_cc_912: {
      id: "legi_cc_912",
      name: "Légifrance, Code civil, art. 912 (réserve/quotité)",
      short: "Code civil art. 912",
      date: "Version en vigueur depuis le 01 janvier 2007",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006435530",
    },
    legi_cc_913: {
      id: "legi_cc_913",
      name: "Légifrance, Code civil, art. 913",
      short: "Code civil art. 913",
      date: "Version en vigueur depuis le 01 novembre 2021",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043982288",
    },
    cgi_750ter: {
      id: "cgi_750ter",
      name: "Légifrance, CGI art. 750 ter (territorialiteit)",
      short: "CGI art. 750 ter (territorialiteit)",
      date: "Versie van 31 juli 2011",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024453202",
    },
    cgi_764bis: {
      id: "cgi_764bis",
      name: "Légifrance, CGI art. 764 bis (aftrek hoofdwoning)",
      short: "CGI art. 764 bis (aftrek hoofdwoning)",
      date: "Versie van 1 januari 2005",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006305387",
    },
    cgi_775: {
      id: "cgi_775",
      name: "Légifrance, CGI art. 775 (begrafeniskosten)",
      short: "CGI art. 775 (begrafeniskosten)",
      date: "Versie van 1 januari 2003",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006305398",
    },
    sw_3: {
      id: "sw_3",
      name: "wetten.overheid.nl, Successiewet 1956, art. 3 (fictieve woonplaats)",
      short: "Successiewet 1956 art. 3",
      date: "Geldend op 1 januari 2026",
      url: "https://wetten.overheid.nl/BWBR0002226/2026-01-01",
    },
    cgi_777: {
      id: "cgi_777",
      name: "Légifrance, CGI art. 777 (tarieven)",
      short: "CGI art. 777 (tarieven)",
      date: "Versie van 30 december 2014",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000030061736",
    },
    cgi_779: {
      id: "cgi_779",
      name: "Légifrance, CGI art. 779 (aftrek)",
      short: "CGI art. 779 (aftrek)",
      date: "Versie van 1 januari 2013",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026292566",
    },
    cgi_784: {
      id: "cgi_784",
      name: "Légifrance, CGI art. 784 (rappel fiscal, 15 jaar)",
      short: "CGI art. 784 (15 jaar)",
      date: "Versie van 1 januari 2017",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033809289",
    },
    cgi_790g: {
      id: "cgi_790g",
      name: "Légifrance, CGI art. 790 G (don familial)",
      short: "CGI art. 790 G (geldschenking)",
      date: "Versie van 31 december 2023",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048838931",
    },
    cgi_790abis: {
      id: "cgi_790abis",
      name: "Légifrance, CGI art. 790 A bis (tijdelijke vrijstelling)",
      short: "CGI art. 790 A bis",
      date: "Geldende versie op 18 oktober 2026, van toepassing tot 31 december 2026",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051203670",
    },
    sp_790abis: {
      id: "sp_790abis",
      name: "Service-Public, don exceptionnel (F10203)",
      short: "Service-Public, tijdelijke vrijstelling (F10203)",
      date: "Vérifié le 1 janvier 2026 (F10203)",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10203",
    },
    cgi_788: {
      id: "cgi_788",
      name: "Légifrance, CGI art. 788 IV (aftrek bij overlijden)",
      short: "CGI art. 788 IV",
      date: "Versie van 1 augustus 2020",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042194220",
    },
    cgi_790e: {
      id: "cgi_790e",
      name: "Légifrance, CGI art. 790 E (schenking aan echtgenoot)",
      short: "CGI art. 790 E",
      date: "Geldende versie op 18 oktober 2026",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026292592",
    },
    cgi_790f: {
      id: "cgi_790f",
      name: "Légifrance, CGI art. 790 F (schenking aan PACS-partner)",
      short: "CGI art. 790 F",
      date: "Geldende versie op 18 oktober 2026",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026292590",
    },
    cgi_786: {
      id: "cgi_786",
      name: "Légifrance, CGI art. 786 (adoptie)",
      short: "CGI art. 786 (adoptie)",
      date: "Versie van 1 juli 2026",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000054373359",
    },
    eurlex_650_2012: {
      id: "eurlex_650_2012",
      name: "EUR-Lex, règlement (UE) n°650/2012 (successions)",
      short: "Verordening EU 650/2012",
      date: "04 July 2012",
      url: "https://eur-lex.europa.eu/eli/reg/2012/650/oj/?locale=FR",
    },
  };

  // -------------------------
  // Barèmes (Service-Public) — MUST be defined BEFORE any compute calls
  // -------------------------
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

  const BRACKETS_FLAT_60 = [{ upTo: Infinity, rate: 0.6 }];
  const DON_FAMILIAL_MAX = 31865; // CGI 790 G
  const ALLOWANCE_CHILD = 100000; // CGI 779 I
  const ALLOWANCE_SPOUSE_DONATION = 80724; // CGI 790 E/F
  const ALLOWANCE_DEATH_NONRELATIVE = 1594; // CGI 788 IV
  const DONOR_MAX_AGE = 80; // CGI 790 G I 1°
  const RAPPEL_YEARS = 15; // CGI 784
  const FORFAIT_BEGRAFENIS = 1500; // CGI 775: vast bedrag voor begrafeniskosten, van het actief af te trekken (bron: legifrance.gouv.fr, LEGIARTI000006305398)
  const ABATTEMENT_HOOFDWONING = 0.2; // CGI 764 bis: 20 % van de waarde van de hoofdwoning bij overlijden (LEGIARTI000006305387)
  const TERRITORIAL_YEARS_NEEDED = 6; // CGI 750 ter 3°: verkrijger fiscaal inwoner van Frankrijk ten minste 6 van de laatste 10 jaar (LEGIARTI000024453202)

  // Peil: het parameterregister van Communities Abroad (privé). De waarden staan als kopie in peil/waarden.json, bijgewerkt door de Peil-agent; tests/peil.test.mjs bewaakt dat de bedragen hierboven daarmee overeenkomen.
  // Bij elke controle alleen PEIL_STAND aanpassen (en peil/waarden.json).
  const PEIL_STAND = "2026-10-20";
  // Schakelaar voor het Peil-label (korte regel, markdown-regel en voettekstalinea). Zolang false toont de tool niets over Peil.
  const PEIL_LABEL_AAN = true;
  const PEIL_UITLEG_URL = "https://infofrankrijk.com/ons-manifest-hoe-wij-werken/";
  // Toolkaart van deze tool; de Peil-stempel linkt hiernaartoe (het manifest blijft de link in de voettekstalinea).
  const PEIL_KAART_URL = "https://communitiesabroad.com/manifest/tool/erf-en-schenkingsrecht-nl-fr";
  const MAANDEN_NL = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  function peilStandNl() {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(PEIL_STAND);
    return m ? `${parseInt(m[3], 10)} ${MAANDEN_NL[parseInt(m[2], 10) - 1]} ${m[1]}` : PEIL_STAND;
  }
  const PEIL_MERK = `<span class="peil-merk" aria-hidden="true">&#10003;</span>`;
  const MAANDEN_KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  function peilStandKort() {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(PEIL_STAND);
    return m ? `${parseInt(m[3], 10)} ${MAANDEN_KORT[parseInt(m[2], 10) - 1]} ${m[1]}` : PEIL_STAND;
  }
  // Voorbehoud direct onder de uitkomsttabel (zelfde tekst als in de voettekst); de stempel komt daarna.
  const VOORBEHOUD_TEKST = "dit is een educatieve scenario-tool. Bij internationale situaties, bijzondere vermogenscomponenten en/of grote bedragen hoort controle door notaris/fiscalist.";
  function voorbehoudHtml() {
    return `<p class="voorbehoud"><strong>Let op:</strong> ${VOORBEHOUD_TEKST}</p>`;
  }
  // Compacte stempelknop: merkteken met dubbele ring en vinkje, twee korte regels, het geheel is één link naar het manifest.
  function peilRegelHtml() {
    if (!PEIL_LABEL_AAN) return "";
    const aria = `Bedragen gecontroleerd tegen Peil, stand ${peilStandNl()}, bekijk wat er gecontroleerd is`;
    return `<div class="peil-stempel-rij"><a class="peil-stempel" href="${PEIL_KAART_URL}" target="_blank" rel="noopener" aria-label="${escapeHtml(aria)}"><svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="18.5" fill="#fff" stroke="#800000" stroke-width="1.6"/><circle cx="20" cy="20" r="14.5" fill="none" stroke="#800000" stroke-width="1"/><path d="M13.5 20.5 L18 25 L26.5 15.5" fill="none" stroke="#800000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="peil-stempel__tk" aria-hidden="true"><span class="peil-stempel__t1">Gecontroleerd tegen Peil</span><span class="peil-stempel__t2">stand ${escapeHtml(peilStandKort())}<span class="peil-pijl" aria-hidden="true">&#8599;</span></span></span></a></div>`;
  }
  function peilRegelMd() {
    if (!PEIL_LABEL_AAN) return "";
    return `[Bedragen gecontroleerd tegen Peil, stand ${peilStandNl()}](${PEIL_UITLEG_URL})`;
  }
  function peilVoetHtml() {
    if (!PEIL_LABEL_AAN) return "";
    return `${PEIL_MERK}<strong>Over de bedragen in deze tool.</strong> Alle wettelijke tarieven, bedragen en grenzen komen uit Peil, het register waarin wij deze gegevens bijhouden. Elk daarvan is gecontroleerd bij de officiële bron, de laatste controle was op ${escapeHtml(peilStandNl())}. Waar de tool met een aanname of schatting rekent, staat dat bij de uitkomst. <a href="${PEIL_UITLEG_URL}" target="_blank" rel="noopener">Lees in ons manifest hoe wij werken</a>`;
  }
  { const voet = document.getElementById("peilVoet"); if (voet) { voet.innerHTML = peilVoetHtml(); voet.hidden = !PEIL_LABEL_AAN; } }

  // -------------------------
  // Storage / State
  // -------------------------
  const STORAGE_KEY = "nlfr_erf_schenk_v02";

  const DEFAULT_STATE = {
    meta: {
      version: "0.4.2",
      stateVersion: 2,
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
      stepchildrenCount: 1, // alleen van belang als hasStepchildren aan staat
      adoptedSimpleCount: 0, // aantal adoptiekinderen met adoption simple (0 = alles plénière)
    },

    anchors: {
      habitualResidenceAtDeath: "fr", // fr | nl | other
      nationality: "nl", // nl | fr | other
      mainAssetsLocation: "fr", // fr | nl | mixed
      recipientFrResident: "yes", // yes | no: verkrijger fiscaal inwoner van Frankrijk, ten minste 6 van de laatste 10 jaar (art. 750 ter CGI)
      frAssetsPct: 50, // bij gemengd vermogen: deel dat in Frankrijk ligt (%)
      leftNlSince: "lt10", // lt1 | lt10 | gte10: vertrek uit Nederland minder dan 1 jaar, minder dan 10 jaar of 10 jaar of langer geleden
    },

    estate: {
      assetsTotal: 533000,
      debtsTotal: 50000,
      includesMainHome: true,
      mainHomeValue: 250000, // waarde van de hoofdwoning (art. 764 bis CGI), alleen bij overlijden
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
      donor: "one", // one | both (alleen bij schenking)
      donorSplitPct: 50, // aandeel van ouder 1 bij beide ouders
      donorAge: 65,
      donor2Age: 65,
      recipientStatus: "adult", // adult | emancipated | minor
      cashAmount: null, // bedrag dat als geld wordt geschonken; null = alles
      priorChildGifts: 0, // TOTAAL eerder per kind en per schenker geschonken (15 jaar), inclusief het 790 G-deel
      priorChild790G: 0, // waarvan eerder als vrijgestelde geldschenking 790 G (deel van het totaal hierboven)
      priorPartnerGifts: 0,
    },

    report: {},
    ui: { stepIndex: 0 },
  };

  // Voegt ontbrekende velden uit de standaardwaarden toe aan een opgeslagen state (oudere versies).
  function mergeDefaults(def, loaded) {
    if (!loaded || typeof loaded !== "object") return def;
    const out = Object.assign({}, loaded);
    Object.keys(def).forEach((k) => {
      const dv = def[k];
      const lv = loaded[k];
      if (lv === undefined) out[k] = dv;
      else if (dv && typeof dv === "object" && !Array.isArray(dv) && lv && typeof lv === "object") out[k] = mergeDefaults(dv, lv);
    });
    return out;
  }

  const state = (function init() {
    const loaded = loadState();
    const merged = mergeDefaults(DEFAULT_STATE, loaded);
    if (loaded && loaded.scenario && loaded.scenario.recipientStatus === undefined && loaded.family && loaded.family.hasMinorChildren) {
      merged.scenario.recipientStatus = "minor";
    }
    // Stateversie 2: veld "eerder geschonken" is het totaal, veld "waarvan 790 G" een deel daarvan.
    // In opgeslagen state van voor versie 2 waren de velden los: tel ze dan eenmalig op.
    const oldStateVersion = loaded && loaded.meta && loaded.meta.stateVersion ? loaded.meta.stateVersion : 1;
    if (loaded && oldStateVersion < 2) {
      const a = Math.max(0, Number(merged.scenario.priorChildGifts) || 0);
      const b = Math.max(0, Number(merged.scenario.priorChild790G) || 0);
      if (b > a) merged.scenario.priorChildGifts = a + b;
    }
    merged.meta.stateVersion = 2;
    merged.meta.version = "0.4.2";
    return merged;
  })();

  // -------------------------
  // Steps
  // -------------------------
  const STEPS = [
    { key: "family", title: "1. Gezin" },
    { key: "anchors", title: "2. Woon- en aanknopingspunten" },
    { key: "estate", title: "3. Vermogen (indicatief)" },
    { key: "will", title: "4. Wensen en testament" },
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
    renderCalcExplain();
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
      <p class="muted">De tool modelleert partner en kinderen (indicatief). Stiefkinderen en adoptiekinderen worden fiscaal apart behandeld; complexe gezinnen geven extra waarschuwingen (geen harde civielrechtelijke berekening).</p>

      <div class="form">
        <div class="field">
          <label>Relatievorm</label>
          <select id="relation">
            <option value="married">Gehuwd</option>
            <option value="pacs">PACS</option>
            <option value="cohab">Samenwonend (concubinage)</option>
            <option value="single">Geen partner</option>
          </select>
          <div class="help">Belangrijk voor de fiscale behandeling. Bij PACS of samenwonen erft uw partner civielrechtelijk niets zonder testament; samenwonenden betalen 60 % belasting.</div>
        </div>

        <div class="field">
          <label>Aantal kinderen</label>
          <input id="childrenCount" type="number" min="0" step="1" />
          <div class="help">Het kinderdeel wordt gelijk verdeeld over alle kinderen (stief- en adoptiekinderen meegeteld).</div>
        </div>

        <div class="field">
          <label><input id="hasChildrenFromEarlierRelationship" type="checkbox" /> Kinderen uit eerdere relatie(s)</label>
          <div class="help">Geeft extra waarschuwingen (voorbehouden erfdeel, stiefdynamiek).</div>
        </div>

        <div class="field">
          <label><input id="hasStepchildren" type="checkbox" /> Stiefkinderen aanwezig (kinderen van de partner, niet geadopteerd)</label>
          <div class="help">Fiscaal niet-verwant: 60 % belasting, zonder aftrek bij schenking en met 1.594 euro aftrek bij overlijden, tenzij geadopteerd.</div>
          ${
            state.family.hasStepchildren
              ? `<label style="margin-top:8px;">Hoeveel van de kinderen zijn stiefkind? <input id="stepchildrenCount" type="number" min="1" step="1" /></label>`
              : ``
          }
        </div>

        <div class="field">
          <label><input id="hasAdoptedChildren" type="checkbox" /> Adoptiekinderen aanwezig</label>
          <div class="help">Adoption plénière telt als eigen kind. Bij adoption simple geldt de rechte lijn alleen in de gevallen van art. 786 CGI; die gevallen rekent de tool niet door.</div>
          ${
            state.family.hasAdoptedChildren
              ? `<label style="margin-top:8px;">Hoeveel van de kinderen zijn geadopteerd met adoption simple? <input id="adoptedSimpleCount" type="number" min="0" step="1" /></label>`
              : ``
          }
        </div>

        <div class="field">
          <label><input id="hasMinorChildren" type="checkbox" /> Minderjarige kinderen</label>
          <div class="help">Raakt voogdij, bewind en executeur. Bij een geldschenking (art. 790 G) telt meerderjarigheid van de ontvanger.</div>
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
    if (document.getElementById("stepchildrenCount")) {
      bindAmount("stepchildrenCount", state.family.stepchildrenCount, 1, 20, (v) => (state.family.stepchildrenCount = v));
    }
    if (document.getElementById("adoptedSimpleCount")) {
      bindAmount("adoptedSimpleCount", state.family.adoptedSimpleCount, 0, 20, (v) => (state.family.adoptedSimpleCount = v));
    }

    document.getElementById("next").addEventListener("click", () => next());
  }

  // -------------------------
  // Step 2: Anchors
  // -------------------------
  function renderAnchors() {
    elPanel.innerHTML = `
      <h2>Woon- en aanknopingspunten (juridische laag)</h2>
      <p class="muted">De tool rekent primair de Franse schenk- en erfbelasting (indicatief). Aanknopingspunten zijn nodig voor EU 650/2012-context (toepasselijk erfrecht ≠ belasting).</p>

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
          ${state.anchors.mainAssetsLocation === "mixed" ? "" : `<div class="help">Bij “voornamelijk” rekent de tool met alles in dat land. Kies Gemengd om het Franse deel zelf op te geven.</div>`}
        </div>

        ${
          state.anchors.mainAssetsLocation === "mixed" && territorialRestricted()
            ? `<div class="field">
          <label>Welk deel van de bezittingen ligt in Frankrijk? <strong><span id="frAssetsLbl"></span></strong></label>
          <input id="frAssetsPct" type="range" min="0" max="100" step="5" />
          <div class="help">Alleen dit deel is in Frankrijk belastbaar (art. 750 ter CGI).</div>
        </div>`
            : ""
        }

        ${
          state.anchors.habitualResidenceAtDeath !== "fr"
            ? `<div class="field">
          <label>Is de erfgenaam of ontvanger fiscaal inwoner van Frankrijk, en was dat ten minste 6 van de laatste 10 jaar?</label>
          <select id="recipientFrResident">
            <option value="yes">Ja</option>
            <option value="no">Nee</option>
          </select>
          <div class="help">Woonde de overledene of schenker niet in Frankrijk? Dan heft Frankrijk alleen over Franse goederen, tenzij de verkrijger zo lang in Frankrijk woont (art. 750 ter CGI).</div>
        </div>`
            : ""
        }

        ${
          state.anchors.habitualResidenceAtDeath !== "nl"
            ? `<div class="field">
          <label>Wanneer bent u (overledene of schenker) uit Nederland vertrokken?</label>
          <select id="leftNlSince">
            <option value="lt1">Minder dan 1 jaar geleden</option>
            <option value="lt10">1 tot 10 jaar geleden</option>
            <option value="gte10">10 jaar of langer geleden, of nooit in Nederland gewoond</option>
          </select>
          <div class="help">Nederland blijft na vertrek nog heffen: tot 10 jaar bij Nederlanders (art. 3 Successiewet 1956), tot 1 jaar bij schenkingen door ieder die in Nederland woonde.</div>
        </div>`
            : ""
        }
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
    if (document.getElementById("recipientFrResident")) bindSelect("recipientFrResident", state.anchors.recipientFrResident, (v) => (state.anchors.recipientFrResident = v));
    if (document.getElementById("leftNlSince")) bindSelect("leftNlSince", state.anchors.leftNlSince, (v) => (state.anchors.leftNlSince = v));
    if (document.getElementById("frAssetsPct")) {
      const el = document.getElementById("frAssetsPct");
      const lbl = document.getElementById("frAssetsLbl");
      el.value = String(clampInt(state.anchors.frAssetsPct, 0, 100));
      lbl.textContent = `${clampInt(state.anchors.frAssetsPct, 0, 100)} %`;
      el.addEventListener("input", () => {
        state.anchors.frAssetsPct = clampInt(el.value, 0, 100);
        lbl.textContent = `${state.anchors.frAssetsPct} %`;
        render();
      });
    }

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  // -------------------------
  // Step 3: Estate
  // -------------------------
  function renderEstate() {
    const net = calcNetEstate();
    const isDonation = state.scenario.mode === "donation";

    elPanel.innerHTML = `
      <h2>Vermogen (indicatief)</h2>
      <p class="muted">
        Schuifregelaars voor educatieve scenario’s. ${
          isDonation
            ? "Bij een schenking is de grondslag het geschonken bedrag; schulden van de schenker verlagen dat niet."
            : `Netto massa = bezittingen min schulden, min het vaste bedrag van ${formatEUR(FORFAIT_BEGRAFENIS)} voor begrafeniskosten (art. 775 CGI).`
        }
        Detailklassen (assurance-vie, SCI, onderneming, buitenlandse bezittingen) zijn waarschuwingen en worden niet doorgerekend.
      </p>

      <div class="form">
        <div class="field">
          <label>${isDonation ? "Bedrag van de schenking" : "Totaal bezittingen"}: <strong><span id="assetsLbl"></span></strong></label>
          <input id="assetsTotal" type="range" min="0" max="5000000" step="1000" />
          <div class="help">Indicatief. Je kunt later verfijnen met notaris/fiscalist.</div>
        </div>

        ${
          isDonation
            ? ""
            : `<div class="field">
          <label>Totaal schulden: <strong><span id="debtsLbl"></span></strong></label>
          <input id="debtsTotal" type="range" min="0" max="2000000" step="1000" />
        </div>

        <div class="field">
          <label><input id="includesMainHome" type="checkbox" /> Hoofdwoning/woonhuis in massa</label>
          <div class="help">Was de woning ook de hoofdverblijfplaats van de langstlevende echtgenoot of PACS-partner, of van een minderjarig of beschermd kind? Dan geldt een aftrek van 20 % van de waarde (art. 764 bis CGI).</div>
        </div>

        ${
          state.estate.includesMainHome
            ? `<div class="field">
          <label>Waarde van de hoofdwoning: <strong><span id="homeLbl"></span></strong></label>
          <input id="mainHomeValue" type="range" min="0" max="3000000" step="5000" />
        </div>`
            : ""
        }`
        }

        <div class="field">
          <label><input id="includesLifeInsurance" type="checkbox" /> Assurance-vie aanwezig</label>
          <div class="help">Eigen regime, niet betrouwbaar doorgerekend.</div>
        </div>

        <div class="field">
          <label><input id="includesBusiness" type="checkbox" /> Onderneming/bedrijf(sopvolging) relevant</label>
          <div class="help">Niet doorgerekend; alleen route-waarschuwingen.</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__item">
          <strong>Netto massa (indicatief)</strong>
          <span id="netEstate">${formatEUR(net)}</span>
        </div>
        <div class="kpi__item">
          <strong>Wat de tool wel rekent</strong>
          <span>Franse schenk- en erfbelasting voor partner en kinderen (indicatief), met geldschenking en eerdere schenkingen, plus vergelijking met de gunstigste verdeling</span>
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
    assetsLbl.textContent = formatEUR(state.estate.assetsTotal);
    if (debtsEl) {
      debtsEl.value = String(toInt(state.estate.debtsTotal));
      debtsLbl.textContent = formatEUR(state.estate.debtsTotal);
    }

    assetsEl.addEventListener("input", () => {
      state.estate.assetsTotal = clampInt(assetsEl.value, 0, 5000000);
      assetsLbl.textContent = formatEUR(state.estate.assetsTotal);
      netLbl.textContent = formatEUR(calcNetEstate());
      render();
    });

    if (debtsEl) {
      debtsEl.addEventListener("input", () => {
        state.estate.debtsTotal = clampInt(debtsEl.value, 0, 2000000);
        debtsLbl.textContent = formatEUR(state.estate.debtsTotal);
        netLbl.textContent = formatEUR(calcNetEstate());
        render();
      });
    }

    if (document.getElementById("includesMainHome")) {
      bindCheckbox("includesMainHome", state.estate.includesMainHome, (v) => (state.estate.includesMainHome = v));
    }
    const homeEl = document.getElementById("mainHomeValue");
    if (homeEl) {
      const homeLbl = document.getElementById("homeLbl");
      homeEl.value = String(toInt(state.estate.mainHomeValue));
      homeLbl.textContent = formatEUR(state.estate.mainHomeValue);
      homeEl.addEventListener("input", () => {
        state.estate.mainHomeValue = clampInt(homeEl.value, 0, 3000000);
        homeLbl.textContent = formatEUR(state.estate.mainHomeValue);
        netLbl.textContent = formatEUR(calcNetEstate());
        render();
      });
    }
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
      <h2>Wensen en testament</h2>
      <p class="muted">
        De tool gebruikt dit om te bepalen wat u <em>beoogt</em> (wensen) en welke juridische route waarschijnlijk nodig is.
        Let op: EU 650/2012 gaat over toepasselijk erfrecht, niet over belasting.
      </p>

      <h3>Testamentkeuze</h3>
      <div class="form">
        <div class="field">
          <label>Welke situatie benadert uw keuze?</label>
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
          <div class="help">De tool registreert dit en waarschuwt; civielrechtelijke uitwerking blijft notariswerk.</div>
        </div>

        <div class="field">
          <label><input id="wantsEuropeanCertificate" type="checkbox" /> Europese verklaring van erfrecht (EVE) relevant (na overlijden)</label>
          <div class="help">Dit is een document in de afwikkeling (art. 62 e.v.), niet iets dat je “nu” als testament opstelt.</div>
        </div>
      </div>

      <hr />

      <h3>Wensen</h3>
      <p class="muted">Gebaseerd op de notarisvragenlijst: wat wilt u in hoofdlijnen bereiken?</p>

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
    const sc = state.scenario;
    const isDonation = sc.mode === "donation";
    const kids = toInt(state.family.childrenCount);
    const hasPartner = hasPartnerInFamily();
    const canChooseDonor = isDonation && hasPartner && kids > 0;
    const both = effectiveDonors().length > 1;
    const hideSliders = both || !hasPartner || kids === 0;
    const cashOn = isDonation && sc.donationType === "cash_gift_31865";
    const showChildPriors = kids > 0;
    const showPartnerPriors = isDonation && (state.family.relation === "married" || state.family.relation === "pacs");

    const donHtml = isDonation
      ? `
      <div class="field">
        <label>Schenking-type</label>
        <select id="donationType">
          <option value="standard">Standaard schenking</option>
          <option value="cash_gift_31865">Geldschenking met extra vrijstelling (art. 790 G, 31.865 euro)</option>
        </select>
        <div class="help">De vrijstelling geldt alleen voor het deel dat in geld wordt geschonken, aan een meerderjarige (of geëmancipeerde) ontvanger die kind, kleinkind of achterkleinkind van een schenker onder de 80 jaar is. Een neef of nicht (bij plaatsvervulling een achterneef of achternicht) komt alleen in aanmerking als de schenker geen afstammelingen heeft; de tool rekent dat niet door.</div>
      </div>
      ${
        canChooseDonor
          ? `<div class="field">
        <label>Wie schenkt?</label>
        <select id="donor">
          <option value="one">Eén ouder</option>
          <option value="both">Beide ouders</option>
        </select>
        <div class="help">${state.family.relation === "married" ? "50/50 geldt bij gemeenschap van goederen als beide ouders schenken. Bij eigen vermogen van één ouder, of als de ander alleen toestemming geeft: kies “Eén ouder”." : "Bij PACS of samenwonen schenkt ieder uit eigen vermogen: vul in wat ieder werkelijk geeft."} Bij beide ouders ontvangt alleen het kind of de kinderen; de partner is dan zelf schenker. Bij een stiefkind is ouder 1 de stiefouder en ouder 2 de eigen ouder.</div>
      </div>`
          : ``
      }
      ${
        both
          ? `<div class="field">
        <label>Verdeling over de ouders: ouder 1 schenkt <strong><span id="splitLbl">${toInt(sc.donorSplitPct)}</span>%</strong>, ouder 2 de rest</label>
        <input id="donorSplitPct" type="number" min="0" max="100" step="1" />
        <div class="help">Standaard 50/50. Kies een andere verdeling bij ongelijke eigendom, bijvoorbeeld 70/30.</div>
      </div>`
          : ``
      }
      <div class="field">
        <label>${both ? "Leeftijd ouder 1" : "Leeftijd schenker"}</label>
        <input id="donorAge" type="number" min="0" max="120" step="1" />
      </div>
      ${
        both
          ? `<div class="field"><label>Leeftijd ouder 2</label><input id="donor2Age" type="number" min="0" max="120" step="1" /></div>`
          : ``
      }
      ${
        cashOn
          ? `<div class="field">
        <label>Bedrag dat als geld wordt geschonken (totaal, in euro)</label>
        <input id="cashAmount" type="number" min="0" step="1000" placeholder="leeg is de hele schenking" />
        <div class="help">Per overschrijving, cheque, postwissel of contant. Vastgoed en effecten tellen niet mee. Laat leeg als de hele schenking in geld is.</div>
      </div>
      <div class="field">
        <label>Is het kind meerderjarig?</label>
        <select id="recipientStatus">
          <option value="adult">Ja, meerderjarig</option>
          <option value="emancipated">Minderjarig, maar geëmancipeerd (bijvoorbeeld gehuwd)</option>
          <option value="minor">Minderjarig en niet geëmancipeerd</option>
        </select>
        <div class="help">Geldt voor alle kinderen. Zijn er meerderjarige en minderjarige kinderen, reken dan de groepen apart door.</div>
      </div>
      ${renderDonChecklist()}`
          : ``
      }`
      : ``;

    const priorHtml =
      showChildPriors || showPartnerPriors
        ? `
      <hr />
      <h3>Eerdere schenkingen (laatste 15 jaar)</h3>
      <p class="muted">Een eerdere schenking van dezelfde schenker aan dezelfde ontvanger, van minder dan 15 jaar geleden, telt mee (art. 784 CGI): de aftrek is dan al deels gebruikt en de belasting begint in een hogere schijf. Schenkingen van 15 jaar of langer geleden telt u niet mee.</p>
      <div class="form">
        ${
          showChildPriors
            ? `<div class="field">
          <label>Hoeveel heeft deze schenker in de afgelopen 15 jaar in totaal al aan elk kind geschonken? (bedrag per schenker per kind, inclusief het vrijgestelde deel hieronder)</label>
          <input id="priorChildGifts" type="number" min="0" step="1000" />
        </div>
        <div class="field">
          <label>Waarvan als vrijgestelde geldschenking (maximaal € 31.865)</label>
          <input id="priorChild790G" type="number" min="0" step="1000" />
          <div class="help">Toelichting: een vrijgestelde geldschenking (art. 790 G) telt niet mee voor de aftrek, maar wel voor het plafond van 31.865 euro. Een bedrag boven dat plafond telt als gewone schenking. Dit bedrag is een deel van het totaal hierboven; tel het dus niet nog eens op.</div>
        </div>`
            : ``
        }
        ${
          showPartnerPriors
            ? `<div class="field">
          <label>Eerder geschonken aan de partner (in euro)</label>
          <input id="priorPartnerGifts" type="number" min="0" step="1000" />
        </div>`
            : ``
        }
      </div>`
        : ``;

    elPanel.innerHTML = `
      <h2>Scenario: koude hand of warme hand</h2>
      <p class="muted">
        De tool rekent de Franse heffing voor partner en kinderen en toont de nominale impact.
        “100.000 euro per kind per ouder per 15 jaar” is opgenomen als uitgangspunt.
      </p>

      <div class="form">
        <div class="field">
          <label>Traject</label>
          <select id="mode">
            <option value="succession">Erfenis (koude hand)</option>
            <option value="donation">Schenking (warme hand)</option>
          </select>
        </div>
        ${donHtml}
      </div>

      ${priorHtml}

      <hr />

      <h3>Verdeling (% van de netto massa)</h3>
      <p class="muted">
        De schuifregelaars tonen uw <em>gewenste</em> verdeling. Civielrechtelijke beperkingen (voorbehouden erfdeel, rechten van de partner) worden niet afgedwongen, maar wel gesignaleerd.
      </p>
      ${
        hideSliders
          ? `<p class="muted">${
              both
                ? "Bij beide ouders als schenker is de partner zelf schenker; de kinderen ontvangen dan alles, dus er is geen verdeling te kiezen."
                : !hasPartner
                ? "Zonder partner gaat alles naar de kinderen, dus er is geen verdeling te kiezen."
                : "Zonder kinderen gaat alles naar de partner, dus er is geen verdeling te kiezen."
            }</p>`
          : ``
      }

      <div class="form" ${hideSliders ? "hidden" : ""}>
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

    bindSelect("mode", sc.mode, (v) => (sc.mode = v));
    if (document.getElementById("donationType")) bindSelect("donationType", sc.donationType, (v) => (sc.donationType = v));
    if (document.getElementById("donor")) bindSelect("donor", sc.donor, (v) => (sc.donor = v));
    if (document.getElementById("recipientStatus")) bindSelect("recipientStatus", sc.recipientStatus, (v) => (sc.recipientStatus = v));
    if (document.getElementById("donorSplitPct")) bindAmount("donorSplitPct", sc.donorSplitPct, 0, 100, (v) => (sc.donorSplitPct = v));
    if (document.getElementById("donorAge")) bindAmount("donorAge", sc.donorAge, 0, 120, (v) => (sc.donorAge = v));
    if (document.getElementById("donor2Age")) bindAmount("donor2Age", sc.donor2Age, 0, 120, (v) => (sc.donor2Age = v));
    if (document.getElementById("cashAmount")) bindAmount("cashAmount", sc.cashAmount, 0, 1e9, (v) => (sc.cashAmount = v), true);
    if (document.getElementById("priorChildGifts")) bindAmount("priorChildGifts", sc.priorChildGifts, 0, 1e9, (v) => (sc.priorChildGifts = v));
    if (document.getElementById("priorChild790G")) bindAmount("priorChild790G", sc.priorChild790G, 0, 1e9, (v) => (sc.priorChild790G = v));
    if (document.getElementById("priorPartnerGifts")) bindAmount("priorPartnerGifts", sc.priorPartnerGifts, 0, 1e9, (v) => (sc.priorPartnerGifts = v));

    const p = document.getElementById("allocateToPartnerPct");
    const c = document.getElementById("allocateToChildrenPct");
    const pPct = document.getElementById("pPct");
    const cPct = document.getElementById("cPct");

    p.value = String(sc.allocateToPartnerPct);
    c.value = String(sc.allocateToChildrenPct);
    pPct.textContent = String(sc.allocateToPartnerPct);
    cPct.textContent = String(sc.allocateToChildrenPct);

    p.addEventListener("input", () => {
      const pv = clampInt(p.value, 0, 100);
      const cv = 100 - pv;
      sc.allocateToPartnerPct = pv;
      sc.allocateToChildrenPct = cv;
      c.value = String(cv);
      pPct.textContent = String(pv);
      cPct.textContent = String(cv);
      render();
    });

    c.addEventListener("input", () => {
      const cv = clampInt(c.value, 0, 100);
      const pv = 100 - cv;
      sc.allocateToChildrenPct = cv;
      sc.allocateToPartnerPct = pv;
      p.value = String(pv);
      pPct.textContent = String(pv);
      cPct.textContent = String(cv);
      render();
    });

    document.getElementById("prev").addEventListener("click", () => prev());
    document.getElementById("next").addEventListener("click", () => next());
  }

  // Vinkjes voor de voorwaarden van de geldschenking (art. 790 G).
  function renderDonChecklist() {
    const info = describeDonFamilial();
    if (!info) return "";
    const blocks = info
      .map((d) => {
        const items = d.checks.map((c) => `<li>${c.ok ? "✓" : "✗"} ${escapeHtml(c.label)}</li>`).join("");
        const head = info.length > 1 ? `<div><strong>${escapeHtml(d.donor)}</strong></div>` : "";
        const verdict = d.eligible
          ? `<div class="tiny">Vrijstelling van toepassing op het geldbedrag.</div>`
          : `<div class="tiny"><strong>Geen vrijstelling voor geldschenking:</strong> ${escapeHtml(d.reason)}.</div>`;
        return `${head}<ul class="nlfr-mini-list" style="list-style:none;margin-left:0;">${items}</ul>${verdict}`;
      })
      .join("");
    return `<div class="nudge"><div class="nudge__title"><strong>Voorwaarden geldschenking (art. 790 G)</strong></div><div class="nudge__body">${blocks}<div class="tiny muted" style="margin-top:6px;">${escapeHtml(
      info[0].notChecked[0]
    )}</div></div></div>`;
  }

  // -------------------------
  // Step 6: Report
  // -------------------------
  function renderReport() {
    computeReport();
    const r = state.report;

    elPanel.innerHTML = `
      <h2>Rapport (V0.4.2)</h2>
      <p class="muted">
        Nominale bedragen op basis van de netto massa en de schuifregelaars. De tool rekent alleen wat onderbouwd kan; wat niet kan, staat als “niet berekend” vermeld.
      </p>

      <div class="kpi">
        <div class="kpi__item">
          <strong>Netto massa</strong>
          <span>${formatEUR(r.netEstate)}</span>
        </div>
        ${
          r.taxBase !== r.netEstate
            ? `<div class="kpi__item">
          <strong>Grondslag Franse belasting</strong>
          <span>${formatEUR(r.taxBase)}</span>
        </div>`
            : ""
        }
        <div class="kpi__item">
          <strong>Traject</strong>
          <span>${escapeHtml(labelMode(state.scenario.mode))}</span>
        </div>
      </div>

      <hr />

      <h3>Uitkomst per ontvanger (gewenst scenario)</h3>
      ${renderResultsTable(r.rowsDesired)}
      ${voorbehoudHtml()}
      ${peilRegelHtml()}

      <hr />

      ${r.gapSkipped ? "" : `<h3>Vergelijking met de gunstigste verdeling</h3>
      ${renderGapBlock(r.gap, r.benchmarkLabel, r.gapReason)}`}
      ${renderRelationComparison(r.relationComparison)}

      <hr />

      <h3>Wat niet is doorgerekend</h3>
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

    const rowsHtml = rows
      .map((row) => {
        if (row.computed === false) {
          return `
      <tr>
        <td>${escapeHtml(row.person)}</td>
        <td>${escapeHtml(row.relationLabel)}</td>
        <td>${formatEUR(row.gross)}</td>
        <td colspan="4"><strong>Niet berekend:</strong> ${escapeHtml(row.reason)}</td>
      </tr>`;
        }
        const noteRow =
          row.notes && row.notes.length
            ? `<tr><td colspan="7" class="tiny muted">${row.notes.map((n) => escapeHtml(n)).join(" ")}</td></tr>`
            : "";
        return `
      <tr>
        <td>${escapeHtml(row.person)}</td>
        <td>${escapeHtml(row.relationLabel)}</td>
        <td>${formatEUR(row.gross)}</td>
        <td>${formatEUR(row.allowance)}</td>
        <td>${formatEUR(row.taxable)}</td>
        <td>${formatEUR(row.tax)}</td>
        <td><strong>${formatEUR(row.net)}</strong></td>
      </tr>${noteRow}`;
      })
      .join("");

    return `
      <div class="table-wrap">
      <table class="table" aria-label="Resultaten">
        <thead>
          <tr>
            <th>Ontvanger</th><th>Relatie</th><th>Bruto</th><th>Aftrek</th><th>Belastbaar</th><th>Belasting</th><th>Netto</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      </div>
      <p class="tiny muted" style="margin-top:10px;">
        Bronnen: Service-Public (schenking: F14203; erfenis: F35794) en het Code général des impôts. Zie “Bronnen gebruikt” in het zijpaneel of de print.
      </p>
    `;
  }

  function renderGapBlock(gap, benchLabel, reason) {
    if (!gap) return `<p class="badge badge--warn">Vergelijking met de gunstigste verdeling niet beschikbaar. ${escapeHtml(reason || "")}</p>`;

    const badge = gap.level === "bad" ? "badge--bad" : gap.level === "warn" ? "badge--warn" : "badge--ok";
    const benchTxt = benchLabel ? `${escapeHtml(benchLabel)}.` : "Laagste belasting (indicatief).";

    return `
      <div class="nudge">
        <div class="nudge__title">
          <strong>${escapeHtml(gap.title)}</strong>
          <span class="badge ${badge}">${escapeHtml(levelLabel(gap.level))}</span>
        </div>
        <div class="nudge__body">${escapeHtml(gap.body)}</div>
        <div class="tiny muted" style="margin-top:8px;">${benchTxt}</div>

        <div class="kpi" style="margin-top:10px;">
          <div class="kpi__item">
            <strong>Belasting (gewenst)</strong>
            <span>${formatEUR(gap.taxDesired)}</span>
          </div>
          <div class="kpi__item">
            <strong>Belasting bij de fiscaal gunstigste verdeling</strong>
            <span>${formatEUR(gap.taxMin)}</span>
          </div>
          <div class="kpi__item">
            <strong>Verschil met de fiscaal gunstigste verdeling</strong>
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

  function renderRelationComparison(c) {
    if (!c) return "";
    return `<div class="nudge"><div class="nudge__title"><strong>Samenwonend, gehuwd of met PACS</strong></div>
      <div class="nudge__body">Op dezelfde invoer betaalt u als samenwonenden ${formatEUR(c.cohabTax)} belasting. Met PACS of huwelijk is dat ${formatEUR(c.marriedOrPacsTax)} (bij een erfenis is de partner dan vrijgesteld; bij een schenking geldt een aftrek van 80.724 euro).</div></div>`;
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
    const list = Object.values(SOURCES)
      .map(
        (s) => `
      <div class="source">
        <div class="source__top">
          <div class="source__name">${escapeHtml(s.name)}</div>
          <div class="source__date">${escapeHtml(s.date)}</div>
        </div>
        <div style="margin-top:6px;">
          <a href="${escapeAttr(s.url)}" target="_blank" rel="noopener">Open bron</a>
        </div>
      </div>
    `
      )
      .join("");
    elSources.innerHTML = list;
  }

  function renderNudges() {
    const nudges = buildNudges();
    if (nudges.length === 0) {
      elNudges.innerHTML = `<div class="badge badge--ok">Geen directe flags op basis van huidige invoer.</div>`;
      return;
    }

    elNudges.innerHTML = nudges
      .map((n) => {
        const badgeClass = n.level === "bad" ? "badge--bad" : n.level === "warn" ? "badge--warn" : "badge--ok";
        const src = SOURCES[n.sourceId];
        return `
        <div class="nudge">
          <div class="nudge__title">
            <strong>${escapeHtml(n.title)}</strong>
            <span class="badge ${badgeClass}">${escapeHtml(levelLabel(n.level))}</span>
          </div>
          <div class="nudge__body">${escapeHtml(n.body)}</div>
          ${
            src
              ? `<div class="nudge__src">Bron: <a href="${escapeAttr(src.url)}" target="_blank" rel="noopener">${escapeHtml(
                  src.name
                )}</a>, ${escapeHtml(src.date)}</div>`
              : ``
          }
        </div>
      `;
      })
      .join("");
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
    if (r.taxBase !== undefined && r.taxBase !== net) lines.push(routeRow("Grondslag Franse belasting", formatEUR(r.taxBase)));

    if (r.totalsDesired) lines.push(routeRow("Belasting (gewenst)", formatEUR(r.totalsDesired.totalTax)));
    if (r.gap) lines.push(routeRow("Verschil met de fiscaal gunstigste verdeling", formatEUR(r.gap.taxGap)));
    else if (!r.gapSkipped) lines.push(routeRow("Gunstigste verdeling", "niet te bepalen"));

    if (r.notComputed && r.notComputed.length > 0) {
      lines.push(routeRow("Niet doorgerekend", `${r.notComputed.length} item(s)`));
    }

    elRoutecard.innerHTML = lines.join("");
  }

  function renderCalcExplain() {
    const r = state.report || {};
    const sourcesUsed = computeSourcesUsed();
    const sourcesHtml = sourcesUsed.length
      ? `<ul class="nlfr-mini-list">${sourcesUsed
          .map((s) => `<li><a href="${escapeAttr(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>, ${escapeHtml(s.date)}</li>`)
          .join("")}</ul>`
      : `<div class="badge badge--warn">Geen bronnen gedetecteerd (onverwacht). Controleer sourceId’s.</div>`;

    const notComputedHtml =
      r.notComputed && r.notComputed.length
        ? `<ul class="nlfr-mini-list">${r.notComputed.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
        : `<div class="badge badge--ok">Geen extra beperkingen op basis van huidige invoer.</div>`;

    elCalcExplain.innerHTML = `
      <div class="nlfr-explain">
        <div><strong>Wat de tool wel doet:</strong></div>
        <ul class="nlfr-mini-list">
          <li>Netto massa: <code>bezittingen min schulden</code>, bij overlijden ook min 1.500 euro begrafeniskosten en min 20 % van de hoofdwoning (indicatief). Bij schenking: het geschonken bedrag.</li>
          <li>Tarieven en aftrekken voor <code>partner (gehuwd, PACS of samenwonend)</code>, <code>kind (rechte lijn)</code> en <code>stiefkind (60 %)</code>.</li>
          <li>Geldschenking (art. 790 G) alleen als alle voorwaarden vervuld zijn, en eerdere schenkingen binnen 15 jaar (art. 784).</li>
          <li>Vergelijking van <em>gewenst</em> met de <em>gunstigste verdeling</em> (partner 0 tot en met 100%, stappen van 1).</li>
        </ul>

        <div style="margin-top:10px;"><strong>Wat de tool niet doet:</strong></div>
        ${notComputedHtml}

        <div style="margin-top:10px;"><strong>Bronnen gebruikt (huidige invoer):</strong></div>
        ${sourcesHtml}

        <div style="margin-top:10px;" class="tiny muted">
          Tip: “Opslaan in Dossier” bewaart een leesbare samenvatting van uw scenario.
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
  // Nudges engine (V0.3)
  // -------------------------
  function buildNudges() {
    const out = [];

    if (state.family.relation === "pacs") {
      out.push({
        level: "warn",
        title: "PACS betekent niet automatisch erven",
        body: "Bij PACS is civielrechtelijk een testament nodig als u wilt dat uw partner (een deel van) uw nalatenschap krijgt.",
        sourceId: "sp_pacs_2026",
      });
      out.push({
        level: "ok",
        title: "PACS: fiscaal bij overlijden",
        body: "Een PACS-partner is bij overlijden vrijgesteld van successierechten (art. 796-0 bis CGI); dit zegt niets over de civielrechtelijke verdeling zonder testament.",
        sourceId: "sp_succession_2025",
      });
      if (state.scenario.mode === "donation") {
        out.push({
          level: "warn",
          title: "PACS en schenking: aftrek kan vervallen",
          body: "De aftrek van 80.724 euro bij schenking tussen PACS-partners vervalt als het PACS eindigt in het jaar van sluiten of het jaar daarna, behalve door huwelijk of overlijden (art. 790 F CGI).",
          sourceId: "cgi_790f",
        });
      }
    }

    if (state.family.relation === "cohab") {
      out.push({
        level: "bad",
        title: "Samenwonend (concubinage): zeer ongunstig",
        body: "Zonder huwelijk of PACS betaalt uw partner 60 % belasting en erft hij of zij niets zonder testament.",
        sourceId: "sp_succession_2025",
      });
    }

    if (toInt(state.family.childrenCount) > 0) {
      out.push({
        level: "warn",
        title: "Kinderen: voorbehouden erfdeel (civielrecht)",
        body: "Als er reservataire erfgenamen zijn (vaak kinderen), is niet alles vrij te bestemmen. De tool signaleert dit, maar rekent het civielrechtelijk niet door.",
        sourceId: "legi_cc_912",
      });
    }

    if (state.family.hasChildrenFromEarlierRelationship) {
      out.push({
        level: "warn",
        title: "Eerdere relaties: verhoogde complexiteit",
        body: "Kinderen uit eerdere relaties kunnen de verdeling sterk beïnvloeden. De tool is een scenariotool; controle door een notaris wordt aanbevolen.",
        sourceId: "legi_cc_912",
      });
    }

    if (effectiveDonors().length > 1 && childKinds().some((k) => k.relation === "stepchild")) {
      out.push({
        level: "warn",
        title: "Stiefkind: wie schenkt?",
        body: "Bij een stiefkind is een schenking door de eigen ouder fiscaal veel gunstiger dan door de stiefouder (60 % zonder aftrek). Bespreek met een notaris wie wat schenkt. (CGI art. 777, tabel III, en art. 779 I.)",
        sourceId: "cgi_777",
      });
    }

    if (state.family.hasStepchildren || state.wishes.goals.includeStepchildren) {
      out.push({
        level: "warn",
        title: "Stiefkinderen: 60 % belasting, tenzij geadopteerd",
        body: "Een stiefkind is fiscaal niet-verwant: bij schenking geen aftrek, bij overlijden 1.594 euro aftrek, en 60 % belasting. Bij een volle adoptie geldt de rechte lijn. Bij een gewone adoptie (adoption simple) alleen in de gevallen van art. 786 CGI, onder meer voor het kind uit een eerder huwelijk van de echtgenoot. Dat eerste geval geldt niet voor het kind van een PACS- of samenwonende partner; de gevallen van langdurige verzorging (art. 786, 3° en 3° bis) kunnen wel van toepassing zijn.",
        sourceId: "cgi_786",
      });
    }

    if (state.estate.includesLifeInsurance) {
      out.push({
        level: "warn",
        title: "Assurance-vie: eigen regime",
        body: "Assurance-vie volgt vaak niet dezelfde logica als ‘gewone’ nalatenschap. De tool geeft daarom geen betrouwbare eindbelasting op dit onderdeel.",
        sourceId: "sp_succession_2025",
      });
    }

    if (state.estate.includesBusiness || state.wishes.goals.businessSuccession) {
      out.push({
        level: "warn",
        title: "Onderneming/bedrijf: niet doorgerekend",
        body: "Bedrijfsopvolging en waardering zijn notaris/fiscalist-werk. De tool geeft route-waarschuwingen, geen harde eurobedragen.",
        sourceId: "sp_succession_2025",
      });
    }

    const fictie = nlFictie();
    if (fictie) {
      out.push({
        level: "bad",
        title: "Nederland heft mogelijk ook belasting (tienjaarsfictie)",
        body: fictie.grond === "nl10"
          ? "Een Nederlander die minder dan 10 jaar geleden uit Nederland is vertrokken, geldt voor de Nederlandse erf- en schenkbelasting nog als inwoner (art. 3 lid 1 Successiewet 1956). Nederland kan dan over het hele vermogen heffen, met de Nederlandse vrijstellingen en tarieven. De tool rekent die Nederlandse belasting niet door: het bedrag in de uitkomst is alleen de Franse belasting en is dus niet de totale last. Een Nederlandse vermindering voor de Franse belasting is mogelijk (art. 48 Besluit voorkoming dubbele belasting 2001). Laat dit berekenen door een fiscalist."
          : "Een schenking binnen een jaar na vertrek uit Nederland geldt voor de Nederlandse schenkbelasting nog als schenking door een inwoner (art. 3 lid 2 Successiewet 1956). Nederland kan dan over de schenking heffen. De tool rekent die Nederlandse belasting niet door: het bedrag in de uitkomst is alleen de Franse belasting. Laat dit berekenen door een fiscalist.",
        sourceId: "sw_3",
      });
    }

    if (state.anchors.habitualResidenceAtDeath === "nl") {
      out.push({
        level: "warn",
        title: "Nederland heft als woonland",
        body: "Woonde de overledene of schenker in Nederland, dan heft Nederland erf- of schenkbelasting over het wereldwijde vermogen. De tool rekent alleen de Franse belasting over de Franse goederen; de Nederlandse belasting is niet doorgerekend.",
        sourceId: "sw_3",
      });
    }

    if (state.anchors.habitualResidenceAtDeath !== "fr") {
      const sh = frShare();
      out.push(
        territorialRestricted()
          ? {
              level: sh < 1 ? "warn" : "ok",
              title: sh === 0 ? "Frankrijk heft hier niet (art. 750 ter CGI)" : "Frankrijk heft alleen over de Franse goederen (art. 750 ter CGI)",
              body: sh === 0
                ? "De overledene of schenker woonde niet in Frankrijk, de verkrijger is geen fiscaal inwoner van Frankrijk gedurende ten minste 6 van de laatste 10 jaar, en de bezittingen liggen in Nederland. Frankrijk heft dan geen erf- of schenkbelasting: de Franse belasting in deze uitkomst is 0."
                : `De overledene of schenker woonde niet in Frankrijk en de verkrijger is geen fiscaal inwoner van Frankrijk gedurende ten minste 6 van de laatste 10 jaar. Frankrijk heft dan alleen over de Franse goederen. De tool rekent met ${Math.round(sh * 100)} % van de netto massa; dat is een aanname naar rato.`,
              sourceId: "cgi_750ter",
            }
          : {
              level: "warn",
              title: "Frankrijk heft over alles: de verkrijger woont in Frankrijk (art. 750 ter CGI)",
              body: "De overledene of schenker woonde niet in Frankrijk, maar de verkrijger is fiscaal inwoner van Frankrijk, ten minste 6 van de laatste 10 jaar. Frankrijk heft dan over alle goederen, ook die in het buitenland.",
              sourceId: "cgi_750ter",
            }
      );
    }

    if (state.scenario.mode === "succession") {
      out.push({
        level: "ok",
        title: "Forfait begrafeniskosten en aftrek hoofdwoning",
        body:
          `In de netto massa is het vaste bedrag van ${formatEUR(funeralForfait())} voor begrafeniskosten afgetrokken (art. 775 CGI)` +
          (mainHomeAbatement() > 0 ? ` en een aftrek van 20 % op de hoofdwoning, ${formatEUR(mainHomeAbatement())} (art. 764 bis CGI).` : state.estate.includesMainHome ? ". De aftrek van 20 % op de hoofdwoning geldt alleen als de woning ook bewoond werd door de langstlevende echtgenoot of PACS-partner, of door een minderjarig of beschermd kind (art. 764 bis CGI)." : ".") +
          " Geeft u begrafeniskosten al bij de schulden op, dan telt u ze dubbel.",
        sourceId: "cgi_775",
      });
    }

    if (state.anchors.habitualResidenceAtDeath !== "fr" || state.anchors.mainAssetsLocation !== "fr" || state.anchors.nationality !== "fr") {
      out.push({
        level: "warn",
        title: "Internationale knoop: erfrecht vs belasting",
        body: "EU 650/2012 gaat over toepasselijk erfrecht (art. 21/22). Belasting blijft een aparte laag. De tool rekent primair de Franse basisheffing, indicatief.",
        sourceId: "eurlex_650_2012",
      });
    }

    if (calcNetEstate() <= 0) {
      out.push({
        level: "bad",
        title: "Netto massa ≤ 0",
        body: "Met de huidige bezittingen en schulden is er indicatief geen positieve massa om te verdelen. Controleer invoer.",
        sourceId: "sp_succession_2025",
      });
    }

    if (state.will.type === "none") {
      out.push({
        level: "warn",
        title: "Geen testament: standaardregels gelden",
        body: "Zonder testament is uw gewenste verdeling mogelijk niet uitvoerbaar. De tool signaleert dit; civiele uitwerking is notariswerk.",
        sourceId: "eurlex_650_2012",
      });
    }

    if (state.will.hasChoiceOfLawToNationality) {
      out.push({
        level: "warn",
        title: "Rechtskeuze: civiel effect ≠ fiscaal effect",
        body: "Rechtskeuze kan civielrechtelijke verdeling beïnvloeden, maar belastingheffing kan alsnog (deels) nationaal blijven. De tool rekent fiscaal de Franse basis.",
        sourceId: "eurlex_650_2012",
      });
      out.push({
        level: "warn",
        title: "Reserve-bescherming (FR) is complex bij internationale successies",
        body: "Franse regels rond het voorbehouden erfdeel en internationale situaties kunnen complex zijn. De tool toont scenario’s, geen juridisch eindadvies.",
        sourceId: "legi_cc_913",
      });
    }

    if (state.scenario.mode === "donation" && toInt(state.family.childrenCount) > 0) {
      out.push({
        level: "ok",
        title: "Indicatie: 100.000 euro per kind en per ouder, per 15 jaar",
        body: "De aftrek is 100.000 euro per ouder per kind. Binnen 15 jaar telt een eerdere schenking van dezelfde ouder aan hetzelfde kind mee (art. 784 CGI): de aftrek is dan al deels gebruikt.",
        sourceId: "impots_don_enfant_2025",
      });
    }

    if (state.scenario.mode === "donation" && Date.now() <= new Date("2026-12-31T23:59:59").getTime()) {
      out.push({
        level: "ok",
        title: "Tijdelijke vrijstelling nieuwbouw en energierenovatie tot 31 december 2026",
        body: "Art. 790 A bis CGI: tot en met 31 december 2026 een extra vrijstelling (100.000 euro per schenker, 300.000 euro per ontvanger) voor geld dat binnen 6 maanden wordt besteed aan nieuwbouw of energierenovatie. De ontvanger moet een kind, kleinkind of achterkleinkind van de schenker zijn, of een neef of nicht als de schenker geen afstammelingen heeft. De tool rekent dit niet door.",
        sourceId: "cgi_790abis",
      });
    }

    return out;
  }

  // -------------------------
  // Rekenmotor (V0.4.2), volgens regelspecificatie A t/m E
  // Alle berekeningen gaan per paar (een schenker, een ontvanger).
  // -------------------------
  function rateAt(x, brackets) {
    const v = Math.max(0, Number(x) || 0);
    for (const b of brackets) if (v < b.upTo) return b.rate;
    return brackets[brackets.length - 1].rate;
  }

  // Belast het stuk van offset tot offset + amount (CGI 784, rappel fiscal).
  function taxWithOffset(amount, brackets, offset) {
    const off = Math.max(0, Number(offset) || 0);
    const amt = Math.max(0, Number(amount) || 0);
    return round2(progressiveTax(off + amt, brackets) - progressiveTax(off, brackets));
  }

  // Eerdere schenkingen binnen 15 jaar: gebruikte aftrek en eerder belast deel (spec B.2).
  // Elke schenking: { amount (bruto), vrij790G (vrijgesteld deel), date (optioneel, ISO) }.
  function derivePriors(priorGifts, baseAllowance, onDate) {
    const cutoff = new Date(onDate || Date.now());
    cutoff.setFullYear(cutoff.getFullYear() - RAPPEL_YEARS);
    const list = (priorGifts || [])
      .filter((g) => g && Number(g.amount) > 0)
      .map((g) => {
        const amount = Number(g.amount);
        return {
          amount,
          // Maximaal 31.865 per schenker en ontvanger telt als 790 G; het meerdere is een gewone schenking.
          vrij790G: Math.min(amount, DON_FAMILIAL_MAX, Math.max(0, Number(g.vrij790G) || 0)),
          date: g.date ? new Date(g.date) : null,
        };
      })
      .filter((g) => !g.date || g.date > cutoff)
      .sort((a, b) => (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0));

    let usedAllowance = 0;
    let taxedPart = 0;
    let used790G = 0;
    list.forEach((g) => {
      used790G += g.vrij790G;
      const rest = g.amount - g.vrij790G; // 790 G telt niet mee voor 784 (790 G III)
      const u = Math.min(rest, Math.max(0, baseAllowance - usedAllowance));
      usedAllowance += u;
      taxedPart += rest - u;
    });
    return { count: list.length, usedAllowance, taxedPart, used790G };
  }

  // Voorwaarden don familial (CGI 790 G), spec A.1.
  function check790G(p) {
    const cash = Math.max(0, Number(p.cashPart) || 0);
    const age = Number(p.donorAge);
    const status = p.recipientStatus || "adult";
    const adultOk = status === "emancipated" || (status === "adult" && !p.minorFlag);
    const checks = [
      { key: "cash", label: "Het gaat om een geldsom in volle eigendom", ok: cash > 0, reason: "er is geen geldbedrag opgegeven" },
      {
        key: "recipient",
        label: "De ontvanger is een kind, kleinkind of achterkleinkind van de schenker (een neef of nicht alleen als de schenker geen afstammelingen heeft; dat rekent de tool niet door)",
        ok: p.relation === "child",
        reason:
          p.relation === "stepchild"
            ? "een stiefkind (niet geadopteerd) komt niet in aanmerking"
            : "alleen kinderen, kleinkinderen en achterkleinkinderen worden doorgerekend; een neef of nicht (bij plaatsvervulling een achterneef of achternicht) komt alleen in aanmerking als de schenker geen afstammelingen heeft, en de tool rekent die uitzondering niet door",
      },
      {
        key: "age",
        label: `De schenker is jonger dan ${DONOR_MAX_AGE} jaar`,
        ok: Number.isFinite(age) && age < DONOR_MAX_AGE,
        reason: Number.isFinite(age) ? `de schenker is ${DONOR_MAX_AGE} jaar of ouder` : "de leeftijd van de schenker is onbekend",
      },
      {
        key: "adult",
        label: "De ontvanger is meerderjarig (of geëmancipeerd)",
        ok: adultOk,
        reason:
          status === "adult" && p.minorFlag
            ? "er zijn minderjarige kinderen aangegeven en de tool rekent alle kinderen gelijk, dus meerderjarigheid per kind is niet vast te stellen"
            : "de ontvanger is minderjarig en niet geëmancipeerd",
      },
      {
        key: "cap",
        label: `Het plafond van ${formatEUR(DON_FAMILIAL_MAX)} per schenker en ontvanger in 15 jaar is nog niet benut`,
        ok: (Number(p.used790G) || 0) < DON_FAMILIAL_MAX,
        reason: `het plafond van ${formatEUR(DON_FAMILIAL_MAX)} in 15 jaar is al benut`,
      },
    ];
    const failing = checks.find((c) => !c.ok);
    return {
      eligible: !failing,
      reason: failing ? failing.reason : "",
      checks: checks.map((c) => ({ key: c.key, label: c.label, ok: c.ok })),
      notChecked: ["De ontvanger moet de schenking binnen één maand aangeven of laten registreren (art. 790 G IV); de tool kan dit niet controleren."],
    };
  }

  // Een schenker, een ontvanger. Geeft computed:false als de spec het geval niet regelt.
  function calcPair(p) {
    const mode = p.mode === "donation" ? "donation" : "succession";
    const relation = p.relation;
    const g = Math.max(0, Number(p.gross) || 0);
    const onDate = p.onDate || new Date();

    const notComputed = (reason) => ({
      computed: false,
      reason,
      relation,
      gross: g,
      allowance: 0,
      vrij790G: 0,
      taxable: 0,
      tax: 0,
      net: 0,
      notes: [],
    });

    if (relation === "adoption_simple") {
      return notComputed(
        "Adoption simple: rechte lijn alleen in de gevallen van art. 786 CGI (o.a. kind van de echtgenoot uit een eerder huwelijk, of 5 jaar verzorging als minderjarige). Laat dit door de notaris vaststellen."
      );
    }

    const notes = [];
    const result = (o) =>
      Object.assign(
        { computed: true, relation, gross: g, allowance: 0, vrij790G: 0, taxable: g, tax: 0, net: g, notes },
        o
      );

    // Niet-verwanten (samenwonende partner, stiefkind): 60 % vlak.
    if (relation === "cohab" || relation === "stepchild") {
      const base = mode === "succession" ? ALLOWANCE_DEATH_NONRELATIVE : 0;
      const allowance = Math.min(g, base);
      const taxable = Math.max(0, g - allowance);
      const tax = roundEuro(taxWithOffset(taxable, BRACKETS_FLAT_60, 0));
      if (relation === "stepchild") notes.push("Stiefkind: 60 % belasting, tenzij geadopteerd.");
      if (relation === "stepchild" && mode === "donation" && p.useDonFamilial && Number(p.cashPart) > 0) {
        const chk = check790G({ relation, cashPart: p.cashPart, donorAge: p.donorAge, recipientStatus: p.recipientStatus, minorFlag: p.minorFlag, used790G: 0 });
        if (!chk.eligible) notes.push(`Geen vrijstelling voor geldschenking: ${chk.reason}.`);
      }
      return result({ allowance, taxable, tax: tax, net: round2(Math.max(0, g - tax)) });
    }

    if (mode === "succession" && (relation === "married" || relation === "pacs")) {
      return result({ allowance: g, taxable: 0, tax: 0, net: g });
    }

    let base;
    let table;
    if (relation === "child") {
      base = ALLOWANCE_CHILD;
      table = BRACKETS_LINE_DIRECT;
    } else if ((relation === "married" || relation === "pacs") && mode === "donation") {
      base = ALLOWANCE_SPOUSE_DONATION;
      table = BRACKETS_SPOUSE_DONATION;
    } else {
      return notComputed("Deze relatie wordt in de tool niet doorgerekend.");
    }

    const pri = derivePriors(p.priorGifts, base, onDate);
    const remaining = Math.max(0, base - pri.usedAllowance);

    let vrij = 0;
    if (mode === "donation" && relation === "child" && p.useDonFamilial) {
      const cash = Math.min(g, Math.max(0, Number(p.cashPart) || 0));
      const chk = check790G({
        relation,
        cashPart: cash,
        donorAge: p.donorAge,
        recipientStatus: p.recipientStatus,
        minorFlag: p.minorFlag,
        used790G: pri.used790G,
      });
      if (chk.eligible) {
        vrij = Math.min(cash, Math.max(0, DON_FAMILIAL_MAX - pri.used790G));
        notes.push(`Vrijgesteld via geldschenking (art. 790 G): ${formatEUR(vrij)}, met een plafond van ${formatEUR(DON_FAMILIAL_MAX)} per schenker en per ontvanger in 15 jaar.`);
      } else {
        notes.push(`Geen vrijstelling voor geldschenking: ${chk.reason}.`);
      }
    }

    const rest = g - vrij;
    const applied = Math.min(rest, remaining);
    const taxable = Math.max(0, rest - remaining);
    const tax = roundEuro(taxWithOffset(taxable, table, pri.taxedPart));

    if (pri.count > 0) {
      notes.push(`Resterende aftrek: ${formatEUR(remaining)} van ${formatEUR(base)}.`);
      if (taxable > 0) notes.push(`Begint in schijf: ${Math.round(rateAt(pri.taxedPart, table) * 100)} %.`);
    }

    return result({
      allowance: round2(vrij + applied),
      vrij790G: vrij,
      taxable,
      tax,
      net: round2(Math.max(0, g - tax)),
      remainingAllowance: remaining,
      baseAllowance: base,
    });
  }

  // Opbouw van de kinderen volgens de invoer (eigen of plénière, stiefkind, adoption simple).
  function childKinds() {
    const n = Math.max(0, toInt(state.family.childrenCount));
    const step = state.family.hasStepchildren && n > 0 ? clampInt(state.family.stepchildrenCount || 1, 1, n) : 0;
    const simple = state.family.hasAdoptedChildren ? clampInt(state.family.adoptedSimpleCount || 0, 0, n - step) : 0;
    const own = n - step - simple;
    const kinds = [];
    for (let i = 1; i <= own; i++) kinds.push({ relation: "child", person: `Kind ${i}`, label: "Kind" });
    for (let i = 1; i <= step; i++) kinds.push({ relation: "stepchild", person: `Stiefkind ${i}`, label: "Stiefkind (niet geadopteerd)" });
    for (let i = 1; i <= simple; i++) kinds.push({ relation: "adoption_simple", person: `Adoptiekind ${i}`, label: "Adoptiekind (adoption simple)" });
    return kinds;
  }

  function effectiveDonors() {
    const sc = state.scenario;
    const both =
      sc.mode === "donation" && sc.donor === "both" && hasPartnerInFamily() && toInt(state.family.childrenCount) > 0;
    if (!both) return [{ label: "Schenker", share: 1, age: Number(sc.donorAge) }];
    const s = Math.min(100, Math.max(0, Number(sc.donorSplitPct) || 0)) / 100;
    return [
      { label: "Ouder 1", share: s, age: Number(sc.donorAge) },
      { label: "Ouder 2", share: 1 - s, age: Number(sc.donor2Age) },
    ];
  }

  function computeReport() {
    const netMassa = calcNetEstate();
    const net = calcFrTaxBase(); // grondslag voor de Franse belasting

    const desired = computeRowsForAllocation(net, state.scenario.allocateToPartnerPct, state.scenario.allocateToChildrenPct);
    const totalsDesired = sumTotals(desired);

    const bench = computeBenchmarkMin(net);
    const totalsMin = sumTotals(bench.rows);

    let gap = null;
    let gapReason = "";
    // Bij beide ouders als schenker zoekt de tool niet over de verdeling tussen de ouders: geen uitspraak over de gunstigste verdeling.
    const gapSkipped = effectiveDonors().length > 1;
    if (gapSkipped) {
      gapReason = "";
    } else if (desired.some((r) => r.computed === false)) {
      gapReason = "Een of meer ontvangers zijn niet doorgerekend, dus een vergelijking zou onbetrouwbaar zijn.";
    } else if (bench.unavailable) {
      gapReason = "Voor geen enkele verdeling zijn alle ontvangers door te rekenen.";
    } else {
      gap = buildGap(totalsDesired.totalTax, totalsMin.totalTax, bench.partnerPct, bench.childrenPct);
    }

    const notComputed = buildNotComputed(desired);
    const nudges = buildNudges();
    const sourcesUsed = computeSourcesUsed(nudges, notComputed);
    const relationComparison = buildRelationComparison(net, totalsDesired.totalTax);
    const don790G = describeDonFamilial();

    state.report = {
      netEstate: netMassa,
      taxBase: net,
      frShare: frShare(),
      rowsDesired: desired,
      totalsDesired,

      benchmarkLabel: bench.label,
      rowsMin: bench.rows,
      totalsMin,

      gap,
      gapReason,
      gapSkipped,
      relationComparison,
      don790G,
      notComputed,
      nudges,
      sourcesUsed,

      computedAt: new Date().toISOString(),
      assumptions: buildAssumptions(),
    };

    saveState(state);
  }

  function buildAssumptions() {
    const slidersShown = hasPartnerInFamily() && toInt(state.family.childrenCount) > 0 && effectiveDonors().length === 1;
    const out = [
      slidersShown
        ? "Verdeling via schuifregelaars (% van de netto massa); kinderen krijgen elk een gelijk deel."
        : "Kinderen krijgen elk een gelijk deel.",
      "Tarieven en aftrekken volgens CGI art. 777, 779, 788 IV, 790 E, 790 F en 796-0 bis.",
      "De belasting is per verkrijger afgerond op hele euro's (art. 1724 CGI).",
      "Eerdere schenkingen binnen 15 jaar tellen mee volgens art. 784 CGI (aftrek en schijven).",
      "Civielrechtelijke uitvoerbaarheid (voorbehouden erfdeel, rechten van de partner, testament) wordt niet afgedwongen.",
    ];
    if (effectiveDonors().length > 1) {
      out.push("Bij beide ouders als schenker wordt per ouder apart gerekend (aftrek, schijven en geldschenking per ouder).");
    }
    return out;
  }

  function priorGiftsFor(relation) {
    const sc = state.scenario;
    if (relation === "child") {
      // Veld 1 is het totaal, veld 2 het 790 G-deel daarvan: niet bij elkaar optellen.
      const a = Math.max(0, Number(sc.priorChildGifts) || 0);
      const b = Math.max(0, Number(sc.priorChild790G) || 0);
      const amount = Math.max(a, b);
      return amount > 0 ? [{ amount, vrij790G: Math.min(b, DON_FAMILIAL_MAX) }] : [];
    }
    if (relation === "married" || relation === "pacs") {
      const a = Math.max(0, Number(sc.priorPartnerGifts) || 0);
      return a > 0 ? [{ amount: a, vrij790G: 0 }] : [];
    }
    return [];
  }

  function computeRowsForAllocation(net, partnerPct, childrenPct, opts) {
    const o = opts || {};
    const rows = [];
    const hasPartner = hasPartnerInFamily();
    const partnerRelation = o.partnerRelation || state.family.relation;
    const kinds = childKinds();
    const childrenCount = kinds.length;
    const donors = effectiveDonors();
    const bothDonors = donors.length > 1;
    const sc = state.scenario;
    const mode = sc.mode;

    let partnerGross = 0;
    let childrenGrossTotal = 0;

    if (net > 0) {
      if (bothDonors) {
        // De partner is dan zelf schenker en ontvangt niets.
        partnerGross = 0;
        childrenGrossTotal = net;
      } else if (childrenCount === 0 && hasPartner) {
        partnerGross = net;
      } else {
        partnerGross = hasPartner ? net * (partnerPct / 100) : 0;
        childrenGrossTotal = Math.max(0, net - partnerGross);
      }
    }

    if (hasPartner && partnerGross > 0) {
      const d = donors[0];
      const res = calcPair({
        mode,
        relation: partnerRelation,
        gross: partnerGross,
        donorAge: d.age,
        priorGifts: priorGiftsFor(partnerRelation),
      });
      rows.push(rowFromPairs("Partner", labelRelation(partnerRelation), [res], [""], res.computed === false ? res.reason : ""));
    }

    if (childrenCount > 0 && childrenGrossTotal > 0) {
      const perChild = childrenGrossTotal / childrenCount;
      const useCash = mode === "donation" && sc.donationType === "cash_gift_31865";
      const cashTotal = sc.cashAmount === null || sc.cashAmount === undefined || sc.cashAmount === "" ? childrenGrossTotal : Math.max(0, Number(sc.cashAmount) || 0);
      const cashFrac = useCash && childrenGrossTotal > 0 ? Math.min(1, cashTotal / childrenGrossTotal) : 0;
      const minorFlag = !!state.family.hasMinorChildren;

      kinds.forEach((k) => {
        const pairs = donors.map((d, di) => {
          const gross = perChild * d.share;
          // Bij beide ouders is het stiefkind voor de partner (ouder 2, eigen ouder) een eigen kind.
          const rel = bothDonors && k.relation === "stepchild" && di === 1 ? "child" : k.relation;
          return calcPair({
            mode,
            relation: rel,
            gross,
            cashPart: gross * cashFrac,
            useDonFamilial: useCash,
            donorAge: d.age,
            recipientStatus: sc.recipientStatus,
            minorFlag,
            priorGifts: priorGiftsFor(rel),
          });
        });
        const prefixes = bothDonors ? donors.map((d) => `${d.label}: `) : donors.map(() => "");
        const bad = pairs.find((x) => x.computed === false);
        const label = bothDonors && k.relation === "stepchild" ? "Stiefkind van ouder 1, eigen kind van ouder 2" : k.label;
        rows.push(rowFromPairs(k.person, label, pairs, prefixes, bad ? bad.reason : ""));
      });
    }

    return rows;
  }

  function rowFromPairs(person, relationLabel, pairs, prefixes, reason) {
    const sum = (f) => round2(pairs.reduce((a, x) => a + (Number(x[f]) || 0), 0));
    const computed = !pairs.some((x) => x.computed === false);
    const notes = [];
    pairs.forEach((x, i) => (x.notes || []).forEach((t) => notes.push(`${prefixes[i] || ""}${t}`)));
    return {
      person,
      relationLabel,
      computed,
      reason: computed ? "" : reason,
      gross: sum("gross"),
      allowance: computed ? sum("allowance") : 0,
      vrij790G: computed ? sum("vrij790G") : 0,
      taxable: computed ? sum("taxable") : 0,
      tax: computed ? sum("tax") : 0,
      net: computed ? sum("net") : 0,
      notes,
    };
  }

  function computeBenchmarkMin(net) {
    const hasPartner = hasPartnerInFamily();
    const childrenCount = Math.max(0, toInt(state.family.childrenCount));
    const donors = effectiveDonors();
    const desiredPartner = Number(state.scenario.allocateToPartnerPct) || 0;

    // Zonder partner, zonder kinderen of met beide ouders als schenker is er maar één mogelijke verdeling.
    let candidates;
    if (donors.length > 1) candidates = [0];
    else if (!hasPartner) candidates = [0];
    else if (childrenCount === 0) candidates = [100];
    else {
      candidates = [];
      for (let p = 0; p <= 100; p++) candidates.push(p);
    }

    let best = null;
    candidates.forEach((p) => {
      const rows = computeRowsForAllocation(net, p, 100 - p);
      if (rows.some((r) => r.computed === false)) return; // niet te vergelijken
      const tax = sumTotals(rows).totalTax;
      const dist = Math.abs(p - desiredPartner);
      if (!best || tax < best.tax - 0.005 || (Math.abs(tax - best.tax) <= 0.005 && dist < best.dist)) {
        best = { p, rows, tax, dist };
      }
    });

    if (!best) return { label: "", rows: [], partnerPct: null, childrenPct: null, unavailable: true };

    const partnerPct = best.p;
    const childrenPct = 100 - best.p;
    let label;
    if (donors.length > 1) label = "Laagste belasting (indicatief): alleen kinderen, beide ouders als schenker";
    else if (!hasPartner) label = "Laagste belasting (indicatief): alleen kinderen, 100%";
    else if (childrenCount === 0) label = "Laagste belasting (indicatief): alleen partner, 100%";
    else label = `Laagste belasting (indicatief): partner ${partnerPct}%, kinderen ${childrenPct}%`;
    return { label, rows: best.rows, partnerPct, childrenPct };
  }

  // Samenwonend: wat zou dezelfde invoer kosten met PACS of huwelijk (spec D.2)?
  function buildRelationComparison(net, desiredTax) {
    if (state.family.relation !== "cohab") return null;
    const rows = computeRowsForAllocation(net, state.scenario.allocateToPartnerPct, state.scenario.allocateToChildrenPct, {
      partnerRelation: "married",
    });
    if (rows.some((r) => r.computed === false)) return null;
    return { cohabTax: desiredTax, marriedOrPacsTax: sumTotals(rows).totalTax };
  }

  // Voorwaarden van de don familial op basis van de huidige invoer (voor het vinkjesoverzicht).
  function describeDonFamilial() {
    const sc = state.scenario;
    if (sc.mode !== "donation" || sc.donationType !== "cash_gift_31865") return null;
    const donors = effectiveDonors();
    const kinds = childKinds();
    const hasOwn = kinds.some((k) => k.relation === "child");
    const cash = sc.cashAmount === null || sc.cashAmount === undefined || sc.cashAmount === "" ? 1 : Number(sc.cashAmount) || 0;
    const pri = derivePriors(priorGiftsFor("child"), ALLOWANCE_CHILD, new Date());
    return donors.map((d) =>
      Object.assign(
        { donor: d.label },
        check790G({
          relation: hasOwn ? "child" : kinds.length ? kinds[0].relation : "none",
          cashPart: cash,
          donorAge: d.age,
          recipientStatus: sc.recipientStatus,
          minorFlag: !!state.family.hasMinorChildren,
          used790G: pri.used790G,
        })
      )
    );
  }

  function civilCaveat() {
    return hasPartnerInFamily() ? "voorbehouden erfdeel van de kinderen, rechten van de partner" : "voorbehouden erfdeel van de kinderen";
  }

  // Omschrijving van de gunstigste verdeling; zonder partner of zonder kinderen geen percentages.
  function benchWho(partnerPct, childrenPct, spaced) {
    const pc = spaced ? " %" : "%";
    if (!hasPartnerInFamily()) return "alle kinderen gelijk, geen partner";
    if (toInt(state.family.childrenCount) === 0) return "alles aan de partner";
    return `partner ${partnerPct}${pc}, kinderen ${childrenPct}${pc}`;
  }

  function buildGap(taxDesired, taxMin, minPartnerPct, minChildrenPct) {
    const d = Number(taxDesired) || 0;
    const m = Number(taxMin) || 0;
    const gap = Math.max(0, round2(d - m));

    let level = "ok";
    if (gap > 0 && gap <= 5000) level = "warn";
    if (gap > 5000) level = "bad";

    const who = benchWho(minPartnerPct, minChildrenPct, false);
    const civil = civilCaveat();
    return {
      level,
      title: "Vergelijking met de gunstigste verdeling",
      body:
        gap === 0
          ? `Uw verdeling is binnen deze berekening de fiscaal gunstigste; of deze verdeling civielrechtelijk kan (${civil}), moet een notaris beoordelen.`
          : `Uw verdeling kost indicatief ${formatEUR(gap)} meer belasting dan de gunstigste verdeling (${who}), fiscaal gezien; of deze verdeling civielrechtelijk kan (${civil}), moet een notaris beoordelen.`,
      taxDesired: d,
      taxMin: m,
      taxGap: gap,
      minPartnerPct,
      minChildrenPct,
      note: "De gunstigste verdeling is indicatief en negeert civielrechtelijke beperkingen; gebruik dit als signaal om scenario’s met een notaris te bespreken.",
    };
  }

  function buildNotComputed(rows) {
    const list = [];
    (rows || []).forEach((r) => {
      if (r.computed === false) list.push(`Niet berekend (${r.person}): ${r.reason}`);
    });
    if (state.family.hasAdoptedChildren && clampInt(state.family.adoptedSimpleCount || 0, 0, 99) === 0) {
      list.push("Adoptiekinderen: u geeft aan dat het om adoption plénière gaat; die tellen als eigen kind. Bij adoption simple vult u het aantal in.");
    }
    if (state.estate.includesLifeInsurance) list.push("Assurance-vie: eigen regime; de tool rekent geen betrouwbare eindbelasting.");
    if (state.estate.includesBusiness || state.wishes.goals.businessSuccession) list.push("Onderneming of bedrijfsopvolging: waardering en fiscale regimes zijn werk voor notaris of fiscalist (niet doorgerekend).");
    if (state.anchors.mainAssetsLocation !== "fr" || state.anchors.habitualResidenceAtDeath !== "fr") list.push("Internationale doorsnijdingen (NL/FR): de tool rekent primair de Franse basisheffing; dubbele heffing en verdragen zijn niet doorgerekend.");
    if (state.will.type === "none") list.push("Zonder testament kan uw gewenste verdeling civielrechtelijk niet uitvoerbaar zijn (de tool signaleert dit, maar rekent het niet door).");
    if (state.will.hasChoiceOfLawToNationality) list.push("Rechtskeuze (EU 650/2012) beïnvloedt de civiele verdeling; belasting blijft een aparte laag (de tool rekent fiscaal de Franse basis).");
    if (state.scenario.mode === "donation" && state.scenario.donationType === "cash_gift_31865") {
      list.push("Geldschenking (art. 790 G): de aangifte binnen één maand door de ontvanger kan de tool niet controleren.");
    }
    if (nlFictie()) list.push("Nederlandse erf- of schenkbelasting (tienjaarsfictie, art. 3 Successiewet 1956): Nederland kan ook heffen; deze belasting is niet doorgerekend. Raadpleeg een fiscalist.");
    if (state.anchors.habitualResidenceAtDeath === "nl") list.push("Nederlandse erf- of schenkbelasting als woonland: niet doorgerekend. Raadpleeg een fiscalist.");
    list.push("Broers, zussen, kleinkinderen, neven en nichten als ontvanger: niet doorgerekend.");
    return list;
  }

  function sumTotals(rows) {
    let totalGross = 0,
      totalTax = 0,
      totalNet = 0;
    (rows || []).forEach((r) => {
      if (r.computed === false) return;
      totalGross += Number(r.gross) || 0;
      totalTax += Number(r.tax) || 0;
      totalNet += Number(r.net) || 0;
    });
    return { totalGross: round2(totalGross), totalTax: round2(totalTax), totalNet: round2(totalNet) };
  }

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
      tool: { id: "erf-en-schenkingsrecht-nl-fr", version: "0.4.2" },
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
          stepchildrenCount: state.family.hasStepchildren ? toInt(state.family.stepchildrenCount) : 0,
          adoptedSimpleCount: state.family.hasAdoptedChildren ? toInt(state.family.adoptedSimpleCount) : 0,
        },
        anchors: { ...state.anchors },
        estate: { ...state.estate },
        will: { ...state.will },
        scenario: { ...state.scenario },
      },

      outputs: {
        netEstate: r.netEstate ?? calcNetEstate(),
        taxBase: r.taxBase ?? calcFrTaxBase(),
        rowsDesired: r.rowsDesired || [],
        totalsDesired: r.totalsDesired || { totalGross: 0, totalTax: 0, totalNet: 0 },

        benchmark: {
          label: r.benchmarkLabel || "",
          minPartnerPct: r.gap ? r.gap.minPartnerPct : null,
          minChildrenPct: r.gap ? r.gap.minChildrenPct : null,
          rows: r.rowsMin || [],
          totals: r.totalsMin || { totalGross: 0, totalTax: 0, totalNet: 0 },
        },

        gap: r.gap || null,
        relationComparison: r.relationComparison || null,
        notComputed: r.notComputed || [],
        nudges: r.nudges || [],
        assumptions: r.assumptions || [],
        sourcesUsed: r.sourcesUsed || computeSourcesUsed(),
      },
    };
  }

  function computeSourcesUsed(nudgesOverride, notComputedOverride) {
    const set = new Set();

    set.add("sp_succession_2025");
    set.add("sp_donation_2024");
    set.add("cgi_777");
    set.add("cgi_779");
    set.add("cgi_784");
    if (state.scenario.mode === "donation" && state.scenario.donationType === "cash_gift_31865") set.add("cgi_790g");
    if (state.scenario.mode === "succession") set.add("cgi_788");
    if (state.scenario.mode === "donation" && (state.family.relation === "married" || state.family.relation === "pacs")) {
      set.add(state.family.relation === "married" ? "cgi_790e" : "cgi_790f");
    }

    if (state.anchors.habitualResidenceAtDeath !== "fr" || state.anchors.mainAssetsLocation !== "fr" || state.anchors.nationality !== "fr") {
      set.add("eurlex_650_2012");
    }
    if (state.will.hasChoiceOfLawToNationality || state.will.type === "eu_choice" || state.will.type === "none") {
      set.add("eurlex_650_2012");
    }

    if (toInt(state.family.childrenCount) > 0 || state.family.hasChildrenFromEarlierRelationship) set.add("legi_cc_912");
    if (state.will.hasChoiceOfLawToNationality) set.add("legi_cc_913");
    if (state.family.relation === "pacs") set.add("sp_pacs_2026");

    if (state.scenario.mode === "donation" && toInt(state.family.childrenCount) > 0) set.add("impots_don_enfant_2025");

    const nudges = nudgesOverride || buildNudges();
    nudges.forEach((n) => {
      if (n && n.sourceId) set.add(n.sourceId);
    });

    return Array.from(set)
      .map((id) => SOURCES[id])
      .filter(Boolean);
  }

  // -------------------------
  // DossierFrankrijk integration (postMessage)
  // -------------------------
  function saveToDossier() {
    computeReport();

    // Alleen versturen naar een bekende herkomst; nooit naar "*".
    let referrer = "";
    let ancestor = "";
    try {
      referrer = document.referrer || "";
    } catch (_) {}
    try {
      if (window.location && window.location.ancestorOrigins && window.location.ancestorOrigins.length) {
        ancestor = window.location.ancestorOrigins[0] || "";
      }
    } catch (_) {}
    const parentOrigin = resolveParentOrigin(referrer, ancestor);

    if (window.parent === window) {
      elActionHint.textContent = "Opslaan in het dossier werkt alleen binnen Infofrankrijk.com.";
      return;
    }
    if (!parentOrigin) {
      elActionHint.textContent =
        "Opslaan in het dossier is niet verstuurd: de herkomst van deze pagina is niet herkend. Open de tool via Infofrankrijk.com.";
      return;
    }

    const contract = buildReportContract();
    const payload = buildDossierMessage(contract);

    try {
      window.parent.postMessage(payload, parentOrigin);
      elActionHint.textContent = "Opslaan-verzoek verzonden (er verschijnt een venster in Infofrankrijk).";
    } catch (e) {
      elActionHint.textContent = "Opslaan mislukt (postMessage-fout).";
      console.error(e);
    }
  }

  const ALLOWED_PARENT_ORIGINS = ["https://infofrankrijk.com", "https://www.infofrankrijk.com"];

  // Geeft de toegestane origin van het ouderframe terug, of "" als de herkomst onbekend is.
  function resolveParentOrigin(referrer, ancestorOrigin) {
    const candidates = [];
    try {
      if (referrer) candidates.push(new URL(referrer).origin);
    } catch (_) {}
    if (ancestorOrigin) candidates.push(String(ancestorOrigin).replace(/\/$/, ""));
    for (const origin of candidates) {
      if (ALLOWED_PARENT_ORIGINS.includes(origin)) return origin;
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin; // alleen ontwikkeling
    }
    return "";
  }

  function buildDossierMessage(contract) {
    const title = buildDossierTitle(contract);
    const summary = buildDossierSummary(contract);

    return {
      type: "saveToDossier",
      title,
      summary,
      data: contract,
      source: "erf-en-schenkingsrecht-nl-fr",
      bron: "infofrankrijk",
      toolVersion: "0.4.2",
      generatedAt: new Date().toISOString(),
    };
  }

  function buildDossierTitle(contract) {
    const mode = state.scenario.mode === "donation" ? "Schenking" : "Erfenis";
    const kids = toInt(state.family.childrenCount);
    const rel = labelRelation(state.family.relation);
    const net = formatEUR(contract.outputs.netEstate);
    const gap = contract.outputs.gap ? ` | meer belasting dan gunstigste verdeling ${formatEUR(contract.outputs.gap.taxGap)}` : "";
    return `Erf- en schenkingsrecht: ${mode} | ${rel} | kinderen ${kids} | netto ${net}${gap}`;
  }

  const SUMMARY_MAX = 4000;

  // Markdown-samenvatting voor DossierFrankrijk (tabellen, geen HTML).
  function buildDossierSummary(contract) {
    const o = contract.outputs;
    const md = (n) => formatEUR(n).replace(/[  ]/g, " ");
    const clean = (t) => String(t).replace(/\s*[—–]\s*/g, ", ").replace(/\|/g, "/");
    const rows = o.rowsDesired || [];
    const donors = effectiveDonors();
    const date = new Date().toLocaleDateString("nl-NL");

    const modeTxt = state.scenario.mode === "donation" ? "Schenking" : "Erfenis";
    const kids = toInt(state.family.childrenCount);
    const kidsTxt = kids === 1 ? "1 kind" : `${kids} kinderen`;

    const head = [
      "## Erf- en schenkingsrecht NL/FR: uw scenario",
      `${modeTxt}, ${labelRelation(state.family.relation).toLowerCase()}, ${kidsTxt}, netto bedrag ${md(o.netEstate)}`,
      `Berekend op ${date} met versie 0.4.2`,
    ];

    // In het kort
    let short;
    const taxDesired = o.totalsDesired ? o.totalsDesired.totalTax : 0;
    const civil = civilCaveat();
    if (state.report && state.report.gapSkipped) {
      short = `Bij uw verdeling bedraagt de belasting ${md(taxDesired)}, voor zover door te rekenen. Bij beide ouders als schenker is er geen verdeling tussen partner en kinderen om te vergelijken.`;
    } else if (o.gap) {
      const who = benchWho(o.gap.minPartnerPct, o.gap.minChildrenPct, true);
      short =
        o.gap.taxGap > 0
          ? `Bij uw verdeling bedraagt de belasting ${md(taxDesired)}. De gunstigste verdeling (${who}) komt uit op ${md(o.gap.taxMin)}, dat is ${md(o.gap.taxGap)} minder, fiscaal gezien; of die verdeling civielrechtelijk kan (${civil}), moet een notaris beoordelen.`
          : `Bij uw verdeling bedraagt de belasting ${md(taxDesired)}. Dat is binnen deze berekening ook de fiscaal gunstigste verdeling (${who}); of een verdeling civielrechtelijk kan (${civil}), moet een notaris beoordelen.`;
    } else {
      short = `Bij uw verdeling bedraagt de belasting ${md(taxDesired)}, voor zover door te rekenen. Een vergelijking met de gunstigste verdeling is niet beschikbaar.`;
    }

    // Tabel
    const table = ["| Ontvanger | Bruto | Belasting | Netto |", "|---|---|---|---|"];
    rows.forEach((r) => {
      if (r.computed === false) table.push(`| ${clean(r.person)} | ${md(r.gross)} | Niet berekend | Niet berekend |`);
      else table.push(`| ${clean(r.person)} | ${md(r.gross)} | ${md(r.tax)} | ${md(r.net)} |`);
    });
    if (rows.length === 0) table.push("| Geen ontvangers | | | |");
    else {
      const t = o.totalsDesired || { totalGross: 0, totalTax: 0, totalNet: 0 };
      const anyNc = rows.some((r) => r.computed === false);
      table.push(`| **${anyNc ? "Totaal (alleen berekende ontvangers)" : "Totaal"}** | ${md(t.totalGross)} | ${md(t.totalTax)} | ${md(t.totalNet)} |`);
    }

    // Vergelijking
    const comp = [];
    comp.push(`- Belasting bij uw verdeling: ${md(taxDesired)}`);
    if (state.report && state.report.gapSkipped) {
      // bij beide ouders geen vergelijking met een gunstigste verdeling
    } else if (o.gap) {
      const who = benchWho(o.gap.minPartnerPct, o.gap.minChildrenPct, true);
      comp.push(`- Belasting bij de gunstigste verdeling (${who}): ${md(o.gap.taxMin)}`);
      comp.push(`- Verschil met de fiscaal gunstigste verdeling: ${md(o.gap.taxGap)}`);
      comp.push("- De gunstigste verdeling negeert civielrechtelijke beperkingen en is een signaal voor het gesprek met een notaris.");
    } else {
      comp.push(`- Vergelijking met de gunstigste verdeling niet beschikbaar. ${(state.report && state.report.gapReason) || ""}`.trim());
    }
    if (o.relationComparison) {
      comp.push(
        `- Dezelfde invoer met PACS of huwelijk: ${md(o.relationComparison.marriedOrPacsTax)} belasting, tegen ${md(o.relationComparison.cohabTax)} als samenwonenden.`
      );
    }

    // Niet meegerekend
    const notComp = (o.notComputed || []).map((x) => `- ${clean(x)}`);

    // Uitgangspunten en bronnen
    const noteSet = [];
    rows.forEach((r) => (r.notes || []).forEach((n) => noteSet.indexOf(n) < 0 && noteSet.push(n)));
    const basis = [];
    if (donors.length === 1 && !hasPartnerInFamily()) {
      basis.push("- Verdeling: alle kinderen gelijk, geen partner");
    } else if (donors.length === 1 && kids === 0) {
      basis.push("- Verdeling: alles aan de partner, geen kinderen");
    } else if (donors.length === 1) {
      basis.push(`- Gewenste verdeling: partner ${state.scenario.allocateToPartnerPct} %, kinderen ${state.scenario.allocateToChildrenPct} %`);
    } else {
      basis.push(`- Beide ouders schenken (ouder 1: ${toInt(state.scenario.donorSplitPct)} %); alleen de kinderen ontvangen`);
    }
    (o.assumptions || []).forEach((x) => basis.push(`- ${clean(x)}`));
    const noteLines = noteSet.map((n) => `- ${clean(n)}`);
    const srcLines = (o.sourcesUsed || []).map((s) => `- [${clean(s.short || s.name)}](${s.url}), ${clean(s.date)}`);

    function assemble(opts) {
      const out = [];
      out.push(...head, "", "### In het kort", short, "", "### Resultaat per ontvanger", ...table, "", ...(peilRegelMd() ? [peilRegelMd(), ""] : []), "### Vergelijking", ...comp, "");
      if (notComp.length) out.push("### Niet meegerekend", ...notComp, "");
      out.push("### Uitgangspunten en bronnen", ...basis);
      if (opts.notes) out.push(...noteLines);
      out.push(...srcLines, "", "Educatieve berekening, geen vervanging van notarieel of fiscaal advies.");
      return out.join("\n");
    }

    let text = assemble({ notes: true });
    if (text.length > SUMMARY_MAX) text = assemble({ notes: false });
    if (text.length > SUMMARY_MAX) {
      // Laatste redmiddel: bronnen zonder datum.
      const plain = (o.sourcesUsed || []).map((s) => `- [${clean(s.short || s.name)}](${s.url})`);
      srcLines.splice(0, srcLines.length, ...plain);
      text = assemble({ notes: false });
    }
    return text;
  }

  // -------------------------
  // Print/PDF export
  // -------------------------
  function renderPrintReport(contract) {
    const o = contract.outputs;
    const sources = o.sourcesUsed || [];
    const nudges = o.nudges || [];

    document.documentElement.classList.add("nlfr-printing");

    elPrintRoot.innerHTML = `
      <section class="nlfr-print">
        <header class="nlfr-print__header">
          <div class="nlfr-print__h1">Erf- en schenkingsrecht NL/FR: rapport</div>
          <div class="nlfr-print__meta">
            <div>Versie: ${escapeHtml(contract.tool.version)}</div>
            <div>Datum: ${escapeHtml(new Date().toLocaleDateString("nl-NL"))}</div>
            <div>Schema: ${escapeHtml(contract.schema)}</div>
          </div>
          <div class="nlfr-print__note">
            Educatieve scenariotool. Bedoeld voor begrip, vergelijking en routekeuze, geen vervanging van notarieel of fiscaal advies.
          </div>
        </header>

        <hr class="nlfr-print__hr" />

        <h2 class="nlfr-print__h2">1) Invoer (kern)</h2>
        ${printKeyValues([
          ["Traject", labelMode(state.scenario.mode)],
          ["Relatie", labelRelation(state.family.relation)],
          ["Kinderen", String(toInt(state.family.childrenCount))],
          ["Testament", labelWill(state.will.type)],
          ["Netto massa (indicatief)", formatEUR(o.netEstate)],
        ])}

        <h2 class="nlfr-print__h2">2) Gewenste verdeling</h2>
        ${printKeyValues([
          ["Partner", `${state.scenario.allocateToPartnerPct}%`],
          ["Kinderen", `${state.scenario.allocateToChildrenPct}%`],
        ])}

        <h2 class="nlfr-print__h2">3) Resultaten (gewenst)</h2>
        ${printResultsTable(o.rowsDesired || [])}

        ${voorbehoudHtml()}
        ${peilRegelHtml()}

        <h2 class="nlfr-print__h2">4) Gunstigste verdeling</h2>
        ${printBenchmarkGap(o)}

        <h2 class="nlfr-print__h2">5) Controles en waarschuwingen (actief)</h2>
        ${printNudges(nudges)}

        <h2 class="nlfr-print__h2">6) Niet doorgerekend</h2>
        ${printList(o.notComputed || [], "Geen extra beperkingen op basis van huidige invoer.")}

        <h2 class="nlfr-print__h2">7) Aannames</h2>
        ${printList(o.assumptions || [], "Geen aannames geregistreerd (onverwacht).")}

        <h2 class="nlfr-print__h2">8) Bronnen gebruikt</h2>
        ${printSources(sources)}

        <footer class="nlfr-print__footer">
          <div>Tool: ${escapeHtml(contract.tool.id)}, versie ${escapeHtml(contract.tool.version)}</div>
        </footer>
      </section>
    `;
  }

  function printKeyValues(items) {
    return `
      <table class="nlfr-print__kv" role="presentation">
        <tbody>
          ${items
            .map(
              ([k, v]) => `
            <tr>
              <td class="nlfr-print__kvk">${escapeHtml(k)}</td>
              <td class="nlfr-print__kvv">${escapeHtml(v)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  function printResultsTable(rows) {
    if (!rows.length) return `<div class="nlfr-print__badge nlfr-print__badge--warn">Onvoldoende invoer om te rekenen.</div>`;
    const body = rows
      .map((r) => {
        if (r.computed === false) {
          return `
      <tr>
        <td>${escapeHtml(r.person)}</td>
        <td>${escapeHtml(r.relationLabel)}</td>
        <td>${formatEUR(r.gross)}</td>
        <td colspan="4"><strong>Niet berekend:</strong> ${escapeHtml(r.reason)}</td>
      </tr>`;
        }
        const noteRow = r.notes && r.notes.length ? `<tr><td colspan="7">${r.notes.map((n) => escapeHtml(n)).join(" ")}</td></tr>` : "";
        return `
      <tr>
        <td>${escapeHtml(r.person)}</td>
        <td>${escapeHtml(r.relationLabel)}</td>
        <td>${formatEUR(r.gross)}</td>
        <td>${formatEUR(r.allowance)}</td>
        <td>${formatEUR(r.taxable)}</td>
        <td>${formatEUR(r.tax)}</td>
        <td><strong>${formatEUR(r.net)}</strong></td>
      </tr>${noteRow}`;
      })
      .join("");

    return `
      <table class="nlfr-print__table">
        <thead>
          <tr>
            <th>Ontvanger</th><th>Relatie</th><th>Bruto</th><th>Aftrek</th><th>Belastbaar</th><th>Belasting</th><th>Netto</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  function printBenchmarkGap(o) {
    if (state.report && state.report.gapSkipped) return `<div class="nlfr-print__muted">Bij beide ouders als schenker is er geen verdeling tussen partner en kinderen om te vergelijken.</div>`;
    if (!o.gap) return `<div class="nlfr-print__badge nlfr-print__badge--warn">Vergelijking met de gunstigste verdeling niet beschikbaar. ${escapeHtml((state.report && state.report.gapReason) || "")}</div>`;

    const benchLabel = (o.benchmark && o.benchmark.label) ? o.benchmark.label : (state.report.benchmarkLabel || "(indicatief)");
    return `
      <div class="nlfr-print__box">
        <div><strong>Gunstigste verdeling:</strong> ${escapeHtml(benchLabel)}</div>
        <div style="margin-top:6px;">Belasting (gewenst): <strong>${formatEUR(o.gap.taxDesired)}</strong></div>
        <div>Belasting bij de gunstigste verdeling: <strong>${formatEUR(o.gap.taxMin)}</strong></div>
        <div>Verschil met de fiscaal gunstigste verdeling: <strong>${formatEUR(o.gap.taxGap)}</strong></div>
        <div style="margin-top:6px;" class="nlfr-print__muted">${escapeHtml(o.gap.note)}</div>
      </div>
    `;
  }

  function printNudges(nudges) {
    if (!nudges.length) return `<div class="nlfr-print__badge nlfr-print__badge--ok">Geen directe flags op basis van huidige invoer.</div>`;
    return nudges
      .map((n) => {
        const src = SOURCES[n.sourceId];
        return `
        <div class="nlfr-print__nudge">
          <div class="nlfr-print__nudgeTitle">${escapeHtml(n.title)} <span class="nlfr-print__pill nlfr-print__pill--${escapeHtml(n.level)}">${escapeHtml(
          levelLabel(n.level)
        )}</span></div>
          <div class="nlfr-print__nudgeBody">${escapeHtml(n.body)}</div>
          ${src ? `<div class="nlfr-print__muted">Bron: ${escapeHtml(src.name)}, ${escapeHtml(src.date)}, ${escapeHtml(src.url)}</div>` : ``}
        </div>
      `;
      })
      .join("");
  }

  function printList(items, emptyText) {
    if (!items.length) return `<div class="nlfr-print__badge nlfr-print__badge--ok">${escapeHtml(emptyText)}</div>`;
    return `<ul class="nlfr-print__ul">${items.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  }

  function printSources(sources) {
    if (!sources.length) return `<div class="nlfr-print__badge nlfr-print__badge--warn">Geen bronnen gedetecteerd (onverwacht).</div>`;
    return `
      <ul class="nlfr-print__ul">
        ${sources.map((s) => `<li>${escapeHtml(s.name)}, ${escapeHtml(s.date)}, ${escapeHtml(s.url)}</li>`).join("")}
      </ul>
    `;
  }

  function injectPrintStyles() {
    if (document.getElementById("nlfrPrintStyles")) return;

    const css = `
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
  function next() {
    goTo(state.ui.stepIndex + 1);
  }
  function prev() {
    goTo(state.ui.stepIndex - 1);
  }

  // -------------------------
  // Helpers
  // -------------------------
  function hasPartnerInFamily() {
    return state.family.relation === "married" || state.family.relation === "pacs" || state.family.relation === "cohab";
  }

  // Aftrek hoofdwoning (art. 764 bis CGI): alleen bij overlijden, en alleen als de woning ook bewoond werd door de langstlevende echtgenoot of PACS-partner, of door een minderjarig of beschermd kind.
  function mainHomeAbatement() {
    if (state.scenario.mode === "donation" || !state.estate.includesMainHome) return 0;
    const bewoond = state.family.relation === "married" || state.family.relation === "pacs" || !!state.family.hasMinorChildren;
    if (!bewoond) return 0;
    const a = Math.max(0, Number(state.estate.assetsTotal) || 0);
    const woning = Math.min(a, Math.max(0, Number(state.estate.mainHomeValue) || 0));
    return round2(woning * ABATTEMENT_HOOFDWONING);
  }

  // Forfait begrafeniskosten (art. 775 CGI): alleen bij overlijden, hoogstens het actief.
  function funeralForfait() {
    if (state.scenario.mode === "donation") return 0;
    return Math.min(FORFAIT_BEGRAFENIS, Math.max(0, Number(state.estate.assetsTotal) || 0));
  }

  // Netto massa. Bij overlijden: bezittingen min schulden, min forfait begrafeniskosten, min aftrek hoofdwoning.
  // Bij schenking: het geschonken bedrag; schulden van de schenker zijn geen aftrekpost.
  function calcNetEstate() {
    const a = Math.max(0, Number(state.estate.assetsTotal) || 0);
    if (state.scenario.mode === "donation") return round2(a);
    const d = Math.max(0, Number(state.estate.debtsTotal) || 0);
    return round2(Math.max(0, a - d - funeralForfait() - mainHomeAbatement()));
  }

  // Territorialiteit (art. 750 ter CGI). Woonde de overledene of schenker in Frankrijk: alles. Anders alleen de Franse goederen,
  // tenzij de verkrijger fiscaal inwoner van Frankrijk is en dat ten minste 6 van de laatste 10 jaar was: dan alles.
  function territorialRestricted() {
    return state.anchors.habitualResidenceAtDeath !== "fr" && state.anchors.recipientFrResident === "no";
  }
  function frShare() {
    if (!territorialRestricted()) return 1;
    const loc = state.anchors.mainAssetsLocation;
    if (loc === "fr") return 1;
    if (loc === "nl") return 0;
    return clampInt(state.anchors.frAssetsPct, 0, 100) / 100;
  }
  // Grondslag voor de Franse belasting: de netto massa naar rato van de Franse goederen.
  function calcFrTaxBase() {
    return round2(calcNetEstate() * frShare());
  }

  // Nederlandse tienjaarsfictie (art. 3 Successiewet 1956). Geeft null als de fictie niet speelt.
  function nlFictie() {
    const a = state.anchors;
    if (a.habitualResidenceAtDeath === "nl") return null;
    const t = a.leftNlSince;
    if (a.nationality === "nl" && (t === "lt1" || t === "lt10")) return { grond: "nl10" };
    if (state.scenario.mode === "donation" && t === "lt1") return { grond: "jaar" };
    return null;
  }

  function labelRelation(rel) {
    if (rel === "married") return "Gehuwd";
    if (rel === "pacs") return "PACS";
    if (rel === "cohab") return "Samenwonend (concubinage)";
    if (rel === "single") return "Geen partner";
    if (rel === "stepchild") return "Stiefkind";
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

  function bindAmount(id, value, min, max, onChange, nullable) {
    const el = document.getElementById(id);
    el.value = value === null || value === undefined ? "" : String(value);
    el.addEventListener("change", () => {
      const raw = String(el.value).trim();
      if (raw === "" && nullable) onChange(null);
      else {
        const n = Math.round(Number(raw));
        onChange(Math.min(max, Math.max(min, Number.isFinite(n) ? n : min)));
      }
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
    } catch (_) {}
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

  function levelLabel(level) {
    if (level === "bad") return "Let op";
    if (level === "warn") return "Aandachtspunt";
    return "Ter info";
  }

  function formatEUR(n) {
    const v = Number(n) || 0;
    return v.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
  }

  // Art. 1724 CGI: de belasting wordt per verkrijger afgerond op de dichtstbijzijnde euro, 0,50 telt voor 1.
  function roundEuro(n) {
    return Math.round(round2(n));
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
        <pre style="white-space:pre-wrap; background:#fff; border:1px solid rgba(0,0,0,.12); padding:12px; border-radius:10px;">${escapeHtml(
          String(err && err.stack ? err.stack : err)
        )}</pre>
      `;
    } catch (_) {}
  }

  // Rekenfuncties beschikbaar maken voor de tests (tests/erf.test.mjs); geen effect op de pagina.
  try {
    globalThis.ERF_ENGINE = {
      state,
      computeReport,
      calcPair,
      check790G,
      derivePriors,
      progressiveTax,
      taxWithOffset,
      resolveParentOrigin,
      buildReportContract,
      buildDossierSummary,
      buildDossierMessage,
      BRACKETS_LINE_DIRECT,
      BRACKETS_SPOUSE_DONATION,
      BRACKETS_FLAT_60,
      DON_FAMILIAL_MAX,
      ALLOWANCE_CHILD,
      ALLOWANCE_SPOUSE_DONATION,
      ALLOWANCE_DEATH_NONRELATIVE,
      DONOR_MAX_AGE,
      RAPPEL_YEARS,
      FORFAIT_BEGRAFENIS,
      ABATTEMENT_HOOFDWONING,
      calcNetEstate,
      calcFrTaxBase,
      frShare,
      nlFictie,
      PEIL_STAND,
      PEIL_LABEL_AAN,
      PEIL_UITLEG_URL, PEIL_KAART_URL,
      peilStandNl,
      peilStandKort,
      peilRegelMd,
      peilRegelHtml,
      peilVoetHtml,
      mergeDefaults,
      DEFAULT_STATE,
      goTo,
      renderPrintReport,
    };
  } catch (_) {}
})();
