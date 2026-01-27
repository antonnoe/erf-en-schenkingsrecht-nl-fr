const INFO_DB = {
    residency: {
        title: "Gewone Verblijfplaats (EU 650/2012)",
        text: "Het land waar u het feitelijke centrum van uw belangen heeft, bepaalt welk erfrecht van toepassing is. Dit heeft enorme gevolgen voor de legitieme portie.",
        source: "Bron: Europese Erfrechtverordening Art. 21"
    },
    adoption: {
        title: "Adoption Simple (Art. 786 CGI)",
        text: "Door een stiefkind via 'Adoption Simple' te adopteren, behoudt het kind de band met de biologische ouders, maar wordt het voor de Franse fiscus in de rechte lijn belast (5-45% ipv 60%).",
        source: "Bron: Code Général des Impôts Art. 786 / Frankrijknotaris.nl"
    },
    professio: {
        title: "Rechtskeuze & Art. 913 Code Civil",
        text: "Sinds 2021 blokkeert Frankrijk de onterving van kinderen via Nederlands recht als er Frans vastgoed in het spel is. De kinderen kunnen een compensatie claimen.",
        source: "Bron: Loi n° 2021-1109 du 24 août 2021"
    }
};

function nextStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    document.getElementById('progress').style.width = (step * 33) + '%';
}

function updateUI() {
    const val = document.getElementById('property-val').value;
    document.getElementById('og-val-display').innerText = '€ ' + Number(val).toLocaleString('nl-NL');
}

function toggleAdoption() {
    const type = document.getElementById('heir-type').value;
    document.getElementById('adoption-bypass').style.display = (type === 'step') ? 'block' : 'none';
}

function showInfo(key) {
    const info = INFO_DB[key];
    document.getElementById('modal-title').innerText = info.title;
    document.getElementById('modal-text').innerText = info.text;
    document.getElementById('modal-source').innerText = info.source;
    document.getElementById('info-modal').style.display = 'block';
}

function closeInfo() { document.getElementById('info-modal').style.display = 'none'; }

function calculateFinal() {
    const totalAssets = parseFloat(document.getElementById('property-val').value);
    const numChildren = parseInt(document.getElementById('num-children').value);
    const isStep = document.getElementById('heir-type').value === 'step';
    const isAdoption = document.getElementById('is-adoption-simple').checked;
    const residentie = document.getElementById('residency').value;
    const choice = document.getElementById('legal-choice').value;

    // Verdeling over kinderen
    const portionPerChild = totalAssets / numChildren;
    
    // Fiscale status bepalen
    let taxPerChild = 0;
    let allowance = (isStep && !isAdoption) ? 1594 : 100000;
    let taxable = Math.max(0, portionPerChild - allowance);

    if (isStep && !isAdoption) {
        taxPerChild = taxable * 0.60;
    } else {
        // Progressieve schijven 2026
        const brackets = [
            { lim: 8072, r: 0.05, c: 0 },
            { lim: 552324, r: 0.20, c: 1806 },
            { lim: Infinity, r: 0.45, c: 237606 }
        ];
        const b = brackets.find(x => taxable <= x.lim) || brackets[2];
        taxPerChild = (taxable * b.r) - b.c;
    }

    const totalTax = taxPerChild * numChildren;

    // Rapport genereren
    let report = `
        <h2>Strategisch Dossier</h2>
        <p>Voor een vermogen van € ${totalAssets.toLocaleString()} verdeeld over ${numChildren} kind(eren).</p>
        <hr>
        <p><strong>Fiscale Claim Frankrijk:</strong> € ${Math.round(totalTax).toLocaleString()}</p>
        <p><strong>Netto per kind:</strong> € ${Math.round(portionPerChild - taxPerChild).toLocaleString()}</p>
    `;

    if (choice === 'yes' && residentie === 'FR') {
        report += `<div class="warning-text" style="color:red; font-weight:bold; border: 1px solid red; padding:10px;">
            ⚠️ ART. 913 ALERT: Uw rechtskeuze voor Nederlands recht kan in Frankrijk worden aangevochten door de 'compenserende reserve'. Kinderen kunnen hun legitieme portie opeisen over het Franse vastgoed.
        </div>`;
    }

    const resultArea = document.getElementById('result-area');
    resultArea.innerHTML = report;
    resultArea.style.display = 'block';
    resultArea.scrollIntoView();
}
