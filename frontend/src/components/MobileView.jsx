import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { 
  Brain, ArrowLeft, AlertTriangle, Stethoscope, CheckCircle2, ShieldAlert 
} from 'lucide-react';

export default function MobileView({ 
  predictionResult, 
  patientData, 
  onBackToApp 
}) {
  const data = predictionResult || {
    prediction: 1,
    probability: 92.4,
    model_used: 'ANN (MLP)',
    risk_level: 'High Risk',
    risk_factors: [
      { name: 'Low MMSE Score', contribution: 25.0, is_risk: true, impact: 'critical' },
      { name: 'Advanced Age (>75)', contribution: 15.0, is_risk: true, impact: 'high' },
      { name: 'Family History', contribution: 12.0, is_risk: true, impact: 'high' },
      { name: 'Low Functional Assessment', contribution: 12.0, is_risk: true, impact: 'high' },
      { name: 'Low ADL Score', contribution: 10.0, is_risk: true, impact: 'high' },
      { name: 'Memory Complaints', contribution: 10.0, is_risk: true, impact: 'medium' },
    ],
    category_breakdown: [
      { name: 'Cognitive', value: 42.5, color: '#8B5CF6' },
      { name: 'Demographic', value: 24.0, color: '#3B82F6' },
      { name: 'Lifestyle', value: 18.5, color: '#EC4899' },
      { name: 'Clinical', value: 15.0, color: '#10B981' },
    ],
    patient_id: patientData?.id || 'PID_1001',
  };

  const isPositive = data.prediction === 1 || data.probability > 50;

  const barChartData = (data.risk_factors || []).slice(0, 5).map(f => ({
    name: f.name.length > 14 ? f.name.substring(0, 14) + '...' : f.name,
    fullName: f.name,
    impact: f.contribution,
    impactLevel: f.impact,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090D16',
      color: '#FFFFFF',
      padding: '20px 16px',
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: 'var(--font-main)',
    }}>
      {/* Mobile Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Brain size={20} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>NeuroPredict Mobile</h3>
            <span style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 600 }}>● Clinician Live View</span>
          </div>
        </div>

        {onBackToApp && (
          <button 
            onClick={onBackToApp}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <ArrowLeft size={14} />
            <span>Full App</span>
          </button>
        )}
      </div>

      {/* Patient Header Card */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818CF8' }}>
              PATIENT #{data.patient_id || 'PID_1001'}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {patientData?.name || 'Eleanor Vance'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Age {patientData?.age || 74}, {patientData?.gender || 'Female'}
            </p>
          </div>
          <span className={`badge ${isPositive ? 'badge-danger' : 'badge-success'}`}>
            {isPositive ? 'HIGH RISK' : 'LOW RISK'}
          </span>
        </div>
      </div>

      {/* Primary Result Banner & Probability Gauge */}
      <div className="glass-card" style={{
        padding: '24px 16px',
        marginBottom: '16px',
        textAlign: 'center',
        border: isPositive ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
        background: isPositive 
          ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, #0F1523 80%)'
          : 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, #0F1523 80%)',
      }}>
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          margin: '0 auto 16px auto',
          background: '#0B101C',
          border: `6px solid ${isPositive ? '#EF4444' : '#10B981'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isPositive ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
        }}>
          <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FFFFFF' }}>
            {data.probability}%
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isPositive ? '#FCA5A5' : '#6EE7B7' }}>
            RISK PROBABILITY
          </span>
        </div>

        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          color: isPositive ? '#F87171' : '#34D399',
          marginBottom: '6px',
        }}>
          {isPositive ? "Alzheimer's Detected" : "No Alzheimer's Detected"}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {isPositive 
            ? "High clinical likelihood of cognitive impairment. Neurological consultation advised." 
            : "Clinical biomarker values are within standard healthy limits."}
        </p>

        {/* MMSE and ADL scores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
          <div style={{ background: '#0B101C', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>MMSE SCORE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
              {patientData?.mmse || 18} / 30
            </div>
          </div>
          <div style={{ background: '#0B101C', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>ADL AUTONOMY</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
              {patientData?.adl || 4.5} / 10
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart: Key Risk Factors */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <AlertTriangle size={15} color="#F59E0B" />
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
            Top Risk Contributors
          </h4>
        </div>

        <div style={{ width: '100%', height: '180px' }}>
          <ResponsiveContainer>
            <BarChart data={barChartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="var(--text-dim)" fontSize={10} domain={[0, 30]} />
              <YAxis type="category" dataKey="name" stroke="var(--text-dim)" fontSize={10} width={95} />
              <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
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

      {/* Pie Chart: Category Share */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Brain size={15} color="#EC4899" />
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
            Feature Category Breakdown
          </h4>
        </div>

        <div style={{ width: '100%', height: '180px' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data.category_breakdown || []}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {(data.category_breakdown || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={24} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommended Clinical Action */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Stethoscope size={15} color="#10B981" />
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
            Clinical Action Required
          </h4>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {isPositive
            ? "Priority neurology referral for MRI volumetric study and plasma biomarker assay."
            : "Annual cognitive checkup scheduled. Maintain standard wellness regimen."}
        </p>
      </div>
    </div>
  );
}
