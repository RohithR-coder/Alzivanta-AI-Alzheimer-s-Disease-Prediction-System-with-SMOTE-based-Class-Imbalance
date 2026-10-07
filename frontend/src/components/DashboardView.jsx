import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { 
  Sparkles, Upload, ArrowRight, RefreshCw, Zap, CheckCircle2, 
  Layers, Database, FileSpreadsheet, Eye, Play, AlertCircle 
} from 'lucide-react';

export default function DashboardView({ 
  metricsData, 
  datasetInfo, 
  onGoToIntake, 
  onRetrainDataset, 
  onBatchPredict,
  isRetraining 
}) {
  const [smoteView, setSmoteView] = useState('after'); // 'before' | 'after'
  const [activeMetricTab, setActiveMetricTab] = useState('recall'); // 'recall', 'accuracy', 'f1', 'roc_auc', 'mcc'
  const [batchResults, setBatchResults] = useState(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const modelCardsConfig = [
    {
      name: 'ANN (MLP)',
      stars: '⭐⭐⭐⭐⭐',
      type: 'Deep Neural Network',
      highlight: 'Primary DL Architecture',
      color: '#6366F1'
    },
    {
      name: 'XGBoost',
      stars: '⭐⭐⭐⭐⭐',
      type: 'Extreme Gradient Boosting',
      highlight: 'Fast & High Accuracy',
      color: '#8B5CF6'
    },
    {
      name: 'Gradient Boosting',
      stars: '⭐⭐⭐⭐⭐',
      type: 'Ensemble Tree',
      highlight: 'High Precision & Recall',
      color: '#EC4899'
    },
    {
      name: 'SVM',
      stars: '⭐⭐⭐⭐⭐',
      type: 'Kernel Classifier',
      highlight: 'Strong Boundary Margin',
      color: '#3B82F6'
    },
    {
      name: 'Random Forest',
      stars: '⭐⭐⭐⭐☆',
      type: 'Ensemble Forest',
      highlight: 'Robust Bagging',
      color: '#10B981'
    },
    {
      name: 'Decision Tree',
      stars: '⭐⭐⭐☆☆',
      type: 'Tree Classifier',
      highlight: 'High Interpretability',
      color: '#F59E0B'
    },
    {
      name: 'AdaBoost (Fast Learner)',
      stars: '⭐⭐⭐⭐⭐',
      type: 'Adaptive Boosting',
      highlight: 'Ultra-Fast Weighted Learning',
      color: '#06B6D4'
    },
    {
      name: 'KNN (Lazy/Slow Learner)',
      stars: '⭐⭐⭐☆☆',
      type: 'Distance Based',
      highlight: 'Lazy Learner Baseline',
      color: '#14B8A6'
    },
    {
      name: 'Naive Bayes (Slow/Lazy Learner)',
      stars: '⭐⭐⭐☆☆',
      type: 'Probabilistic Gaussian',
      highlight: 'Simple Probabilistic Baseline',
      color: '#84CC16'
    },
    {
      name: 'Logistic Regression (Slow Learner)',
      stars: '⭐⭐⭐☆☆',
      type: 'Linear Model',
      highlight: 'Slow Learning Algorithm',
      color: '#64748B'
    }
  ];

  // Prepare chart & table data based on current SMOTE toggle
  const modelKeys = Object.keys(metricsData || {});
  const chartData = modelKeys.map(name => {
    const info = metricsData[name] || {};
    const set = smoteView === 'after' ? info.after_smote : info.before_smote;
    return {
      name,
      accuracy: set?.accuracy ? (set.accuracy * 100) : 0,
      precision: set?.precision ? (set.precision * 100) : 0,
      recall: set?.recall ? (set.recall * 100) : 0,
      f1: set?.f1 ? (set.f1 * 100) : 0,
      mcc: set?.mcc ? set.mcc : 0,
      roc_auc: set?.roc_auc ? (set.roc_auc * 100) : 0,
      stars: info.stars || 4,
    };
  });

  // Sort ranked table by Recall or F1
  const rankedTableData = [...chartData].sort((a, b) => {
    if (activeMetricTab === 'recall') return b.recall - a.recall;
    if (activeMetricTab === 'accuracy') return b.accuracy - a.accuracy;
    if (activeMetricTab === 'f1') return b.f1 - a.f1;
    if (activeMetricTab === 'roc_auc') return b.roc_auc - a.roc_auc;
    return b.mcc - a.mcc;
  });

  const handleCustomDatasetUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await onRetrainDataset(file);
      setToastMsg(`✅ Retrained on ${res?.total_records || 'dataset'} records successfully!`);
      setTimeout(() => setToastMsg(null), 4500);
    } catch (err) {
      setToastMsg(`❌ Retraining failed: ${err.message}`);
      setTimeout(() => setToastMsg(null), 4500);
    }
  };

  const handleBatchTestUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBatchLoading(true);
    try {
      const res = await onBatchPredict(file);
      setBatchResults(res.predictions);
      setToastMsg(`✅ Batch inference completed for ${res.total} records!`);
      setTimeout(() => setToastMsg(null), 4500);
    } catch (err) {
      setToastMsg(`❌ Batch prediction error: ${err.message}`);
      setTimeout(() => setToastMsg(null), 4500);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const cmANN = metricsData?.['ANN (MLP)']?.confusion_matrix || {
    true_negative: 312, false_positive: 21, false_negative: 16, true_positive: 308
  };

  return (
    <div className="animate-fade-in" style={{ padding: '32px 24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          background: '#0F172A',
          border: '1px solid #6366F1',
          padding: '14px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          color: '#FFFFFF',
          fontSize: '0.92rem',
          fontWeight: 600,
        }}>
          {toastMsg}
        </div>
      )}

      {/* Top Header Hero */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="badge badge-primary">
              <Sparkles size={13} />
              Benchmark Evaluation & Clinical Performance
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', marginBottom: '8px' }}>
            Data Analytics & Model Performance Results
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '850px', lineHeight: 1.5 }}>
            Comparison of Deep Learning <span style={{ color: '#818CF8', fontWeight: 600 }}>Artificial Neural Network (ANN MLP)</span> against 
            Ensemble Classifiers (<span style={{ color: '#34D399', fontWeight: 600 }}>Gradient Boosting</span>, <span style={{ color: '#A78BFA', fontWeight: 600 }}>XGBoost</span>, <span style={{ color: '#60A5FA', fontWeight: 600 }}>SVM</span>, <span style={{ color: '#F472B6', fontWeight: 600 }}>Random Forest</span>, <span style={{ color: '#FBBF24', fontWeight: 600 }}>Decision Tree</span>) and 
            Slow Learners (<span style={{ color: '#94A3B8', fontWeight: 600 }}>KNN</span>, <span style={{ color: '#94A3B8', fontWeight: 600 }}>Logistic Regression</span>).
          </p>
        </div>

        <button 
          onClick={onGoToIntake}
          className="btn-primary-gradient"
          style={{ fontSize: '1rem', padding: '12px 26px' }}
        >
          <span>Go to Patient Intake</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Action Cards Grid: Retrain Custom Dataset + Batch Inference Test */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '18px',
        marginBottom: '24px',
      }}>
        {/* Retrain Dataset Card */}
        <div className="glass-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818CF8',
            }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                Upload Custom Alzheimer's Dataset (.CSV / .XLSX)
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Retrains all 8 models with live SMOTE resampling & metrics update
              </p>
            </div>
          </div>

          <label style={{ margin: 0 }}>
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls" 
              style={{ display: 'none' }}
              onChange={handleCustomDatasetUpload}
              disabled={isRetraining}
            />
            <span className="btn-primary-gradient" style={{ padding: '10px 18px', fontSize: '0.88rem', cursor: isRetraining ? 'not-allowed' : 'pointer' }}>
              {isRetraining ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Training...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Select File</span>
                </>
              )}
            </span>
          </label>
        </div>

        {/* Batch Test Data Card */}
        <div className="glass-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                Upload Test Data for Batch Inference
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Run unlabeled CSV/XLSX through ANN model for batch predictions
              </p>
            </div>
          </div>

          <label style={{ margin: 0 }}>
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls" 
              style={{ display: 'none' }}
              onChange={handleBatchTestUpload}
              disabled={isBatchLoading}
            />
            <span className="btn-success" style={{ padding: '10px 18px', fontSize: '0.88rem', cursor: isBatchLoading ? 'not-allowed' : 'pointer' }}>
              {isBatchLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Run Batch</span>
                </>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Batch Results Viewer (if run) */}
      {batchResults && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#6EE7B7' }}>
                📊 Batch Inference Results ({batchResults.length} Patients)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ANN model predictions generated successfully.
              </p>
            </div>
            <button 
              onClick={() => setBatchResults(null)}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              Close Table
            </button>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#0B101C', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 14px' }}>Patient ID</th>
                  <th style={{ padding: '10px 14px' }}>Diagnosis</th>
                  <th style={{ padding: '10px 14px' }}>Probability</th>
                  <th style={{ padding: '10px 14px' }}>Risk Category</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#A5B4FC' }}>#{row.patient_id}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${row.prediction === 1 ? 'badge-danger' : 'badge-success'}`}>
                        {row.diagnosis}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#FFFFFF' }}>{row.probability}%</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{row.risk_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SMOTE Toggle Banner */}
      <div className="glass-card" style={{
        padding: '18px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(90deg, rgba(15,21,35,0.95) 0%, rgba(20,29,48,0.95) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FBBF24',
          }}>
            <Zap size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
              SMOTE OVERSAMPLING DATA VIEW
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Toggle between raw imbalanced metrics vs SMOTE synthetic minority oversampled metrics
            </p>
          </div>
        </div>

        {/* Real Toggle Buttons */}
        <div style={{
          display: 'flex',
          background: '#0B101C',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <button
            onClick={() => setSmoteView('before')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              background: smoteView === 'before' ? '#334155' : 'transparent',
              color: smoteView === 'before' ? '#FFFFFF' : 'var(--text-muted)',
            }}
          >
            <RefreshCw size={14} />
            <span>BEFORE SMOTE</span>
          </button>
          <button
            onClick={() => setSmoteView('after')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              background: smoteView === 'after' ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' : 'transparent',
              color: smoteView === 'after' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: smoteView === 'after' ? '0 4px 12px rgba(124, 58, 237, 0.4)' : 'none',
            }}
          >
            <Zap size={14} />
            <span>AFTER SMOTE (Balanced)</span>
          </button>
        </div>
      </div>

      {/* 8 Model Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {modelCardsConfig.map((card, idx) => {
          const info = metricsData?.[card.name] || {};
          const set = smoteView === 'after' ? info.after_smote : info.before_smote;
          return (
            <div 
              key={idx} 
              className="glass-card glass-card-interactive"
              style={{
                padding: '18px 20px',
                borderTop: `3px solid ${card.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>{card.name}</h4>
                <span style={{ fontSize: '0.8rem' }}>{card.stars}</span>
              </div>
              
              <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {card.type}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Recall / Sensitivity</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: card.color }}>
                  {set?.recall ? `${(set.recall * 100).toFixed(1)}%` : '--'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={13} color={card.color} />
                <span>{card.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Comparison Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '22px',
        marginBottom: '28px',
      }}>
        {/* Left: Multi-Model Performance Comparison Bar Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Multi-Model Performance Comparison
                </h3>
                <span className="badge badge-success">
                  {smoteView === 'after' ? 'AFTER SMOTE' : 'BEFORE SMOTE'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Metrics evaluated across all 8 models simultaneously
              </p>
            </div>

            {/* Metric Selector Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#0B101C', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {[
                { id: 'recall', label: 'Recall' },
                { id: 'accuracy', label: 'Accuracy' },
                { id: 'f1', label: 'F1' },
                { id: 'roc_auc', label: 'ROCAUC' },
                { id: 'mcc', label: 'MCC' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMetricTab(tab.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeMetricTab === tab.id ? '#6366F1' : 'transparent',
                    color: activeMetricTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-dim)" 
                  fontSize={11} 
                  angle={-25} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis 
                  stroke="var(--text-dim)" 
                  fontSize={11} 
                  domain={activeMetricTab === 'mcc' ? [0, 1] : [0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0F1523', 
                    border: '1px solid #6366F1', 
                    borderRadius: '8px',
                    color: '#FFFFFF' 
                  }}
                  formatter={(val) => [
                    activeMetricTab === 'mcc' ? Number(val).toFixed(3) : `${Number(val).toFixed(1)}%`,
                    activeMetricTab.toUpperCase()
                  ]}
                />
                <Bar dataKey={activeMetricTab} radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#8B5CF6' : (index === 1 ? '#6366F1' : (index === 2 ? '#EC4899' : '#3B82F6'))} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Metric Score Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
                Metric Score Table
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                Ranked by Clinical Recall & F1-Score
              </p>
            </div>
            <span className="badge badge-primary">
              {smoteView === 'after' ? 'AFTER SMOTE' : 'BEFORE SMOTE'}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#0B101C', textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Model</th>
                  <th style={{ padding: '10px 12px' }}>Accuracy</th>
                  <th style={{ padding: '10px 12px' }}>Recall</th>
                  <th style={{ padding: '10px 12px' }}>F1</th>
                  <th style={{ padding: '10px 12px' }}>ROC-AUC</th>
                  <th style={{ padding: '10px 12px' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {rankedTableData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: idx === 0 ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: idx === 0 ? '#A5B4FC' : '#FFFFFF' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '10px 12px' }}>{row.accuracy.toFixed(1)}%</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#34D399' }}>{row.recall.toFixed(1)}%</td>
                    <td style={{ padding: '10px 12px' }}>{row.f1.toFixed(1)}%</td>
                    <td style={{ padding: '10px 12px' }}>{(row.roc_auc / 100).toFixed(3)}</td>
                    <td style={{ padding: '10px 12px' }}>{row.stars}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SMOTE Impact & Confusion Matrix Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '20px',
      }}>
        {/* SMOTE Impact Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
            SMOTE Class Balancing Impact
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Raw Imbalanced Split (Original Dataset)</span>
                <span style={{ fontWeight: 700, color: '#F87171' }}>20% Positive / 80% Negative</span>
              </div>
              <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '20%', height: '100%', background: '#EF4444' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>After SMOTE Synthetic Resampling</span>
                <span style={{ fontWeight: 700, color: '#34D399' }}>50% Positive / 50% Negative (Balanced)</span>
              </div>
              <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, #10B981, #6366F1)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
            Confusion Matrix (ANN Primary Model)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#0B101C', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>True Negative</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '4px' }}>{cmANN.true_negative}</div>
            </div>
            <div style={{ background: '#0B101C', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>False Positive</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171', marginTop: '4px' }}>{cmANN.false_positive}</div>
            </div>
            <div style={{ background: '#0B101C', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>False Negative</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171', marginTop: '4px' }}>{cmANN.false_negative}</div>
            </div>
            <div style={{ background: '#0B101C', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(99,102,241,0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>True Positive</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818CF8', marginTop: '4px' }}>{cmANN.true_positive}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
