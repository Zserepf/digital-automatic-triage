/* ========================================
   CLINIC QUEUE PAGE
   Digital Automatic Triage
   ======================================== */

export async function renderClinicQueue(container) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/clinic.css">
        <div class="page-clinic">
            ${window.getClinicSidebar ? window.getClinicSidebar('queue') : ''}
            <div class="clinic-content">
                <div class="clinic-page-header">
                    <h1>Queue Management</h1>
                    <span class="date-display">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>

                <div id="queue-content">
                    <div style="text-align: center; padding: 48px;">
                        <div class="spinner" style="margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Real-time queue
    AppointmentService.onQueueUpdate((appointments) => {
        const queueContent = document.getElementById('queue-content');
        if (!queueContent) return;

        const severityOrder = { emergency: 0, severe: 1, moderate: 2, minor: 3 };
        appointments.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

        if (appointments.length === 0) {
            queueContent.innerHTML = `
                <div style="text-align: center; padding: 48px; color: var(--color-text-hint);">
                    <span class="material-icons-round" style="font-size: 64px;">inbox</span>
                    <p>No appointments today</p>
                </div>
            `;
            return;
        }

        queueContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${appointments.map(apt => `
                    <div class="queue-card queue-card--${apt.severity || 'minor'}">
                        <div class="queue-card-number" style="background: var(--color-${apt.severity === 'emergency' ? 'emergency' : apt.severity === 'severe' ? 'severe' : apt.severity === 'moderate' ? 'moderate' : 'normal'});">
                            ${apt.queueNumber || '-'}
                        </div>
                        <div class="queue-card-body">
                            <div class="queue-card-name">${apt.userId}</div>
                            <div class="queue-card-detail">${(apt.severity || 'minor').toUpperCase()} — ${apt.type === 'auto' ? 'Auto-booked' : 'Manual'}</div>
                            <div class="queue-card-detail">${Utils.formatTime(apt.createdAt)}</div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                            ${Utils.getStatusBadge(apt.status)}
                            <div style="display: flex; gap: 4px;">
                                ${apt.status === 'waiting' ? `
                                    <button class="btn btn--primary btn--sm" onclick="updateAppointmentStatus('${apt.id}', 'in_progress')">Start</button>
                                ` : ''}
                                ${apt.status === 'in_progress' ? `
                                    <button class="btn btn--success btn--sm" onclick="openConsultationForm('${apt.id}', '${apt.userId}')">Complete</button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    });
}

// Global helpers
window.updateAppointmentStatus = async function(id, status) {
    await AppointmentService.updateStatus(id, status);
    Utils.showToast(`Status updated to ${status.replace('_', ' ')}`, 'success');
};

window.openConsultationForm = function(appointmentId, userId) {
    Router.navigate('/clinic/consultation', { appointmentId, userId });
};
