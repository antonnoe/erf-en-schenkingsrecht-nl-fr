const LEGAL_CONTENT = {
    residency: { title: "Residency (Art. 21 Erfrechtverordening)", text: "De gewone verblijfplaats is het ankerpunt. Let op de 10-jarenfictie van de Nederlandse Belastingdienst.", source: "Bron: EU 650/2012 / Successiewet 1956" },
    adoption: { title: "Adoption Simple (Art. 786 CGI)", text: "Zonder adoptie betaalt een stiefkind 60%. Met Adoption Simple gelden de tarieven van de rechte lijn (5-45%).", source: "Bron: Code Général des Impôts" },
    professio: { title: "Rechtskeuze (Art. 913 CC)", text: "Het Franse recht beschermt kinderen via de réserve. Een Nederlands testament kan dit niet altijd omzeilen bij Frans vastgoed.", source: "Bron: Loi n° 2021-1109" }
};

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

function showConfirmation() {
    const data = {
        Residentie: document.getElementById('residency').value,
        Kinderen: document.getElementById('num-children').value,
        Type: document.getElementById('heir-type').value,
        Vastgoed: '€ ' + Number(document.getElementById('property-val').value).toLocaleString('nl-NL'),
        Rechtskeuze: document.getElementById('legal-choice').value === 'yes' ? 'Ja' : 'Nee'
    };
    
    let html = '<ul>';
    for (const [key, value] of Object.entries(data)) {
        html += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    html += '</ul>';
    document.getElementById('confirmation-data').innerHTML = html;
    goToStep(4);
}

function generateFinalReport() {
    const assets = parseFloat(document.getElementById('property-val').value);
    const num = parseInt(document.getElementById('num-children').value);
    const isStep = document.getElementById('heir-type').value === 'step';
    const isAdoption = document.getElementById('is-adoption-simple').checked;
    
    const portion = assets / num;
    let allowance = (isStep && !isAdoption) ? 1594 : 100000;
    let taxable = Math.max(0, portion - allowance);
    
    let taxPerChild = (isStep && !isAdoption) ? taxable * 0.60 : (taxable * 0.20); // Vereenvoudigde 20% voor de demo

    const reportArea = document.getElementById('final-report');
    reportArea.style.display = 'block';
    
    reportArea.innerHTML = `
        <h2>Strategisch Dossier: Nalatenschapsanalyse</h2>
        <div class="report-content">
            <p>Voor een vermogen van <strong>€ ${assets.toLocaleString()}</strong> verdeeld over <strong>${num}</strong> erfgenaam/erfgenamen.</p>
            <p><strong>Fiscale claim (Frankrijk):</strong> € ${(taxPerChild * num).toLocaleString()}</p>
            <p><strong>Netto per erfgenaam:</strong> € ${(portion - taxPerChild).toLocaleString()}</p>
        </div>
        
        <div class="appendix">
            <h3>Bijlage: Procedure Adoption Simple</h3>
            <p>Om stiefkinderen fiscaal gelijk te stellen aan biologische kinderen (Art. 786 CGI), dient een procedure bij de Franse rechtbank (Tribunal Judiciaire) te worden gestart:</p>
            <ol>
                <li><strong>Verzoekschrift:</strong> Ingediend door een Franse advocaat (Avocat).</li>
                <li><strong>Toestemming:</strong> Biologische ouders moeten toestemming geven (indien van toepassing).</li>
                <li><strong>Vonnis:</strong> De rechter toetst of de adoptie in het belang van het kind is.</li>
                <li><strong>Resultaat:</strong> De fiscale vrijstelling stijgt van € 1.594 naar € 100.000.</li>
            </ol>
            <p class="modal-source">Bron: Code Civil Art. 361 / Frankrijknotaris.nl</p>
        </div>

        <button class="btn highlight-btn" onclick="window.print()">Download als PDF voor DossierFrankrijk.nl</button>
    `;
    reportArea.scrollIntoView({ behavior: 'smooth' });
}
