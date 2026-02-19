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
    // Fetch student profile to get pre-registered building + room
    let locationData = {};
    try {
        const result = await AuthService.getUserData(firebase.auth().currentUser?.uid);
        const profile = result.data?.profile || {};
        locationData = {
            building: profile.building || '',
            room: profile.room || '',
            section: profile.section || ''
        };
    } catch (_) {}

    const locationBlock = (locationData.building || locationData.room || locationData.section)
        ? `<div style="
                background: #fff3f3;
                border: 2px solid var(--color-emergency);
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 20px;
                text-align: left;
            ">
                ${locationData.building ? `<div style="font-size:0.82rem; color:#666; margin-bottom:2px;">📍 ${locationData.building}</div>` : ''}
                ${locationData.room ? `<div style="font-size:1.05rem; font-weight:700; color:#cc0000; margin-bottom:2px;">${locationData.room}</div>` : ''}
                ${locationData.section ? `<div style="font-size:0.85rem; color:#333;">Section: ${locationData.section}</div>` : ''}
           </div>`
        : `<div style="color:#999; font-size:0.85rem; margin-bottom:16px;">(Location not set — update your profile)</div>`;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal" style="text-align: center; max-width: 360px; width: 90%;">
            <div style="font-size: 64px; margin-bottom: 8px;">🚨</div>
            <h2 style="color: var(--color-emergency); margin-bottom: 8px; font-size: 1.5rem;">SCT 911 EMERGENCY</h2>
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: 12px;">
                Clinic staff will be dispatched to your location:
            </p>
            ${locationBlock}
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
        const result = await EmergencyService.triggerAlert(locationData);
        Utils.hideLoading();

        if (result.success) {
            Utils.showToast('🚨 Emergency alert sent! Help is on the way.', 'success');
        } else {
            Utils.showToast('Failed to send alert. Please call the clinic directly.', 'error');
        }
    });
}

async function _UNUSED_showSOSConfirmation_withPicker() {
    const ROOMS = {
        'St. Catherine Building': [
            'Room 201 - Grade 1 Joy', 'Room 202 - Grade 1 Peace', 'Room 203 - Grade 1 Piety',
            'Room 204 - Grade 2 Humility', 'Room 207 - Grade 2 Kindness', 'Room 208 - Grade 2 Obedience',
            'Room 209 - Grade 3 Gratitude', 'Room 307 - Grade 3 Honesty', 'Room 308 - Grade 3 Wisdom',
            'Room 303 - Grade 4 Fortitude', 'Room 305 - Grade 4 Justice', 'Room 304 - Grade 4 Prudence',
            'Room 401 - Grade 5 Modesty', 'Room 302 - Grade 5 Patience', 'Room 301 - Grade 5 Providence',
            'Room 404 - Grade 6 Courage', 'Room 402 - Grade 6 Determination', 'Room 403 - Grade 6 Perseverance',
            'Room 501 - Grade 11 St. Albert the Great (STEM)', 'Room 502 - Grade 11 St. Catherine of Siena (STEM)',
            'Room 503 - Grade 11 St. Dominic de Guzman (STEM)', 'Room 504 - Grade 11 St. Martin de Porres (STEM)',
            'Room 505 - Grade 11 St. Thomas Aquinas (STEM)', 'Room 506 - Grade 11 St. Francis de Capillas (STEM)'
        ],
        'St. Dominic Building': [
            'Room 202 - Grade 10 Integrity',
            'Room 404 - Grade 7 Compassionate Christian', 'Room 405 - Grade 7 Marian Devotee',
            'Room 403 - Grade 7 Research Motivated', 'Room 406 - Grade 7 Service Oriented',
            'Room 407 - Grade 7 Truth Seeker', 'Room 402 - Grade 7 Proud Global Pinoy',
            'Room 401 - Grade 8 Family Oriented', 'Room 408 - Grade 8 Music Enthusiast',
            'Room 409 - Grade 8 Pro-Life Advocate', 'Room 410 - Grade 8 Stewards of God\'s Creation',
            'Room 415 - Grade 8 Technology Competent',
            'Room 412 - Grade 9 Self Smart', 'Room 512 - Grade 9 Body Smart',
            'Room 414 - Grade 9 Creative Learner', 'Room 413 - Grade 9 Gospel Preacher',
            'Room 511 - Grade 9 Body Smart', 'Room 411 - Grade 9 People Smart',
            'Room 313 - Grade 10 Eucharist Centered', 'Room 314 - Grade 10 Good Samaritan',
            'Room 312 - Grade 10 Lifelong Learner', 'Room 311 - Grade 10 Mission Oriented',
            'Room 501 - Grade 11 St. Lorenzo Ruiz (ABM)', 'Room 503 - Grade 11 St. Rose of Lima (ABM)',
            'Room 504 - Grade 11 St. Margaret of Hungary (HUMMS)', 'Room 505 - Grade 11 St. John Macias (HUMMS)',
            'Room 507 - Grade 11 St. Pius V (Culinary) (TVL)', 'Room 506 - Grade 11 St. Louis de Montfort (Travel Services) (TVL)'
        ],
        'St. Thomas Building': [
            'Room 403 - Grade 12 STEM 1', 'Room 501 - Grade 12 STEM 2', 'Room 502 - Grade 12 STEM 3',
            'Room 503 - Grade 12 STEM 4', 'Room 505 - Grade 12 STEM 5',
            'Room 504 - Grade 12 ABM 1', 'Room 301 - Grade 12 HUMMS 1', 'Room 506 - Grade 12 HUMMS 2',
            'Room 401 - Grade 12 Travel Services 1', 'Room 402 - Grade 12 Culinary 1'
        ]
    };

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal" style="text-align: center; max-width: 400px; width: 90%;">
            <div style="font-size: 56px; margin-bottom: 8px;">🚨</div>
            <h2 style="color: var(--color-emergency); margin-bottom: 4px; font-size: 1.5rem;">SCT 911 EMERGENCY</h2>
            <p style="color: var(--color-text-secondary); margin-bottom: 20px; font-size: var(--font-size-sm);">
                Clinic staff will be dispatched to your location.
            </p>

            <!-- Step 1: Building -->
            <div id="sos-step-1">
                <p style="font-weight: 600; margin-bottom: 12px;">Which building are you in?</p>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${Object.keys(ROOMS).map(b => `
                        <button class="btn btn--secondary btn--full sos-building-btn" data-building="${b}">
                            <span class="material-icons-round" style="vertical-align: middle; margin-right: 6px;">apartment</span>
                            ${b}
                        </button>
                    `).join('')}
                </div>
                <button class="btn btn--ghost btn--full" id="sos-cancel-1">Cancel</button>
            </div>

            <!-- Step 2: Room (hidden) -->
            <div id="sos-step-2" style="display:none;">
                <p style="font-weight: 600; margin-bottom: 4px;" id="sos-building-label"></p>
                <p style="font-size:var(--font-size-sm); color:var(--color-text-hint); margin-bottom: 12px;">Select your specific room:</p>
                <select id="sos-room-select" class="input-field" style="margin-bottom: 16px;">
                    <option value="">-- Select Room --</option>
                </select>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn--secondary btn--full" id="sos-back">Back</button>
                    <button class="btn btn--danger btn--full" id="sos-confirm" disabled>
                        <span class="material-icons-round">warning</span>
                        SEND ALERT
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(backdrop);

    let selectedBuilding = '';
    let selectedRoom = '';

    // Cancel buttons
    document.getElementById('sos-cancel-1').addEventListener('click', () => backdrop.remove());
    document.getElementById('sos-back').addEventListener('click', () => {
        document.getElementById('sos-step-2').style.display = 'none';
        document.getElementById('sos-step-1').style.display = 'block';
    });

    // Building selection
    backdrop.querySelectorAll('.sos-building-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedBuilding = btn.dataset.building;
            const rooms = ROOMS[selectedBuilding];

            document.getElementById('sos-building-label').textContent = selectedBuilding;
            const select = document.getElementById('sos-room-select');
            select.innerHTML = '<option value="">-- Select Room --</option>' +
                rooms.map(r => `<option value="${r}">${r}</option>`).join('');

            document.getElementById('sos-step-1').style.display = 'none';
            document.getElementById('sos-step-2').style.display = 'block';
        });
    });

    // Enable confirm only when room is selected
    document.getElementById('sos-room-select').addEventListener('change', (e) => {
        selectedRoom = e.target.value;
        document.getElementById('sos-confirm').disabled = !selectedRoom;
    });

    // Send alert
    document.getElementById('sos-confirm').addEventListener('click', async () => {
        if (!selectedRoom) return;
        backdrop.remove();
        Utils.showLoading();
        const result = await EmergencyService.triggerAlert({
            building: selectedBuilding,
            room: selectedRoom
        });
        Utils.hideLoading();

        if (result.success) {
            Utils.showToast('🚨 Emergency alert sent! Help is on the way.', 'success');
        } else {
            Utils.showToast('Failed to send alert. Please call the clinic directly.', 'error');
        }
    });
}
