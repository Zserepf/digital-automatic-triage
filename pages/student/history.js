/* ========================================
   STUDENT HISTORY PAGE
   Digital Automatic Triage
   ======================================== */

export async function renderStudentHistory(container) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/student.css">
        <div class="page-student">
            <div class="student-header">
                <div class="student-header-greeting">
                    <h1>History</h1>
                    <p>Your past consultations</p>
                </div>
            </div>

            <div id="history-content">
                <div style="text-align: center; padding: 48px 0;">
                    <div class="spinner" style="margin: 0 auto;"></div>
                </div>
            </div>
        </div>

        ${window.getStudentBottomNav ? window.getStudentBottomNav('history') : ''}
    `;

    const historyContent = document.getElementById('history-content');

    try {
        // Load all three in parallel
        const [logsResult, appointmentsResult, consultationsResult] = await Promise.all([
            SymptomLogService.getMyLogs(),
            AppointmentService.getMine(),
            ConsultationService.getMine()
        ]);

        const logs = logsResult.success ? logsResult.data : [];
        const appointments = appointmentsResult.success ? appointmentsResult.data : [];
        const consultations = consultationsResult.success ? consultationsResult.data : [];

        // Build lookup maps for fast linking
        // appointment by symptomLogId
        const aptByLogId = {};
        appointments.forEach(apt => {
            if (apt.symptomLogId) aptByLogId[apt.symptomLogId] = apt;
        });
        // consultation by appointmentId
        const consultByAptId = {};
        consultations.forEach(c => {
            if (c.appointmentId) consultByAptId[c.appointmentId] = c;
        });

        if (logs.length === 0) {
            historyContent.innerHTML = `
                <div style="text-align: center; padding: 48px 0; color: var(--color-text-hint);">
                    <span class="material-icons-round" style="font-size: 64px; margin-bottom: 16px;">history</span>
                    <p>No history yet</p>
                    <p style="font-size: var(--font-size-sm);">Your symptom logs will appear here</p>
                </div>
            `;
            return;
        }

        // Group by TODAY vs PAST
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayLogs = logs.filter(log => {
            const d = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
            return d >= today;
        });
        const pastLogs = logs.filter(log => {
            const d = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
            return d < today;
        });

        historyContent.innerHTML = `
            ${todayLogs.length > 0 ? `
                <div class="section-header">TODAY</div>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                    ${todayLogs.map(log => renderHistoryCard(log, aptByLogId, consultByAptId)).join('')}
                </div>
            ` : ''}
            ${pastLogs.length > 0 ? `
                <div class="section-header">PAST</div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${pastLogs.map(log => renderHistoryCard(log, aptByLogId, consultByAptId)).join('')}
                </div>
            ` : ''}
            ${todayLogs.length === 0 && pastLogs.length === 0 ? `
                <div style="text-align: center; padding: 48px 0; color: var(--color-text-hint);">
                    <p>No history found</p>
                </div>
            ` : ''}
        `;
    } catch (error) {
        historyContent.innerHTML = `
            <div style="text-align: center; padding: 48px 0; color: var(--color-emergency);">
                <p>Failed to load history. Please try again.</p>
            </div>
        `;
    }
}

function renderHistoryCard(log, aptByLogId, consultByAptId) {
    const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();

    // Properly link: log → appointment → consultation
    const appointment = aptByLogId[log.id];
    const consultation = appointment ? consultByAptId[appointment.id] : null;

    const hasConsultation = !!consultation;
    const diagnosis = hasConsultation
        ? consultation.diagnosis
        : `Symptoms: ${(log.symptoms || []).join(', ')}`;

    const prescriptions = consultation?.prescriptions || [];
    const severity = log.triageResult?.category || 'minor';
    const status = appointment?.status || log.status || 'pending';

    const statusLabel = {
        'waiting': 'Waiting',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'pending': 'Pending'
    }[status] || status;

    const statusColor = {
        'waiting': 'var(--color-moderate)',
        'in_progress': 'var(--color-severe)',
        'completed': 'var(--color-normal)',
        'pending': 'var(--color-text-hint)'
    }[status] || 'var(--color-text-hint)';

    return `
        <div class="history-card" style="cursor: default;">
            <div class="history-card-date">
                <div class="day">${day}</div>
                <div class="month">${month}</div>
            </div>
            <div class="history-card-body" style="flex: 1;">
                <div class="history-card-diagnosis" style="font-weight: 600; margin-bottom: 4px;">
                    ${hasConsultation ? 'Diagnosis' : 'Triage Submitted'}
                </div>
                <div class="history-card-info" style="margin-bottom: 6px;">
                    ${diagnosis}
                </div>
                ${prescriptions.length > 0 ? `
                    <div style="margin-top: 6px; padding: 8px; background: #f0f7ff; border-radius: 8px;">
                        <div style="font-size: var(--font-size-xs); font-weight: 600; color: var(--color-primary); margin-bottom: 4px;">
                            <span class="material-icons-round" style="font-size: 14px; vertical-align: middle;">medication</span>
                            PRESCRIPTIONS
                        </div>
                        ${prescriptions.map(p => `
                            <div style="font-size: var(--font-size-sm); color: var(--color-text-primary); padding: 2px 0;">
                                <strong>${p.medicine}</strong>${p.dosage ? ` — ${p.dosage}` : ''}
                                ${p.instructions ? `<br><span style="color: var(--color-text-secondary); font-size: var(--font-size-xs);">${p.instructions}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : hasConsultation ? `
                    <div style="font-size: var(--font-size-sm); color: var(--color-text-hint); margin-top: 4px;">No prescriptions given</div>
                ` : ''}
                ${consultation?.recommendations ? `
                    <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 6px;">
                        <em>${consultation.recommendations}</em>
                    </div>
                ` : ''}
                ${severity === 'severe' || severity === 'emergency' ? `
                    <div style="font-size: var(--font-size-xs); color: var(--color-emergency); margin-top: 4px; font-weight: 600;">
                        ⚠ ${severity.toUpperCase()} case
                    </div>
                ` : ''}
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; min-width: 80px;">
                <span style="font-size: var(--font-size-xs); font-weight: 600; color: ${statusColor}; text-align: right;">
                    ${statusLabel}
                </span>
                <span style="font-size: var(--font-size-xs); color: var(--color-text-hint); text-align: right;">
                    ${(log.triageResult?.category || 'minor').toUpperCase()}
                </span>
            </div>
        </div>
    `;
}
