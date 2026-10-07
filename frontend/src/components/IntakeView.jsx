import React, { useState } from 'react';
import { 
  Sparkles, Upload, Zap, User, Activity, HeartPulse, 
  Dna, Flame, Brain, Search, Check, RefreshCw 
} from 'lucide-react';

export default function IntakeView({ 
  formData, 
  setFormData, 
  onPredict, 
  onParsePatientsFile,
  isPredicting 
}) {
  const [parsedPatients, setParsedPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // Preset Clinical Samples
  const presets = {
    highRisk: {
      id: 'PID_1001',
      name: 'Eleanor Vance',
      age: 74,
      gender: 'Female',
      physician: 'Dr. Marcus Vance, MD',
      ethnicity: 'Caucasian',
      education: 10,
      bmi: 28.5,
      smoking: 'Yes',
      alcohol: 8,
      physicalActivity: 1.5,
      dietQuality: 3,
      sleepQuality: 4,
      familyHistory: 'Yes',
      cardio: 'Yes',
      diabetes: 'Yes',
      depression: 'Yes',
      headInjury: 'Yes',
      hypertension: 'Yes',
      sysBP: 155,
      diaBP: 95,
      cholTotal: 260,
      cholLDL: 165,
      cholHDL: 38,
      cholTri: 220,
      mmse: 18,
      functionalAssessment: 3.5,
      adl: 4.5,
      memoryComplaints: 'Yes',
      behavioralProblems: 'Yes',
      confusion: 'Yes',
      disorientation: 'Yes',
      personalityChanges: 'Yes',
      difficultyTasks: 'Yes',
      forgetfulness: 'Yes',
    },
    mci: {
      id: 'PID_1002',
      name: 'Robert Hayes',
      age: 68,
      gender: 'Male',
      physician: 'Dr. Sarah Jenkins, MD',
      ethnicity: 'Caucasian',
      education: 14,
      bmi: 25.2,
      smoking: 'No',
      alcohol: 4,
      physicalActivity: 4.0,
      dietQuality: 6,
      sleepQuality: 6,
      familyHistory: 'No',
      cardio: 'No',
      diabetes: 'No',
      depression: 'No',
      headInjury: 'No',
      hypertension: 'Yes',
      sysBP: 135,
      diaBP: 85,
      cholTotal: 215,
      cholLDL: 130,
      cholHDL: 50,
      cholTri: 160,
      mmse: 23,
      functionalAssessment: 6.5,
      adl: 7.5,
      memoryComplaints: 'Yes',
      behavioralProblems: 'No',
      confusion: 'No',
      disorientation: 'No',
      personalityChanges: 'No',
      difficultyTasks: 'No',
      forgetfulness: 'Yes',
    },
    healthy: {
      id: 'PID_1003',
      name: 'Arthur Pendelton',
      age: 65,
      gender: 'Male',
      physician: 'Dr. Alan Ross, MD',
      ethnicity: 'Caucasian',
      education: 18,
      bmi: 22.8,
      smoking: 'No',
      alcohol: 2,
      physicalActivity: 7.5,
      dietQuality: 9,
      sleepQuality: 8,
      familyHistory: 'No',
      cardio: 'No',
      diabetes: 'No',
      depression: 'No',
      headInjury: 'No',
      hypertension: 'No',
      sysBP: 118,
      diaBP: 76,
      cholTotal: 185,
      cholLDL: 98,
      cholHDL: 65,
      cholTri: 110,
      mmse: 29,
      functionalAssessment: 9.5,
      adl: 9.8,
      memoryComplaints: 'No',
      behavioralProblems: 'No',
      confusion: 'No',
      disorientation: 'No',
      personalityChanges: 'No',
      difficultyTasks: 'No',
      forgetfulness: 'No',
    }
  };

  const applyPreset = (key) => {
    setActivePreset(key);
    setFormData({ ...presets[key] });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingFile(true);
    try {
      const res = await onParsePatientsFile(file);
      setParsedPatients(res.patients || []);
    } catch (err) {
      alert(`Failed to parse patient file: ${err.message}`);
    } finally {
      setIsParsingFile(false);
    }
  };

  const selectPatientFromLookup = (p) => {
    const d = p.data || {};
    setFormData({
      id: p.id || formData.id,
      name: p.name || formData.name,
      age: p.age || formData.age,
      gender: p.gender || formData.gender,
      physician: formData.physician,
      ethnicity: d.Ethnicity || 'Caucasian',
      education: d.EducationLevel || 12,
      bmi: d.BMI || 24.5,
      smoking: d.Smoking === 1 || d.Smoking === 'Yes' ? 'Yes' : 'No',
      alcohol: d.AlcoholConsumption || 5,
      physicalActivity: d.PhysicalActivity || 4,
      dietQuality: d.DietQuality || 5,
      sleepQuality: d.SleepQuality || 6,
      familyHistory: d.FamilyHistoryAlzheimers === 1 || d.FamilyHistoryAlzheimers === 'Yes' ? 'Yes' : 'No',
      cardio: d.CardiovascularDisease === 1 || d.CardiovascularDisease === 'Yes' ? 'Yes' : 'No',
      diabetes: d.Diabetes === 1 || d.Diabetes === 'Yes' ? 'Yes' : 'No',
      depression: d.Depression === 1 || d.Depression === 'Yes' ? 'Yes' : 'No',
      headInjury: d.HeadInjury === 1 || d.HeadInjury === 'Yes' ? 'Yes' : 'No',
      hypertension: d.Hypertension === 1 || d.Hypertension === 'Yes' ? 'Yes' : 'No',
      sysBP: d.SystolicBP || 125,
      diaBP: d.DiastolicBP || 80,
      cholTotal: d.CholesterolTotal || 200,
      cholLDL: d.CholesterolLDL || 120,
      cholHDL: d.CholesterolHDL || 50,
      cholTri: d.CholesterolTriglycerides || 150,
      mmse: d.MMSE || 24,
      functionalAssessment: d.FunctionalAssessment || 6,
      adl: d.ADL || 7,
      memoryComplaints: d.MemoryComplaints === 1 || d.MemoryComplaints === 'Yes' ? 'Yes' : 'No',
      behavioralProblems: d.BehavioralProblems === 1 || d.BehavioralProblems === 'Yes' ? 'Yes' : 'No',
      confusion: d.Confusion === 1 || d.Confusion === 'Yes' ? 'Yes' : 'No',
      disorientation: d.Disorientation === 1 || d.Disorientation === 'Yes' ? 'Yes' : 'No',
      personalityChanges: d.PersonalityChanges === 1 || d.PersonalityChanges === 'Yes' ? 'Yes' : 'No',
      difficultyTasks: d.DifficultyCompletingTasks === 1 || d.DifficultyCompletingTasks === 'Yes' ? 'Yes' : 'No',
      forgetfulness: d.Forgetfulness === 1 || d.Forgetfulness === 'Yes' ? 'Yes' : 'No',
    });
    setParsedPatients([]);
  };

  const filteredPatients = parsedPatients.filter(p => 
    String(p.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '32px 24px', maxWidth: '1440px', margin: '0 auto' }}>
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
              Clinical Patient Intake Form
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', marginBottom: '8px' }}>
            Collect Patient Clinical & Diagnostic Data
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '850px', lineHeight: 1.5 }}>
            Enter patient demography, cognitive MMSE/ADL test scores, lifestyle factors, and neurological symptoms, or 
            <span style={{ color: '#818CF8', fontWeight: 600 }}> lookup by Patient ID</span> from uploaded CSV/XLSX.
          </p>
        </div>

        <button 
          onClick={onPredict}
          disabled={isPredicting}
          className="btn-primary-gradient pulse-glow"
          style={{ fontSize: '1rem', padding: '12px 26px', cursor: isPredicting ? 'not-allowed' : 'pointer' }}
        >
          {isPredicting ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Analyzing Patient Data...</span>
            </>
          ) : (
            <>
              <Zap size={18} />
              <span>Analyze Patient & Predict Risk</span>
            </>
          )}
        </button>
      </div>

      {/* Option A: Upload Patient CSV/XLSX */}
      <div className="glass-card" style={{ padding: '22px 26px', marginBottom: '22px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
            }}>
              <Upload size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#FFFFFF' }}>
                OPTION A: UPLOAD PATIENT CSV/EXCEL & LOOKUP PATIENT ID
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                Import CSV or XLSX to search and auto-fill patient details into the assessment form
              </p>
            </div>
          </div>

          <label style={{ margin: 0 }}>
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls" 
              style={{ display: 'none' }}
              onChange={handlePatientFileUpload}
              disabled={isParsingFile}
            />
            <span className="btn-success" style={{ padding: '10px 20px', fontSize: '0.88rem', cursor: isParsingFile ? 'not-allowed' : 'pointer' }}>
              {isParsingFile ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Parsing File...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload Patient CSV/Excel</span>
                </>
              )}
            </span>
          </label>
        </div>

        {/* Searchable Patient Lookup Dropdown / Table (when file uploaded) */}
        {parsedPatients.length > 0 && (
          <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Search size={16} color="var(--text-dim)" />
              <input 
                type="text" 
                placeholder="Search patient by ID or Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: '380px', padding: '8px 12px', fontSize: '0.88rem' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Found {filteredPatients.length} patients
              </span>
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#0B101C', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {filteredPatients.slice(0, 20).map((p, idx) => (
                <div 
                  key={idx}
                  onClick={() => selectPatientFromLookup(p)}
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#818CF8' }}>#{p.id}</span>
                    <span style={{ color: '#FFFFFF' }}>{p.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Age {p.age}, {p.gender}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 600 }}>Click to Auto-fill ➜</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Option B: 1-Click Preset Clinical Samples */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Sparkles size={14} color="#FBBF24" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Option B: 1-Click Preset Clinical Samples:
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {/* Preset 1: High Risk */}
          <div 
            onClick={() => applyPreset('highRisk')}
            className={`glass-card glass-card-interactive ${activePreset === 'highRisk' ? 'pulse-glow' : ''}`}
            style={{
              padding: '18px 20px',
              cursor: 'pointer',
              border: activePreset === 'highRisk' ? '2px solid #EF4444' : '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
                High Risk Alzheimer's Case
              </h4>
              <span className="badge badge-danger">High Risk (ANN 92.4%)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
              74-year-old female presenting severe memory complaints, MMSE 18, low ADL 4.5, disorientation & family history.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#F87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📄 Click to auto-fill form</span>
            </div>
          </div>

          {/* Preset 2: MCI */}
          <div 
            onClick={() => applyPreset('mci')}
            className={`glass-card glass-card-interactive ${activePreset === 'mci' ? 'pulse-glow' : ''}`}
            style={{
              padding: '18px 20px',
              cursor: 'pointer',
              border: activePreset === 'mci' ? '2px solid #F59E0B' : '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
                Mild Cognitive Impairment (MCI)
              </h4>
              <span className="badge badge-warning">Moderate Risk (ANN 48.6%)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
              68-year-old male with moderate MMSE 23, mild forgetfulness, maintained ADL 7.5, no disorientation.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#FBBF24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📄 Click to auto-fill form</span>
            </div>
          </div>

          {/* Preset 3: Healthy */}
          <div 
            onClick={() => applyPreset('healthy')}
            className={`glass-card glass-card-interactive ${activePreset === 'healthy' ? 'pulse-glow' : ''}`}
            style={{
              padding: '18px 20px',
              cursor: 'pointer',
              border: activePreset === 'healthy' ? '2px solid #10B981' : '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
                Healthy Senior Control
              </h4>
              <span className="badge badge-success">Low Risk (ANN 6.2%)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
              65-year-old male with optimal cognitive scores (MMSE 29, ADL 9.8), good lifestyle metrics and zero symptoms.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📄 Click to auto-fill form</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Form Sections */}
      <form onSubmit={(e) => { e.preventDefault(); onPredict(); }} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Section 1: Patient Identification */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <User size={20} color="#818CF8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              1. Patient Identification & ID Number
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label>Patient ID Number</label>
              <input 
                type="text" 
                value={formData.id} 
                onChange={(e) => handleInputChange('id', e.target.value)} 
                placeholder="PID_1001"
              />
            </div>
            <div>
              <label>Patient Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
                placeholder="Eleanor Vance"
              />
            </div>
            <div>
              <label>Age (Years: 60-90)</label>
              <input 
                type="number" 
                min={60} 
                max={90} 
                value={formData.age} 
                onChange={(e) => handleInputChange('age', Number(e.target.value))} 
              />
            </div>
            <div>
              <label>Gender</label>
              <select value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div>
              <label>Attending Physician</label>
              <input 
                type="text" 
                value={formData.physician} 
                onChange={(e) => handleInputChange('physician', e.target.value)} 
                placeholder="Dr. Marcus Vance, MD"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Cognitive & Functional Assessment */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Brain size={20} color="#EC4899" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              2. Cognitive & Functional Assessment Scores
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label>MMSE Score (0 - 30): {formData.mmse}</label>
              <input 
                type="range" 
                min={0} 
                max={30} 
                step={0.5} 
                value={formData.mmse} 
                onChange={(e) => handleInputChange('mmse', Number(e.target.value))} 
              />
            </div>
            <div>
              <label>Functional Assessment (0 - 10): {formData.functionalAssessment}</label>
              <input 
                type="range" 
                min={0} 
                max={10} 
                step={0.1} 
                value={formData.functionalAssessment} 
                onChange={(e) => handleInputChange('functionalAssessment', Number(e.target.value))} 
              />
            </div>
            <div>
              <label>ADL Autonomy Score (0 - 10): {formData.adl}</label>
              <input 
                type="range" 
                min={0} 
                max={10} 
                step={0.1} 
                value={formData.adl} 
                onChange={(e) => handleInputChange('adl', Number(e.target.value))} 
              />
            </div>
            <div>
              <label>Memory Complaints</label>
              <select value={formData.memoryComplaints} onChange={(e) => handleInputChange('memoryComplaints', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Behavioral Problems</label>
              <select value={formData.behavioralProblems} onChange={(e) => handleInputChange('behavioralProblems', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Medical History & Risk Factors */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <HeartPulse size={20} color="#F59E0B" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              3. Medical History & Chronic Conditions
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label>Family History</label>
              <select value={formData.familyHistory} onChange={(e) => handleInputChange('familyHistory', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Cardiovascular</label>
              <select value={formData.cardio} onChange={(e) => handleInputChange('cardio', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Diabetes</label>
              <select value={formData.diabetes} onChange={(e) => handleInputChange('diabetes', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Depression</label>
              <select value={formData.depression} onChange={(e) => handleInputChange('depression', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Head Injury</label>
              <select value={formData.headInjury} onChange={(e) => handleInputChange('headInjury', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Hypertension</label>
              <select value={formData.hypertension} onChange={(e) => handleInputChange('hypertension', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Clinical & Biomarker Vitals */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Activity size={20} color="#10B981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              4. Clinical Measurements & Biomarkers
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label>Systolic BP (mmHg)</label>
              <input type="number" min={90} max={180} value={formData.sysBP} onChange={(e) => handleInputChange('sysBP', Number(e.target.value))} />
            </div>
            <div>
              <label>Diastolic BP (mmHg)</label>
              <input type="number" min={60} max={120} value={formData.diaBP} onChange={(e) => handleInputChange('diaBP', Number(e.target.value))} />
            </div>
            <div>
              <label>Total Cholesterol (mg/dL)</label>
              <input type="number" min={150} max={300} value={formData.cholTotal} onChange={(e) => handleInputChange('cholTotal', Number(e.target.value))} />
            </div>
            <div>
              <label>LDL Cholesterol (mg/dL)</label>
              <input type="number" min={50} max={200} value={formData.cholLDL} onChange={(e) => handleInputChange('cholLDL', Number(e.target.value))} />
            </div>
            <div>
              <label>HDL Cholesterol (mg/dL)</label>
              <input type="number" min={20} max={100} value={formData.cholHDL} onChange={(e) => handleInputChange('cholHDL', Number(e.target.value))} />
            </div>
            <div>
              <label>Triglycerides (mg/dL)</label>
              <input type="number" min={50} max={400} value={formData.cholTri} onChange={(e) => handleInputChange('cholTri', Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Section 5: Lifestyle & Environmental Factors */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Flame size={20} color="#38BDF8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              5. Lifestyle & Environmental Factors
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label>BMI (kg/m²)</label>
              <input type="number" step={0.1} min={15} max={40} value={formData.bmi} onChange={(e) => handleInputChange('bmi', Number(e.target.value))} />
            </div>
            <div>
              <label>Smoking Status</label>
              <select value={formData.smoking} onChange={(e) => handleInputChange('smoking', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Alcohol (units/wk): {formData.alcohol}</label>
              <input type="range" min={0} max={20} value={formData.alcohol} onChange={(e) => handleInputChange('alcohol', Number(e.target.value))} />
            </div>
            <div>
              <label>Physical Activity (hrs/wk): {formData.physicalActivity}</label>
              <input type="range" min={0} max={10} step={0.5} value={formData.physicalActivity} onChange={(e) => handleInputChange('physicalActivity', Number(e.target.value))} />
            </div>
            <div>
              <label>Diet Quality (0 - 10): {formData.dietQuality}</label>
              <input type="range" min={0} max={10} value={formData.dietQuality} onChange={(e) => handleInputChange('dietQuality', Number(e.target.value))} />
            </div>
            <div>
              <label>Sleep Quality (1 - 10): {formData.sleepQuality}</label>
              <input type="range" min={1} max={10} value={formData.sleepQuality} onChange={(e) => handleInputChange('sleepQuality', Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Section 6: Neurological Symptoms */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Dna size={20} color="#A855F7" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              6. Neurological & Behavioral Symptoms
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label>Confusion</label>
              <select value={formData.confusion} onChange={(e) => handleInputChange('confusion', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Disorientation</label>
              <select value={formData.disorientation} onChange={(e) => handleInputChange('disorientation', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Personality Changes</label>
              <select value={formData.personalityChanges} onChange={(e) => handleInputChange('personalityChanges', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Task Difficulty</label>
              <select value={formData.difficultyTasks} onChange={(e) => handleInputChange('difficultyTasks', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Forgetfulness</label>
              <select value={formData.forgetfulness} onChange={(e) => handleInputChange('forgetfulness', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', marginTop: '12px' }}>
          <button 
            type="button" 
            onClick={() => applyPreset('healthy')}
            className="btn-secondary"
          >
            Reset Form
          </button>
          <button 
            type="submit" 
            disabled={isPredicting}
            className="btn-primary-gradient"
            style={{ fontSize: '1rem', padding: '12px 28px' }}
          >
            <Zap size={18} />
            <span>Analyze Patient & Predict Risk</span>
          </button>
        </div>
      </form>
    </div>
  );
}
