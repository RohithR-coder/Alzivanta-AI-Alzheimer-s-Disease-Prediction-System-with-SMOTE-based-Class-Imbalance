document.addEventListener('DOMContentLoaded', () => {
    // Current Date
    const dateEl = document.getElementById('currentDate');
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            // Remove active class from all navs and views
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => {
                view.classList.remove('active');
                view.style.opacity = '0';
            });

            // Add active class to clicked nav and target view
            item.classList.add('active');
            const targetView = document.getElementById(targetId);
            targetView.classList.add('active');
            
            // Fade-in animation
            setTimeout(() => {
                targetView.style.opacity = '1';
                
                // Trigger specific animations if needed
                if (targetId === 'dataView') {
                    animateDataCards();
                }
            }, 50);
        });
    });

    // Range Slider Labels
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const valSpan = document.getElementById(e.target.id + 'Val');
            if (valSpan) {
                valSpan.textContent = e.target.value;
            }
        });
    });

    // Form Handling
    const form = document.getElementById('predictionForm');
    const clearBtn = document.getElementById('clearBtn');
    
    clearBtn.addEventListener('click', clearForm);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            showToast('Please fill out all required fields.', 'error');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Show loading
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('hidden');

        setTimeout(() => {
            overlay.classList.add('hidden');
            runPredictionModel(data);
        }, 1500);
    });

    // Prediction Logic
    function runPredictionModel(data) {
        let score = 15; // Base score
        let factors = [];

        // High risk factors
        if (Number(data.age) > 75) { score += 15; factors.push({name: 'Advanced Age (>75)', impact: 'high'}); }
        if (Number(data.mmse) < 20) { score += 25; factors.push({name: 'Low MMSE Score (<20)', impact: 'critical'}); }
        if (data.familyHistory === 'Yes') { score += 15; factors.push({name: 'Family History of Alzheimer\'s', impact: 'high'}); }
        if (data.memoryComplaints === 'Yes') { score += 10; factors.push({name: 'Memory Complaints reported', impact: 'medium'}); }
        if (data.confusion === 'Yes') { score += 10; factors.push({name: 'Symptoms of Confusion', impact: 'medium'}); }
        if (data.disorientation === 'Yes') { score += 10; factors.push({name: 'Symptoms of Disorientation', impact: 'medium'}); }
        if (data.behavioralProblems === 'Yes') { score += 8; factors.push({name: 'Behavioral Problems observed', impact: 'medium'}); }
        if (data.depression === 'Yes') { score += 5; factors.push({name: 'History of Depression', impact: 'low'}); }
        if (data.hypertension === 'Yes') { score += 5; factors.push({name: 'Hypertension', impact: 'low'}); }
        if (data.diabetes === 'Yes') { score += 5; factors.push({name: 'Diabetes', impact: 'low'}); }
        if (data.headInjury === 'Yes') { score += 8; factors.push({name: 'Previous Head Injury', impact: 'low'}); }

        // Protective factors
        if (Number(data.physicalActivity) > 5) { score -= 8; }
        if (Number(data.dietQuality) > 7) { score -= 5; }
        if (Number(data.sleepQuality) > 7) { score -= 5; }
        if (Number(data.education) > 12) { score -= 5; }
        if (Number(data.cholHDL) > 60) { score -= 3; }

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        displayResults(score, factors);
    }

    function displayResults(probability, factors) {
        // Switch view
        document.querySelector('[data-target="outputView"]').click();

        // Toggle empty state vs results
        document.getElementById('outputEmptyState').classList.add('hidden');
        document.getElementById('resultContent').classList.remove('hidden');

        // Banner setup
        const banner = document.getElementById('resultBanner');
        const predText = document.getElementById('predictionText');
        const predSubtext = document.getElementById('predictionSubtext');
        
        banner.className = 'result-banner'; // reset
        if (probability > 50) {
            banner.classList.add('negative'); // Red theme for disease detected
            predText.innerHTML = "Alzheimer's Detected ❌";
            predSubtext.textContent = "High probability of Alzheimer's based on the clinical profile.";
        } else {
            banner.classList.add('positive'); // Green theme for healthy
            predText.innerHTML = "No Alzheimer's Detected ✅";
            predSubtext.textContent = "Low probability of Alzheimer's disease.";
        }

        // Determine Risk Level
        let riskLevel = '';
        let riskClass = '';
        if (probability < 25) {
            riskLevel = 'Low Risk';
            riskClass = 'risk-low';
        } else if (probability < 50) {
            riskLevel = 'Medium Risk';
            riskClass = 'risk-medium';
        } else if (probability < 75) {
            riskLevel = 'High Risk';
            riskClass = 'risk-high';
        } else {
            riskLevel = 'Very High Risk';
            riskClass = 'risk-very-high';
        }

        const badge = document.getElementById('riskBadge');
        badge.textContent = riskLevel;
        badge.className = `risk-badge ${riskClass}`;

        // Animate meter and probability
        animateValue("probValue", 0, probability, 1500);
        const meter = document.getElementById('riskMeter');
        meter.style.background = `conic-gradient(var(--primary-color) ${probability * 1.8}deg, var(--border-color) 0 180deg)`;

        // Populate factors
        const factorList = document.getElementById('factorList');
        factorList.innerHTML = '';
        if (factors.length === 0) {
            factorList.innerHTML = '<li>No significant high-risk factors identified.</li>';
        } else {
            // Sort by impact
            const impactOrder = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
            factors.sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact]);
            
            factors.slice(0, 5).forEach(f => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="factor-dot ${f.impact}"></span> ${f.name}`;
                factorList.appendChild(li);
            });
        }

        // Populate actions
        const actionList = document.getElementById('actionList');
        actionList.innerHTML = '';
        const actions = [];
        if (probability > 50) {
            actions.push("Schedule follow-up appointment with a neurologist.");
            actions.push("Conduct detailed cognitive profiling and brain MRI.");
            actions.push("Discuss potential care planning with family members.");
        } else {
            actions.push("Maintain healthy lifestyle and current monitoring schedule.");
            actions.push("Re-evaluate in 12 months or if new symptoms present.");
            actions.push("Encourage continued physical activity and cognitive engagement.");
        }
        actions.forEach(act => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="icon">➡️</span> ${act}`;
            actionList.appendChild(li);
        });
    }

    // Utility Functions
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    function clearForm() {
        form.reset();
        // Reset slider displays
        rangeInputs.forEach(input => {
            const valSpan = document.getElementById(input.id + 'Val');
            if (valSpan) valSpan.textContent = input.value;
        });
        showToast('Form cleared successfully.');
    }

    document.getElementById('printBtn').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('newAssessmentBtn').addEventListener('click', () => {
        clearForm();
        document.getElementById('outputEmptyState').classList.remove('hidden');
        document.getElementById('resultContent').classList.add('hidden');
        document.querySelector('[data-target="inputView"]').click();
    });

    // Animations
    function animateDataCards() {
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    function animateValue(id, start, end, duration) {
        if (start === end) return;
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Initialize initial animations
    animateDataCards();
});
