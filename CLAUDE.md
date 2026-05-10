# Bengaluru Home Price Predictor — Claude Context

## What This Project Is
A full-stack web application that predicts residential property prices in Bengaluru, India.
A user inputs square footage, BHK, bathrooms, and location — the app returns a price estimate
in Lakhs (Indian Rupees), along with supporting context: price range, per-sqft rate, area
average comparison badge, EMI calculator, and a side-by-side location comparison bar chart.

**Live URL:** https://bhp-y0gi.onrender.com  
**GitHub:** https://github.com/mustafanoman128/BHP

---

## Tech Stack
- **ML Model**: Linear Regression (scikit-learn), trained on Bengaluru property data
- **Backend**: Python 3, Flask, Gunicorn (production WSGI server)
- **Frontend**: Vanilla HTML/CSS/JS, jQuery, Tom Select (searchable dropdown)
- **Deployment**: Render (free tier Web Service) — auto-deploys on every push to `main`

---

## Project Structure
```
Real Estate Prediction/
├── Client/                        # Frontend — served by Flask as static files
│   ├── app.html
│   ├── app.css
│   └── app.js
├── Server/                        # Flask backend — Render root directory
│   ├── server.py                  # Flask routes + serves frontend
│   ├── util.py                    # Model loading, prediction, location stats
│   ├── requirements.txt           # Python dependencies (includes gunicorn)
│   └── Artifacts/                 # CAPITAL A — case-sensitive on Linux
│       ├── banglore_home_prices_model.pickle
│       └── columns.json
├── Code and Data (Jupyter NB)/
│   ├── Bengaluru_House_Data.csv   # Raw training data — used at runtime for location stats
│   └── House Price Prediction Project.ipynb
├── BHP Interview Guide.html       # Interview prep — open in browser, print to PDF
├── .gitignore                     # Excludes .idea/, .vscode/, __pycache__, venv/
├── CLAUDE.md                      # This file
└── PRD.md                         # Product Requirements Document
```

---

## How to Run Locally
```bash
# Start Flask server (from Server/ directory)
cd Server
python server.py
# Server runs on http://127.0.0.1:5000
# Open Client/app.html in browser — BASE_URL auto-detects localhost
```

---

## Key Files — What They Do

### Server/server.py
- `load_saved_artifacts()` called at **module level** (top of file) so Gunicorn triggers it
- `serve_frontend()` — serves `Client/app.html` at `/` using Flask static file serving
- `CLIENT_DIR` computed via `os.path.abspath(__file__)` so path is correct regardless of working directory
- `GET /get_location_names` — returns list of 240 Bengaluru locations
- `GET/POST /predict_home_price` — returns `estimated_price` + `context` (area average comparison)
- Flask `static_folder` points to `../Client` — serves app.css, app.js automatically

### Server/util.py
- `load_saved_artifacts()` — loads pickle model + columns.json + computes location stats from CSV
- `get_estimated_price(location, sqft, bhk, bath)` — runs the Linear Regression model
- `get_location_context(location, price_per_sqft)` — compares prediction against area average
- `__compute_location_stats()` — reads CSV at startup, computes mean price/sqft per location
- Artifact paths use `os.path.abspath(__file__)` — works correctly on Linux (case-sensitive)
- CSV path: `../Code and Data (Jupyter NB)/Bengaluru_House_Data.csv` relative to Server/

### Client/app.js
- `BASE_URL` auto-detects environment:
  - `http://127.0.0.1:5000` when on localhost (local dev)
  - `''` (relative URLs) when on any other host (Render, EC2, etc.)
- `onPageLoad()` — fetches locations, initialises all 3 Tom Select dropdowns
- `onClickedEstimatePrice()` — calls predict endpoint, populates result + EMI + compare card
- `calculateEMI()` — pure frontend math, live recalculation on every input change
- `onClickedCompare()` — fires parallel requests for up to 2 comparison locations, renders bar chart
- `renderCompareResults()` — builds animated bar chart sorted by price descending

### Client/app.css
- Desktop: `height: 100vh; overflow: hidden` — fits everything on one screen
- `body.has-result` class unlocks scroll when result + EMI + compare appear
- Tom Select dark theme overrides — matches amber/glass design
- Media queries: tablet (≤768px), phone (≤480px)
- Mobile: `min-height: 100dvh`, overflow-y auto, 16px inputs (prevents iOS zoom)

---

## Model Details
- **Algorithm**: Linear Regression
- **Features**: 243 (total_sqft, bath, bhk + 240 one-hot encoded Bengaluru locations)
- **Target**: price in Lakhs
- **Test R²**: 0.8496 (~85% accuracy)
- **Cross-validation R²**: 0.845 (5-fold ShuffleSplit)
- **Training data**: 7,264 cleaned rows (from 13,320 raw after outlier removal)

---

## Features Built (in order)
1. **Searchable location dropdown** — Tom Select on all 3 location selects (main + 2 compare)
2. **Price range** — ±15% of estimate: "Likely range: ₹ X – ₹ Y Lakhs"
3. **Price per sq ft** — `(price * 100000) / sqft`, formatted with Indian locale (en-IN)
4. **EMI calculator** — standard reducing-balance formula, live recalculation, defaults: 20%/8.5%/20yr
5. **Location comparison** — up to 3 locations, animated bar chart, sorted by price, current tagged "you"
6. **Area average context badge** — ▲ above / ▼ below / ● at par, sourced from CSV at startup

---

## Deployment (Render)
- **Platform**: Render Web Service (free tier)
- **Live URL**: https://bhp-y0gi.onrender.com
- **GitHub**: https://github.com/mustafanoman128/BHP
- **Root directory**: `Server`
- **Build command**: `pip install -r requirements.txt`
- **Start command**: `gunicorn --bind 0.0.0.0:$PORT server:app`
- **Auto-deploy**: Yes — every push to `main` triggers a redeploy on Render
- **Sleep behaviour**: Free tier sleeps after 15 min of inactivity; first request takes ~30s to wake up

---

## Memory Files
Persistent memory for this project is stored at:
`C:\Users\musta\.claude\projects\c--Users-musta-Desktop-PROJECTS-Real-Estate-Prediction\memory\`

- `MEMORY.md` — index of all memory files
- `project_deployment.md` — live URL, platform, current project state
- `user_profile.md` — Mustafa's background and preferences
- `feedback_deployment.md` — confirmed rules for how to collaborate on this project

---

## Important Notes
- `Artifacts/` folder is capital A — do NOT rename to lowercase (Linux is case-sensitive)
- `load_saved_artifacts()` must be at module level in server.py — NOT inside `if __name__ == "__main__"` — so Gunicorn runs it on startup
- `Bengaluru_House_Data.csv` must exist at `../Code and Data (Jupyter NB)/` relative to Server/ for the area-average badge to work. If missing, badge silently disappears — everything else still works
- Tom Select and Google Fonts load from CDN — requires internet in the browser
- `BASE_URL` in app.js handles local vs production automatically — never hardcode an IP address
- To update the live app: make changes → `git add . && git commit -m "..." && git push` → Render auto-deploys
