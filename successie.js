/**
 * EXPERT SUCCESSION ENGINE NL-FR 2026
 * Gebaseerd op: Code Général des Impôts (Art. 777, 784, 669)
 * Update: 27 januari 2026
 */

const LEGAL_CONTENT = {
    residency: { 
        title: "Gewone Verblijfplaats (EU 650/2012)", 
        text: "Uw fiscale residentie bepaalt de reikwijdte van de heffing. Bij residentie in FR is het wereldwijde vermogen belastbaar. Let op: Nederland hanteert een 10-jarige woonplaatsfictie (Art. 3 SW 1956).", 
        source: "Bron: EU Erfrechtverordening / Successiewet 1956" 
    },
    adoption: { 
        title: "Adoption Simple (Art. 786 CGI)", 
        text: "Deze juridische procedure stelt stiefkinderen fiscaal gelijk aan biologische kinderen. Zonder dit vonnis geldt een tarief van 60% na een minimale vrijstelling van slechts € 1.594.", 
        source: "Bron: Code Général des Impôts / Frankrijknotaris.nl" 
    },
    professio: { 
        title: "Rechtskeuze & Art. 913 CC", 
        text: "Een rechtskeuze voor Nederlands recht is civielrechtelijk geldig, maar Frankrijk blokkeert de onterving van kinderen via de 'Prüm-wetgeving' indien er Frans vastgoed aanwezig is.", 
        source: "Bron: Cour de Cassation / Loi n° 2021-1109" 
    }
};

// Navigatie & UI Logic
function goToStep(s) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById('step' + s).classList.add('active');
    document.getElementById('progress-bar').style.width = (s * 25) + '%';
}

function updateUI() {
    const val = document.getElementById('property-val').value;
    document.getElementById('val-display').innerText = '€ ' + Number(val).toLocaleString('nl-NL');
}

function toggleEmigratie() {
    const res = document.getElementById('residency').value;
    document.getElementById('emigratie-field').style.display = (res === 'FR') ? 'block' : 'none';
}

function toggleAdoption() {
    const type = document.getElementById('heir-type').value;
    document.getElementById('adoption-option').style.display = (type === 'step') ? 'block' : 'none';
}

function showInfo(key) {
    const content = LEGAL_CONTENT[key];
    document.getElementById('modal-title').innerText = content.title;
    document.getElementById('modal-body').innerText = content.text;
    document.getElementById('modal-source').innerText = content.source;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

// Validatie Logic
function showConfirmation() {
    const data = {
        "Fiscale Residentie": document.getElementById('residency').value === 'FR' ? "Frankrijk" : "Nederland",
        "Aantal Erfgenamen": document.getElementById('num-children').value,
        "Type Erfgenaam": document.getElementById('heir-type').value === 'direct' ? "Biologisch" : "Stiefkind",
        "Adoption Simple": document.getElementById('is-adoption-simple').checked ? "Ja" : "Nee",
        "Vastgoedwaarde": '€ ' + Number(document.getElementById('property-val').value).toLocaleString('nl-NL'),
        "Rechtskeuze NL": document.getElementById('legal-choice').value === 'yes' ? "Ja" : "Nee"
    };
    
    let html = '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">';
    for (const [key, value] of Object.entries(data)) {
        html += `<div style="padding:10px; border-bottom:1px solid #ddd;"><strong>${key}:</strong></div>`;
        html += `<div style="padding:10px; border-bottom:1px solid #ddd;">${value}</div>`;
    }
    html += '</div>';
    document.getElementById('confirmation-data').innerHTML = html;
    goToStep(4);
}

// DE FISCALE MOTOR (ART. 777 CGI - 2026)
const TAX_ENGINE = {
    brackets: [
        { limit: 8072, rate: 0.05, constant: 0 },
        { limit: 12109, rate: 0.10, constant: 404 },
        { limit: 15932, rate: 0.15, constant: 1009 },
        { limit: 552324, rate: 0.20, constant: 1806 },
        { limit: 902838, rate: 0.30, constant: 57038 },
        { limit: 1805677, rate: 0.40, constant: 147322 },
        { limit: Infinity, rate: 0.45, constant: 237606 }
    ],

    calculate: function(taxableAmount, isStepChild) {
        if (taxableAmount <= 0) return 0;
        if (isStepChild) return taxableAmount * 0.60;

        const b = this.brackets.find(x => taxableAmount <= x.limit) || this.brackets[this.brackets.length - 1];
        return (taxableAmount * b.rate) - b.constant;
    }
};

function generateFinalReport() {
    const assets = parseFloat(document.getElementById('property-val').value);
    const num = parseInt(document.getElementById('num-children').value);
    const isStep = document.getElementById('heir-type').value === 'step';
    const isAdoption = document.getElementById('is-adoption-simple').checked;
    const res = document.getElementById('residency').value;
    const choice = document.getElementById('legal-choice').value;

    const portionPerChild = assets / num;
    const allowance = (isStep && !isAdoption) ? 1594 : 100000;
    const taxable = Math.max(0, portionPerChild - allowance);
    
    // Berekening per kind
    const taxPerChild = TAX_ENGINE.calculate(taxable, (isStep && !isAdoption));
    const totalTax = taxPerChild * num;

    const reportArea = document.getElementById('final-report');
    reportArea.style.display = 'block';
    
    reportArea.innerHTML = `
        <div style="padding:30px; border:1px solid #eee;">
            <h2 style="margin-top:0;">Strategisch Dossier: Nalatenschapsanalyse</h2>
            <p style="font-size:0.9rem; color:#666;">Gegenereerd op 27 januari 2026 | Dossier-ID: DF-${Math.floor(Math.random()*9000)+1000}</p>
            
            <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background:#f8f9fa;">
                    <th style="padding:15px; text-align:left; border-bottom:2px solid #800000;">Omschrijving</th>
                    <th style="padding:15px; text-align:right; border-bottom:2px solid #800000;">Waarde</th>
                </tr>
                <tr>
                    <td style="padding:12px; border-bottom:1px solid #eee;">Bruto waarde onroerend goed (FR)</td>
                    <td style="padding:12px; border-bottom:1px solid #eee; text-align:right;">€ ${assets.toLocaleString('nl-NL')}</td>
                </tr>
                <tr>
                    <td style="padding:12px; border-bottom:1px solid #eee;">Aantal erfgenamen</td>
                    <td style="padding:12px; border-bottom:1px solid #eee; text-align:right;">${num}</td>
                </tr>
                <tr>
                    <td style="padding:12px; border-bottom:1px solid #eee;">Fiscale vrijstelling (per erfgenaam)</td>
                    <td style="padding:12px; border-bottom:1px solid #eee; text-align:right;">€ ${allowance.toLocaleString('nl-NL')}</td>
                </tr>
                <tr style="color:#800000; font-weight:700;">
                    <td style="padding:15px; border-bottom:2px solid #eee;">Totale Franse erfbelasting</td>
                    <td style="padding:15px; border-bottom:2px solid #eee; text-align:right;">€ ${Math.round(totalTax).toLocaleString('nl-NL')}</td>
                </tr>
            </table>

            <div style="background:#fdfdfd; padding:20px; border-left:5px solid #800000; margin:20px 0;">
                <h3 style="margin-top:0;">Netto resultaat</h3>
                <p>Na aftrek van Franse belastingen bedraagt de netto verkrijging per kind: <br>
                <strong style="font-size:1.4rem; color:#800000;">€ ${Math.round(portionPerChild - taxPerChild).toLocaleString('nl-NL')}</strong></p>
            </div>

            ${choice === 'yes' && res === 'FR' ? `
            <div style="color:#d9534f; border:1px solid #d9534f; padding:15px; margin:20px 0; font-size:0.9rem;">
                <strong>WAARSCHUWING ART. 913 CC:</strong> Ondanks uw keuze voor Nederlands recht, voorziet de Franse wet van augustus 2021 in een compenserende reserve voor kinderen als zij door het buitenlandse recht worden benadeeld ten opzichte van hun Franse legitieme portie.
            </div>` : ''}

            ${isStep && !isAdoption ? `
            <div class="appendix" style="background:#f8f9fa; padding:20px; margin-top:30px;">
                <h3 style="margin-top:0;">Strategisch Advies: Adoption Simple</h3>
                <p>Uw stiefkind wordt momenteel belast tegen het 'derden-tarief' van 60%. Door een <strong>Adoption Simple</strong> procedure (Art. 786 CGI) kunt u de belastingdruk verlagen naar het progressieve tarief (5-45%).</p>
                <p><strong>Potentiële besparing in dit scenario: € ${Math.round(totalTax - (TAX_ENGINE.calculate(Math.max(0, portionPerChild - 100000), false) * num)).toLocaleString('nl-NL')}</strong></p>
            </div>` : ''}

            <p style="font-size:0.8rem; color:#888; margin-top:30px;"><em>Disclaimer: Deze berekening is gebaseerd op de fiscale wetgeving van 2026. Dit is een simulatie bedoeld voor strategische oriëntatie en vervangt geen notarieel advies.</em></p>
            
            <button class="btn primary" style="width:100%;" onclick="window.print()">Download Rapport (PDF)</button>
        </div>
    `;
    reportArea.scrollIntoView({ behavior: 'smooth' });
}
