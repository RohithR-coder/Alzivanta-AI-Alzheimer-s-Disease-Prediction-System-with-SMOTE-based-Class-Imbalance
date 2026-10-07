"""
NeuroPredict AI - Machine Learning Engine
8 Models with real SMOTE training and dynamic metric computation.
"""
import numpy as np
import pandas as pd
import io
import json
import warnings
warnings.filterwarnings('ignore')

from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    matthews_corrcoef, roc_auc_score, confusion_matrix
)


# ── Feature category definitions ─────────────────────────────────────────
COGNITIVE_FEATURES = [
    'MMSE', 'FunctionalAssessment', 'ADL', 'MemoryComplaints',
    'BehavioralProblems', 'Confusion', 'Disorientation', 'PersonalityChanges',
    'DifficultyCompletingTasks', 'Forgetfulness'
]
LIFESTYLE_FEATURES = [
    'BMI', 'Smoking', 'AlcoholConsumption', 'PhysicalActivity',
    'DietQuality', 'SleepQuality'
]
DEMOGRAPHIC_FEATURES = [
    'Age', 'Gender', 'Ethnicity', 'EducationLevel', 'FamilyHistoryAlzheimers'
]
CLINICAL_FEATURES = [
    'SystolicBP', 'DiastolicBP', 'CholesterolTotal', 'CholesterolLDL',
    'CholesterolHDL', 'CholesterolTriglycerides'
]
MEDICAL_HISTORY_FEATURES = [
    'CardiovascularDisease', 'Diabetes', 'Depression', 'HeadInjury',
    'Hypertension'
]

# Star ratings for each model (display metadata)
MODEL_STARS = {
    'ANN (MLP)': 5,
    'XGBoost': 5,
    'Gradient Boosting': 5,
    'AdaBoost (Fast Learner)': 5,
    'SVM': 5,
    'Random Forest': 4,
    'Decision Tree': 3,
    'KNN (Lazy/Slow Learner)': 3,
    'Naive Bayes (Slow/Lazy Learner)': 3,
    'Logistic Regression (Slow Learner)': 3,
}

# ── Default Alzheimer's dataset columns ──────────────────────────────────
EXPECTED_FEATURES = [
    'Age', 'Gender', 'Ethnicity', 'EducationLevel', 'BMI', 'Smoking',
    'AlcoholConsumption', 'PhysicalActivity', 'DietQuality', 'SleepQuality',
    'FamilyHistoryAlzheimers', 'CardiovascularDisease', 'Diabetes',
    'Depression', 'HeadInjury', 'Hypertension', 'SystolicBP', 'DiastolicBP',
    'CholesterolTotal', 'CholesterolLDL', 'CholesterolHDL',
    'CholesterolTriglycerides', 'MMSE', 'FunctionalAssessment', 'ADL',
    'MemoryComplaints', 'BehavioralProblems', 'Confusion', 'Disorientation',
    'PersonalityChanges', 'DifficultyCompletingTasks', 'Forgetfulness'
]
TARGET_COL = 'Diagnosis'


def _generate_synthetic_dataset(n_samples=2149, random_state=42):
    """Generate a realistic synthetic Alzheimer's dataset with clear clinical signal."""
    rng = np.random.RandomState(random_state)
    data = {}

    data['Age'] = rng.randint(60, 91, n_samples)
    data['Gender'] = rng.randint(0, 2, n_samples)
    data['Ethnicity'] = rng.randint(0, 4, n_samples)
    data['EducationLevel'] = rng.randint(0, 21, n_samples)
    data['BMI'] = np.round(rng.uniform(15, 40, n_samples), 1)
    data['Smoking'] = rng.randint(0, 2, n_samples)
    data['AlcoholConsumption'] = np.round(rng.uniform(0, 20, n_samples), 1)
    data['PhysicalActivity'] = np.round(rng.uniform(0, 10, n_samples), 1)
    data['DietQuality'] = np.round(rng.uniform(0, 10, n_samples), 1)
    data['SleepQuality'] = rng.randint(1, 11, n_samples)
    data['FamilyHistoryAlzheimers'] = rng.randint(0, 2, n_samples)
    data['CardiovascularDisease'] = rng.randint(0, 2, n_samples)
    data['Diabetes'] = rng.randint(0, 2, n_samples)
    data['Depression'] = rng.randint(0, 2, n_samples)
    data['HeadInjury'] = rng.randint(0, 2, n_samples)
    data['Hypertension'] = rng.randint(0, 2, n_samples)
    data['SystolicBP'] = rng.randint(90, 181, n_samples)
    data['DiastolicBP'] = rng.randint(60, 121, n_samples)
    data['CholesterolTotal'] = rng.randint(150, 301, n_samples)
    data['CholesterolLDL'] = rng.randint(50, 201, n_samples)
    data['CholesterolHDL'] = rng.randint(20, 101, n_samples)
    data['CholesterolTriglycerides'] = rng.randint(50, 401, n_samples)
    data['MMSE'] = np.round(rng.uniform(0, 30, n_samples), 1)
    data['FunctionalAssessment'] = np.round(rng.uniform(0, 10, n_samples), 1)
    data['ADL'] = np.round(rng.uniform(0, 10, n_samples), 1)
    data['MemoryComplaints'] = rng.randint(0, 2, n_samples)
    data['BehavioralProblems'] = rng.randint(0, 2, n_samples)
    data['Confusion'] = rng.randint(0, 2, n_samples)
    data['Disorientation'] = rng.randint(0, 2, n_samples)
    data['PersonalityChanges'] = rng.randint(0, 2, n_samples)
    data['DifficultyCompletingTasks'] = rng.randint(0, 2, n_samples)
    data['Forgetfulness'] = rng.randint(0, 2, n_samples)

    df = pd.DataFrame(data)

    # Strong clinical scoring rules for Alzheimer's diagnosis
    score = np.zeros(n_samples)
    # Primary cognitive deficit markers (highest clinical weight)
    score += (df['MMSE'] < 16).astype(float) * 4.5
    score += ((df['MMSE'] >= 16) & (df['MMSE'] < 22)).astype(float) * 2.8
    score += (df['ADL'] < 4.0).astype(float) * 3.2
    score += (df['FunctionalAssessment'] < 4.0).astype(float) * 2.5
    score += df['Disorientation'] * 2.4
    score += df['MemoryComplaints'] * 2.2
    score += df['Confusion'] * 2.0
    score += df['DifficultyCompletingTasks'] * 1.8
    score += df['Forgetfulness'] * 1.5
    score += df['BehavioralProblems'] * 1.4

    # High-risk demographic and medical markers
    score += (df['Age'] > 75).astype(float) * 2.2
    score += df['FamilyHistoryAlzheimers'] * 2.0
    score += df['HeadInjury'] * 1.2
    score += df['Depression'] * 0.9
    score += df['Hypertension'] * 0.8
    score += df['Diabetes'] * 0.8
    score += (df['BMI'] > 30).astype(float) * 0.6

    # Protective factors
    score -= (df['PhysicalActivity'] > 5).astype(float) * 1.2
    score -= (df['DietQuality'] > 7).astype(float) * 0.9
    score -= (df['SleepQuality'] > 7).astype(float) * 0.8
    score -= (df['EducationLevel'] > 14).astype(float) * 0.9

    # Minimal noise for realistic medical variance
    noise = rng.normal(0, 0.45, n_samples)
    score += noise

    # Positive diagnosis threshold (~22% clinical positive rate before SMOTE)
    threshold = np.percentile(score, 78)
    df[TARGET_COL] = (score >= threshold).astype(int)

    return df


from sklearn.pipeline import make_pipeline
from sklearn.feature_selection import SelectKBest, f_classif

def _build_models():
    """Create fresh, tuned instances of all models (including Fast & Slow learners)."""
    return {
        'ANN (MLP)': MLPClassifier(
            hidden_layer_sizes=(128, 64), activation='relu',
            solver='adam', alpha=0.001, max_iter=450, random_state=42,
            early_stopping=True, validation_fraction=0.1
        ),
        'XGBoost': XGBClassifier(
            n_estimators=160, max_depth=4, learning_rate=0.08,
            subsample=0.85, colsample_bytree=0.85,
            random_state=42, eval_metric='logloss', use_label_encoder=False
        ),
        'Gradient Boosting': GradientBoostingClassifier(
            n_estimators=160, max_depth=4, learning_rate=0.08,
            subsample=0.85, random_state=42
        ),
        'AdaBoost (Fast Learner)': AdaBoostClassifier(
            n_estimators=120, learning_rate=0.1, random_state=42
        ),
        'SVM': SVC(
            kernel='rbf', C=1.5, gamma='scale',
            probability=True, random_state=42
        ),
        'Random Forest': RandomForestClassifier(
            n_estimators=180, max_depth=8, min_samples_leaf=4,
            random_state=42
        ),
        'Decision Tree': DecisionTreeClassifier(
            max_depth=6, min_samples_leaf=6, random_state=42
        ),
        'KNN (Lazy/Slow Learner)': make_pipeline(
            SelectKBest(f_classif, k=14),
            KNeighborsClassifier(n_neighbors=9, weights='distance', metric='manhattan')
        ),
        'Naive Bayes (Slow/Lazy Learner)': GaussianNB(var_smoothing=1e-2),
        'Logistic Regression (Slow Learner)': LogisticRegression(
            C=1.5, max_iter=1000, solver='lbfgs', random_state=42
        ),
    }


def _evaluate_model(model, X_test, y_test):
    """Compute all 6 metrics for a trained model."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    return {
        'accuracy': round(float(accuracy_score(y_test, y_pred)), 4),
        'precision': round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        'f1': round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        'mcc': round(float(matthews_corrcoef(y_test, y_pred)), 4),
        'roc_auc': round(float(roc_auc_score(y_test, y_prob)), 4),
    }


def _compute_confusion_matrix(model, X_test, y_test):
    """Return confusion matrix as dict."""
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    return {
        'true_negative': int(cm[0][0]),
        'false_positive': int(cm[0][1]),
        'false_negative': int(cm[1][0]),
        'true_positive': int(cm[1][1]),
    }


class MLEngine:
    """Central ML engine that manages training, prediction and metrics for 8 models."""

    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = EXPECTED_FEATURES
        self.models_before_smote = {}
        self.models_after_smote = {}
        self.metrics_before_smote = {}
        self.metrics_after_smote = {}
        self.confusion_matrices = {}
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.X_train_smote = None
        self.y_train_smote = None
        self.dataset_info = {}
        self.is_trained = False
        self.best_model_name = None

        # Bootstrap with synthetic data
        self._bootstrap_train()

    def _bootstrap_train(self):
        """Train on synthetic data at startup."""
        df = _generate_synthetic_dataset()
        self._train_on_dataframe(df)

    def _preprocess_dataframe(self, df):
        """Clean and preprocess a raw dataframe."""
        # Drop non-predictive columns if present
        drop_cols = ['PatientID', 'DoctorInCharge', 'PatientName', 'Name']
        for col in drop_cols:
            if col in df.columns:
                df = df.drop(col, axis=1)

        # Encode categorical columns
        for col in df.columns:
            if df[col].dtype == 'object' and col != TARGET_COL:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))

        # Encode target if string
        if df[TARGET_COL].dtype == 'object':
            le = LabelEncoder()
            df[TARGET_COL] = le.fit_transform(df[TARGET_COL])

        return df

    def _train_on_dataframe(self, df):
        """Full training pipeline on a dataframe."""
        df = self._preprocess_dataframe(df.copy())

        X = df.drop(TARGET_COL, axis=1)
        y = df[TARGET_COL]

        self.feature_names = list(X.columns)

        # Scale
        self.scaler = StandardScaler()
        X_scaled = pd.DataFrame(self.scaler.fit_transform(X), columns=X.columns)

        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
        self.X_train = X_train
        self.X_test = X_test
        self.y_train = y_train
        self.y_test = y_test

        # SMOTE
        smote = SMOTE(random_state=42)
        X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)
        self.X_train_smote = X_train_smote
        self.y_train_smote = y_train_smote

        # Dataset info
        self.dataset_info = {
            'total_records': len(df),
            'total_features': len(self.feature_names),
            'train_size': len(X_train),
            'test_size': len(X_test),
            'train_size_smote': len(X_train_smote),
            'positive_before': int(y_train.sum()),
            'negative_before': int((y_train == 0).sum()),
            'positive_after': int(y_train_smote.sum()),
            'negative_after': int((y_train_smote == 0).sum()),
            'class_ratio_before': f"{int(y.sum())}/{len(y) - int(y.sum())}",
            'positive_pct_before': round(float(y.mean()) * 100, 1),
        }

        # ── Train BEFORE SMOTE (imbalanced) ──
        self.models_before_smote = _build_models()
        self.metrics_before_smote = {}
        for name, model in self.models_before_smote.items():
            model.fit(X_train, y_train)
            self.metrics_before_smote[name] = _evaluate_model(model, X_test, y_test)

        # ── Train AFTER SMOTE (balanced) ──
        self.models_after_smote = _build_models()
        self.metrics_after_smote = {}
        self.confusion_matrices = {}
        for name, model in self.models_after_smote.items():
            model.fit(X_train_smote, y_train_smote)
            self.metrics_after_smote[name] = _evaluate_model(model, X_test, y_test)
            self.confusion_matrices[name] = _compute_confusion_matrix(model, X_test, y_test)

        # Best model by Recall (after SMOTE)
        best_recall = 0
        for name, m in self.metrics_after_smote.items():
            if m['recall'] > best_recall:
                best_recall = m['recall']
                self.best_model_name = name

        self.is_trained = True

    def train_custom_dataset(self, file_bytes, filename):
        """Train on uploaded CSV or XLSX file."""
        if filename.endswith('.xlsx') or filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(file_bytes), engine='openpyxl')
        else:
            df = pd.read_csv(io.BytesIO(file_bytes))

        # Validate required target column
        if TARGET_COL not in df.columns:
            # Try common alternatives
            alt_names = ['diagnosis', 'target', 'label', 'class', 'Diagnosis']
            found = False
            for alt in alt_names:
                if alt in df.columns:
                    df = df.rename(columns={alt: TARGET_COL})
                    found = True
                    break
            if not found:
                raise ValueError(
                    f"Missing '{TARGET_COL}' column. Found columns: {list(df.columns)}"
                )

        self._train_on_dataframe(df)
        return self.dataset_info

    def get_all_metrics(self):
        """Return metrics for all 8 models, before and after SMOTE."""
        result = {}
        for name in MODEL_STARS:
            result[name] = {
                'stars': MODEL_STARS[name],
                'before_smote': self.metrics_before_smote.get(name, {}),
                'after_smote': self.metrics_after_smote.get(name, {}),
                'confusion_matrix': self.confusion_matrices.get(name, {}),
            }
        return result

    def predict_single(self, patient_data, model_name=None):
        """Predict for a single patient. Returns probability, class, risk factors, chart data."""
        if model_name is None:
            model_name = self.best_model_name

        model = self.models_after_smote.get(model_name)
        if model is None:
            raise ValueError(f"Model '{model_name}' not found")

        # Build feature vector
        feature_values = []
        for feat in self.feature_names:
            val = patient_data.get(feat, 0)
            # Convert Yes/No to 1/0
            if isinstance(val, str):
                if val.lower() in ('yes', 'true', '1', 'male', 'caucasian'):
                    val = 1
                elif val.lower() in ('no', 'false', '0', 'female'):
                    val = 0
                else:
                    try:
                        val = float(val)
                    except ValueError:
                        val = 0
            feature_values.append(float(val))

        input_arr = np.array(feature_values).reshape(1, -1)
        input_scaled = self.scaler.transform(input_arr)

        prob = float(model.predict_proba(input_scaled)[0][1])
        prediction = 1 if prob > 0.5 else 0

        # Compute risk factor contributions
        risk_factors = self._compute_risk_factors(patient_data, prob)
        category_breakdown = self._compute_category_breakdown(patient_data)

        return {
            'prediction': prediction,
            'probability': round(prob * 100, 2),
            'model_used': model_name,
            'risk_level': self._get_risk_level(prob * 100),
            'risk_factors': risk_factors,
            'category_breakdown': category_breakdown,
        }

    def batch_predict(self, file_bytes, filename, model_name=None):
        """Batch predict from CSV/XLSX. Returns list of predictions."""
        if filename.endswith('.xlsx') or filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(file_bytes), engine='openpyxl')
        else:
            df = pd.read_csv(io.BytesIO(file_bytes))

        # Remove non-feature columns
        drop_cols = ['PatientID', 'DoctorInCharge', 'PatientName', 'Name', TARGET_COL]
        id_col = None
        patient_ids = []
        for col in ['PatientID', 'ID', 'id', 'Patient_ID']:
            if col in df.columns:
                id_col = col
                patient_ids = df[col].tolist()
                break

        if not patient_ids:
            patient_ids = list(range(1, len(df) + 1))

        predictions = []
        for idx, row in df.iterrows():
            patient_data = row.to_dict()
            try:
                result = self.predict_single(patient_data, model_name)
                predictions.append({
                    'patient_id': patient_ids[idx] if idx < len(patient_ids) else idx + 1,
                    'prediction': result['prediction'],
                    'probability': result['probability'],
                    'risk_level': result['risk_level'],
                    'diagnosis': "Alzheimer's Detected" if result['prediction'] == 1 else "No Alzheimer's",
                })
            except Exception as e:
                predictions.append({
                    'patient_id': patient_ids[idx] if idx < len(patient_ids) else idx + 1,
                    'prediction': -1,
                    'probability': 0,
                    'risk_level': 'Error',
                    'diagnosis': f'Error: {str(e)}',
                })

        return predictions

    def parse_patients_file(self, file_bytes, filename):
        """Parse CSV/XLSX for patient lookup list."""
        if filename.endswith('.xlsx') or filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(file_bytes), engine='openpyxl')
        else:
            df = pd.read_csv(io.BytesIO(file_bytes))

        patients = []
        for idx, row in df.iterrows():
            patient = row.to_dict()
            # Generate display info
            pid = patient.get('PatientID', patient.get('ID', idx + 1))
            name = patient.get('PatientName', patient.get('Name', f'Patient {pid}'))
            age = patient.get('Age', 'N/A')
            gender = patient.get('Gender', 'N/A')
            if gender == 0:
                gender = 'Female'
            elif gender == 1:
                gender = 'Male'

            patients.append({
                'id': pid,
                'name': str(name),
                'age': age,
                'gender': gender,
                'data': {k: (v if not pd.isna(v) else 0) for k, v in patient.items()},
            })

        return patients

    def _compute_risk_factors(self, patient_data, prob):
        """Compute individual feature risk contributions for bar chart."""
        risk_weights = {
            'MMSE': {'weight': 0.25, 'threshold': lambda v: v < 20, 'label': 'Low MMSE Score'},
            'FunctionalAssessment': {'weight': 0.12, 'threshold': lambda v: v < 5, 'label': 'Low Functional Assessment'},
            'ADL': {'weight': 0.10, 'threshold': lambda v: v < 5, 'label': 'Low ADL Score'},
            'Age': {'weight': 0.15, 'threshold': lambda v: v > 75, 'label': 'Advanced Age (>75)'},
            'FamilyHistoryAlzheimers': {'weight': 0.12, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': "Family History"},
            'MemoryComplaints': {'weight': 0.10, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': 'Memory Complaints'},
            'Confusion': {'weight': 0.08, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': 'Confusion'},
            'Disorientation': {'weight': 0.08, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': 'Disorientation'},
            'BehavioralProblems': {'weight': 0.06, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': 'Behavioral Problems'},
            'BMI': {'weight': 0.05, 'threshold': lambda v: v > 30, 'label': 'High BMI (>30)'},
            'Depression': {'weight': 0.05, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': 'Depression'},
            'Hypertension': {'weight': 0.04, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': 'Hypertension'},
            'Diabetes': {'weight': 0.04, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': 'Diabetes'},
            'HeadInjury': {'weight': 0.05, 'threshold': lambda v: v == 1 or str(v).lower() == 'yes', 'label': 'Head Injury'},
            'SleepQuality': {'weight': 0.03, 'threshold': lambda v: v < 4, 'label': 'Poor Sleep Quality'},
            'PhysicalActivity': {'weight': 0.03, 'threshold': lambda v: v < 3, 'label': 'Low Physical Activity'},
        }

        factors = []
        for feat, info in risk_weights.items():
            raw_val = patient_data.get(feat, 0)
            try:
                val = float(raw_val) if not isinstance(raw_val, str) else (
                    1 if raw_val.lower() in ('yes', 'true', '1') else 0
                )
            except (ValueError, AttributeError):
                val = 0

            is_risk = info['threshold'](val)
            contribution = round(info['weight'] * 100 * (1 if is_risk else 0.1), 1)
            impact = 'critical' if info['weight'] >= 0.2 else (
                'high' if info['weight'] >= 0.1 else (
                    'medium' if info['weight'] >= 0.05 else 'low'
                )
            )
            factors.append({
                'name': info['label'],
                'feature': feat,
                'value': val,
                'contribution': contribution,
                'is_risk': is_risk,
                'impact': impact,
            })

        # Sort by contribution descending
        factors.sort(key=lambda x: x['contribution'], reverse=True)
        return factors

    def _compute_category_breakdown(self, patient_data):
        """Compute category risk breakdown for pie chart."""
        categories = {
            'Cognitive': {'features': COGNITIVE_FEATURES, 'score': 0, 'max': 0},
            'Lifestyle': {'features': LIFESTYLE_FEATURES, 'score': 0, 'max': 0},
            'Demographic': {'features': DEMOGRAPHIC_FEATURES, 'score': 0, 'max': 0},
            'Clinical': {'features': CLINICAL_FEATURES, 'score': 0, 'max': 0},
            'Medical History': {'features': MEDICAL_HISTORY_FEATURES, 'score': 0, 'max': 0},
        }

        risk_checks = {
            'MMSE': lambda v: max(0, (30 - v) / 30),
            'FunctionalAssessment': lambda v: max(0, (10 - v) / 10),
            'ADL': lambda v: max(0, (10 - v) / 10),
            'Age': lambda v: max(0, (v - 60) / 30),
            'BMI': lambda v: max(0, (v - 18) / 22) if v > 25 else 0,
            'EducationLevel': lambda v: max(0, (20 - v) / 20),
            'SystolicBP': lambda v: max(0, (v - 120) / 60) if v > 120 else 0,
            'DiastolicBP': lambda v: max(0, (v - 80) / 40) if v > 80 else 0,
            'PhysicalActivity': lambda v: max(0, (10 - v) / 10),
            'DietQuality': lambda v: max(0, (10 - v) / 10),
            'SleepQuality': lambda v: max(0, (10 - v) / 10),
        }

        for cat_name, cat_info in categories.items():
            for feat in cat_info['features']:
                raw_val = patient_data.get(feat, 0)
                try:
                    val = float(raw_val) if not isinstance(raw_val, str) else (
                        1 if str(raw_val).lower() in ('yes', 'true', '1') else 0
                    )
                except (ValueError, AttributeError):
                    val = 0

                if feat in risk_checks:
                    score = risk_checks[feat](val)
                else:
                    score = val  # binary features
                cat_info['score'] += score
                cat_info['max'] += 1

        # Normalize to percentages
        total = sum(c['score'] for c in categories.values())
        if total == 0:
            total = 1

        result = []
        colors = {
            'Cognitive': '#8B5CF6',
            'Lifestyle': '#EC4899',
            'Demographic': '#3B82F6',
            'Clinical': '#10B981',
            'Medical History': '#F59E0B',
        }
        for cat_name, cat_info in categories.items():
            result.append({
                'name': cat_name,
                'value': round((cat_info['score'] / total) * 100, 1),
                'color': colors.get(cat_name, '#6B7280'),
            })

        return result

    def _get_risk_level(self, probability):
        if probability < 25:
            return 'Low Risk'
        elif probability < 50:
            return 'Medium Risk'
        elif probability < 75:
            return 'High Risk'
        else:
            return 'Very High Risk'
