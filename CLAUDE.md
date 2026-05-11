# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Live URL:** https://bhp-y0gi.onrender.com  
**GitHub:** https://github.com/mustafanoman128/BHP

---

## What This Project Is
A full-stack web application that predicts residential property prices in Bengaluru, India.
A user inputs square footage, BHK, bathrooms, and location — the app returns a price estimate
in Lakhs (Indian Rupees), along with supporting context: price range, per-sqft rate, area
average comparison badge, EMI calculator, and a side-by-side location comparison bar chart.

---

## Tech Stack
- **ML Model**: Linear Regression (scikit-learn), trained on Bengaluru property data
- **Backend**: Python 3, Flask, Gunicorn (production WSGI server)
- **Frontend**: Vanilla HTML/CSS/JS, jQuery, Tom Select (searchable dropdown)
- **Deployment**: Render (free tier Web Service) — auto-deploys on every push to `main`

---

## Commands

```bash
# Run the app locally (from Server/ directory)
cd Server
python server.py
# → http://127.0.0.1:5000

# Smoke-test the ML model and util functions directly
cd Server
python util.py
# Prints location names + sample predictions for known/unknown locations

# Install dependencies
pip install -r Server/requirements.txt

# Deploy (Render auto-deploys on push — no manual step needed)
git add . && git commit -m "..." && git push
```

There are no automated tests or linting configs in this project.

---

## Architecture

### Request flow
```
Browser (Client/)
  → jQuery AJAX
    → Flask (Server/server.py)
      → util.py: get_estimated_price() + get_location_context()
        → scikit-learn model (Artifacts/banglore_home_prices_model.pickle)
        → location stats dict (computed from CSV at startup)
```

Flask also serves `Client/` as static files — there is no separate web server. One process handles both the API and the frontend.

### Startup sequence (critical)
`util.load_saved_artifacts()` is called at **module level** in `server.py` — not inside `if __name__ == '__main__'`. This is intentional: Gunicorn imports the module rather than running it as a script, so the model must load at import time. Moving this call breaks production.

### util.py internals
- Four module-level globals: `__model`, `__data_columns`, `__locations`, `__location_stats`
- `__data_columns[0:3]` = `[total_sqft, bath, bhk]`; `__data_columns[3:]` = 240 location dummies
- Unknown locations (not in training data) silently fall back to all-zeros for location features — model still returns a prediction via the intercept
- `__parse_sqft()` handles range strings like `"1000-1500"` by averaging them
- `__location_stats` is a `{location_name: mean_price_per_sqft}` dict; if CSV is missing it stays `{}` and the area badge silently disappears — everything else still works

### Frontend (Client/app.js)
- `BASE_URL` auto-detects: `http://127.0.0.1:5000` on localhost, `''` (relative) everywhere else — never hardcode an IP
- Bar chart animation: widths are set to `0` on DOM insert, then actual widths applied after a 60ms `setTimeout` to trigger the CSS transition
- Location comparison fires two API requests in parallel, not sequentially

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

## Model Details
- **Algorithm**: Linear Regression
- **Features**: 243 (total_sqft, bath, bhk + 240 one-hot encoded Bengaluru locations)
- **Target**: price in Lakhs
- **Test R²**: 0.8496 (~85% accuracy)
- **Cross-validation R²**: 0.845 (5-fold ShuffleSplit)
- **Training data**: 7,264 cleaned rows (from 13,320 raw after outlier removal)

---

## Deployment (Render)
- **Platform**: Render Web Service (free tier)
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
- `Bengaluru_House_Data.csv` must exist at `../Code and Data (Jupyter NB)/` relative to `Server/` for the area-average badge to work
- Tom Select and Google Fonts load from CDN — requires internet in the browser
- To update the live app: `git add . && git commit -m "..." && git push` → Render auto-deploys
