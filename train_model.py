import pandas as pd
import numpy as np
import json
import os
import warnings
warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib


def load_and_clean_data(filepath):

    print("[INFO] Loading dataset...")
    df = pd.read_csv(filepath)
    print(f"[INFO] Raw dataset shape: {df.shape}")

    df = df.dropna(subset=["Rating"])
    df = df[df["Rating"] != "NaN"]
    df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce")
    df = df.dropna(subset=["Rating"])
    df = df[(df["Rating"] >= 1.0) & (df["Rating"] <= 5.0)]

    df["Reviews"] = pd.to_numeric(df["Reviews"], errors="coerce").fillna(0).astype(int)

    df["Installs_Clean"] = df["Installs"].str.replace(",", "").str.replace("+", "")
    df["Installs_Clean"] = pd.to_numeric(df["Installs_Clean"], errors="coerce").fillna(0).astype(int)

    df["Size_MB"] = df["Size"].apply(parse_size)
    df["Price_USD"] = df["Price"].apply(lambda x: float(str(x).replace("$", "")) if str(x) != "nan" else 0.0)
    df["Is_Free"] = (df["Type"] == "Free").astype(int)

    df["Log_Reviews"] = np.log1p(df["Reviews"])
    df["Log_Installs"] = np.log1p(df["Installs_Clean"])
    df["Reviews_Per_Install"] = np.where(
        df["Installs_Clean"] > 0,
        df["Reviews"] / df["Installs_Clean"],
        0
    )

    print(f"[INFO] Cleaned dataset shape: {df.shape}")
    return df


def parse_size(size_str):

    if pd.isna(size_str) or size_str == "Varies with device":
        return -1.0
    size_str = str(size_str).strip()
    if size_str.endswith("M"):
        return float(size_str[:-1])
    elif size_str.endswith("k"):
        return float(size_str[:-1]) / 1024
    return -1.0


def encode_features(df):

    label_encoders = {}

    for col in ["Category", "Content Rating", "Genres"]:
        le = LabelEncoder()
        df[col + "_Encoded"] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    feature_cols = [
        "Reviews", "Installs_Clean", "Size_MB", "Price_USD", "Is_Free",
        "Log_Reviews", "Log_Installs", "Reviews_Per_Install",
        "Category_Encoded", "Content Rating_Encoded", "Genres_Encoded"
    ]

    X = df[feature_cols].copy()
    X = X.replace([np.inf, -np.inf], 0)
    X = X.fillna(0)
    y = df["Rating"]

    return X, y, feature_cols, label_encoders


def train_and_evaluate(X, y, feature_cols):

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\n[INFO] Training Gradient Boosting model...")
    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    y_pred = np.clip(y_pred, 1.0, 5.0)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"\n[RESULTS] Model Performance:")
    print(f"  MAE  : {mae:.4f}")
    print(f"  RMSE : {rmse:.4f}")
    print(f"  R2   : {r2:.4f}")

    importances = model.feature_importances_
    feature_importance = sorted(
        zip(feature_cols, importances),
        key=lambda x: x[1],
        reverse=True
    )
    print(f"\n[INFO] Feature Importance:")
    for feat, imp in feature_importance:
        print(f"  {feat:30s} : {imp:.4f}")

    metrics = {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "feature_importance": {feat: round(imp, 4) for feat, imp in feature_importance},
        "train_size": len(X_train),
        "test_size": len(X_test)
    }

    return model, scaler, metrics


def generate_analytics(df):

    analytics = {}

    cat_stats = df.groupby("Category").agg({
        "Rating": "mean",
        "Reviews": "sum",
        "Installs_Clean": "sum",
        "App": "count"
    }).reset_index()
    cat_stats.columns = ["Category", "Avg_Rating", "Total_Reviews", "Total_Installs", "App_Count"]
    cat_stats = cat_stats.sort_values("App_Count", ascending=False)
    analytics["category_stats"] = cat_stats.to_dict(orient="records")

    type_dist = df["Type"].value_counts().to_dict()
    analytics["type_distribution"] = type_dist

    content_dist = df["Content Rating"].value_counts().to_dict()
    analytics["content_rating_distribution"] = content_dist

    rating_dist = df["Rating"].apply(lambda x: f"{int(x)}-{int(x)+1}" if x < 5 else "5").value_counts().sort_index().to_dict()
    analytics["rating_distribution"] = rating_dist

    analytics["total_apps"] = len(df)
    analytics["avg_rating"] = round(df["Rating"].mean(), 2)
    analytics["total_reviews"] = int(df["Reviews"].sum())
    analytics["total_installs"] = int(df["Installs_Clean"].sum())
    analytics["avg_size_mb"] = round(df[df["Size_MB"] > 0]["Size_MB"].mean(), 2)
    analytics["paid_percentage"] = round((df["Type"] == "Paid").mean() * 100, 2)

    top_apps = df.nlargest(10, "Reviews")[["App", "Category", "Rating", "Reviews", "Installs"]].to_dict(orient="records")
    analytics["top_apps_by_reviews"] = top_apps

    top_rated = df[df["Reviews"] > 100].nlargest(10, "Rating")[["App", "Category", "Rating", "Reviews", "Installs"]].to_dict(orient="records")
    analytics["top_rated_apps"] = top_rated

    cat_rating = df.groupby("Category")["Rating"].mean().sort_values(ascending=False).head(15)
    analytics["top_categories_by_rating"] = {k: round(v, 2) for k, v in cat_rating.items()}

    size_bins = [0, 5, 10, 25, 50, 100, float("inf")]
    size_labels = ["0-5MB", "5-10MB", "10-25MB", "25-50MB", "50-100MB", "100MB+"]
    valid_sizes = df[df["Size_MB"] > 0].copy()
    valid_sizes["Size_Bin"] = pd.cut(valid_sizes["Size_MB"], bins=size_bins, labels=size_labels, right=False)
    size_rating = valid_sizes.groupby("Size_Bin", observed=False)["Rating"].mean()
    analytics["size_vs_rating"] = {k: round(v, 2) for k, v in size_rating.items()}

    install_bins = [0, 100, 1000, 10000, 100000, 1000000, 10000000, float("inf")]
    install_labels = ["<100", "100-1K", "1K-10K", "10K-100K", "100K-1M", "1M-10M", "10M+"]
    df_copy = df.copy()
    df_copy["Install_Bin"] = pd.cut(df_copy["Installs_Clean"], bins=install_bins, labels=install_labels, right=False)
    install_rating = df_copy.groupby("Install_Bin", observed=False)["Rating"].mean()
    analytics["installs_vs_rating"] = {k: round(v, 2) for k, v in install_rating.items()}

    return analytics


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "google_playstore_apps.csv")
    model_dir = os.path.join(base_dir, "model")
    os.makedirs(model_dir, exist_ok=True)

    if not os.path.exists(data_path):
        print("[ERROR] Dataset not found. Please run generate_dataset.py first.")
        return

    df = load_and_clean_data(data_path)
    X, y, feature_cols, label_encoders = encode_features(df)
    model, scaler, metrics = train_and_evaluate(X, y, feature_cols)

    analytics = generate_analytics(df)

    joblib.dump(model, os.path.join(model_dir, "rating_predictor.pkl"))
    joblib.dump(scaler, os.path.join(model_dir, "scaler.pkl"))
    joblib.dump(label_encoders, os.path.join(model_dir, "label_encoders.pkl"))
    joblib.dump(feature_cols, os.path.join(model_dir, "feature_cols.pkl"))

    with open(os.path.join(model_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    with open(os.path.join(model_dir, "analytics.json"), "w") as f:
        json.dump(analytics, f, indent=2, default=str)

    categories = sorted(df["Category"].unique().tolist())
    content_ratings = sorted(df["Content Rating"].unique().tolist())
    with open(os.path.join(model_dir, "categories.json"), "w") as f:
        json.dump({"categories": categories, "content_ratings": content_ratings}, f, indent=2)

    print(f"\n[SUCCESS] Model and analytics saved to {model_dir}/")
    print("[INFO] You can now run app.py to start the dashboard.")


if __name__ == "__main__":
    main()
