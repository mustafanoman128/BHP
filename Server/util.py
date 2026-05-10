import pickle
import json
import numpy as np
import os

__locations      = None
__data_columns   = None
__model          = None
__location_stats = {}


def __parse_sqft(val):
    try:
        s = str(val)
        if '-' in s:
            parts = s.split('-')
            return (float(parts[0]) + float(parts[1])) / 2
        return float(s)
    except:
        return None


def __compute_location_stats():
    global __location_stats
    csv_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        '..', 'Code and Data (Jupyter NB)', 'Bengaluru_House_Data.csv'
    )
    try:
        import pandas as pd
        df = pd.read_csv(csv_path)
        df['location']  = df['location'].str.lower().str.strip()
        df['sqft_val']  = df['total_sqft'].apply(__parse_sqft)
        df = df.dropna(subset=['sqft_val', 'price'])
        df = df[(df['sqft_val'] > 0) & (df['price'] > 0)]
        df['pps'] = df['price'] * 100000 / df['sqft_val']
        df = df[(df['pps'] > 500) & (df['pps'] < 100000)]
        __location_stats = df.groupby('location')['pps'].mean().to_dict()
        print(f"Loaded price stats for {len(__location_stats)} locations.")
    except Exception as e:
        print(f"Warning: could not load location stats ({e})")
        __location_stats = {}


def get_location_context(location, price_per_sqft):
    avg = __location_stats.get(location.lower().strip())
    if not avg:
        return None
    pct_diff = round((price_per_sqft - avg) / avg * 100, 1)
    if abs(pct_diff) < 3:
        verdict = 'atpar'
    elif pct_diff > 0:
        verdict = 'above'
    else:
        verdict = 'below'
    return {
        'area_avg_per_sqft': round(avg),
        'pct_diff':          abs(pct_diff),
        'verdict':           verdict
    }


def get_estimated_price(location, sqft, bhk, bath):
    try:
        loc_index = __data_columns.index(location.lower())
    except:
        loc_index = -1
    x = np.zeros(len(__data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    if loc_index >= 0:
        x[loc_index] = 1
    return round(__model.predict([x])[0], 2)


def load_saved_artifacts():
    print("loading saved artifacts...start")
    global __data_columns, __locations, __model

    _artifacts = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Artifacts')

    with open(os.path.join(_artifacts, 'columns.json'), 'r') as f:
        __data_columns = json.load(f)['data_columns']
        __locations    = __data_columns[3:]

    if __model is None:
        with open(os.path.join(_artifacts, 'banglore_home_prices_model.pickle'), 'rb') as f:
            __model = pickle.load(f)

    __compute_location_stats()
    print("loading saved artifacts...done")


def get_location_names():
    return __locations


def get_data_columns():
    return __data_columns


if __name__ == '__main__':
    load_saved_artifacts()
    print(get_location_names())
    print(get_estimated_price('1st Phase JP Nagar', 1000, 3, 3))
    print(get_estimated_price('1st Phase JP Nagar', 1000, 2, 2))
    print(get_estimated_price('Kalhalli', 1000, 2, 2))
    print(get_estimated_price('Ejipura', 1000, 2, 2))
