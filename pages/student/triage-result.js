/* ========================================
   STUDENT TRIAGE RESULT PAGE
   Digital Automatic Triage
   ======================================== */

export function renderTriageResult(container, params = {}) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    const triageResult = params.triageResult || { category: 'minor', recommendations: [], autoBooking: false };
    const severity = params.severity || 1;
    const painScale = params.painScale || 1;
    const symptoms = params.symptoms || [];

    const categoryConfig = {
        minor: { icon: 'check_circle', color: 'var(--color-normal)', bg: 'var(--color-normal-light)', label: 'Minor' },
        moderate: { icon: 'info', color: 'var(--color-moderate)', bg: 'var(--color-moderate-light)', label: 'Moderate' },
        severe: { icon: 'warning', color: 'var(--color-severe)', bg: 'var(--color-severe-light)', label: 'Severe' },
        emergency: { icon: 'emergency', color: 'var(--color-emergency)', bg: 'var(--color-emergency-light)', label: 'Emergency' }
    };

    const config = categoryConfig[triageResult.category] || categoryConfig.minor;

    container.innerHTML = `
        <link rel="stylesheet" href="/css/student.css">
        <div class="page-student">
            <!-- Back Button -->
            <button class="btn btn--ghost" data-route="/student/home" style="margin-bottom: 16px;">
                <span class="material-icons-round">arrow_back</span> Back
            </button>

            <!-- Status Badge -->
            <div style="text-align: center; margin-bottom: 24px;">
                ${triageResult.autoBooking
                    ? Utils.getStatusBadge('waiting')
                    : Utils.getStatusBadge('completed')}
            </div>

            <!-- Triage Result -->
            <div class="card card--elevated triage-result">
                <div class="triage-result-icon" style="background: ${config.color};">
                    <span class="material-icons-round">${config.icon}</span>
                </div>
                <h2 style="color: ${config.color};">${config.label}</h2>
                <p style="color: var(--color-text-secondary);">Triage Result</p>
            </div>

            <!-- Queue Card (if auto-booked) -->
            ${triageResult.autoBooking ? `
            <div class="queue-status-card mt-lg" id="queue-status-card">
                <div class="status-label" style="color: ${config.color};">STATUS: WAITING</div>
                <div class="purpose">Follow-up Checkup</div>
                <div class="queue-number-label">QUEUE NUMBER</div>
                <div class="queue-number" id="queue-number-display">--</div>
                <div id="queue-position-display" style="margin-top: 12px; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <div class="spinner" style="width: 20px; height: 20px; margin: 0 auto; border-width: 2px;"></div>
                </div>
                <div class="estimated-time" id="estimated-time-display">
                    Calculating your position...
                </div>
                <div class="student-id" style="margin-top: 12px;">
                    ${Auth.userData?.profile?.studentId || ''}
                    <br>${Auth.getDisplayName()}
                </div>
            </div>
            ` : ''}

            <!-- Recommendations -->
            <div class="card mt-lg">
                <div class="recommendations-list">
                    <h3>Recommendations</h3>
                    ${(triageResult.recommendations || []).map(rec => `
                        <div class="recommendation-item">
                            <span class="material-icons-round">check_circle</span>
                            <span>${rec}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
                ${!triageResult.autoBooking ? `
                    <button class="btn btn--primary btn--full" id="book-appointment-btn">
                        <span class="material-icons-round">calendar_today</span>
                        Book Appointment (Optional)
                    </button>
                ` : ''}
                <button class="btn btn--secondary btn--full" data-route="/student/home">
                    <span class="material-icons-round">home</span>
                    Back to Home
                </button>
            </div>
        </div>

        ${window.getStudentBottomNav ? window.getStudentBottomNav('') : ''}
    `;

    // Book appointment handler
    const bookBtn = document.getElementById('book-appointment-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', async () => {
            Utils.showLoading();
            const queueNumber = await AppointmentService.getNextQueueNumber();
            const result = await AppointmentService.create({
                symptomLogId: params.logId || '',
                type: 'manual',
                severity: triageResult.category,
                queueNumber: queueNumber,
                estimatedTime: '',
                date: firebase.firestore.Timestamp.now()
            });
            Utils.hideLoading();

            if (result.success) {
                Utils.showToast(`Appointment booked! Queue #${queueNumber}`, 'success');
                bookBtn.disabled = true;
                bookBtn.textContent = `Booked — Queue #${queueNumber}`;
                // Start queue position tracking
                loadQueuePosition();
            } else {
                Utils.showToast('Booking failed. Try again.', 'error');
            }
        });
    }

    // Real-time queue position indicator
    if (triageResult.autoBooking) {
        loadQueuePosition();
    }
}

async function loadQueuePosition() {
    try {
        // Get my active appointment
        const myAppts = await AppointmentService.getMyAppointments();
        if (!myAppts.success) return;

        const activeAppt = myAppts.data.find(a => a.status === 'waiting' || a.status === 'in_progress');
        if (!activeAppt) return;

        const queueDisplay = document.getElementById('queue-number-display');
        const posDisplay = document.getElementById('queue-position-display');
        const timeDisplay = document.getElementById('estimated-time-display');
        const statusLabel = document.querySelector('.queue-status-card .status-label');

        if (queueDisplay) {
            queueDisplay.textContent = activeAppt.queueNumber || '--';
        }

        if (activeAppt.status === 'in_progress') {
            if (statusLabel) statusLabel.textContent = 'STATUS: IN PROGRESS';
            if (posDisplay) posDisplay.innerHTML = `
                <span class="material-icons-round" style="font-size: 20px; color: var(--color-primary); vertical-align: middle;">person</span>
                <strong style="color: var(--color-primary);">It's your turn!</strong>
            `;
            if (timeDisplay) timeDisplay.textContent = 'Please proceed to the clinic now.';
            return;
        }

        // Count how many waiting appointments are ahead
        const allWaiting = await AppointmentService.getWaitingAppointments();
        if (!allWaiting.success) return;

        const waitingAhead = allWaiting.data.filter(a =>
            a.status === 'waiting' && a.queueNumber < activeAppt.queueNumber
        );
        const position = waitingAhead.length + 1;
        const estimatedMinutes = waitingAhead.length * 10;

        if (posDisplay) {
            if (position === 1) {
                posDisplay.innerHTML = `
                    <span style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary);">You're next!</span>
                `;
            } else {
                posDisplay.innerHTML = `
                    <span style="font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-primary);">#${position}</span>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-hint);">in line</div>
                `;
            }
        }

        if (timeDisplay) {
            if (estimatedMinutes > 0) {
                timeDisplay.innerHTML = `Estimated wait: <strong>~${estimatedMinutes} min</strong>`;
            } else {
                timeDisplay.textContent = 'You should be seen very soon!';
            }
        }

        // Auto-refresh every 30 seconds
        setTimeout(() => {
            if (document.getElementById('queue-status-card')) {
                loadQueuePosition();
            }
        }, 30000);
    } catch (e) {}
}
