from flask import Flask, request, jsonify, send_from_directory
import util
import os

# Load ML model and location stats at import time so Gunicorn picks it up
util.load_saved_artifacts()

CLIENT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'Client')
app = Flask(__name__, static_folder=CLIENT_DIR, static_url_path='')


@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'app.html')


@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/predict_home_price', methods=['GET', 'POST'])
def predict_home_price():
    total_sqft = float(request.form['total_sqft'])
    location   = request.form['location']
    bhk        = int(request.form['bhk'])
    bath       = int(request.form['bath'])

    price          = util.get_estimated_price(location, total_sqft, bhk, bath)
    price_per_sqft = round(price * 100000 / total_sqft) if total_sqft > 0 else 0
    context        = util.get_location_context(location, price_per_sqft)

    response = jsonify({
        'estimated_price': price,
        'context':         context
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == "__main__":
    print("Starting Python Flask Server For Home Price Prediction...")
    app.run()
