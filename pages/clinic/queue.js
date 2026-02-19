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

    // Cache for user profiles so we don't re-fetch on every update
    let userCache = {};

    // Real-time queue
    AppointmentService.onQueueUpdate(async (appointments) => {
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

        // Load user profiles for any new UIDs
        const newUids = appointments.map(a => a.userId).filter(uid => uid && !userCache[uid]);
        if (newUids.length > 0) {
            const newUsers = await AuthService.getUsersByIds(newUids);
            userCache = { ...userCache, ...newUsers };
        }

        const severityColorMap = {
            emergency: 'var(--color-emergency)',
            severe: 'var(--color-severe)',
            moderate: 'var(--color-moderate)',
            minor: 'var(--color-normal)'
        };

        queueContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${appointments.map(apt => {
                    const user = userCache[apt.userId];
                    const name = user?.profile
                        ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || 'Unknown Student'
                        : 'Unknown Student';
                    const studentId = user?.profile?.studentId || '';
                    const section = user?.profile?.section || '';
                    const sevColor = severityColorMap[apt.severity] || 'var(--color-normal)';

                    return `
                    <div class="queue-card queue-card--${apt.severity || 'minor'}">
                        <div class="queue-card-number" style="background: ${sevColor}; color: white; min-width: 48px; text-align: center; font-size: 1.4rem; font-weight: 700; padding: 12px 8px; border-radius: 8px;">
                            ${apt.queueNumber || '-'}
                        </div>
                        <div class="queue-card-body" style="flex: 1;">
                            <div class="queue-card-name" style="font-weight: 700; font-size: var(--font-size-md);">${name}</div>
                            ${studentId ? `<div class="queue-card-detail" style="color: var(--color-text-secondary);">ID: ${studentId}${section ? ` · ${section}` : ''}</div>` : ''}
                            <div class="queue-card-detail" style="margin-top: 4px;">
                                <span style="font-weight: 600; color: ${sevColor};">${(apt.severity || 'minor').toUpperCase()}</span>
                                · ${apt.type === 'auto' ? 'Auto-booked' : 'Walk-in'}
                                · ${apt.createdAt ? Utils.formatTime(apt.createdAt) : ''}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                            ${Utils.getStatusBadge(apt.status)}
                            <div style="display: flex; gap: 4px;">
                                ${apt.status === 'waiting' ? `
                                    <button class="btn btn--primary btn--sm" onclick="updateAppointmentStatus('${apt.id}', 'in_progress')">
                                        <span class="material-icons-round" style="font-size:16px;">play_arrow</span> Start
                                    </button>
                                ` : ''}
                                ${apt.status === 'in_progress' ? `
                                    <button class="btn btn--success btn--sm" onclick="openConsultationForm('${apt.id}', '${apt.userId}')">
                                        <span class="material-icons-round" style="font-size:16px;">check</span> Complete
                                    </button>
                                ` : ''}
                                ${apt.status === 'completed' ? `
                                    <button class="btn btn--ghost btn--sm" onclick="viewPatient('${apt.userId}')">
                                        <span class="material-icons-round" style="font-size:16px;">visibility</span> View
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
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

window.viewPatient = function(userId) {
    Router.navigate('/clinic/patient', { userId });
};
