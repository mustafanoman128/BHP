# Product Requirements Document
# Bengaluru Home Price Predictor

**Author:** Mustafa  
**Status:** Built & Live  
**Last Updated:** May 2026  
**Live URL:** https://bhp-y0gi.onrender.com  
**GitHub:** https://github.com/mustafanoman128/BHP

---

## 1. Product Overview

A web application that lets users estimate the market price of a residential property
in Bengaluru, India. The user provides four inputs — area in square feet, number of
bedrooms (BHK), number of bathrooms, and neighbourhood — and the app returns an
instant price estimate powered by a trained Machine Learning model.

The app also provides supporting tools to help users make informed property decisions:
an EMI calculator, a price range, a per-sqft rate, a market context badge, and a
location comparison tool.

---

## 2. Target Users

- People looking to buy or rent a home in Bengaluru
- Real estate investors comparing neighbourhoods
- Students / developers exploring ML-powered web apps

---

## 3. Core Features

### 3.1 Price Prediction
- **Inputs**: Area (sq ft), BHK (1–5), Bathrooms (1–5), Location
- **Output**: Estimated price in Lakhs (₹)
- **Model**: Linear Regression, ~85% accuracy (R² = 0.8496)
- **Locations**: 240 Bengaluru neighbourhoods supported

### 3.2 Searchable Location Dropdown
- All 240 locations available via a type-to-search input (Tom Select)
- Keyboard navigable, mobile-friendly
- Same searchable dropdown used in the comparison tool

### 3.3 Price Range
- Displayed as: "Likely range: ₹ X – ₹ Y Lakhs"
- Calculated as ±15% of the model estimate to account for model uncertainty

### 3.4 Price Per Sq Ft
- Displayed as: "₹ X,XXX per sq ft"
- Formatted using Indian number system (en-IN locale)
- Buyers in India always think in per-sqft terms — makes result immediately comparable

### 3.5 Area Average Context Badge
- Compares the predicted price/sqft against the historical average for that location
- Sources: computed from `Bengaluru_House_Data.csv` at server startup
- Three states:
  - `▲ X% above area average` — red badge (paying over the odds)
  - `▼ X% below area average` — green badge (good value)
  - `● At area average` — neutral badge
- Threshold: differences < 3% are treated as "at par"
- Gracefully hidden if location data is insufficient

### 3.6 EMI Calculator
- Appears after price estimate
- Inputs: Down Payment (%), Interest Rate (%), Loan Tenure (years)
- Defaults: 20% down, 8.5% rate, 20 years (typical Indian home loan)
- Outputs: Loan Amount (₹ Lakhs), Monthly EMI (₹)
- Live recalculation — no button needed, updates on every keystroke
- Formula: standard reducing-balance EMI formula

### 3.7 Location Comparison
- Appears after price estimate
- User picks up to 2 additional Bengaluru locations
- App fetches prices for those locations using the same sqft/BHK/bath config
- Results shown as an animated horizontal bar chart, sorted highest to lowest
- Current location highlighted in amber; others in white

---

## 4. UI / Design

- **Style**: Real estate branded — full-page house photo background with dark overlay
- **Card**: Frosted glass (backdrop-filter blur) with amber/gold accents
- **Color scheme**: Dark navy/brown overlay + amber (#f59e0b) highlights
- **Typography**: Inter (Google Fonts)
- **Responsive**: Desktop (locked single screen), Tablet, Mobile (scroll enabled)
- **Mobile considerations**: iOS zoom prevention (16px inputs), touch targets ≥ 44px,
  `100dvh` for dynamic viewport, stacked layouts on small screens

---

## 5. Technical Architecture

```
Browser
  └── Client/ (HTML + CSS + JS)
        └── jQuery AJAX calls
              └── Render Web Service (https://bhp-y0gi.onrender.com)
                    └── Gunicorn (port 10000)
                          └── Flask (server.py + util.py)
                                ├── Serves Client/ as static files (GET /)
                                ├── GET  /get_location_names
                                └── POST /predict_home_price
                                      └── scikit-learn Linear Regression model
```

### Backend
- **Flask** — REST API (2 endpoints) + serves frontend as static files
- **Gunicorn** — production WSGI server (Render manages process)
- **scikit-learn** — model inference
- **pandas + numpy** — data processing at startup (location stats)
- **Render** — cloud hosting (free tier Web Service, auto-deploys from GitHub)

### Frontend
- **Vanilla JS + jQuery** — no framework overhead
- **Tom Select** — searchable dropdown (CDN)
- **BASE_URL auto-detection** — same JS works locally and in production

### Deployment
- **Cloud**: Render (free tier Web Service, no credit card required)
- **Live URL**: https://bhp-y0gi.onrender.com
- **Repo**: https://github.com/mustafanoman128/BHP
- **CI/CD**: Auto-deploy on push to `main` branch (Render GitHub integration)
- **Start command**: `gunicorn --chdir Server --bind 0.0.0.0:$PORT server:app`

---

## 6. ML Model Summary

| Property | Value |
|----------|-------|
| Algorithm | Linear Regression |
| Training rows | 7,264 (cleaned from 13,320 raw) |
| Features | 243 (sqft, bath, bhk + 240 location dummies) |
| Test R² | 0.8496 |
| Cross-val R² | 0.845 (5-fold) |
| Alternatives tested | Decision Tree (0.779), Lasso (0.695) |
| Model file | `Server/Artifacts/banglore_home_prices_model.pickle` |
| Feature metadata | `Server/Artifacts/columns.json` |
| Training data | `Code and Data (Jupyter NB)/Bengaluru_House_Data.csv` |

---

## 7. What's Done

- [x] Data cleaning, EDA, feature engineering (Jupyter notebook)
- [x] Model training and serialisation (pickle + JSON)
- [x] Flask REST API (`/predict_home_price`, `/get_location_names`)
- [x] Frontend: form, radio toggles, location dropdown
- [x] Frontend redesign: real estate branded, frosted glass, amber theme
- [x] Mobile optimisation (responsive CSS, iOS zoom fix, touch targets)
- [x] Feature 1: Searchable location dropdown (Tom Select)
- [x] Feature 2: Price range (±15%)
- [x] Feature 3: Price per sq ft
- [x] Feature 4: EMI calculator (live recalculation)
- [x] Feature 5: Location comparison (animated bar chart)
- [x] Feature 6: Area average context badge
- [x] Deployment prep: requirements.txt, BASE_URL fix, Artifacts path fix
- [x] Flask serves frontend as static files (single service for both frontend + API)
- [x] Pushed to GitHub: https://github.com/mustafanoman128/BHP
- [x] Deployed to Render: https://bhp-y0gi.onrender.com (free tier, no CC required)
- [x] Auto-deploy on push configured (Render GitHub integration)
- [x] Project cleaned up — removed unused files (Model/, bhp.service, nginx.conf, IDE folders, notebook exports)
- [x] .gitignore added — excludes .idea/, .vscode/, __pycache__, venv/
- [x] Interview guide created (BHP Interview Guide.html)

## 8. What's Next

- [ ] (Optional) Upgrade Render plan to avoid cold starts (~30s on free tier)
- [ ] (Optional) Point a custom domain at the Render service
- [ ] (Optional) Add HTTPS custom certificate (Render provides free TLS by default)
- [ ] (Optional) Retrain model with more recent Bengaluru listings data
- [ ] (Optional) Add more cities beyond Bengaluru
