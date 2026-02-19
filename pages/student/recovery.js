/* ========================================
   STUDENT RECOVERY PAGE
   Digital Automatic Triage
   ======================================== */

export async function renderStudentRecovery(container) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/student.css">
        <div class="page-student">
            <div class="student-header">
                <div class="student-header-greeting">
                    <h1>Recovery</h1>
                    <p>Post-consultation checklist & follow-ups</p>
                </div>
            </div>

            <div id="recovery-content">
                <div style="text-align: center; padding: 48px 0;">
                    <div class="spinner" style="margin: 0 auto;"></div>
                </div>
            </div>
        </div>

        ${window.getStudentBottomNav ? window.getStudentBottomNav('recovery') : ''}
    `;

    const recoveryContent = document.getElementById('recovery-content');

    try {
        const consultationsResult = await ConsultationService.getMine();
        const followUpsResult = await FollowUpService.getMyFollowUps();

        const consultations = consultationsResult.success ? consultationsResult.data : [];
        const followUps = followUpsResult.success ? followUpsResult.data : [];

        if (consultations.length === 0) {
            recoveryContent.innerHTML = `
                <div style="text-align: center; padding: 48px 0; color: var(--color-text-hint);">
                    <span class="material-icons-round" style="font-size: 64px; margin-bottom: 16px;">healing</span>
                    <p>No consultations yet</p>
                    <p style="font-size: var(--font-size-sm);">Your post-consultation info will appear here</p>
                </div>
            `;
            return;
        }

        // Show latest active consultation
        const activeConsultation = consultations.find(c => c.status === 'active') || consultations[0];
        const prescriptions = activeConsultation.prescriptions || [];
        const isCompleted = activeConsultation.status === 'completed';
        const existingSurvey = activeConsultation.recoverySurvey || null;
        const relatedFollowUp = followUps.find(f => f.consultationId === activeConsultation.id);

        recoveryContent.innerHTML = `
            <!-- Consultation Summary Card -->
            <div class="card card--elevated mb-lg" style="border-left: 4px solid var(--color-primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <h3 style="font-size: var(--font-size-md); display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons-round" style="color: var(--color-primary);">medical_information</span>
                        Diagnosis
                    </h3>
                    ${Utils.getStatusBadge(activeConsultation.status)}
                </div>
                <p style="font-size: var(--font-size-base); font-weight: 500; margin-bottom: 4px;">
                    ${activeConsultation.diagnosis || 'No diagnosis provided'}
                </p>
                <p style="font-size: var(--font-size-sm); color: var(--color-text-hint);">
                    ${Utils.formatDate(activeConsultation.date)}
                </p>
            </div>

            <!-- All Prescriptions in One View -->
            <div class="card card--elevated mb-lg" style="background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%); border: 1.5px solid #d0e4ff;">
                <h3 style="font-size: var(--font-size-md); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <span class="material-icons-round" style="color: var(--color-primary);">medication</span>
                    Prescriptions
                    ${prescriptions.length > 0 ? `<span style="background: var(--color-primary); color: white; font-size: var(--font-size-xs); padding: 2px 8px; border-radius: var(--radius-full); font-weight: 700;">${prescriptions.length}</span>` : ''}
                </h3>
                ${prescriptions.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${prescriptions.map((p, idx) => `
                            <div style="display: flex; gap: 12px; align-items: flex-start; padding: 12px; background: white; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                                <div style="min-width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: var(--font-size-sm); flex-shrink: 0;">
                                    ${idx + 1}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; font-size: var(--font-size-base); color: var(--color-text-primary);">
                                        ${p.medicine}
                                    </div>
                                    ${p.dosage ? `<div style="font-size: var(--font-size-sm); color: var(--color-primary); font-weight: 600; margin-top: 2px;">
                                        <span class="material-icons-round" style="font-size: 13px; vertical-align: middle;">schedule</span>
                                        ${p.dosage} · ${p.frequencyLabel || 'Every ' + (p.frequencyHours || 8) + ' hours'}
                                    </div>` : `<div style="font-size: var(--font-size-sm); color: var(--color-primary); font-weight: 600; margin-top: 2px;">
                                        <span class="material-icons-round" style="font-size: 13px; vertical-align: middle;">schedule</span>
                                        ${p.frequencyLabel || 'Every ' + (p.frequencyHours || 8) + ' hours'}
                                    </div>`}
                                    ${p.instructions ? `<div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 4px; font-style: italic;">
                                        ${p.instructions}
                                    </div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 16px; color: var(--color-text-hint);">
                        <span class="material-icons-round" style="font-size: 32px; margin-bottom: 4px;">inventory_2</span>
                        <p>No prescriptions given</p>
                    </div>
                `}
            </div>

            <!-- Medication Reminder Timer -->
            ${prescriptions.length > 0 ? `
            <div class="med-timer-card mb-lg" id="med-timer-section">
                <h3 style="font-size: var(--font-size-md); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span class="material-icons-round" style="color: var(--color-primary);">alarm</span>
                    Medication Reminders
                </h3>
                <div id="med-timer-list">
                    ${prescriptions.map((p, idx) => `
                        <div class="med-timer-item" data-med-idx="${idx}">
                            <div style="flex: 1; min-width: 0;">
                                <div class="med-timer-name">${p.medicine}</div>
                                <div class="med-timer-dosage">${p.dosage || 'As prescribed'} · ${p.frequencyLabel || 'Every ' + (p.frequencyHours || 8) + 'h'}</div>
                            </div>
                            <div id="med-timer-status-${idx}" style="display: flex; align-items: center; gap: 8px;">
                                <span class="med-timer-countdown" id="med-countdown-${idx}">--</span>
                                <button class="med-take-btn" id="med-take-btn-${idx}" data-idx="${idx}">Take</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- PDF Export Button -->
            <div style="margin-bottom: var(--space-lg);">
                <button class="btn btn--outline btn--full" id="export-pdf-btn">
                    <span class="material-icons-round">picture_as_pdf</span>
                    Export Consultation Summary
                </button>
            </div>

            <!-- Recommendations & Notes -->
            ${activeConsultation.recommendations || activeConsultation.notes ? `
            <div class="card card--elevated mb-lg" style="border-left: 4px solid var(--color-normal);">
                <h3 style="font-size: var(--font-size-md); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <span class="material-icons-round" style="color: var(--color-normal);">description</span>
                    Recommendations
                </h3>
                <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.6;">
                    ${activeConsultation.recommendations || activeConsultation.notes}
                </p>
            </div>
            ` : ''}

            <!-- Follow-up Schedule -->
            ${activeConsultation.requiresFollowUp ? `
            <div class="card card--bordered mb-lg" style="border-color: var(--color-moderate); background: var(--color-moderate-light);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="material-icons-round" style="color: #F57F17;">event</span>
                    <div>
                        <div style="font-weight: 600; font-size: var(--font-size-sm);">Follow-up Scheduled</div>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                            ${Utils.formatDate(activeConsultation.followUpDate)}
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Clinic Instructions (from follow-up) -->
            ${relatedFollowUp?.clinicInstructions ? `
            <div class="card card--elevated mb-lg" style="border-left: 4px solid var(--color-moderate); background: #FFFDF5;">
                <h3 style="font-size: var(--font-size-md); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <span class="material-icons-round" style="color: var(--color-moderate);">message</span>
                    Clinic Instructions
                </h3>
                <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.6;">
                    ${relatedFollowUp.clinicInstructions}
                </p>
                ${relatedFollowUp.clinicStaffName ? `<p style="font-size: var(--font-size-xs); color: var(--color-text-hint); margin-top: 8px;">— ${relatedFollowUp.clinicStaffName}</p>` : ''}
            </div>
            ` : ''}

            <!-- Recovery Survey Section -->
            ${!isCompleted ? `
            <div class="section-header" style="margin-top: 8px;">How are you feeling?</div>
            <div class="card card--elevated" id="recovery-survey-card">
                <p style="margin-bottom: 16px; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    Help us understand your recovery progress. This feedback will be sent to the clinic.
                </p>
                <div class="severity-selector" id="recovery-survey-scale">
                    <div class="severity-option" data-level="5">
                        <span class="material-icons-round">sentiment_very_satisfied</span>
                        <span>Recovered</span>
                    </div>
                    <div class="severity-option" data-level="4">
                        <span class="material-icons-round">sentiment_satisfied</span>
                        <span>Better</span>
                    </div>
                    <div class="severity-option" data-level="3">
                        <span class="material-icons-round">sentiment_neutral</span>
                        <span>Same</span>
                    </div>
                    <div class="severity-option" data-level="2">
                        <span class="material-icons-round">sentiment_dissatisfied</span>
                        <span>Poor</span>
                    </div>
                    <div class="severity-option" data-level="1">
                        <span class="material-icons-round">sentiment_very_dissatisfied</span>
                        <span>Worse</span>
                    </div>
                </div>

                <div class="input-group" style="margin-top: 16px;">
                    <label for="recovery-notes" style="font-size:var(--font-size-sm); color:var(--color-text-secondary);">Additional notes (optional)</label>
                    <textarea id="recovery-notes" class="input-field" rows="2" placeholder="Describe any remaining symptoms or concerns..."></textarea>
                </div>

                <!-- Dynamic action area — changes based on feeling selection -->
                <div id="recovery-action-area" style="margin-top: 16px;">
                    <p style="text-align: center; font-size: var(--font-size-sm); color: var(--color-text-hint); padding: 12px;">
                        Select how you feel to see your options
                    </p>
                </div>
            </div>
            ` : `
            <!-- Already completed -->
            <div class="card card--elevated" style="text-align: center; border: 2px solid var(--color-normal); background: var(--color-normal-light);">
                <span class="material-icons-round" style="font-size: 48px; color: var(--color-normal); margin-bottom: 8px;">verified</span>
                <h3 style="color: var(--color-normal); margin-bottom: 4px;">Recovery Complete</h3>
                <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    ${existingSurvey ? `You reported feeling: <strong>${existingSurvey.feelingLabel || 'N/A'}</strong>` : 'This consultation has been completed.'}
                </p>
            </div>
            `}
        `;

        // Only set up interactivity if not completed
        if (!isCompleted) {
            let surveyRating = 0;
            const surveyOptions = document.querySelectorAll('#recovery-survey-scale .severity-option');
            const actionArea = document.getElementById('recovery-action-area');

            surveyOptions.forEach(option => {
                option.addEventListener('click', () => {
                    surveyOptions.forEach(o => o.classList.remove('active'));
                    option.classList.add('active');
                    surveyRating = parseInt(option.dataset.level);
                    updateActionArea(surveyRating);
                });
            });

            const FEELING_LABELS = { 1: 'Worse', 2: 'Poor', 3: 'Same', 4: 'Better', 5: 'Recovered' };

            function updateActionArea(level) {
                if (!actionArea) return;

                if (level === 1) {
                    // Worse → Hospital suggestion + follow-up
                    actionArea.innerHTML = `
                        <div style="background: var(--color-emergency-light); border: 2px solid var(--color-emergency); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span class="material-icons-round" style="color: var(--color-emergency); font-size: 28px;">local_hospital</span>
                                <strong style="color: var(--color-emergency); font-size: var(--font-size-md);">We recommend visiting a hospital</strong>
                            </div>
                            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: 12px;">
                                Since your condition has worsened, we strongly suggest visiting a nearby hospital or medical facility for a more thorough examination. Your health is a priority.
                            </p>
                            <div style="background: white; border-radius: var(--radius-md); padding: 12px; font-size: var(--font-size-sm);">
                                <div style="font-weight: 700; margin-bottom: 4px; color: var(--color-text-primary);">
                                    <span class="material-icons-round" style="font-size: 14px; vertical-align: middle;">info</span>
                                    What you can do:
                                </div>
                                <ul style="margin: 0; padding-left: 18px; color: var(--color-text-secondary); line-height: 1.8;">
                                    <li>Visit the nearest hospital emergency room</li>
                                    <li>Inform your parents/guardians immediately</li>
                                    <li>You may also request a follow-up below</li>
                                </ul>
                            </div>
                        </div>
                        <button class="btn btn--danger btn--full btn--lg" id="request-followup-btn" style="margin-bottom: 8px;">
                            <span class="material-icons-round">event</span>
                            Request Clinic Follow-up
                        </button>
                        <p style="text-align: center; font-size: var(--font-size-xs); color: var(--color-text-hint);">
                            The clinic will be notified about your worsened condition
                        </p>
                    `;
                } else if (level >= 2 && level <= 4) {
                    // Poor / Same / Better → Reschedule or Follow-up
                    const feelingText = level === 2 ? "You're not feeling well yet" : level === 3 ? "Your condition hasn't changed" : "Good to hear you're improving!";
                    actionArea.innerHTML = `
                        <div style="background: ${level === 4 ? 'var(--color-normal-light)' : 'var(--color-moderate-light)'}; border-radius: var(--radius-lg); padding: 14px; margin-bottom: 12px;">
                            <p style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-primary); margin-bottom: 4px;">
                                ${feelingText}
                            </p>
                            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                                ${level <= 3 ? 'You can reschedule an appointment for another checkup at the clinic.' : 'Keep following your prescriptions. You can request a follow-up if needed.'}
                            </p>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn btn--secondary btn--full" id="request-followup-btn">
                                <span class="material-icons-round">event</span>
                                ${level <= 3 ? 'Reschedule Appointment' : 'Request Follow-up'}
                            </button>
                            <button class="btn btn--success btn--full" id="mark-recovered-btn">
                                <span class="material-icons-round">done_all</span>
                                I'm Recovered
                            </button>
                        </div>
                    `;
                } else if (level === 5) {
                    // Recovered → Mark complete
                    actionArea.innerHTML = `
                        <div style="background: var(--color-normal-light); border-radius: var(--radius-lg); padding: 14px; margin-bottom: 12px; text-align: center;">
                            <span class="material-icons-round" style="font-size: 36px; color: var(--color-normal);">celebration</span>
                            <p style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-normal); margin-top: 4px;">
                                That's great news! You're fully recovered!
                            </p>
                        </div>
                        <button class="btn btn--success btn--full btn--lg" id="mark-recovered-btn">
                            <span class="material-icons-round">done_all</span>
                            Complete My Recovery
                        </button>
                    `;
                }

                // Attach event listeners to dynamically added buttons
                document.getElementById('request-followup-btn')?.addEventListener('click', async () => {
                    const notes = document.getElementById('recovery-notes')?.value.trim() || '';
                    Utils.showLoading();

                    await db.collection('consultations').doc(activeConsultation.id).update({
                        recoverySurvey: {
                            feelingScale: surveyRating,
                            feelingLabel: FEELING_LABELS[surveyRating] || '',
                            notes,
                            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            requestedFollowUp: true
                        }
                    });

                    await FollowUpService.create({
                        consultationId: activeConsultation.id,
                        userId: auth.currentUser.uid,
                        scheduledDate: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 86400000)),
                        studentNote: notes,
                        feelingScale: surveyRating
                    });

                    // Send notification to clinic
                    if (typeof NotificationService !== 'undefined') {
                        const userData = await AuthService.getUserData(auth.currentUser.uid);
                        const profile = userData.data?.profile || {};
                        const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'A student';
                        await NotificationService.create({
                            type: 'follow_up_request',
                            title: surveyRating === 1 ? 'Worsened Condition Alert' : 'Follow-up Requested',
                            message: `${name} has requested a follow-up. Feeling: ${FEELING_LABELS[surveyRating]}${notes ? `. Note: "${notes}"` : ''}`,
                            targetRole: 'clinic_staff',
                            relatedId: activeConsultation.id,
                            severity: surveyRating === 1 ? 'urgent' : 'normal'
                        });
                    }

                    Utils.hideLoading();
                    Utils.showToast(surveyRating === 1
                        ? 'The clinic has been alerted. Please consider visiting a hospital.'
                        : 'Follow-up requested! The clinic will confirm your schedule.',
                        'success'
                    );
                    renderStudentRecovery(container);
                });

                document.getElementById('mark-recovered-btn')?.addEventListener('click', async () => {
                    const notes = document.getElementById('recovery-notes')?.value.trim() || '';
                    Utils.showLoading();

                    await db.collection('consultations').doc(activeConsultation.id).update({
                        status: 'completed',
                        recoverySurvey: {
                            feelingScale: surveyRating,
                            feelingLabel: FEELING_LABELS[surveyRating] || '',
                            notes,
                            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            requestedFollowUp: false
                        }
                    });

                    Utils.hideLoading();
                    Utils.showToast('Great! Your recovery has been recorded. Stay healthy!', 'success');
                    renderStudentRecovery(container);
                });
            }
        }

        // ---- Medication Timer Logic ----
        if (prescriptions.length > 0) {
            const TIMER_KEY = `medTimers_${activeConsultation.id}`;
            let timers = {};
            try { timers = JSON.parse(localStorage.getItem(TIMER_KEY) || '{}'); } catch (e) {}

            function renderTimerState(idx) {
                const countdown = document.getElementById(`med-countdown-${idx}`);
                const btn = document.getElementById(`med-take-btn-${idx}`);
                if (!countdown || !btn) return;

                const timerData = timers[idx];
                if (!timerData || !timerData.lastTaken) {
                    countdown.textContent = 'Not taken yet';
                    countdown.classList.remove('overdue');
                    btn.textContent = 'Take Now';
                    btn.disabled = false;
                    return;
                }

                const lastTaken = new Date(timerData.lastTaken);
                const intervalHours = timerData.intervalHours || 8;
                const nextDue = new Date(lastTaken.getTime() + intervalHours * 3600000);
                const now = new Date();
                const diff = nextDue - now;

                if (diff <= 0) {
                    countdown.textContent = 'Overdue!';
                    countdown.classList.add('overdue');
                    btn.textContent = 'Take Now';
                    btn.disabled = false;
                } else {
                    const hrs = Math.floor(diff / 3600000);
                    const mins = Math.floor((diff % 3600000) / 60000);
                    countdown.textContent = `Next in ${hrs}h ${mins}m`;
                    countdown.classList.remove('overdue');
                    btn.textContent = 'Taken';
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            }

            // Get interval from explicit frequency field, fallback to parsing dosage text
            function parseInterval(p) {
                if (p.frequencyHours) return p.frequencyHours;
                const match = (p.dosage || '').match(/every\s*(\d+)\s*h/i);
                if (match) return parseInt(match[1]);
                if (/3\s*times/i.test(p.dosage)) return 8;
                if (/twice|2\s*times/i.test(p.dosage)) return 12;
                if (/once/i.test(p.dosage)) return 24;
                return 8; // default every 8 hours
            }

            prescriptions.forEach((p, idx) => {
                if (!timers[idx]) {
                    timers[idx] = { intervalHours: parseInterval(p), lastTaken: null };
                }
                renderTimerState(idx);

                const btn = document.getElementById(`med-take-btn-${idx}`);
                if (btn) {
                    btn.addEventListener('click', () => {
                        timers[idx].lastTaken = new Date().toISOString();
                        localStorage.setItem(TIMER_KEY, JSON.stringify(timers));
                        renderTimerState(idx);
                        Utils.showToast(`${p.medicine} marked as taken!`, 'success');
                    });
                }
            });

            // Refresh countdowns every minute
            const timerInterval = setInterval(() => {
                if (!document.getElementById('med-timer-section')) {
                    clearInterval(timerInterval);
                    return;
                }
                prescriptions.forEach((_, idx) => renderTimerState(idx));
            }, 60000);
        }

        // ---- PDF Export ----
        const exportBtn = document.getElementById('export-pdf-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const rxRows = prescriptions.map((p, i) =>
                    `<tr><td>${i + 1}</td><td><strong>${p.medicine}</strong></td><td>${p.dosage || 'N/A'}</td><td>${p.instructions || '-'}</td></tr>`
                ).join('');

                const printHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Consultation Summary - DAT</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 700px; margin: 0 auto; }
                            h1 { color: #2563eb; font-size: 22px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
                            h2 { font-size: 16px; margin-top: 24px; color: #444; }
                            .meta { color: #888; font-size: 13px; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
                            th { background: #f5f5f5; font-weight: 600; }
                            .notes { background: #f9f9f9; padding: 12px; border-radius: 6px; font-size: 13px; margin-top: 8px; }
                            .footer { margin-top: 40px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
                            @media print { body { padding: 20px; } }
                        </style>
                    </head>
                    <body>
                        <h1>Digital Automatic Triage — Consultation Summary</h1>
                        <div class="meta">
                            Date: ${Utils.formatDate(activeConsultation.date)} &nbsp;|&nbsp;
                            Patient: ${Auth.getDisplayName()} &nbsp;|&nbsp;
                            Status: ${activeConsultation.status}
                        </div>

                        <h2>Diagnosis</h2>
                        <p>${activeConsultation.diagnosis || 'No diagnosis provided'}</p>

                        <h2>Prescriptions</h2>
                        ${prescriptions.length > 0 ? `
                            <table>
                                <thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Instructions</th></tr></thead>
                                <tbody>${rxRows}</tbody>
                            </table>
                        ` : '<p>No prescriptions given.</p>'}

                        ${activeConsultation.recommendations ? `
                            <h2>Recommendations</h2>
                            <div class="notes">${activeConsultation.recommendations}</div>
                        ` : ''}

                        ${activeConsultation.requiresFollowUp ? `
                            <h2>Follow-Up</h2>
                            <p>Scheduled: ${Utils.formatDate(activeConsultation.followUpDate)}</p>
                        ` : ''}

                        <div class="footer">
                            Generated by DAT (Digital Automatic Triage) &bull; ${new Date().toLocaleDateString()}
                        </div>
                    </body>
                    </html>
                `;

                const printWin = window.open('', '_blank');
                printWin.document.write(printHTML);
                printWin.document.close();
                printWin.focus();
                setTimeout(() => printWin.print(), 500);
            });
        }

    } catch (error) {
        recoveryContent.innerHTML = `
            <div style="text-align: center; padding: 48px 0; color: var(--color-emergency);">
                <p>Failed to load recovery data.</p>
            </div>
        `;
    }
}
