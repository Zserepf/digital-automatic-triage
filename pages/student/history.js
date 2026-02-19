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

    // Load history
    const historyContent = document.getElementById('history-content');

    try {
        const logsResult = await SymptomLogService.getMyLogs();
        const consultationsResult = await ConsultationService.getMine();

        const logs = logsResult.success ? logsResult.data : [];
        const consultations = consultationsResult.success ? consultationsResult.data : [];

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

        // Group by date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayLogs = logs.filter(log => {
            const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
            return logDate >= today;
        });

        const pastLogs = logs.filter(log => {
            const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
            return logDate < today;
        });

        historyContent.innerHTML = `
            ${todayLogs.length > 0 ? `
                <div class="section-header">TODAY</div>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                    ${todayLogs.map(log => renderHistoryCard(log, consultations)).join('')}
                </div>
            ` : ''}

            ${pastLogs.length > 0 ? `
                <div class="section-header">PAST</div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${pastLogs.map(log => renderHistoryCard(log, consultations)).join('')}
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

function renderHistoryCard(log, consultations) {
    const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const category = log.triageResult?.category || 'minor';

    // Find matching consultation
    const consultation = consultations.find(c => c.userId === log.userId);
    const diagnosis = consultation?.diagnosis || `Symptoms: ${(log.symptoms || []).join(', ')}`;
    const meds = consultation?.prescriptions?.map(p => p.medicine).join(', ') || '';

    const statusMap = {
        'pending': 'waiting',
        'reviewed': 'in_progress',
        'completed': 'completed'
    };

    return `
        <div class="history-card">
            <div class="history-card-date">
                <div class="day">${day}</div>
                <div class="month">${month}</div>
            </div>
            <div class="history-card-body">
                <div class="history-card-diagnosis">
                    Diagnosis
                </div>
                <div class="history-card-info">
                    ${diagnosis}
                </div>
                ${meds ? `<div class="history-card-info">Medications given</div>` : ''}
                ${log.triageResult?.category === 'severe' || log.triageResult?.category === 'emergency'
                    ? `<div class="history-card-info">Sent to ER</div>` : ''}
            </div>
            <div>
                ${Utils.getStatusBadge(statusMap[log.status] || log.status)}
            </div>
        </div>
    `;
}
