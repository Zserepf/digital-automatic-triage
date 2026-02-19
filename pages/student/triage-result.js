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
            <div class="queue-status-card mt-lg">
                <div class="status-label" style="color: ${config.color};">STATUS: WAITING</div>
                <div class="purpose">Follow-up Checkup</div>
                <div class="queue-number-label">QUEUE NUMBER</div>
                <div class="queue-number">--</div>
                <div class="estimated-time">
                    Estimated time will be assigned.<br>
                    Drop by the Clinic.
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
            } else {
                Utils.showToast('Booking failed. Try again.', 'error');
            }
        });
    }
}
