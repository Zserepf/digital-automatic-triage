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

        const userResult = await AuthService.getUserData(userId);
        const logsResult = await SymptomLogService.getAll();
        const consultationsResult = await ConsultationService.getByStudent(userId);

        const userData = userResult.success ? userResult.data : {};
        const profile = userData.profile || {};
        const logs = (logsResult.success ? logsResult.data : []).filter(l => l.userId === userId);
        const consultations = consultationsResult.success ? consultationsResult.data : [];

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
                ${consultations.map(c => `
                    <div class="card card--bordered">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600;">${Utils.formatDate(c.date)}</span>
                            ${Utils.getStatusBadge(c.status)}
                        </div>
                        <div style="font-size: var(--font-size-sm);">
                            <strong>Diagnosis:</strong> ${c.diagnosis || 'N/A'}<br>
                            <strong>Prescriptions:</strong> ${(c.prescriptions || []).map(p => p.medicine).join(', ') || 'None'}<br>
                            ${c.recommendations ? `<strong>Notes:</strong> ${c.recommendations}` : ''}
                        </div>
                    </div>
                `).join('') || '<p style="color: var(--color-text-hint);">No consultations</p>'}
            </div>

            <!-- Action -->
            <button class="btn btn--primary" onclick="openConsultationForm('${params.appointmentId}', '${userId}')">
                <span class="material-icons-round">edit_note</span>
                Start Consultation
            </button>
        `;
    } catch (error) {
        content.innerHTML = `
            <div style="text-align: center; padding: 48px; color: var(--color-emergency);">
                <p>Failed to load patient data: ${error.message}</p>
            </div>
        `;
    }
}
