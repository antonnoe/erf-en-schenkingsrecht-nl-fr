/**
 * Frans-Nederlandse Erfrecht Calculator 2026
 * Logica gebaseerd op CGI Art. 777 (Tarieven) en Art. 669 (Vruchtgebruik)
 */

const SUCCESSION_LOGIC = {
    // Tarieven 2026 Rechte Lijn (Kinderen)
    bracketsDirect: [
        { limit: 8072, rate: 0.05, constant: 0 },
        { limit: 12109, rate: 0.10, constant: 404 },
        { limit: 15932, rate: 0.15, constant: 1009 },
        { limit: 552324, rate: 0.20, constant: 1806 },
        { limit: 902838, rate: 0.30, constant: 57038 },
        { limit: 1805677, rate: 0.40, constant: 147322 },
        { limit: Infinity, rate: 0.45, constant: 237606 }
    ],

    // Vrijstellingen 2026
    abattements: {
        child: 100000,
        partner: Infinity, // Gehuwd/PACS is 100% vrijgesteld in FR (Art. 796-0 bis)
        stepchild: 1594,   // Tenzij Adoption Simple
        concubinage: 1594  // Derden / Ongehuwd partner
    },

    /**
     * Bereken Franse Successierechten
     * Formule: Tax = (Netto x Tarief) - Correctiefactor
     */
    calculateFrenchTax: function(amount, type) {
        let allowance = this.abattements[type] || 1594;
        let taxable = Math.max(0, amount - allowance);
        
        if (type === 'stepchild' || type === 'concubinage') {
            return taxable * 0.60; // Hard 60% tarief voor 'derden'
        }

        // Rechte lijn berekening (progressief)
        let bracket = this.bracketsDirect.find(b => taxable <= b.limit) || this.bracketsDirect[this.bracketsDirect.length - 1];
        return (taxable * bracket.rate) - bracket.constant;
    },

    /**
     * Berekening van Bloot Eigendom (Art. 669 CGI)
     */
    getBareOwnershipValue: function(totalValue, age) {
        let factor = 0.9;
        if (age >= 51 && age <= 60) factor = 0.5;
        else if (age >= 61 && age <= 70) factor = 0.6;
        else if (age >= 71 && age <= 80) factor = 0.7;
        else if (age >= 81 && age <= 90) factor = 0.8;
        
        return totalValue * factor;
    }
};

// Integratie met UI
function calculateScenario() {
    const assetVal = parseFloat(document.getElementById('property-slider').value);
    const residency = document.getElementById('residency').value;
    const type = 'child'; // In een volledige tool dynamisch ophalen

    // Berekening 'Koude Hand' (Successie)
    const taxCold = SUCCESSION_LOGIC.calculateFrenchTax(assetVal, type);
    
    // Berekening 'Warme Hand' (Gift Hint)
    // Stel schenker is 65 jaar -> 60% belastbare grondslag
    const bareValue = SUCCESSION_LOGIC.getBareOwnershipValue(assetVal, 65);
    const taxWarm = SUCCESSION_LOGIC.calculateFrenchTax(bareValue, type);

    displayResults(taxCold, taxWarm, assetVal - taxCold);
}

function displayResults(cold, warm, net) {
    const resultDiv = document.getElementById('inheritance-result');
    const saving = cold - warm;

    resultDiv.innerHTML = `
        <div style="border: 1px solid #800000; padding: 15px; border-radius: 5px;">
            <h3>Resultaat Nalatenschap (Koude Hand)</h3>
            <p>Verwachte Franse belasting: <strong>€ ${cold.toLocaleString('nl-NL', {maximumFractionDigits: 0})}</strong></p>
            <p>Netto voor erfgenamen: <strong>€ ${net.toLocaleString('nl-NL', {maximumFractionDigits: 0})}</strong></p>
        </div>
    `;

    if (saving > 5000) {
        document.getElementById('gift-hint').style.display = 'block';
        document.getElementById('gift-hint').innerHTML += `
            <p style="color: #800000; font-weight: bold;">
                Potentiële besparing via de 'Warme Hand': € ${saving.toLocaleString('nl-NL', {maximumFractionDigits: 0})}
            </p>
        `;
    }
}
