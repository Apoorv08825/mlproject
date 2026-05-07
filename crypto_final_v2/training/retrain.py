import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, AdaBoostClassifier
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings("ignore")

def main():
    print("Loading dataset...")
    df = pd.read_csv('dataset.csv')
    if 'price' in df.columns:
        df.rename(columns={'price': 'close'}, inplace=True)
    df['date'] = pd.to_datetime(df['date'])

    print("Recomputing indicators...")
    df['return'] = df['close'].pct_change()
    df['ma_10'] = df['close'].rolling(10).mean()
    df['ma_50'] = df['close'].rolling(50).mean()
    df['volatility'] = df['return'].rolling(10).std()
    delta = df['close'].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    df['rsi'] = 100 - (100 / (1 + gain / (loss + 1e-9)))
    ema12 = df['close'].ewm(span=12, adjust=False).mean()
    ema26 = df['close'].ewm(span=26, adjust=False).mean()
    df['macd'] = ema12 - ema26
    rm = df['close'].rolling(20).mean()
    rs = df['close'].rolling(20).std()
    df['bb_high'] = rm + 2 * rs
    df['bb_low'] = rm - 2 * rs

    # Time-based features
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month

    # Lag features
    for col in ['close', 'return', 'volatility']:
        df[f'{col}_lag1'] = df[col].shift(1)
        df[f'{col}_lag2'] = df[col].shift(2)

    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)

    # Volatility class
    median_volatility = df['volatility'].median()
    df['volatility_class'] = df['volatility'].apply(lambda x: 1 if x > median_volatility else 0)

    # Classification Data
    features_clf_cols = ['close', 'return', 'ma_10', 'ma_50', 'rsi', 'macd', 'bb_high', 'bb_low', 'day_of_week', 'month', 'close_lag1', 'close_lag2', 'return_lag1', 'return_lag2', 'volatility_lag1', 'volatility_lag2']
    X_clf = df[features_clf_cols]
    y_clf = df['volatility_class']

    print("Training Classification Scaler and Models...")
    scaler_clf = StandardScaler()
    X_clf_scaled = scaler_clf.fit_transform(X_clf)

    rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_classifier.fit(X_clf_scaled, y_clf)

    ada_classifier = AdaBoostClassifier(n_estimators=50, random_state=42)
    ada_classifier.fit(X_clf_scaled, y_clf)

    kmeans_model = KMeans(n_clusters=3, random_state=42)
    kmeans_model.fit(X_clf_scaled)

    # Regression Data
    df_reg = df.copy()
    df_reg['target_close'] = df_reg['close'].shift(-1)
    df_reg.dropna(inplace=True)

    prediction_features_columns = ['return', 'ma_10', 'ma_50', 'rsi', 'macd', 'bb_high', 'bb_low', 'day_of_week', 'month', 'close_lag1', 'close_lag2', 'return_lag1', 'return_lag2', 'volatility_lag1', 'volatility_lag2']
    X_reg = df_reg[prediction_features_columns]
    y_reg = df_reg['target_close']

    print("Training Regression Scaler and Model...")
    scaler_reg = StandardScaler()
    X_reg_scaled = scaler_reg.fit_transform(X_reg)

    rf_regressor = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_regressor.fit(X_reg_scaled, y_reg)

    print("Saving Models to 'models' directory...")
    model_dir = 'models'
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(rf_classifier, os.path.join(model_dir, 'clf_model.pkl'))
    joblib.dump(ada_classifier, os.path.join(model_dir, 'ada_model.pkl'))
    joblib.dump(kmeans_model, os.path.join(model_dir, 'kmeans_model.pkl'))
    joblib.dump(rf_regressor, os.path.join(model_dir, 'reg_model.pkl'))
    joblib.dump(scaler_clf, os.path.join(model_dir, 'scaler_clf.pkl'))
    joblib.dump(scaler_reg, os.path.join(model_dir, 'scaler_reg.pkl'))

    print("All models and scalers have been successfully retrained and saved locally.")

if __name__ == '__main__':
    main()
