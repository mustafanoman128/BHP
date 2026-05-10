<div align="center">

# 🏠 Bengaluru Home Price Predictor

### Know what a home is worth — before you make an offer.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Try_it_Now-f59e0b?style=for-the-badge)](https://bhp-y0gi.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML_Model-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

**[▶ Open the live app](https://bhp-y0gi.onrender.com)** · Built by [Mustafa](https://github.com/mustafanoman128)

</div>

---

## What is this?

Ever wondered if a property is fairly priced — or if you're getting ripped off?

This app takes four simple inputs — **neighbourhood, size, bedrooms, and bathrooms** — and instantly tells you what that home should cost in Bengaluru, India. Powered by a Machine Learning model trained on over 7,000 real property listings.

No spreadsheets. No estate agent guesswork. Just type, click, and know.

> ⚡ **[Try it live → bhp-y0gi.onrender.com](https://bhp-y0gi.onrender.com)**
> *(Free tier — may take ~30 seconds to wake up on first visit)*

---

## What you get

| Feature | What it does |
|---|---|
| 🏷️ **Price Estimate** | Instant prediction in Lakhs (₹), powered by Linear Regression |
| 📊 **Price Range** | A realistic ±15% range so you know the upper and lower bounds |
| 📐 **Price Per Sq Ft** | The number every Indian buyer actually thinks in |
| 🏘️ **Area Average Badge** | Is this property above or below the neighbourhood average? |
| 🧮 **EMI Calculator** | Monthly repayment estimate with customisable loan terms |
| 🔍 **Location Comparison** | Compare prices across up to 3 neighbourhoods side by side |
| 🔎 **Searchable Dropdown** | All 240 Bengaluru neighbourhoods — just start typing |

---

## How it works

```
You fill in the form
       ↓
JavaScript sends your inputs to the Flask API
       ↓
Flask passes them to the ML model (Linear Regression)
       ↓
Model runs prediction across 243 features
       ↓
Result + context returned to your browser instantly
```

No page reload. No waiting. Everything updates live.

---

## The ML model

The prediction engine was built from scratch:

- **Dataset**: 13,320 raw Bengaluru property listings (sourced from Kaggle)
- **Cleaning**: Removed outliers, bad sqft values, and impossible bath/bedroom ratios → 7,264 usable rows
- **Features**: 243 total — sqft, bathrooms, BHK + 240 one-hot encoded neighbourhood columns
- **Algorithm**: Linear Regression (outperformed Decision Tree and Lasso on this dataset)
- **Accuracy**: **R² = 0.8496** (~85%) on the test set · 0.845 on 5-fold cross-validation

| Model | R² Score |
|---|---|
| ✅ Linear Regression | **0.8496** |
| Decision Tree | 0.779 |
| Lasso | 0.695 |

---

## Tech stack

**Backend**
- Python 3 + Flask — lightweight REST API
- Gunicorn — production WSGI server
- scikit-learn — model training and inference
- pandas + numpy — data processing

**Frontend**
- Vanilla HTML / CSS / JavaScript + jQuery
- Tom Select — searchable dropdown
- No frameworks — fast, simple, zero dependencies

**Deployment**
- Render (free tier Web Service)
- Auto-deploys on every push to `main`
- GitHub → Render CI/CD pipeline

---

## Run it locally

```bash
# 1. Clone the repo
git clone https://github.com/mustafanoman128/BHP.git
cd BHP

# 2. Install dependencies
pip install -r Server/requirements.txt

# 3. Start the server
cd Server
python server.py

# 4. Open your browser
# Go to: http://127.0.0.1:5000
```

That's it. The app auto-detects whether it's running locally or in production — no config changes needed.

---

## Project structure

```
BHP/
├── Client/                          # Frontend
│   ├── app.html                     # Single-page UI
│   ├── app.css                      # Frosted glass + amber theme
│   └── app.js                       # All interactivity + API calls
│
├── Server/                          # Backend (Render root)
│   ├── server.py                    # Flask routes
│   ├── util.py                      # ML logic + location stats
│   ├── requirements.txt             # Python dependencies
│   └── Artifacts/
│       ├── banglore_home_prices_model.pickle   # Trained model
│       └── columns.json                        # Feature metadata
│
└── Code and Data (Jupyter NB)/
    ├── House Price Prediction Project.ipynb    # Full ML pipeline
    └── Bengaluru_House_Data.csv               # Training data (used at runtime too)
```

---

## Design

The UI is built to feel like a real estate product — not a university project.

- Full-page property photo background with dark gradient overlay
- Frosted glass card (`backdrop-filter: blur`) with amber/gold accents
- Fully responsive — works on desktop, tablet, and mobile
- iOS zoom prevention, touch-friendly inputs, dynamic viewport height

---

## Author

Built by **Mustafa** · [linkedin.com/in/mustafanoman128](https://www.linkedin.com/in/mustafanoman128/)

---

<div align="center">

**[🚀 Try the live app](https://bhp-y0gi.onrender.com)**

*If the app takes a moment to load, it's just waking up from sleep (free tier). Refresh once and it'll be instant.*

</div>
