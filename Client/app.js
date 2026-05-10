var locationSelect  = null;
var compareSelect1  = null;
var compareSelect2  = null;
var currentPrice    = null;
var currentConfig   = null;
var allLocations    = [];

// Auto-detect whether we're running locally or on the server.
// Locally the frontend is opened directly, so requests go to the Flask dev server.
// On EC2, Nginx serves the frontend and proxies API calls, so relative URLs work.
var BASE_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://127.0.0.1:5000'
    : '';

function getBathValue() {
    var uiBathrooms = document.getElementsByName("uiBathrooms");
    for (var i in uiBathrooms) {
        if (uiBathrooms[i].checked) return parseInt(i) + 1;
    }
    return -1;
}

function getBHKValue() {
    var uiBHK = document.getElementsByName("uiBHK");
    for (var i in uiBHK) {
        if (uiBHK[i].checked) return parseInt(i) + 1;
    }
    return -1;
}

// ── EMI ──────────────────────────────────────────────────────────────────────

function calculateEMI() {
    if (!currentPrice) return;

    var downPct    = parseFloat(document.getElementById('uiDownPayment').value)  / 100;
    var annualRate = parseFloat(document.getElementById('uiInterestRate').value) / 100;
    var years      = parseInt(document.getElementById('uiTenure').value);

    if (isNaN(downPct) || isNaN(annualRate) || isNaN(years) || years < 1) return;

    var loanLakhs = currentPrice * (1 - downPct);
    var principal = loanLakhs * 100000;
    var monthly   = annualRate / 12;
    var months    = years * 12;

    var emi = monthly === 0
        ? principal / months
        : principal * monthly * Math.pow(1 + monthly, months) / (Math.pow(1 + monthly, months) - 1);

    document.getElementById('uiLoanAmount').textContent = "₹ " + loanLakhs.toFixed(2) + " Lakhs";
    document.getElementById('uiMonthlyEMI').textContent = "₹ " + Math.round(emi).toLocaleString('en-IN');
}

// ── Compare ───────────────────────────────────────────────────────────────────

function renderCompareResults(results) {
    results.sort(function(a, b) { return b.price - a.price; });

    var maxPrice = results[0].price;
    var html = '';

    results.forEach(function(r) {
        var pct       = (r.price / maxPrice * 100).toFixed(1);
        var shortName = r.location.length > 22 ? r.location.substring(0, 20) + '…' : r.location;
        html +=
            '<div class="compare-row">' +
                '<div class="compare-row-name">' + shortName +
                    (r.isCurrent ? ' <span class="compare-tag">you</span>' : '') +
                '</div>' +
                '<div class="compare-row-track">' +
                    '<div class="compare-bar' + (r.isCurrent ? ' compare-bar-current' : '') +
                        '" style="width:0" data-w="' + pct + '%"></div>' +
                '</div>' +
                '<div class="compare-row-price">₹ ' + r.price + ' L</div>' +
            '</div>';
    });

    var el = document.getElementById('uiCompareResults');
    el.innerHTML = html;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = '';

    setTimeout(function() {
        el.querySelectorAll('.compare-bar').forEach(function(bar) {
            bar.style.transition = 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
            bar.style.width      = bar.getAttribute('data-w');
        });
    }, 60);
}

function onClickedCompare() {
    if (!currentConfig) return;

    var loc1 = compareSelect1 ? compareSelect1.getValue() : '';
    var loc2 = compareSelect2 ? compareSelect2.getValue() : '';

    var compareLocs = [loc1, loc2].filter(function(l) {
        return l && l !== currentConfig.location;
    });

    if (compareLocs.length === 0) return;

    var results   = [{ location: currentConfig.location, price: currentConfig.price, isCurrent: true }];
    var remaining = compareLocs.length;

    compareLocs.forEach(function(loc) {
        $.post(BASE_URL + '/predict_home_price', {
            total_sqft: currentConfig.sqft,
            bhk:        currentConfig.bhk,
            bath:       currentConfig.bath,
            location:   loc
        }, function(data) {
            results.push({ location: loc, price: data.estimated_price, isCurrent: false });
            remaining--;
            if (remaining === 0) renderCompareResults(results);
        });
    });
}

// ── Main estimate ─────────────────────────────────────────────────────────────

function onClickedEstimatePrice() {
    var sqft        = document.getElementById("uiSqft");
    var bhk         = getBHKValue();
    var bathrooms   = getBathValue();
    var location    = locationSelect ? locationSelect.getValue() : document.getElementById("uiLocations").value;
    var estPrice    = document.getElementById("uiEstimatedPrice");
    var emiBox      = document.getElementById("uiEMI");
    var compareCard = document.getElementById("uiCompare");

    $.post(BASE_URL + '/predict_home_price', {
        total_sqft: parseFloat(sqft.value),
        bhk:        bhk,
        bath:       bathrooms,
        location:   location
    }, function(data) {
        var price   = data.estimated_price;
        var low     = Math.round(price * 0.85 * 100) / 100;
        var high    = Math.round(price * 1.15 * 100) / 100;
        var perSqft = Math.round((price * 100000) / parseFloat(sqft.value)).toLocaleString('en-IN');

        estPrice.querySelector('.result-value').textContent = "₹ " + price + " Lakhs";
        estPrice.querySelector('.result-sqft').textContent  = "₹ " + perSqft + " per sq ft";

        var contextEl = estPrice.querySelector('.result-context');
        if (data.context) {
            var c     = data.context;
            var arrow = c.verdict === 'above' ? '▲' : (c.verdict === 'below' ? '▼' : '●');
            var label = c.verdict === 'atpar'
                ? 'At area average'
                : c.pct_diff + '% ' + (c.verdict === 'above' ? 'above' : 'below') + ' area average';
            contextEl.textContent = arrow + ' ' + label;
            contextEl.className   = 'result-context verdict-' + c.verdict;
        } else {
            contextEl.textContent = '';
            contextEl.className   = 'result-context';
        }

        estPrice.querySelector('.result-range').textContent = "Likely range: ₹ " + low + " – ₹ " + high + " Lakhs";

        estPrice.classList.remove('hidden');
        estPrice.style.animation = 'none';
        void estPrice.offsetHeight;
        estPrice.style.animation = '';

        currentPrice  = price;
        currentConfig = { sqft: parseFloat(sqft.value), bhk: bhk, bath: bathrooms, location: location, price: price };

        calculateEMI();
        emiBox.classList.remove('hidden');
        emiBox.style.animation = 'none';
        void emiBox.offsetHeight;
        emiBox.style.animation = '';

        compareCard.classList.remove('hidden');
        compareCard.style.animation = 'none';
        void compareCard.offsetHeight;
        compareCard.style.animation = '';

        document.body.classList.add('has-result');
    });
}

// ── Page load ─────────────────────────────────────────────────────────────────

function onPageLoad() {
    ['uiDownPayment', 'uiInterestRate', 'uiTenure'].forEach(function(id) {
        document.getElementById(id).addEventListener('input', calculateEMI);
    });

    $.get(BASE_URL + '/get_location_names', function(data) {
        if (!data || !data.locations) return;

        allLocations = data.locations;

        var mainSelect = document.getElementById('uiLocations');
        allLocations.forEach(function(loc) { mainSelect.appendChild(new Option(loc, loc)); });
        locationSelect = new TomSelect('#uiLocations', {
            create: false, placeholder: 'Type to search a location...', maxOptions: null,
            sortField: { field: 'text', direction: 'asc' }
        });

        ['uiCompare1', 'uiCompare2'].forEach(function(id) {
            var sel = document.getElementById(id);
            allLocations.forEach(function(loc) { sel.appendChild(new Option(loc, loc)); });
        });
        compareSelect1 = new TomSelect('#uiCompare1', {
            create: false, placeholder: 'Location 2…', maxOptions: null,
            sortField: { field: 'text', direction: 'asc' }
        });
        compareSelect2 = new TomSelect('#uiCompare2', {
            create: false, placeholder: 'Location 3…', maxOptions: null,
            sortField: { field: 'text', direction: 'asc' }
        });
    });
}

window.onload = onPageLoad;
