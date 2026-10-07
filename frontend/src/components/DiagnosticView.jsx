import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Sparkles, ArrowLeft, Printer, AlertTriangle, CheckCircle2, 
  Brain, QrCode, ExternalLink, ShieldAlert, Stethoscope, ChevronRight 
} from 'lucide-react';

export default function DiagnosticView({ 
  predictionResult, 
  patientData, 
  onEditData, 
  onViewMobile 
}) {
  if (!predictionResult) {
    return (
      <div className="animate-fade-in" style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '48px 32px' }}>
          <Brain size={48} color="#818CF8" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            No Active Diagnostic Report
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Please fill in patient clinical metrics or load a sample case from the Patient Intake tab.
          </p>
          <button onClick={onEditData} className="btn-primary-gradient">
            Go to Patient Intake
          </button>
        </div>
      </div>
    );
  }

  const {
    prediction,
    probability,
    model_used = 'ANN (MLP)',
    risk_level = 'High Risk',
    risk_factors = [],
    category_breakdown = [],
    patient_id = patientData?.id || 'PID_1001',
  } = predictionResult;

  const isPositive = prediction === 1 || probability > 50;

  // Chart data for individual risk factor impact bar chart
  const barChartData = risk_factors.slice(0, 8).map(f => ({
    name: f.name.length > 18 ? f.name.substring(0, 18) + '...' : f.name,
    fullName: f.name,
    impact: f.contribution,
    isRisk: f.is_risk,
    impactLevel: f.impact,
  }));

  // Direct link for mobile view
  const mobileUrl = `${window.location.origin}?view=mobile&id=${patient_id}`;

  return (
    <div className="animate-fade-in" style={{ padding: '32px 24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header Hero */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="badge badge-primary">
              <Brain size={13} />
              {model_used} Neural Diagnostic Output
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', marginBottom: '6px' }}>
            Patient Assessment & Clinical Diagnostic Report
          </h1>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.05)',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}>
            <span style={{ fontWeight: 700, color: '#818CF8' }}># Patient ID: {patient_id}</span>
            <span>•</span>
            <span style={{ color: '#FFFFFF' }}>Name: {patientData?.name || 'Eleanor Vance'}</span>
            <span>(Age {patientData?.age || 74}, {patientData?.gender || 'Female'})</span>
            <span>•</span>
            <span>Physician: {patientData?.physician || 'Dr. Marcus Vance, MD'}</span>
          </div>
        </div>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onEditData} className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Edit Input Data</span>
          </button>
          <button onClick={() => window.print()} className="btn-primary-gradient">
            <Printer size={16} />
            <span>Print Diagnostic Report</span>
          </button>
        </div>
      </div>

      {/* Main Result Banner & Circular Probability Ring Card */}
      <div className="glass-card" style={{
        padding: '32px',
        marginBottom: '24px',
        border: isPositive ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
        background: isPositive 
          ? 'radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.08) 0%, #0F1523 70%)'
          : 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.08) 0%, #0F1523 70%)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px',
          alignItems: 'center',
        }}>
          {/* Left: Headline and summary */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className={`badge ${isPositive ? 'badge-danger' : 'badge-success'}`}>
                {isPositive ? 'HIGH RISK' : 'LOW RISK'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                {model_used} Classification
              </span>
            </div>

            <h2 style={{
              fontSize: '1.95rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: isPositive ? '#F87171' : '#34D399',
              marginBottom: '12px',
              lineHeight: 1.25,
            }}>
              {isPositive 
                ? "Positive - High Probability of Alzheimer's Disease"
                : "Negative - Low Probability of Alzheimer's Disease"}
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '22px' }}>
              {isPositive
                ? "Significant cognitive & functional deficit detected. Immediate comprehensive neurological evaluation, MRI brain scan, and CSF/Blood biomarker screening strongly recommended."
                : "Cognitive autonomy and clinical biomarkers fall within optimal reference ranges. Recommended routine monitoring and lifestyle maintenance."}
            </p>

            {/* 3 Metric Mini Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: '#0B101C', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>MMSE Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                  {patientData?.mmse || 18} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 30</span>
                </div>
              </div>
              <div style={{ background: '#0B101C', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>ADL Autonomy</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                  {patientData?.adl || 4.5} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 10</span>
                </div>
              </div>
              <div style={{ background: '#0B101C', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Model Focus</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#818CF8', marginTop: '4px' }}>
                  {model_used} ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
          </div>

          {/* Right: Circular Probability Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '190px',
              height: '190px',
              borderRadius: '50%',
              background: '#0B101C',
              border: `8px solid ${isPositive ? '#EF4444' : '#10B981'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPositive ? '0 0 35px rgba(239, 68, 68, 0.4)' : '0 0 35px rgba(16, 185, 129, 0.4)',
              position: 'relative',
            }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {probability}%
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isPositive ? '#FCA5A5' : '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PROBABILITY
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '14px', textAlign: 'center' }}>
              {model_used} Neural Confidence Score
            </p>
          </div>
        </div>
      </div>

      {/* Visualizations Grid: Recharts Bar Chart + Recharts Pie Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '22px',
        marginBottom: '24px',
      }}>
        {/* Left: Bar Chart (Individual Risk Factor Contributions Ranked) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={18} color="#F59E0B" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              Individual Risk Factor Breakdown (Ranked Impact)
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '18px' }}>
            Features exerting the highest upward pressure on the patient's Alzheimer's risk score
          </p>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="var(--text-dim)" fontSize={11} domain={[0, 30]} />
                <YAxis type="category" dataKey="name" stroke="var(--text-dim)" fontSize={11} width={130} />
                <Tooltip 
                  contentStyle={{ background: '#0F1523', border: '1px solid #6366F1', borderRadius: '8px', color: '#FFFFFF' }}
                  formatter={(val, name, item) => [`${val}% Weight`, item.payload.fullName]}
                />
                <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.impactLevel === 'critical' ? '#EF4444' : (entry.impactLevel === 'high' ? '#F59E0B' : '#6366F1')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pie Chart (Feature-Category Risk Share) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Brain size={18} color="#EC4899" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              Feature Category Contribution Breakdown
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '18px' }}>
            Risk distribution across Cognitive, Lifestyle, Demographic, and Clinical domains
          </p>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={category_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {category_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0F1523', border: '1px solid #6366F1', borderRadius: '8px', color: '#FFFFFF' }}
                  formatter={(val) => [`${val}%`, 'Category Risk Share']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommended Actions & Mobile QR Generator Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '22px',
      }}>
        {/* Recommended Actions */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Stethoscope size={18} color="#10B981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              Recommended Clinical Actions
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isPositive ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <ChevronRight size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Refer to Cognitive Neurology for High-Resolution Volumetric MRI Brain Scan.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <ChevronRight size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Perform CSF or Plasma p-tau217 / Amyloid-Beta 42/40 biomarker assay.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <ChevronRight size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Initiate acetylcholinesterase inhibitor (AChEI) evaluation and caregiver counseling.</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <ChevronRight size={16} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Continue active cognitive stimulation, aerobic exercise, and Mediterranean diet.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <ChevronRight size={16} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Schedule routine follow-up cognitive assessment in 12 months.</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scannable Mobile QR Code Card */}
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={18} color="#34D399" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                Clinician Mobile QR View
              </h3>
            </div>
            <span className="badge badge-success">Live Mobile Sync</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: '12px',
              display: 'inline-block',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <QRCodeSVG value={mobileUrl} size={110} />
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '12px' }}>
                Scan this QR code with any smartphone camera to open the simplified, read-only diagnostic summary for Patient #{patient_id}.
              </p>
              <button 
                onClick={onViewMobile}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              >
                <ExternalLink size={14} />
                <span>Open Mobile View Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
