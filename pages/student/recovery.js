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

        recoveryContent.innerHTML = `
            <!-- Diagnosis Summary -->
            <div class="card card--elevated mb-lg">
                <h3 style="font-size: var(--font-size-md); margin-bottom: 12px;">
                    <span class="material-icons-round" style="vertical-align: middle; color: var(--color-primary);">medical_information</span>
                    Diagnosis
                </h3>
                <p style="font-size: var(--font-size-base); margin-bottom: 8px;">${activeConsultation.diagnosis || 'No diagnosis provided'}</p>
                <p style="font-size: var(--font-size-sm); color: var(--color-text-hint);">
                    ${Utils.formatDate(activeConsultation.date)}
                </p>
            </div>

            <!-- Post-Consultation Checklist -->
            <div class="section-header">Post-Consultation Checklist</div>
            <div class="recovery-checklist mb-lg">
                <div class="checklist-item ${(activeConsultation.prescriptions || []).length > 0 ? 'checked' : 'unchecked'}">
                    <span class="material-icons-round">${(activeConsultation.prescriptions || []).length > 0 ? 'check_circle' : 'radio_button_unchecked'}</span>
                    <div>
                        <strong>Prescriptions</strong>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                            ${(activeConsultation.prescriptions || []).length > 0
                                ? (activeConsultation.prescriptions || []).map(p =>
                                    `<div style="padding: 2px 0;"><strong>${p.medicine}</strong>${p.dosage ? ` — ${p.dosage}` : ''}${p.instructions ? `<br><em style="color: var(--color-text-hint);">${p.instructions}</em>` : ''}</div>`
                                  ).join('')
                                : 'None prescribed'}
                        </div>
                    </div>
                </div>

                <div class="checklist-item ${activeConsultation.recommendations ? 'checked' : 'unchecked'}">
                    <span class="material-icons-round">${activeConsultation.recommendations ? 'check_circle' : 'radio_button_unchecked'}</span>
                    <div>
                        <strong>Recommendations / Notes</strong>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                            ${activeConsultation.recommendations || activeConsultation.notes || 'No recommendations'}
                        </div>
                    </div>
                </div>

                <div class="checklist-item ${activeConsultation.requiresFollowUp ? 'checked' : 'unchecked'}">
                    <span class="material-icons-round">${activeConsultation.requiresFollowUp ? 'check_circle' : 'radio_button_unchecked'}</span>
                    <div>
                        <strong>Follow-up Checkup</strong>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                            ${activeConsultation.requiresFollowUp
                                ? `Scheduled: ${Utils.formatDate(activeConsultation.followUpDate)}`
                                : 'No follow-up required'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recovery Survey -->
            <div class="section-header">Recovery Survey</div>
            <div class="card card--elevated">
                <p style="margin-bottom: 16px; font-weight: var(--font-weight-semibold);">How are you feeling now?</p>
                <div class="severity-selector" id="recovery-survey-scale">
                    <div class="severity-option" data-level="1">
                        <span class="material-icons-round">sentiment_very_dissatisfied</span>
                        <span>Worse</span>
                    </div>
                    <div class="severity-option" data-level="2">
                        <span class="material-icons-round">sentiment_dissatisfied</span>
                        <span>Poor</span>
                    </div>
                    <div class="severity-option" data-level="3">
                        <span class="material-icons-round">sentiment_neutral</span>
                        <span>Same</span>
                    </div>
                    <div class="severity-option" data-level="4">
                        <span class="material-icons-round">sentiment_satisfied</span>
                        <span>Better</span>
                    </div>
                    <div class="severity-option" data-level="5">
                        <span class="material-icons-round">sentiment_very_satisfied</span>
                        <span>Recovered</span>
                    </div>
                </div>

                <div class="input-group" style="margin-top: 16px;">
                    <label for="recovery-notes" style="font-size:var(--font-size-sm); color:var(--color-text-secondary);">Additional notes for the clinic (optional)</label>
                    <textarea id="recovery-notes" class="input-field" rows="2" placeholder="Describe any remaining symptoms or concerns..."></textarea>
                </div>

                <div style="margin-top: 12px; display: flex; gap: 12px;">
                    <button class="btn btn--secondary btn--full" id="request-followup-btn">
                        <span class="material-icons-round">event</span>
                        Request Follow-up
                    </button>
                    <button class="btn btn--success btn--full" id="mark-recovered-btn">
                        <span class="material-icons-round">done_all</span>
                        I'm Recovered
                    </button>
                </div>
            </div>
        `;

        // Survey interaction
        let surveyRating = 0;
        const surveyOptions = document.querySelectorAll('#recovery-survey-scale .severity-option');
        surveyOptions.forEach(option => {
            option.addEventListener('click', () => {
                surveyOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                surveyRating = parseInt(option.dataset.level);
            });
        });

        const FEELING_LABELS = { 1: 'Worse', 2: 'Poor', 3: 'Same', 4: 'Better', 5: 'Recovered' };

        // Request follow-up
        document.getElementById('request-followup-btn')?.addEventListener('click', async () => {
            if (surveyRating === 0) {
                Utils.showToast('Please select how you feel first.', 'warning');
                return;
            }
            const notes = document.getElementById('recovery-notes')?.value.trim() || '';
            Utils.showLoading();

            // Save survey result back to the consultation
            await db.collection('consultations').doc(activeConsultation.id).update({
                recoverySurvey: {
                    feelingScale: surveyRating,
                    feelingLabel: FEELING_LABELS[surveyRating] || '',
                    notes,
                    submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    requestedFollowUp: true
                }
            });

            // Create follow-up request
            await FollowUpService.create({
                consultationId: activeConsultation.id,
                userId: auth.currentUser.uid,
                scheduledDate: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 86400000)),
                studentNote: notes,
                feelingScale: surveyRating
            });

            Utils.hideLoading();
            Utils.showToast('Follow-up requested! The clinic will confirm your schedule.', 'success');
        });

        // Mark as recovered
        document.getElementById('mark-recovered-btn')?.addEventListener('click', async () => {
            if (surveyRating === 0) {
                Utils.showToast('Please select how you feel first.', 'warning');
                return;
            }
            const notes = document.getElementById('recovery-notes')?.value.trim() || '';
            Utils.showLoading();

            // Save survey result + mark consultation completed
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
            Utils.showToast('Great! Your recovery has been recorded. Stay healthy! 💪', 'success');
            renderStudentRecovery(container);
        });

    } catch (error) {
        recoveryContent.innerHTML = `
            <div style="text-align: center; padding: 48px 0; color: var(--color-emergency);">
                <p>Failed to load recovery data.</p>
            </div>
        `;
    }
}
