PlayStore Pulse

Google Play Store Analytics and AI-Powered Rating Predictor

PlayStore Pulse is a full-stack machine learning application that analyzes 10,000+ Google Play Store apps, visualizes category trends, content rating distributions, and install patterns, and uses a Gradient Boosting ML model to predict app ratings based on user-provided features.

---

Features

Analytics Dashboard
- KPI Cards with animated counters - Total Apps, Average Rating, Reviews, Installs
- Category Distribution - Bar chart showing app counts per category
- Free vs Paid - Doughnut chart with percentage breakdown
- Rating Distribution - Distribution of app ratings across ranges
- Content Rating - Polar area chart for content maturity levels
- Top Apps Table - Sortable by reviews or ratings

Category Analysis
- Average Rating by Category - Horizontal bar chart ranking all categories
- Size vs Rating - Line chart correlating app size with user ratings
- Installs vs Rating - Trend analysis of how download counts affect ratings

AI Rating Predictor
- Input your app details (category, reviews, installs, size, price, content rating)
- Get a predicted rating with animated circle gauge
- View model confidence and top influencing factors
- Real-time prediction using the trained Gradient Boosting model

Insights
- Auto-generated actionable insights from the data
- Key statistics highlighted with premium card design

Model Info
- Model architecture details (Gradient Boosting, 200 trees)
- Performance metrics: MAE, RMSE, R2 Score
- Feature Importance visualization
- Dataset and tech stack information

---

Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | HTML5, CSS3, JavaScript, Chart.js |
| Backend   | Python, Flask      |
| ML Engine | scikit-learn (Gradient Boosting Regressor) |
| Data      | Pandas, NumPy      |
| Design    | Custom CSS, Font Awesome, Google Fonts (Inter) |

---

Project Structure

project/
  data/
    google_playstore_apps.csv       (Generated dataset)
  model/
    rating_predictor.pkl            (Trained ML model)
    scaler.pkl                      (Feature scaler)
    label_encoders.pkl              (Categorical encoders)
    feature_cols.pkl                (Feature columns)
    metrics.json                    (Model performance)
    analytics.json                  (Dashboard analytics)
    categories.json                 (Category list)
  static/
    css/
      style.css                     (Premium dashboard styles)
    js/
      app.js                        (Dashboard logic)
  templates/
    index.html                      (Dashboard template)
  generate_dataset.py               (Dataset generator)
  train_model.py                    (ML training pipeline)
  app.py                            (Flask server)
  requirements.txt                  (Dependencies)
  README.md                         (This file)

---

Setup and Run

1. Install Dependencies
   pip install -r requirements.txt

2. Generate Dataset
   python generate_dataset.py

3. Train the ML Model
   python train_model.py

4. Launch the Dashboard
   python app.py

Then open your browser to http://localhost:5000

---

Machine Learning Pipeline

1. Data Cleaning: Remove NaN ratings, parse installs/size/price fields
2. Feature Engineering: Log transforms, review-to-install ratio, categorical encoding
3. Model Training: Gradient Boosting Regressor with 200 estimators, max depth 5
4. Evaluation: MAE, RMSE, R2 Score on 20 percent held-out test set
5. Deployment: Saved model served via Flask REST API

---

API Endpoints

| Method | Endpoint         | Description                    |
|--------|------------------|--------------------------------|
| GET    | /                | Dashboard page                 |
| GET    | /api/analytics   | Full analytics data            |
| GET    | /api/metrics     | Model performance metrics      |
| GET    | /api/categories  | Available categories list      |
| POST   | /api/predict     | Predict rating (JSON payload)  |

---

Team

- Student: B.Tech 3rh Year, AI&DS
- Event: Hackathon 2026
- Theme: Google (Google Play Store Analysis)

.
