/* ========================================
   CLINIC PATIENT VIEW PAGE
   Digital Automatic Triage
   ======================================== */

export async function renderPatientView(container, params = {}) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/clinic.css">
        <div class="page-clinic">
            ${window.getClinicSidebar ? window.getClinicSidebar('') : ''}
            <div class="clinic-content">
                <button class="btn btn--ghost mb-lg" data-route="/clinic/queue">
                    <span class="material-icons-round">arrow_back</span> Back to Queue
                </button>
                <div id="patient-view-content">
                    <div style="text-align: center; padding: 48px;">
                        <div class="spinner" style="margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const content = document.getElementById('patient-view-content');

    try {
        const userId = params.userId;
        if (!userId) throw new Error('No patient specified');

        // Load all data in parallel with targeted queries
        const [userResult, logsResult, consultationsResult, followUpsResult] = await Promise.all([
            AuthService.getUserData(userId),
            SymptomLogService.getByUserId(userId),
            ConsultationService.getByStudent(userId),
            FollowUpService.getByUserId(userId)
        ]);

        const userData = userResult.success ? userResult.data : {};
        const profile = userData.profile || {};
        const logs = logsResult.success ? logsResult.data : [];
        const consultations = consultationsResult.success ? consultationsResult.data : [];
        const followUps = followUpsResult.success ? followUpsResult.data : [];

        const initials = ((profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')).toUpperCase() || '?';

        content.innerHTML = `
            <!-- Patient Header -->
            <div class="patient-view-header">
                <div class="patient-view-avatar">${initials}</div>
                <div class="patient-view-info">
                    <h2>${profile.firstName || ''} ${profile.lastName || ''}</h2>
                    <div class="patient-view-meta">
                        <span>ID: ${profile.studentId || 'N/A'}</span>
                        <span>Section: ${profile.section || 'N/A'}</span>
                        <span>Blood Type: ${profile.bloodType || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <!-- Emergency Contacts -->
            <div class="card mb-lg">
                <h3 style="margin-bottom: 12px;">Emergency Contacts</h3>
                ${(profile.emergencyContacts || []).map(c => `
                    <div style="font-size: var(--font-size-sm); margin-bottom: 8px;">
                        <strong>${c.name}</strong> (${c.relationship}) — ${c.phone}
                    </div>
                `).join('') || '<p style="color: var(--color-text-hint);">None listed</p>'}
            </div>

            <!-- Recent Symptom Logs -->
            <h3 style="margin-bottom: 12px;">Recent Symptom Logs</h3>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                ${logs.slice(0, 5).map(log => `
                    <div class="card card--bordered">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600;">${Utils.formatDate(log.timestamp)}</span>
                            ${Utils.getStatusBadge(log.triageResult?.category || 'minor')}
                        </div>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                            Symptoms: ${(log.symptoms || []).join(', ')}<br>
                            Severity: ${log.severityLevel}/5 | Pain: ${log.painScale}/10
                        </div>
                        ${log.description ? `<div style="font-size: var(--font-size-sm); margin-top: 4px;">"${log.description}"</div>` : ''}
                    </div>
                `).join('') || '<p style="color: var(--color-text-hint);">No logs found</p>'}
            </div>

            <!-- Past Consultations -->
            <h3 style="margin-bottom: 12px;">Consultation History</h3>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                ${consultations.length > 0 ? consultations.map(c => {
                    const prescriptions = c.prescriptions || [];
                    return `
                    <div class="card card--bordered">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600;">${Utils.formatDate(c.date)}</span>
                            ${Utils.getStatusBadge(c.status)}
                        </div>
                        <div style="font-size: var(--font-size-sm); margin-bottom: 8px;">
                            <strong>Diagnosis:</strong> ${c.diagnosis || 'N/A'}
                        </div>
                        ${prescriptions.length > 0 ? `
                            <div style="background: #f0f7ff; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
                                <div style="font-size: var(--font-size-xs); font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">
                                    <span class="material-icons-round" style="font-size: 13px; vertical-align: middle;">medication</span>
                                    PRESCRIPTIONS
                                </div>
                                ${prescriptions.map(p => `
                                    <div style="font-size: var(--font-size-sm); padding: 2px 0;">
                                        <strong>${p.medicine}</strong>${p.dosage ? ` — ${p.dosage}` : ''}
                                        ${p.instructions ? `<span style="color:var(--color-text-secondary);"> · ${p.instructions}</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `<div style="font-size:var(--font-size-sm);color:var(--color-text-hint);margin-bottom:8px;">No prescriptions given</div>`}
                        ${c.recommendations ? `<div style="font-size:var(--font-size-sm);color:var(--color-text-secondary);"><strong>Notes:</strong> ${c.recommendations}</div>` : ''}
                        ${c.requiresFollowUp ? `<div style="font-size:var(--font-size-xs);color:var(--color-moderate);margin-top:6px;font-weight:600;">⏰ Follow-up required</div>` : ''}
                    </div>`;
                }).join('') : '<p style="color: var(--color-text-hint);">No consultations</p>'}
            </div>

            <!-- Follow-Up Requests -->
            <h3 style="margin-bottom: 12px;">Follow-Up Requests</h3>
            <div id="follow-ups-section" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                ${followUps.length > 0 ? followUps.map(fu => {
                    const survey = fu.recoverySurvey || {};
                    const feelingLabels = { 1: 'Much Worse', 2: 'Slightly Worse', 3: 'Same', 4: 'Better', 5: 'Recovered' };
                    const feelingColors = { 1: 'var(--color-emergency)', 2: 'var(--color-severe)', 3: 'var(--color-moderate)', 4: 'var(--color-primary)', 5: 'var(--color-normal)' };
                    const fScale = survey.feelingScale || fu.feelingScale || 0;
                    const scheduledDate = fu.scheduledDate ? (fu.scheduledDate.toDate ? Utils.formatDate(fu.scheduledDate) : fu.scheduledDate) : 'N/A';
                    return `
                    <div class="card card--bordered" data-followup-id="${fu.id}" style="border-left: 4px solid ${feelingColors[fScale] || 'var(--color-border)'};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                            <span style="font-weight: 600;">Scheduled: ${scheduledDate}</span>
                            <span class="badge badge--${fu.status === 'confirmed' ? 'success' : 'warning'}" style="font-size: var(--font-size-xs);">
                                ${fu.status || 'scheduled'}
                            </span>
                        </div>
                        ${fScale ? `
                        <div style="font-size: var(--font-size-sm); margin-bottom: 6px;">
                            <strong>Feeling:</strong>
                            <span style="color: ${feelingColors[fScale]}; font-weight: 600;">${feelingLabels[fScale] || 'Level ' + fScale}</span>
                        </div>` : ''}
                        ${survey.completed ? `
                        <div style="background: var(--color-background); border-radius: 8px; padding: 8px; margin-bottom: 8px; font-size: var(--font-size-sm);">
                            <div style="font-weight: 600; margin-bottom: 4px; color: var(--color-primary);">
                                <span class="material-icons-round" style="font-size: 14px; vertical-align: middle;">assignment_turned_in</span>
                                Recovery Survey
                            </div>
                            <div>Symptoms Resolved: ${survey.symptomsResolved ? 'Yes' : 'No'}</div>
                            ${survey.additionalNotes ? `<div>Notes: "${survey.additionalNotes}"</div>` : ''}
                        </div>` : `
                        <div style="font-size: var(--font-size-xs); color: var(--color-text-hint); margin-bottom: 8px;">
                            Survey not yet submitted
                        </div>`}
                        ${fu.studentNote ? `<div style="font-size: var(--font-size-sm); margin-bottom: 6px;"><strong>Student Note:</strong> ${fu.studentNote}</div>` : ''}
                        ${fu.clinicInstructions ? `
                        <div style="background: #e8f5e9; border-radius: 8px; padding: 8px; margin-bottom: 8px; font-size: var(--font-size-sm);">
                            <strong style="color: #2e7d32;">
                                <span class="material-icons-round" style="font-size: 14px; vertical-align: middle;">medical_information</span>
                                Clinic Instructions:
                            </strong>
                            ${fu.clinicInstructions}
                        </div>` : ''}
                        <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                            ${fu.status !== 'confirmed' ? `<button class="btn btn--primary btn--sm confirm-followup-btn" data-id="${fu.id}">
                                <span class="material-icons-round" style="font-size: 16px;">check_circle</span> Confirm
                            </button>` : ''}
                            <button class="btn btn--outline btn--sm add-instructions-btn" data-id="${fu.id}">
                                <span class="material-icons-round" style="font-size: 16px;">edit_note</span> ${fu.clinicInstructions ? 'Update' : 'Add'} Instructions
                            </button>
                        </div>
                    </div>`;
                }).join('') : '<p style="color: var(--color-text-hint);">No follow-up requests</p>'}
            </div>

            <!-- Action -->
            ${params.appointmentId ? `
            <button class="btn btn--primary btn--lg" id="start-consultation-btn" style="width:100%; margin-top: 8px;">
                <span class="material-icons-round">edit_note</span>
                Start Consultation
            </button>` : ''}
        `;

        // Define the navigation function locally so it works whether queue.js loaded or not
        window.openConsultationForm = function(appointmentId, userId) {
            Router.navigate('/clinic/consultation', { appointmentId, userId });
        };

        const startBtn = document.getElementById('start-consultation-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                Router.navigate('/clinic/consultation', {
                    appointmentId: params.appointmentId,
                    userId
                });
            });
        }

        // Follow-up action handlers
        content.querySelectorAll('.confirm-followup-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                btn.textContent = 'Confirming...';
                const result = await FollowUpService.confirm(btn.dataset.id);
                if (result.success) {
                    // Send notification to student
                    try {
                        await NotificationService.create({
                            type: 'follow_up',
                            title: 'Follow-Up Confirmed',
                            message: 'Your follow-up appointment has been confirmed by the clinic.',
                            targetRole: 'student',
                            targetUserId: userId,
                            relatedId: btn.dataset.id,
                            severity: 'normal'
                        });
                    } catch (e) {}
                    renderPatientView(container, params); // Refresh
                } else {
                    btn.disabled = false;
                    btn.textContent = 'Confirm';
                    alert('Failed to confirm: ' + result.error);
                }
            });
        });

        content.querySelectorAll('.add-instructions-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fuId = btn.dataset.id;
                const card = btn.closest('[data-followup-id]');
                // Check if form already open
                if (card.querySelector('.instructions-form')) return;

                const existingInstr = card.querySelector('[style*="e8f5e9"]')?.textContent?.replace('Clinic Instructions:', '').trim() || '';

                const form = document.createElement('div');
                form.className = 'instructions-form';
                form.style.cssText = 'margin-top: 8px; display: flex; flex-direction: column; gap: 8px;';
                form.innerHTML = `
                    <textarea class="form-control" rows="3" placeholder="Enter clinic instructions for this follow-up..."
                        style="width: 100%; resize: vertical; font-size: var(--font-size-sm);">${existingInstr}</textarea>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn--primary btn--sm save-instr-btn">
                            <span class="material-icons-round" style="font-size: 16px;">save</span> Save
                        </button>
                        <button class="btn btn--ghost btn--sm cancel-instr-btn">Cancel</button>
                    </div>
                `;
                card.appendChild(form);

                form.querySelector('.cancel-instr-btn').addEventListener('click', () => form.remove());
                form.querySelector('.save-instr-btn').addEventListener('click', async () => {
                    const instructions = form.querySelector('textarea').value.trim();
                    if (!instructions) { alert('Please enter instructions.'); return; }

                    const saveBtn = form.querySelector('.save-instr-btn');
                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Saving...';

                    const result = await FollowUpService.addInstructions(fuId, instructions);
                    if (result.success) {
                        // Notify the student
                        try {
                            await NotificationService.create({
                                type: 'follow_up',
                                title: 'New Clinic Instructions',
                                message: 'The clinic has provided instructions for your follow-up.',
                                targetRole: 'student',
                                targetUserId: userId,
                                relatedId: fuId,
                                severity: 'normal'
                            });
                        } catch (e) {}
                        renderPatientView(container, params); // Refresh
                    } else {
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Save';
                        alert('Failed: ' + result.error);
                    }
                });
            });
        });
    } catch (error) {
        content.innerHTML = `
            <div style="text-align: center; padding: 48px; color: var(--color-emergency);">
                <p>Failed to load patient data: ${error.message}</p>
            </div>
        `;
    }
}
