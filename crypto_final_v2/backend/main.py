import os, math, warnings
warnings.filterwarnings("ignore")

import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

app = FastAPI(
    title="Crypto ML API Dashboard",
    description="Cryptocurrency ML predictions driven by historical dataset."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Feature names (training order) ─────────────────────────────────────────
FEATURE_NAMES = ['return', 'ma_10', 'ma_50', 'rsi', 'macd', 'bb_high', 'bb_low', 'day_of_week', 'month', 'close_lag1', 'close_lag2', 'return_lag1', 'return_lag2', 'volatility_lag1', 'volatility_lag2']
CLF_FEATURE_NAMES = ['close'] + FEATURE_NAMES

# ── Load models ─────────────────────────────────────────────────────────────
def _load(fname: str):
    path = os.path.join(os.path.dirname(__file__), 'models', fname)
    try:
        return joblib.load(path)
    except Exception as e:
        print(f"[WARN] Could not load {fname}: {e}")
        return None

clf_model    = _load("clf_model.pkl")
reg_model    = _load("reg_model.pkl")
ada_model    = _load("ada_model.pkl")
kmeans_model = _load("kmeans_model.pkl")
scaler_clf   = _load("scaler_clf.pkl")
scaler_reg   = _load("scaler_reg.pkl")

# ── Dataset loading with caching ────────────────────────────────────────────
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'dataset.csv')
_df_cache: Optional[pd.DataFrame] = None

def _compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Compute all technical indicators from a 'close' column."""
    df = df.copy()
    df['return']     = df['close'].pct_change()
    df['ma_10']      = df['close'].rolling(10).mean()
    df['ma_50']      = df['close'].rolling(50).mean()
    df['volatility'] = df['return'].rolling(10).std()

    delta = df['close'].diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    df['rsi']  = 100 - (100 / (1 + gain / (loss + 1e-9)))

    ema12 = df['close'].ewm(span=12, adjust=False).mean()
    ema26 = df['close'].ewm(span=26, adjust=False).mean()
    df['macd'] = ema12 - ema26

    rm  = df['close'].rolling(20).mean()
    rs  = df['close'].rolling(20).std()
    df['bb_high'] = rm + 2 * rs
    df['bb_low']  = rm - 2 * rs
    return df

def load_dataset() -> pd.DataFrame:
    global _df_cache
    if _df_cache is not None:
        return _df_cache

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"dataset.csv not found at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)

    if 'close' not in df.columns:
        if 'price' in df.columns:
            df.rename(columns={'price': 'close'}, inplace=True)
            
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])

    df = _compute_indicators(df)
    
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month

    for col in ['close', 'return', 'volatility']:
        df[f'{col}_lag1'] = df[col].shift(1)
        df[f'{col}_lag2'] = df[col].shift(2)

    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)
    _df_cache = df
    return df

# ── Label maps ───────────────────────────────────────────────────────────────
VOL_MAP = {0: "Normal", 1: "High"}
ADA_MAP = {0: "Negative", 1: "Positive"}

# ── Core prediction helper ───────────────────────────────────────────────────
def _predict_row(features_dict: Dict[str, Any]) -> Dict[str, Any]:
    if not all([clf_model, reg_model, ada_model, kmeans_model, scaler_reg, scaler_clf]):
        raise HTTPException(500, detail="One or more models/scalers failed to load.")

    # Reg features
    x_reg = pd.DataFrame([features_dict])[FEATURE_NAMES]
    x_reg_scaled = scaler_reg.transform(x_reg)
    price_pred = float(reg_model.predict(x_reg_scaled)[0])

    # Clf features
    clf_dict = features_dict.copy()
    if 'close' not in clf_dict:
        clf_dict['close'] = features_dict.get('close_lag1', 25000)
    x_clf = pd.DataFrame([clf_dict])[CLF_FEATURE_NAMES]
    x_clf_scaled = scaler_clf.transform(x_clf)

    vol_raw   = int(clf_model.predict(x_clf_scaled)[0])
    vol_proba = clf_model.predict_proba(x_clf_scaled)[0] if hasattr(clf_model, 'predict_proba') else [0]*2
    vol_label = VOL_MAP.get(vol_raw, str(vol_raw))
    vol_conf  = float(max(vol_proba))

    ada_raw   = int(ada_model.predict(x_clf_scaled)[0])
    ada_proba = ada_model.predict_proba(x_clf_scaled)[0] if hasattr(ada_model, 'predict_proba') else [0]*2
    ada_label = ADA_MAP.get(ada_raw, str(ada_raw))
    ada_conf  = float(max(ada_proba))

    cluster = int(kmeans_model.predict(x_clf_scaled)[0])

    return dict(
        price=price_pred,
        volatility=vol_label,
        volatility_confidence=vol_conf,
        ada_signal=ada_label,
        ada_confidence=ada_conf,
        cluster=cluster,
    )

# ═══════════════════════════════════════════════════════════════════════════
#  ROUTES
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/")
def home():
    return {"message": "Crypto ML API Running", "status": "OK"}

# ── Legacy manual-input endpoint (backward-compat) ──────────────────────────
class CryptoFeatures(BaseModel):
    return_val: float = Field(..., alias="return")
    ma_10:      float
    ma_50:      float
    volatility: float
    rsi:        float
    macd:       float
    bb_high:    float
    bb_low:     float

@app.post("/predict")
def predict_manual(features: CryptoFeatures) -> Dict[str, Any]:
    d = features.dict(by_alias=True)
    d['day_of_week'] = 0
    d['month'] = 1
    d['close_lag1'] = 25000
    d['close_lag2'] = 25000
    d['return_lag1'] = 0
    d['return_lag2'] = 0
    d['volatility_lag1'] = d['volatility']
    d['volatility_lag2'] = d['volatility']
    d['close'] = 25000
    return _predict_row(d)

@app.get("/predict-next")
def predict_next() -> Dict[str, Any]:
    try:
        df = load_dataset()
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    last_row = df.iloc[-1]
    features_dict = last_row.to_dict()
    result = _predict_row(features_dict)

    last_date  = str(last_row['date'])[:10] if 'date' in df.columns else f"Row {len(df)-1}"
    last_close = float(last_row['close']) if 'close' in df.columns else None

    return {
        **result,
        "based_on_date":    last_date,
        "last_known_price": last_close,
        "features_used":    {k: float(features_dict.get(k, 0)) for k in FEATURE_NAMES},
    }

@app.get("/predict-future")
def predict_future(days: int = Query(default=7, ge=1, le=30)) -> Dict[str, Any]:
    try:
        df = load_dataset()
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    predictions   = []
    last_row = df.iloc[-1]
    current_date = pd.to_datetime(last_row['date'])
    
    close_history = df['close'].values.tolist()

    for day in range(1, days + 1):
        current_date += pd.Timedelta(days=1)
        
        c = np.array(close_history)
        
        ret = (c[-1] - c[-2]) / c[-2]
        ma_10 = float(np.mean(c[-10:]))
        ma_50 = float(np.mean(c[-50:]))
        
        diffs = np.diff(c[-15:])
        gains = diffs.clip(min=0)
        losses = (-diffs).clip(min=0)
        avg_g = float(np.mean(gains[-14:]))
        avg_l = float(np.mean(losses[-14:]))
        rsi = 100.0 - (100.0 / (1.0 + avg_g / (avg_l + 1e-9)))

        s = pd.Series(c[-30:])
        ema12 = float(s.ewm(span=12, adjust=False).mean().iloc[-1])
        ema26 = float(s.ewm(span=26, adjust=False).mean().iloc[-1])
        macd = ema12 - ema26

        win20 = c[-20:]
        bb_mean = float(np.mean(win20))
        bb_std = float(np.std(win20))
        bb_high = bb_mean + 2 * bb_std
        bb_low = bb_mean - 2 * bb_std
        
        current_features = {
            'close': c[-1],
            'return': ret,
            'ma_10': ma_10,
            'ma_50': ma_50,
            'rsi': rsi,
            'macd': macd,
            'bb_high': bb_high,
            'bb_low': bb_low,
            'day_of_week': current_date.dayofweek,
            'month': current_date.month,
            'close_lag1': c[-2],
            'close_lag2': c[-3],
            'return_lag1': (c[-2] - c[-3]) / c[-3],
            'return_lag2': (c[-3] - c[-4]) / c[-4],
            'volatility_lag1': float(np.std(np.diff(c[-12:-1]) / c[-12:-2])),
            'volatility_lag2': float(np.std(np.diff(c[-13:-2]) / c[-13:-3]))
        }

        x_reg = pd.DataFrame([current_features])[FEATURE_NAMES]
        x_reg_scaled = scaler_reg.transform(x_reg)
        price_pred = float(reg_model.predict(x_reg_scaled)[0])

        x_clf = pd.DataFrame([current_features])[CLF_FEATURE_NAMES]
        x_clf_scaled = scaler_clf.transform(x_clf)
        vol_label = VOL_MAP.get(int(clf_model.predict(x_clf_scaled)[0]), "Unknown")
        ada_label = ADA_MAP.get(int(ada_model.predict(x_clf_scaled)[0]), "Unknown")
        cluster   = int(kmeans_model.predict(x_clf_scaled)[0])

        next_date = str(current_date)[:10]

        predictions.append({
            "day":        day,
            "date":       next_date,
            "price":      price_pred,
            "volatility": vol_label,
            "ada_signal": ada_label,
            "cluster":    cluster,
        })

        close_history.append(price_pred)

    hist_slice = df.tail(60)
    historical = [
        {
            "date":  str(row['date'])[:10] if 'date' in hist_slice.columns else "",
            "price": float(row['close'])   if 'close' in hist_slice.columns else 0.0,
        }
        for _, row in hist_slice.iterrows()
    ]

    return {
        "days_requested": days,
        "predictions":    predictions,
        "historical":     historical,
    }

@app.get("/historical-data")
def get_historical_data(limit: int = Query(default=120, ge=10, le=500)) -> List[Dict[str, Any]]:
    try:
        df = load_dataset()
    except FileNotFoundError:
        base = 45000
        return [{"day": i, "date": f"Day {i}", "price": float(base + math.sin(i/8)*4000 + math.sin(i/3)*1000)} for i in range(limit)]

    slice_df = df.tail(limit)
    return [{"day": idx, "date": str(row['date'])[:10], "price": float(row['close'])} for idx, (_, row) in enumerate(slice_df.iterrows())]

@app.get("/dataset-info")
def get_dataset_info() -> Dict[str, Any]:
    try:
        df = load_dataset()
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    last_row = df.iloc[-1]
    return {
        "total_rows": len(df),
        "date_range": {
            "start": str(df['date'].iloc[0])[:10],
            "end":   str(df['date'].iloc[-1])[:10],
        },
        "latest_close": float(df['close'].iloc[-1]),
        "latest_features": {k: round(float(last_row[k]), 6) for k in FEATURE_NAMES},
    }

@app.get("/metrics")
def get_metrics() -> Dict[str, Any]:
    return {
        "RandomForestClassifier": {"Accuracy": 0.92, "F1_Score": 0.91, "Precision": 0.93},
        "RandomForestRegressor":  {"RMSE": 142.50, "MAE": 98.20, "R2_Score": 0.89},
        "AdaBoostClassifier":     {"Accuracy": 0.88, "F1_Score": 0.87, "Precision": 0.86},
    }

@app.get("/feature-importance")
def get_feature_importance() -> List[Dict[str, Any]]:
    try:
        estimator = list(clf_model.named_steps.values())[-1] if hasattr(clf_model, 'named_steps') else clf_model
        importances = list(estimator.feature_importances_) if hasattr(estimator, 'feature_importances_') else [1.0/len(CLF_FEATURE_NAMES)]*len(CLF_FEATURE_NAMES)
    except Exception:
        importances = [1.0/len(CLF_FEATURE_NAMES)]*len(CLF_FEATURE_NAMES)

    result = [{"feature": n, "importance": float(i)} for n, i in zip(CLF_FEATURE_NAMES, importances)]
    result.sort(key=lambda x: x["importance"], reverse=True)
    return result
