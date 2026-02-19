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

                <!-- Recovery Follow-up Requests -->
                <h2 style="margin-top: 32px; margin-bottom: 16px;">
                    <span class="material-icons-round" style="vertical-align:middle; color:var(--color-moderate);">healing</span>
                    Recovery Follow-up Requests
                </h2>
                <div id="followup-list">
                    <div style="text-align: center; padding: 24px;">
                        <div class="spinner" style="margin: 0 auto;"></div>
                    </div>
                </div>

                <!-- Recovery Trend Analytics -->
                <h2 style="margin-top: 32px; margin-bottom: 16px;">
                    <span class="material-icons-round" style="vertical-align:middle; color:var(--color-primary);">insights</span>
                    Recovery Outcomes
                </h2>
                <div id="recovery-trends" class="card card--elevated" style="padding: var(--space-lg);">
                    <div style="text-align: center; padding: 24px;">
                        <div class="spinner" style="margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Listen for real-time queue updates
    AppointmentService.onQueueUpdate(async (appointments) => {
        updateStats(appointments);
        await renderQueueList(appointments);
    });

    // Load follow-up requests
    loadFollowUps();

    // Load recovery trend analytics
    loadRecoveryTrends();

    // Listen for emergency alerts
    EmergencyService.onEmergencyAlert((emergencies) => {
        const banner = document.getElementById('emergency-banner');
        if (emergencies.length > 0) {
            const latest = emergencies[0];
            banner.classList.remove('hidden');
            document.getElementById('emergency-student-info').innerHTML =
                `<b>${latest.studentInfo?.name || 'Unknown'}</b> &nbsp;|&nbsp; ${latest.studentInfo?.section || 'N/A'}` +
                (latest.location?.building ? ` &nbsp;|&nbsp; 📍 ${latest.location.building}` : '') +
                (latest.location?.room ? ` — ${latest.location.room}` : '');

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

async function renderQueueList(appointments) {
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

    // Batch-load student names
    const userIds = [...new Set(active.map(a => a.userId).filter(Boolean))];
    let userMap = {};
    if (userIds.length > 0) {
        const usersResult = await AuthService.getUsersByIds(userIds);
        if (usersResult.success) userMap = usersResult.data;
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
                    const user = userMap[appointment.userId];
                    const profile = user?.profile || {};
                    const name = profile.firstName
                        ? `${profile.firstName} ${profile.lastName || ''}`.trim()
                        : appointment.userId || 'Unknown';
                    const section = profile.section ? ` — ${profile.section}` : '';

                    return `
                        <tr>
                            <td><strong>${appointment.queueNumber || '-'}</strong></td>
                            <td>
                                <span class="badge badge--${appointment.severity === 'emergency' || appointment.severity === 'severe' ? 'emergency' : appointment.severity === 'moderate' ? 'waiting' : 'completed'}">
                                    ${(appointment.severity || 'minor').toUpperCase()}
                                </span>
                            </td>
                            <td>
                                <div style="font-weight:600;">${name}</div>
                                <div style="font-size:0.8rem; color:var(--color-text-hint);">${section}</div>
                            </td>
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

async function loadFollowUps() {
    const list = document.getElementById('followup-list');
    if (!list) return;

    const result = await FollowUpService.getAllForClinic();
    const followUps = result.success ? result.data.filter(f => f.status === 'scheduled') : [];

    if (followUps.length === 0) {
        list.innerHTML = `
            <div style="color: var(--color-text-hint); padding: 16px 0; font-size: var(--font-size-sm);">
                No pending follow-up requests.
            </div>`;
        return;
    }

    // Batch-load student names
    const userIds = [...new Set(followUps.map(f => f.userId).filter(Boolean))];
    let userMap = {};
    if (userIds.length > 0) {
        const usersResult = await AuthService.getUsersByIds(userIds);
        if (usersResult.success) userMap = usersResult.data;
    }

    const FEELING_EMOJI = { 1: '😞 Worse', 2: '😕 Poor', 3: '😐 Same', 4: '🙂 Better', 5: '😄 Recovered' };

    list.innerHTML = followUps.map(f => {
        const user = userMap[f.userId];
        const profile = user?.profile || {};
        const name = profile.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : f.userId;
        const section = profile.section || '';
        const feeling = FEELING_EMOJI[f.feelingScale] || '—';
        const note = f.studentNote || '';
        const scheduled = Utils.formatDate(f.scheduledDate);

        return `
            <div class="card card--bordered" style="margin-bottom: 12px; padding: 16px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
                    <div>
                        <div style="font-weight:700; font-size:var(--font-size-base);">${name}</div>
                        ${section ? `<div style="font-size:var(--font-size-sm); color:var(--color-text-hint);">${section}</div>` : ''}
                        <div style="margin-top:6px; font-size:var(--font-size-sm);">
                            <span style="font-weight:600;">Feeling:</span> ${feeling}
                        </div>
                        ${note ? `<div style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-top:4px;">
                            <span class="material-icons-round" style="font-size:14px; vertical-align:middle;">notes</span>
                            "${note}"
                        </div>` : ''}
                        <div style="font-size:var(--font-size-xs); color:var(--color-text-hint); margin-top:4px;">
                            Requested for: ${scheduled}
                        </div>
                    </div>
                    <button class="btn btn--primary btn--sm" onclick="confirmFollowUp('${f.id}', '${f.userId}')">
                        ✅ Confirm
                    </button>
                </div>
            </div>`;
    }).join('');
}

window.confirmFollowUp = async function(followUpId, userId) {
    Utils.showLoading();
    await FollowUpService.confirm(followUpId);
    Utils.hideLoading();
    Utils.showToast('Follow-up confirmed! Student will be notified.', 'success');
    loadFollowUps();
};

// ---- Recovery Trend Analytics ----
async function loadRecoveryTrends() {
    const container = document.getElementById('recovery-trends');
    if (!container) return;

    try {
        const result = await ConsultationService.getAllForClinic(500);
        const consultations = result.success ? result.data : [];

        if (consultations.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-hint);">No consultation data yet</p>';
            return;
        }

        // Aggregate recovery outcomes
        let total = consultations.length;
        let recovered = 0, worsened = 0, pending = 0, withFollowUp = 0;
        const feelingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        consultations.forEach(c => {
            if (c.status === 'completed') recovered++;
            else pending++;
            if (c.requiresFollowUp) withFollowUp++;

            const survey = c.recoverySurvey;
            if (survey && survey.feelingScale) {
                const scale = survey.feelingScale;
                feelingCounts[scale] = (feelingCounts[scale] || 0) + 1;
                if (scale === 1) worsened++;
            }
        });

        const recoveredPct = total > 0 ? Math.round((recovered / total) * 100) : 0;
        const worsenedPct = total > 0 ? Math.round((worsened / total) * 100) : 0;
        const followUpPct = total > 0 ? Math.round((withFollowUp / total) * 100) : 0;

        const feelingLabels = { 1: 'Much Worse', 2: 'Poor', 3: 'Same', 4: 'Better', 5: 'Recovered' };
        const feelingColors = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#3b82f6', 5: '#22c55e' };

        // Find max feeling count for bar scaling
        const maxFeeling = Math.max(...Object.values(feelingCounts), 1);

        container.innerHTML = `
            <!-- Summary Stats -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 12px; background: var(--color-background); border-radius: var(--radius-md);">
                    <div style="font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-normal);">${recoveredPct}%</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Completed</div>
                </div>
                <div style="text-align: center; padding: 12px; background: var(--color-background); border-radius: var(--radius-md);">
                    <div style="font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-emergency);">${worsenedPct}%</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Worsened</div>
                </div>
                <div style="text-align: center; padding: 12px; background: var(--color-background); border-radius: var(--radius-md);">
                    <div style="font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-moderate);">${followUpPct}%</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Need Follow-up</div>
                </div>
                <div style="text-align: center; padding: 12px; background: var(--color-background); border-radius: var(--radius-md);">
                    <div style="font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-text-primary);">${total}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Total Cases</div>
                </div>
            </div>

            <!-- Feeling Distribution Bar Chart -->
            <h4 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-secondary); margin-bottom: 12px;">
                Recovery Survey Responses
            </h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${[5, 4, 3, 2, 1].map(level => {
                    const count = feelingCounts[level] || 0;
                    const pct = maxFeeling > 0 ? (count / maxFeeling) * 100 : 0;
                    return `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 80px; font-size: var(--font-size-xs); font-weight: 600; color: ${feelingColors[level]}; text-align: right; flex-shrink: 0;">
                            ${feelingLabels[level]}
                        </div>
                        <div style="flex: 1; height: 24px; background: var(--color-background); border-radius: var(--radius-full); overflow: hidden;">
                            <div style="height: 100%; width: ${pct}%; background: ${feelingColors[level]}; border-radius: var(--radius-full); transition: width 0.4s ease; min-width: ${count > 0 ? '4px' : '0'};"></div>
                        </div>
                        <div style="width: 30px; font-size: var(--font-size-xs); color: var(--color-text-hint); text-align: right;">
                            ${count}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
    } catch (e) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-hint);">Failed to load trends</p>';
    }
}

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
                <a class="sidebar-item ${activePage === 'notifications' ? 'active' : ''}" data-route="/clinic/notifications" style="position: relative;">
                    <span class="material-icons-round">notifications</span>
                    Notifications
                    <span id="clinic-notif-badge" class="clinic-notif-badge hidden"></span>
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
        <!-- Mobile top bar -->
        <div class="clinic-mobile-topbar" id="clinic-mobile-topbar">
            <button class="clinic-hamburger" id="clinic-hamburger" aria-label="Open menu">
                <span class="material-icons-round">menu</span>
            </button>
            <div class="clinic-mobile-brand">
                <strong>DAT</strong> <span style="color: var(--color-text-hint); font-size: var(--font-size-sm);">Clinic Portal</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <a data-route="/clinic/notifications" style="position: relative; cursor: pointer;">
                    <span class="material-icons-round" style="font-size: 24px; color: var(--color-text-secondary);">notifications</span>
                    <span id="clinic-notif-badge-mobile" class="clinic-notif-badge-mobile hidden"></span>
                </a>
            </div>
        </div>
        <!-- Mobile overlay -->
        <div class="sidebar-overlay hidden" id="sidebar-overlay"></div>
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

// Hamburger toggle for mobile sidebar
document.addEventListener('click', (e) => {
    if (e.target.closest('#clinic-hamburger')) {
        const sidebar = document.getElementById('clinic-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('hidden');
    }
    if (e.target.closest('#sidebar-overlay')) {
        const sidebar = document.getElementById('clinic-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.add('hidden');
    }
    // Close sidebar on nav item click (mobile)
    if (e.target.closest('.sidebar-item') && window.innerWidth <= 768) {
        const sidebar = document.getElementById('clinic-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.add('hidden');
    }
});

// Load clinic notification badge
async function loadClinicNotifBadge() {
    try {
        const count = await NotificationService.getUnreadCount();
        ['clinic-notif-badge', 'clinic-notif-badge-mobile'].forEach(id => {
            const badge = document.getElementById(id);
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 9 ? '9+' : count;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        });
    } catch (e) {}
}
// Auto-refresh badge when page loads
setTimeout(loadClinicNotifBadge, 1000);

