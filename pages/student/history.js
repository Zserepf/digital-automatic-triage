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
                    <p>Your consultations &amp; follow-ups</p>
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
        // Load all data in parallel
        const [logsResult, appointmentsResult, consultationsResult, followUpsResult] = await Promise.all([
            SymptomLogService.getMyLogs(),
            AppointmentService.getMine(),
            ConsultationService.getMine(),
            FollowUpService.getMyFollowUps()
        ]);

        const logs          = logsResult.success          ? logsResult.data          : [];
        const appointments  = appointmentsResult.success  ? appointmentsResult.data  : [];
        const consultations = consultationsResult.success ? consultationsResult.data  : [];
        const followUps     = followUpsResult.success     ? followUpsResult.data      : [];

        // Build lookup maps
        const aptByLogId     = {};
        appointments.forEach(apt => { if (apt.symptomLogId) aptByLogId[apt.symptomLogId] = apt; });
        const consultByAptId = {};
        consultations.forEach(c => { if (c.appointmentId) consultByAptId[c.appointmentId] = c; });

        // Separate upcoming vs past follow-ups
        const now = new Date();
        const upcomingFollowUps = followUps.filter(fu => {
            if (fu.status === 'completed' || fu.status === 'cancelled') return false;
            const d = fu.scheduledDate?.toDate ? fu.scheduledDate.toDate() : new Date(fu.scheduledDate);
            return !isNaN(d.getTime()) && d >= now;
        }).sort((a, b) => {
            const da = a.scheduledDate?.toDate ? a.scheduledDate.toDate() : new Date(a.scheduledDate);
            const db2 = b.scheduledDate?.toDate ? b.scheduledDate.toDate() : new Date(b.scheduledDate);
            return da - db2;
        });

        let html = '';

        // â”€â”€ Upcoming Follow-Up Reminders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (upcomingFollowUps.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div class="section-header" style="display:flex; align-items:center; gap:6px;">
                        <span class="material-icons-round" style="font-size:16px; color:var(--color-moderate);">alarm</span>
                        UPCOMING FOLLOW-UPS
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${upcomingFollowUps.map(fu => renderFollowUpReminder(fu)).join('')}
                    </div>
                </div>
            `;
        }
        // ── Consultation Records ─────────────────────────────────
        if (consultations.length > 0) {
            html += `
                <div style="margin-bottom: 24px;">
                    <div class="section-header" style="display:flex; align-items:center; gap:6px;">
                        <span class="material-icons-round" style="font-size:16px; color:var(--color-primary);">medical_services</span>
                        MY CONSULTATION RECORDS
                    </div>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${consultations.map(c => renderConsultationRecord(c)).join('')}
                    </div>
                </div>
            `;
        }
        // â”€â”€ Transaction History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (logs.length === 0 && followUps.length === 0) {
            html += `
                <div style="text-align:center; padding:48px 0; color:var(--color-text-hint);">
                    <span class="material-icons-round" style="font-size:64px; margin-bottom:16px;">history</span>
                    <p>No history yet</p>
                    <p style="font-size:var(--font-size-sm);">Your symptom logs will appear here</p>
                </div>
            `;
        } else {
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

            // Past follow-ups for history section
            const pastFollowUps = followUps.filter(fu => {
                if (fu.status === 'completed' || fu.status === 'cancelled') return true;
                const d = fu.scheduledDate?.toDate ? fu.scheduledDate.toDate() : new Date(fu.scheduledDate);
                return !isNaN(d.getTime()) && d < now;
            });

            html += `
                ${todayLogs.length > 0 ? `
                    <div class="section-header">TODAY</div>
                    <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
                        ${todayLogs.map(log => renderHistoryCard(log, aptByLogId, consultByAptId)).join('')}
                    </div>
                ` : ''}

                ${pastLogs.length > 0 ? `
                    <div class="section-header">PAST VISITS</div>
                    <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
                        ${pastLogs.map(log => renderHistoryCard(log, aptByLogId, consultByAptId)).join('')}
                    </div>
                ` : ''}

                ${pastFollowUps.length > 0 ? `
                    <div class="section-header">PAST FOLLOW-UPS</div>
                    <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
                        ${pastFollowUps.map(fu => renderFollowUpHistoryCard(fu)).join('')}
                    </div>
                ` : ''}
            `;
        }

        historyContent.innerHTML = html;

    } catch (error) {
        historyContent.innerHTML = `
            <div style="text-align:center; padding:48px 0; color:var(--color-emergency);">
                <p>Failed to load history. Please try again.</p>
            </div>
        `;
    }
}

/* â”€â”€ Follow-Up Reminder Card (upcoming) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function renderFollowUpReminder(fu) {
    const scheduledDate = fu.scheduledDate
        ? (fu.scheduledDate.toDate ? fu.scheduledDate.toDate() : new Date(fu.scheduledDate))
        : null;

    const now   = new Date();
    const diffMs = scheduledDate ? (scheduledDate - now) : null;
    const diffDays = diffMs !== null ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : null;

    const urgencyColor = diffDays !== null && diffDays <= 1 ? 'var(--color-emergency)' :
                         diffDays !== null && diffDays <= 3 ? 'var(--color-moderate)'  : 'var(--color-primary)';
    const urgencyBg    = diffDays !== null && diffDays <= 1 ? '#fff5f5' :
                         diffDays !== null && diffDays <= 3 ? '#fff8e1' : '#e3f2fd';

    const urgencyText = diffDays !== null
        ? (diffDays === 0 ? 'âš  Today!' : diffDays === 1 ? 'âš  Tomorrow!' : `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`)
        : '';

    const statusColor = fu.status === 'confirmed' ? 'var(--color-normal)' : 'var(--color-moderate)';

    return `
        <div style="
            background: ${urgencyBg};
            border: 2px solid ${urgencyColor};
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            align-items: flex-start;
            gap: 14px;
        ">
            <span class="material-icons-round" style="font-size:28px; color:${urgencyColor}; flex-shrink:0; margin-top:2px;">event</span>
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
                    <span style="font-weight:700; font-size:0.95rem; color:var(--color-text-primary);">Follow-Up Appointment</span>
                    <span style="font-size:0.75rem; font-weight:700; color:${statusColor}; text-transform:uppercase;">${fu.status || 'scheduled'}</span>
                </div>
                <div style="font-size:0.88rem; color:var(--color-text-secondary); margin-bottom:4px;">
                    <span class="material-icons-round" style="font-size:14px; vertical-align:middle; margin-right:2px;">calendar_today</span>
                    ${scheduledDate ? Utils.formatDate(scheduledDate) : 'Date TBD'}
                    ${urgencyText ? `&nbsp;Â·&nbsp;<strong style="color:${urgencyColor};">${urgencyText}</strong>` : ''}
                </div>
                ${fu.clinicInstructions ? `
                    <div style="background:white; border-radius:8px; padding:8px 10px; font-size:0.82rem; color:var(--color-text-secondary); margin-top:6px; border-left:3px solid var(--color-primary);">
                        <strong style="color:var(--color-primary);">Clinic Instructions:</strong> ${fu.clinicInstructions}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/* â”€â”€ Follow-Up History Card (past) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function renderFollowUpHistoryCard(fu) {
    const scheduledDate = fu.scheduledDate
        ? (fu.scheduledDate.toDate ? fu.scheduledDate.toDate() : new Date(fu.scheduledDate))
        : null;
    const day   = scheduledDate ? scheduledDate.getDate().toString().padStart(2, '0') : '--';
    const month = scheduledDate ? scheduledDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '---';

    const survey = fu.recoverySurvey || {};
    const feelingColors = { 1:'var(--color-emergency)', 2:'var(--color-severe)', 3:'var(--color-moderate)', 4:'var(--color-primary)', 5:'var(--color-normal)' };
    const feelingLabels = { 1:'Much Worse', 2:'Slightly Worse', 3:'Same', 4:'Better', 5:'Recovered' };
    const fScale = survey.feelingScale || fu.feelingScale || 0;

    return `
        <div class="history-card" style="cursor:default; border-left:4px solid ${feelingColors[fScale] || 'var(--color-border)'};">
            <div class="history-card-date">
                <div class="day">${day}</div>
                <div class="month">${month}</div>
            </div>
            <div class="history-card-body" style="flex:1;">
                <div style="font-weight:600; margin-bottom:4px;">Follow-Up Visit</div>
                <div style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:4px;">
                    ${survey.completed
                        ? `Feeling: <strong style="color:${feelingColors[fScale]}">${feelingLabels[fScale] || 'Level '+fScale}</strong>
                           &nbsp;Â·&nbsp; Symptoms resolved: <strong>${survey.symptomsResolved ? 'Yes' : 'No'}</strong>`
                        : 'Recovery survey not yet submitted'}
                </div>
                ${survey.additionalNotes ? `<div style="font-size:var(--font-size-sm); color:var(--color-text-hint); font-style:italic;">"${survey.additionalNotes}"</div>` : ''}
                ${fu.clinicInstructions ? `
                    <div style="margin-top:6px; padding:6px 8px; background:#e8f5e9; border-radius:6px; font-size:var(--font-size-xs);">
                        <strong style="color:#2e7d32;">Clinic:</strong> ${fu.clinicInstructions}
                    </div>
                ` : ''}
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; min-width:72px;">
                <span style="font-size:var(--font-size-xs); font-weight:600; color:${fu.status==='confirmed'?'var(--color-normal)':'var(--color-text-hint)'}; text-align:right;">
                    ${fu.status || 'scheduled'}
                </span>
                <span style="font-size:var(--font-size-xs); color:var(--color-text-hint); text-align:right;">FOLLOW-UP</span>
            </div>
        </div>
    `;
}

function renderHistoryCard(log, aptByLogId, consultByAptId) {
    const date  = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
    const day   = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();

    const appointment  = aptByLogId[log.id];
    const consultation = appointment ? consultByAptId[appointment.id] : null;
    const hasConsultation = !!consultation;

    const diagnosis = hasConsultation
        ? consultation.diagnosis
        : `Symptoms: ${(log.symptoms || []).join(', ')}`;

    const prescriptions = consultation?.prescriptions || [];
    const severity = log.triageResult?.category || 'minor';
    const status   = appointment?.status || log.status || 'pending';

    const statusLabel = {
        'waiting':     'Waiting',
        'in_progress': 'In Progress',
        'completed':   'Completed',
        'pending':     'Pending'
    }[status] || status;

    const statusColor = {
        'waiting':     'var(--color-moderate)',
        'in_progress': 'var(--color-severe)',
        'completed':   'var(--color-normal)',
        'pending':     'var(--color-text-hint)'
    }[status] || 'var(--color-text-hint)';

    return `
        <div class="history-card" style="cursor:default;">
            <div class="history-card-date">
                <div class="day">${day}</div>
                <div class="month">${month}</div>
            </div>
            <div class="history-card-body" style="flex:1;">
                <div class="history-card-diagnosis" style="font-weight:600; margin-bottom:4px;">
                    ${hasConsultation ? 'Diagnosis' : 'Triage Submitted'}
                </div>
                <div class="history-card-info" style="margin-bottom:6px;">${diagnosis}</div>
                ${prescriptions.length > 0 ? `
                    <div style="margin-top:6px; padding:8px; background:#f0f7ff; border-radius:8px;">
                        <div style="font-size:var(--font-size-xs); font-weight:600; color:var(--color-primary); margin-bottom:4px;">
                            <span class="material-icons-round" style="font-size:14px; vertical-align:middle;">medication</span>
                            PRESCRIPTIONS
                        </div>
                        ${prescriptions.map(p => `
                            <div style="font-size:var(--font-size-sm); padding:2px 0;">
                                <strong>${p.medicine}</strong>${p.dosage ? ` â€” ${p.dosage}` : ''}
                                ${p.instructions ? `<br><span style="color:var(--color-text-secondary); font-size:var(--font-size-xs);">${p.instructions}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : hasConsultation ? `<div style="font-size:var(--font-size-sm); color:var(--color-text-hint); margin-top:4px;">No prescriptions given</div>` : ''}
                ${consultation?.recommendations ? `
                    <div style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-top:6px; font-style:italic;">${consultation.recommendations}</div>
                ` : ''}
                ${severity === 'severe' || severity === 'emergency' ? `
                    <div style="font-size:var(--font-size-xs); color:var(--color-emergency); margin-top:4px; font-weight:600;">
                        âš  ${severity.toUpperCase()} case
                    </div>
                ` : ''}
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px; min-width:80px;">
                <span style="font-size:var(--font-size-xs); font-weight:600; color:${statusColor}; text-align:right;">${statusLabel}</span>
                <span style="font-size:var(--font-size-xs); color:var(--color-text-hint); text-align:right;">${(log.triageResult?.category || 'minor').toUpperCase()}</span>
            </div>
        </div>
    `;
}

/* ── Student Consultation Record Card ──────────────────────── */
function renderConsultationRecord(c) {
    const date = c.date?.toDate ? c.date.toDate() : new Date(c.date || Date.now());
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const prescriptions = c.prescriptions || [];

    return `
        <div class="card card--elevated" style="padding: 16px 18px; border-left: 4px solid var(--color-primary);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; flex-wrap:wrap; gap:6px;">
                <div style="font-size:var(--font-size-xs); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--color-primary);">
                    <span class="material-icons-round" style="font-size:14px; vertical-align:middle;">medical_services</span>
                    Clinic Consultation
                </div>
                <div style="font-size:var(--font-size-xs); color:var(--color-text-hint);">${dateStr}</div>
            </div>

            ${c.chiefComplaint ? `
                <div style="margin-bottom:10px;">
                    <div style="font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-hint); text-transform:uppercase; margin-bottom:3px;">Chief Complaint</div>
                    <div style="font-size:var(--font-size-sm); font-style:italic;">${c.chiefComplaint}</div>
                </div>
            ` : ''}

            <div style="margin-bottom:10px;">
                <div style="font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-hint); text-transform:uppercase; margin-bottom:3px;">Diagnosis</div>
                <div style="font-size:var(--font-size-sm); font-weight:600;">${c.diagnosis || 'N/A'}</div>
            </div>

            ${prescriptions.length > 0 ? `
                <div style="margin-bottom:10px; background:var(--color-background); border-radius:8px; padding:10px;">
                    <div style="font-size:var(--font-size-xs); font-weight:600; color:var(--color-primary); text-transform:uppercase; margin-bottom:6px;">
                        <span class="material-icons-round" style="font-size:13px; vertical-align:middle;">medication</span>
                        Prescribed Medicines
                    </div>
                    ${prescriptions.map(p => `
                        <div style="font-size:var(--font-size-sm); padding:2px 0;">
                            <strong>${p.medicine}</strong>${p.dosage ? ` — ${p.dosage}` : ''}
                            ${p.frequencyLabel ? `<span style="color:var(--color-primary); font-size:var(--font-size-xs);"> · ${p.frequencyLabel}</span>` : ''}
                            ${p.instructions ? `<br><span style="color:var(--color-text-secondary); font-size:var(--font-size-xs);">${p.instructions}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${c.recommendations ? `
                <div style="margin-bottom:10px;">
                    <div style="font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-hint); text-transform:uppercase; margin-bottom:3px;">Treatment Notes</div>
                    <div style="font-size:var(--font-size-sm); color:var(--color-text-secondary);">${c.recommendations}</div>
                </div>
            ` : ''}

            ${c.requiresFollowUp ? `
                <div style="display:flex; align-items:center; gap:6px; margin-top:8px; padding-top:8px; border-top:1px solid var(--color-border);">
                    <span class="material-icons-round" style="font-size:14px; color:var(--color-moderate);">event_repeat</span>
                    <span style="font-size:var(--font-size-xs); color:var(--color-moderate); font-weight:600;">Follow-up required</span>
                </div>
            ` : ''}
        </div>
    `;
}
