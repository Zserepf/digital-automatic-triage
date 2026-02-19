/* ========================================
   CLINIC DASHBOARD PAGE
   Digital Automatic Triage
   ======================================== */

export async function renderClinicDashboard(container) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/clinic.css">
        <div class="page-clinic">
            ${getClinicSidebar('dashboard')}
            <div class="clinic-content">
                <!-- Emergency Banner (hidden by default) -->
                <div class="emergency-banner hidden" id="emergency-banner">
                    <div class="emergency-banner-info">
                        <span class="material-icons-round">warning</span>
                        <div>
                            <strong>🚨 EMERGENCY ALERT</strong>
                            <span id="emergency-student-info"></span>
                        </div>
                    </div>
                    <button class="btn btn--sm" style="background: white; color: var(--color-emergency);" id="respond-emergency-btn">
                        RESPOND
                    </button>
                </div>

                <!-- Page Header -->
                <div class="clinic-page-header">
                    <h1>Dashboard</h1>
                    <span class="date-display">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <!-- Stats -->
                <div class="stats-grid" id="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-icon stat-card-icon--waiting">
                            <span class="material-icons-round">schedule</span>
                        </div>
                        <div>
                            <div class="stat-card-value" id="stat-waiting">0</div>
                            <div class="stat-card-label">Waiting</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon stat-card-icon--in-progress">
                            <span class="material-icons-round">pending</span>
                        </div>
                        <div>
                            <div class="stat-card-value" id="stat-in-progress">0</div>
                            <div class="stat-card-label">In Progress</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon stat-card-icon--completed">
                            <span class="material-icons-round">check_circle</span>
                        </div>
                        <div>
                            <div class="stat-card-value" id="stat-completed">0</div>
                            <div class="stat-card-label">Completed</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon stat-card-icon--emergency">
                            <span class="material-icons-round">emergency</span>
                        </div>
                        <div>
                            <div class="stat-card-value" id="stat-emergency">0</div>
                            <div class="stat-card-label">Emergency</div>
                        </div>
                    </div>
                </div>

                <!-- Today's Queue -->
                <h2 style="margin-bottom: 16px;">Today's Queue</h2>
                <div id="queue-list">
                    <div style="text-align: center; padding: 32px;">
                        <div class="spinner" style="margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Listen for real-time queue updates
    AppointmentService.onQueueUpdate((appointments) => {
        updateStats(appointments);
        renderQueueList(appointments);
    });

    // Listen for emergency alerts
    EmergencyService.onEmergencyAlert((emergencies) => {
        const banner = document.getElementById('emergency-banner');
        if (emergencies.length > 0) {
            const latest = emergencies[0];
            banner.classList.remove('hidden');
            document.getElementById('emergency-student-info').textContent =
                `Student: ${latest.studentInfo?.name || 'Unknown'} | Section: ${latest.studentInfo?.section || 'N/A'}`;

            document.getElementById('respond-emergency-btn').onclick = async () => {
                await EmergencyService.respond(latest.id);
                Utils.showToast('Responding to emergency...', 'info');
            };

            // Play alert sound if available
            try {
                const audio = new Audio('/assets/sounds/emergency-alert.mp3');
                audio.play().catch(() => {});
            } catch (e) {}
        } else {
            banner.classList.add('hidden');
        }
    });
}

function updateStats(appointments) {
    const waiting = appointments.filter(a => a.status === 'waiting').length;
    const inProgress = appointments.filter(a => a.status === 'in_progress').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const emergency = appointments.filter(a => a.severity === 'emergency' && a.status !== 'completed').length;

    const wEl = document.getElementById('stat-waiting');
    const ipEl = document.getElementById('stat-in-progress');
    const cEl = document.getElementById('stat-completed');
    const eEl = document.getElementById('stat-emergency');

    if (wEl) wEl.textContent = waiting;
    if (ipEl) ipEl.textContent = inProgress;
    if (cEl) cEl.textContent = completed;
    if (eEl) eEl.textContent = emergency;
}

function renderQueueList(appointments) {
    const queueList = document.getElementById('queue-list');
    if (!queueList) return;

    const active = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');

    // Sort by severity
    const severityOrder = { emergency: 0, severe: 1, moderate: 2, minor: 3 };
    active.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

    if (active.length === 0) {
        queueList.innerHTML = `
            <div style="text-align: center; padding: 48px; color: var(--color-text-hint);">
                <span class="material-icons-round" style="font-size: 48px;">inbox</span>
                <p>No patients in queue</p>
            </div>
        `;
        return;
    }

    queueList.innerHTML = `
        <table class="queue-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Severity</th>
                    <th>Patient</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${active.map(appointment => {
                    const severityColors = {
                        emergency: 'var(--color-emergency)',
                        severe: 'var(--color-severe)',
                        moderate: 'var(--color-moderate)',
                        minor: 'var(--color-normal)'
                    };

                    return `
                        <tr>
                            <td><strong>${appointment.queueNumber || '-'}</strong></td>
                            <td>
                                <span class="badge badge--${appointment.severity === 'emergency' ? 'emergency' : appointment.severity === 'severe' ? 'emergency' : appointment.severity === 'moderate' ? 'waiting' : 'completed'}">
                                    ${(appointment.severity || 'minor').toUpperCase()}
                                </span>
                            </td>
                            <td>${appointment.userId || 'Unknown'}</td>
                            <td>${Utils.formatTime(appointment.createdAt)}</td>
                            <td>${Utils.getStatusBadge(appointment.status)}</td>
                            <td>
                                <button class="btn btn--primary btn--sm" onclick="viewPatient('${appointment.id}', '${appointment.userId}')">
                                    View
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Global function for viewing patient
window.viewPatient = function(appointmentId, userId) {
    Router.navigate('/clinic/patient', { appointmentId, userId });
};

// Shared sidebar component
function getClinicSidebar(activePage) {
    return `
        <aside class="sidebar" id="clinic-sidebar">
            <div class="sidebar-brand">
                <h2>DAT</h2>
                <span>Clinic Portal</span>
            </div>
            <nav class="sidebar-nav">
                <a class="sidebar-item ${activePage === 'dashboard' ? 'active' : ''}" data-route="/clinic/dashboard">
                    <span class="material-icons-round">dashboard</span>
                    Dashboard
                </a>
                <a class="sidebar-item ${activePage === 'queue' ? 'active' : ''}" data-route="/clinic/queue">
                    <span class="material-icons-round">format_list_numbered</span>
                    Queue
                </a>
                <a class="sidebar-item ${activePage === 'analytics' ? 'active' : ''}" data-route="/clinic/analytics">
                    <span class="material-icons-round">analytics</span>
                    Analytics
                </a>
                <a class="sidebar-item ${activePage === 'records' ? 'active' : ''}" data-route="/clinic/records">
                    <span class="material-icons-round">folder_open</span>
                    Records
                </a>
                <a class="sidebar-item ${activePage === 'settings' ? 'active' : ''}" data-route="/clinic/settings">
                    <span class="material-icons-round">settings</span>
                    Settings
                </a>
            </nav>
            <div style="padding: 0 var(--space-md); margin-top: auto;">
                <a class="sidebar-item" id="clinic-logout" style="cursor: pointer;">
                    <span class="material-icons-round">logout</span>
                    Logout
                </a>
            </div>
        </aside>
    `;
}

// Make sidebar available globally
window.getClinicSidebar = getClinicSidebar;

// Clinic logout
document.addEventListener('click', (e) => {
    if (e.target.closest('#clinic-logout')) {
        AuthService.logout().then(() => Router.navigate('/login'));
    }
});
