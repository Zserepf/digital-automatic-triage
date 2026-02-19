/* ========================================
   STUDENT HOME PAGE - Symptom Logging
   Digital Automatic Triage
   ======================================== */

const COMMON_SYMPTOMS = [
    'Headache', 'Fever', 'Cough', 'Sore Throat', 'Runny Nose',
    'Stomach Pain', 'Dizziness', 'Body Ache', 'Vomiting', 'Diarrhea',
    'Rash', 'Sore Eyes', 'Sneezing', 'Tired', 'Difficulty Breathing',
    'Chest Pain', 'High Fever', 'Allergic Reaction'
];

export function renderStudentHome(container) {
    if (!Auth.isAuthenticated() || !Auth.isStudent()) {
        Router.navigate('/login');
        return;
    }

    const displayName = Auth.getDisplayName();
    const initials = Auth.getInitials();

    container.innerHTML = `
        <link rel="stylesheet" href="/css/student.css">
        <div class="page-student">
            <!-- Header -->
            <div class="student-header">
                <div class="student-header-greeting">
                    <h1>Hello, ${displayName}!</h1>
                    <p>How are you feeling today?</p>
                </div>
                <div class="student-header-actions">
                    <div class="student-avatar" data-route="/student/profile">${initials}</div>
                </div>
            </div>

            <!-- Symptom Form -->
            <form id="symptom-form" class="symptom-form">
                <!-- Severity Selection -->
                <div class="form-section">
                    <div class="form-section-title">How are you feeling?</div>
                    <div class="form-section-subtitle">Select your current condition</div>
                    <div class="severity-selector" id="severity-selector">
                        <div class="severity-option" data-level="1">
                            <span class="material-icons-round">sentiment_very_satisfied</span>
                            <span>Normal</span>
                        </div>
                        <div class="severity-option" data-level="2">
                            <span class="material-icons-round">sentiment_satisfied</span>
                            <span>Mild</span>
                        </div>
                        <div class="severity-option" data-level="3">
                            <span class="material-icons-round">sentiment_neutral</span>
                            <span>Moderate</span>
                        </div>
                        <div class="severity-option" data-level="4">
                            <span class="material-icons-round">sentiment_dissatisfied</span>
                            <span>Severe</span>
                        </div>
                        <div class="severity-option" data-level="5">
                            <span class="material-icons-round">emergency</span>
                            <span>Emergency</span>
                        </div>
                    </div>
                    <p id="severity-label" class="form-section-subtitle" style="margin-top: 8px; font-style: italic;"></p>
                </div>

                <!-- Pain Scale -->
                <div class="form-section">
                    <div class="form-section-title">Pain Level</div>
                    <div class="form-section-subtitle">Rate your pain from 1 to 10</div>
                    <div class="pain-scale" id="pain-scale">
                        ${[1,2,3,4,5,6,7,8,9,10].map(n =>
                            `<div class="pain-scale-item" data-pain="${n}">${n}</div>`
                        ).join('')}
                    </div>
                </div>

                <!-- Symptom Selection -->
                <div class="form-section">
                    <div class="form-section-title">Select Your Symptoms</div>
                    <div class="form-section-subtitle">Tap all that apply</div>
                    <div class="symptom-chips" id="symptom-chips">
                        ${COMMON_SYMPTOMS.map(s =>
                            `<div class="symptom-chip" data-symptom="${s}">${s}</div>`
                        ).join('')}
                    </div>
                </div>

                <!-- Additional Description -->
                <div class="form-section">
                    <div class="form-section-title">Additional Details</div>
                    <div class="input-group">
                        <textarea id="symptom-description" class="input-field" rows="3" placeholder="Describe how you're feeling (optional)..." style="resize: vertical;"></textarea>
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn--primary btn--full btn--lg" id="submit-btn" disabled>
                    <span class="material-icons-round">send</span>
                    Submit for Triage
                </button>
            </form>
        </div>

        <!-- Bottom Navigation -->
        ${getStudentBottomNav('home')}
    `;

    initSymptomForm();
}

function initSymptomForm() {
    let selectedSeverity = 0;
    let selectedPain = 0;
    let selectedSymptoms = new Set();

    // Severity selector
    const severityOptions = document.querySelectorAll('.severity-option');
    const severityLabel = document.getElementById('severity-label');

    severityOptions.forEach(option => {
        option.addEventListener('click', () => {
            severityOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            selectedSeverity = parseInt(option.dataset.level);
            severityLabel.textContent = Utils.getSeverityLabel(selectedSeverity);
            updateSubmitButton();
        });
    });

    // Pain scale
    const painItems = document.querySelectorAll('.pain-scale-item');
    painItems.forEach(item => {
        item.addEventListener('click', () => {
            painItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            selectedPain = parseInt(item.dataset.pain);
            updateSubmitButton();
        });
    });

    // Symptom chips
    const chips = document.querySelectorAll('.symptom-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const symptom = chip.dataset.symptom;
            if (selectedSymptoms.has(symptom)) {
                selectedSymptoms.delete(symptom);
                chip.classList.remove('selected');
            } else {
                selectedSymptoms.add(symptom);
                chip.classList.add('selected');
            }
            updateSubmitButton();
        });
    });

    // Update submit button state
    function updateSubmitButton() {
        const btn = document.getElementById('submit-btn');
        btn.disabled = !(selectedSeverity > 0 && selectedPain > 0 && selectedSymptoms.size > 0);
    }

    // Form submission
    const form = document.getElementById('symptom-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const description = document.getElementById('symptom-description').value.trim();

        // Calculate triage
        const triageResult = TriageAlgorithm.calculate(
            Array.from(selectedSymptoms),
            selectedPain,
            selectedSeverity
        );

        Utils.showLoading();

        // Save symptom log
        const logResult = await SymptomLogService.create({
            symptoms: Array.from(selectedSymptoms),
            severityLevel: selectedSeverity,
            painScale: selectedPain,
            description: description,
            triageResult: triageResult
        });

        if (logResult.success) {
            // If auto-booking, create appointment
            if (triageResult.autoBooking) {
                const queueNumber = await AppointmentService.getNextQueueNumber();
                await AppointmentService.create({
                    symptomLogId: logResult.id,
                    type: 'auto',
                    severity: triageResult.category,
                    queueNumber: queueNumber,
                    estimatedTime: calculateEstimatedTime(queueNumber),
                    date: firebase.firestore.Timestamp.now()
                });
            }

            Utils.hideLoading();
            Utils.showToast('Symptoms submitted successfully!', 'success');

            // Navigate to triage result
            Router.navigate('/student/triage-result', {
                logId: logResult.id,
                triageResult: triageResult,
                severity: selectedSeverity,
                painScale: selectedPain,
                symptoms: Array.from(selectedSymptoms)
            });
        } else {
            Utils.hideLoading();
            Utils.showToast('Failed to submit. Please try again.', 'error');
        }
    });
}

function calculateEstimatedTime(queueNumber) {
    const now = new Date();
    const minutesPerPatient = 10;
    now.setMinutes(now.getMinutes() + (queueNumber * minutesPerPatient));
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Shared bottom navigation component
function getStudentBottomNav(activePage) {
    return `
        <nav class="bottom-nav">
            <a class="bottom-nav-item ${activePage === 'home' ? 'active' : ''}" data-route="/student/home">
                <span class="material-icons-round">home</span>
                <span>Home</span>
            </a>
            <a class="bottom-nav-item ${activePage === 'history' ? 'active' : ''}" data-route="/student/history">
                <span class="material-icons-round">history</span>
                <span>History</span>
            </a>
            <button class="sos-btn" id="sos-trigger" title="SCT 911 Emergency">
                <span class="material-icons-round">sos</span>
            </button>
            <a class="bottom-nav-item ${activePage === 'recovery' ? 'active' : ''}" data-route="/student/recovery">
                <span class="material-icons-round">healing</span>
                <span>Recovery</span>
            </a>
            <a class="bottom-nav-item ${activePage === 'profile' ? 'active' : ''}" data-route="/student/profile">
                <span class="material-icons-round">person</span>
                <span>Profile</span>
            </a>
        </nav>
    `;
}

// Make getStudentBottomNav available globally for other student pages
window.getStudentBottomNav = getStudentBottomNav;

// Initialize SOS button after page render
document.addEventListener('click', (e) => {
    if (e.target.closest('#sos-trigger')) {
        e.preventDefault();
        showSOSConfirmation();
    }
});

async function showSOSConfirmation() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal" style="text-align: center;">
            <div style="font-size: 64px; margin-bottom: 16px;">🚨</div>
            <h2 class="modal-title" style="color: var(--color-emergency); margin-bottom: 8px;">SCT 911</h2>
            <p style="color: var(--color-text-secondary); margin-bottom: 24px;">
                This will send an emergency alert to the clinic. Are you sure?
            </p>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn--secondary btn--full" id="sos-cancel">Cancel</button>
                <button class="btn btn--danger btn--full" id="sos-confirm">
                    <span class="material-icons-round">warning</span>
                    SEND ALERT
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(backdrop);

    document.getElementById('sos-cancel').addEventListener('click', () => backdrop.remove());
    document.getElementById('sos-confirm').addEventListener('click', async () => {
        backdrop.remove();
        Utils.showLoading();
        const result = await EmergencyService.triggerAlert();
        Utils.hideLoading();

        if (result.success) {
            Utils.showToast('Emergency alert sent! Help is on the way.', 'success');
        } else {
            Utils.showToast('Failed to send alert. Please call the clinic directly.', 'error');
        }
    });
}
