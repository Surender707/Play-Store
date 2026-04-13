from flask import Flask, render_template, request, jsonify
import joblib
import json
import os
import numpy as np
import pandas as pd

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")


def load_artifacts():

    artifacts = {}
    try:
        artifacts["model"] = joblib.load(os.path.join(MODEL_DIR, "rating_predictor.pkl"))
        artifacts["scaler"] = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
        artifacts["label_encoders"] = joblib.load(os.path.join(MODEL_DIR, "label_encoders.pkl"))
        artifacts["feature_cols"] = joblib.load(os.path.join(MODEL_DIR, "feature_cols.pkl"))

        with open(os.path.join(MODEL_DIR, "metrics.json"), "r") as f:
            artifacts["metrics"] = json.load(f)

        with open(os.path.join(MODEL_DIR, "analytics.json"), "r") as f:
            artifacts["analytics"] = json.load(f)

        with open(os.path.join(MODEL_DIR, "categories.json"), "r") as f:
            artifacts["categories_data"] = json.load(f)

        print("[INFO] All artifacts loaded successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to load artifacts: {e}")
        print("[INFO] Please run train_model.py first.")
    return artifacts


artifacts = load_artifacts()


@app.route("/")
def index():

    return render_template("index.html")


@app.route("/api/analytics")
def get_analytics():

    if "analytics" not in artifacts:
        return jsonify({"error": "Analytics not available. Run train_model.py first."}), 500
    return jsonify(artifacts["analytics"])


@app.route("/api/metrics")
def get_metrics():

    if "metrics" not in artifacts:
        return jsonify({"error": "Metrics not available. Run train_model.py first."}), 500
    return jsonify(artifacts["metrics"])


@app.route("/api/categories")
def get_categories():

    if "categories_data" not in artifacts:
        return jsonify({"error": "Categories not available. Run train_model.py first."}), 500
    return jsonify(artifacts["categories_data"])


@app.route("/api/predict", methods=["POST"])
def predict():

    if "model" not in artifacts:
        return jsonify({"error": "Model not available. Run train_model.py first."}), 500

    try:
        data = request.json
        category = data.get("category", "Tools")
        reviews = int(data.get("reviews", 0))
        installs = int(data.get("installs", 0))
        size_mb = float(data.get("size_mb", 10.0))
        price = float(data.get("price", 0.0))
        content_rating = data.get("content_rating", "Everyone")
        genre = data.get("genre", category)

        is_free = 1 if price == 0 else 0
        log_reviews = np.log1p(reviews)
        log_installs = np.log1p(installs)
        reviews_per_install = reviews / installs if installs > 0 else 0

        le_category = artifacts["label_encoders"]["Category"]
        le_content = artifacts["label_encoders"]["Content Rating"]
        le_genres = artifacts["label_encoders"]["Genres"]

        cat_encoded = le_category.transform([category])[0] if category in le_category.classes_ else 0
        content_encoded = le_content.transform([content_rating])[0] if content_rating in le_content.classes_ else 0
        genre_encoded = le_genres.transform([genre])[0] if genre in le_genres.classes_ else 0

        features = np.array([[
            reviews, installs, size_mb, price, is_free,
            log_reviews, log_installs, reviews_per_install,
            cat_encoded, content_encoded, genre_encoded
        ]])

        features_scaled = artifacts["scaler"].transform(features)
        prediction = artifacts["model"].predict(features_scaled)[0]
        prediction = round(float(np.clip(prediction, 1.0, 5.0)), 2)

        feature_importance = artifacts["metrics"].get("feature_importance", {})
        top_factors = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:5]

        return jsonify({
            "predicted_rating": prediction,
            "confidence": round(artifacts["metrics"].get("r2", 0) * 100, 1),
            "top_factors": [{"feature": f[0], "importance": round(f[1] * 100, 1)} for f in top_factors]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
