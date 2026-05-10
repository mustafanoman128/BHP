# Bengaluru Home Price Predictor — Claude Context

## What This Project Is
A full-stack web application that predicts residential property prices in Bengaluru, India.
A user inputs square footage, BHK, bathrooms, and location — the app returns a price estimate
in Lakhs (Indian Rupees), along with supporting context (range, per-sqft rate, area average comparison,
EMI calculator, and a side-by-side location comparison tool).

## Tech Stack
- **ML Model**: Linear Regression (scikit-learn), trained on 13,320 rows of Bengaluru property data
- **Backend**: Python 3, Flask, Gunicorn (production)
- **Frontend**: Vanilla HTML/CSS/JS, jQuery, Tom Select (searchable dropdown)
- **Deployment target**: AWS EC2 (Ubuntu 22.04), Nginx reverse proxy

## Project Structure
```
Real Estate Prediction/
├── Client/                  # Frontend (static files served by Nginx)
│   ├── app.html
│   ├── app.css
│   └── app.js
├── Server/                  # Flask backend
│   ├── server.py            # Flask routes
│   ├── util.py              # Model loading, prediction, location stats
│   ├── requirements.txt     # Python dependencies
│   └── Artifacts/           # CAPITAL A — case-sensitive on Linux
│       ├── banglore_home_prices_model.pickle
│       └── columns.json
├── Code and Data (Jupyter NB)/
│   ├── Bengaluru_House_Data.csv   # Raw training data (used at runtime for location stats)
│   └── House Price Prediction Project.ipynb
├── Model/                   # Original model artifacts (backup)
├── bhp.service              # systemd service file for Gunicorn on EC2
├── nginx.conf               # Nginx config for EC2 deployment
└── CLAUDE.md                # This file
```

## How to Run Locally
```bash
# Start Flask server (from Server/ directory)
cd Server
python server.py
# Server runs on http://127.0.0.1:5000

# Open frontend
# Open Client/app.html directly in a browser
# app.js auto-detects localhost and points API calls to http://127.0.0.1:5000
```

## Key Files — What They Do

### Server/util.py
- `load_saved_artifacts()` — loads the pickle model + columns.json + computes location stats from CSV
- `get_estimated_price(location, sqft, bhk, bath)` — runs the Linear Regression model
- `get_location_context(location, price_per_sqft)` — compares prediction against area average
- `__compute_location_stats()` — reads Bengaluru_House_Data.csv at startup, computes mean price/sqft per location
- Artifact paths use `os.path.abspath(__file__)` — critical for Linux (case-sensitive filesystem)

### Server/server.py
- `GET /get_location_names` — returns list of 240 Bengaluru locations
- `GET/POST /predict_home_price` — returns `estimated_price` and `context` (area average comparison)

### Client/app.js
- `BASE_URL` auto-detects environment: `http://127.0.0.1:5000` locally, `''` (relative) on EC2
- `onPageLoad()` — fetches locations, initialises all 3 Tom Select dropdowns
- `onClickedEstimatePrice()` — calls predict endpoint, populates result + EMI + compare card
- `calculateEMI()` — pure frontend math, recalculates live on input change
- `onClickedCompare()` — fires parallel requests for up to 2 comparison locations, renders bar chart

## Model Details
- **Algorithm**: Linear Regression
- **Features**: 243 (total_sqft, bath, bhk + 240 one-hot encoded Bengaluru locations)
- **Target**: price in Lakhs
- **Test R²**: 0.8496 (~85% accuracy)
- **Training data**: 7,264 cleaned rows (from 13,320 raw, after outlier removal)

## Features Built (in order)
1. **Searchable location dropdown** — Tom Select on all 3 location selects (main + 2 compare)
2. **Price range** — ±15% of estimate shown as "Likely range: ₹ X – ₹ Y Lakhs"
3. **Price per sq ft** — computed as `(price * 100000) / sqft`, formatted with Indian locale
4. **EMI calculator** — standard EMI formula, live recalculation, defaults: 20% down, 8.5%, 20yr
5. **Location comparison** — up to 3 locations side by side, animated bar chart, sorted by price
6. **Area average context** — compares price/sqft against location's historical average from CSV

## Deployment (EC2 + Nginx)
- EC2: Ubuntu 22.04, t2.micro (free tier)
- Gunicorn runs Flask on `127.0.0.1:5000` (internal only)
- Nginx listens on port 80, serves `Client/` as static files, proxies `/predict_home_price`
  and `/get_location_names` to Gunicorn
- Gunicorn is managed by systemd (`bhp.service`) — auto-restarts on failure/reboot
- GitHub repo: https://github.com/mustafanoman128/BHP

## Important Notes
- The `Artifacts/` folder name is capital A — do NOT rename to lowercase or the Linux server breaks
- `Bengaluru_House_Data.csv` must be present relative to `util.py` for the area-average badge to work
  (path: `../Code and Data (Jupyter NB)/Bengaluru_House_Data.csv` from Server/)
- If the CSV is missing on the server, the badge silently disappears — everything else still works
- Tom Select is loaded from jsDelivr CDN — requires internet connection in the browser
- `BASE_URL` in app.js handles local vs production automatically — never hardcode the IP again
