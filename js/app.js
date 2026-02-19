/* ========================================
   MAIN APP - Route Registration & Init
   Digital Automatic Triage
   ======================================== */

// ---- Utility Functions ----
const Utils = {
    // Show toast notification
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Format date
    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    // Format time
    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    },

    // Get severity label
    getSeverityLabel(level) {
        const labels = {
            1: 'I feel normal / recovered.',
            2: 'Mild discomfort.',
            3: 'Moderate pain… I need meds.',
            4: 'Severe. Hard to focus.',
            5: 'Emergency. I need a doctor now.'
        };
        return labels[level] || '';
    },

    // Get severity color class
    getSeverityClass(level) {
        const classes = {
            1: 'normal',
            2: 'mild',
            3: 'moderate',
            4: 'severe',
            5: 'emergency'
        };
        return classes[level] || 'normal';
    },

    // Get status badge HTML
    getStatusBadge(status) {
        const badges = {
            'waiting': '<span class="badge badge--waiting">Waiting</span>',
            'in_progress': '<span class="badge badge--in-progress">In Progress</span>',
            'completed': '<span class="badge badge--completed">Completed</span>',
            'cancelled': '<span class="badge badge--cancelled">Cancelled</span>',
            'emergency': '<span class="badge badge--emergency">Emergency</span>',
            'active': '<span class="badge badge--emergency">Active</span>',
            'responding': '<span class="badge badge--in-progress">Responding</span>',
            'resolved': '<span class="badge badge--completed">Resolved</span>',
            'pending': '<span class="badge badge--waiting">Pending</span>',
            'reviewed': '<span class="badge badge--in-progress">Reviewed</span>',
            'scheduled': '<span class="badge badge--in-progress">Scheduled</span>'
        };
        return badges[status] || `<span class="badge">${status}</span>`;
    },

    // Show loading
    showLoading() {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.classList.remove('hidden');
    },

    // Hide loading
    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }
};

// ---- Triage Algorithm ----
const TriageAlgorithm = {
    symptomWeights: {
        // Level 1-2 (Minor)
        'tired': 1,
        'headache': 2,
        'runny nose': 1,
        'mild cough': 2,
        'sneezing': 1,
        'sore eyes': 2,
        'minor scratch': 1,

        // Level 3 (Moderate)
        'fever': 4,
        'vomiting': 4,
        'diarrhea': 4,
        'stomach pain': 3,
        'body ache': 3,
        'sore throat': 3,
        'dizziness': 3,
        'rash': 3,

        // Level 4-5 (Severe/Emergency)
        'chest pain': 8,
        'difficulty breathing': 9,
        'severe bleeding': 10,
        'unconscious': 10,
        'allergic reaction': 9,
        'seizure': 10,
        'severe burn': 8,
        'broken bone': 8,
        'high fever': 6
    },

    calculate(symptoms, painScale, severitySelection) {
        let score = 0;

        // Sum symptom weights
        symptoms.forEach(symptom => {
            const key = symptom.toLowerCase().trim();
            score += this.symptomWeights[key] || 2;
        });

        // Factor in pain scale
        score += painScale;

        // Factor in user severity selection
        score += severitySelection * 2;

        // Determine category
        if (score >= 25 || severitySelection === 5) {
            return {
                category: 'emergency',
                autoBooking: true,
                recommendations: [
                    'Please proceed to the clinic immediately.',
                    'An appointment has been automatically booked for you.',
                    'If you cannot move, use the SCT 911 emergency button.'
                ]
            };
        }
        if (score >= 15 || severitySelection === 4) {
            return {
                category: 'severe',
                autoBooking: true,
                recommendations: [
                    'Your symptoms require medical attention.',
                    'An appointment has been booked for you.',
                    'Please visit the clinic at the scheduled time.',
                    'Avoid strenuous activities until cleared by the nurse.'
                ]
            };
        }
        if (score >= 8 || severitySelection === 3) {
            return {
                category: 'moderate',
                autoBooking: false,
                recommendations: [
                    'Take the suggested over-the-counter medication.',
                    'Rest and drink plenty of fluids.',
                    'If symptoms persist or worsen, book an appointment.',
                    'Monitor your condition for the next few hours.'
                ]
            };
        }
        return {
            category: 'minor',
            autoBooking: false,
            recommendations: [
                'Your symptoms appear to be minor.',
                'Rest and stay hydrated.',
                'If symptoms worsen, log again or book an appointment.',
                'Continue monitoring your condition.'
            ]
        };
    }
};

// ---- Register Routes ----

// Auth pages
Router.register('/login', async (container) => {
    const { renderLoginPage } = await import('/pages/auth/login.js');
    renderLoginPage(container);
});

Router.register('/register', async (container) => {
    const { renderRegisterPage } = await import('/pages/auth/register.js');
    renderRegisterPage(container);
});

Router.register('/forgot-password', async (container) => {
    const { renderForgotPasswordPage } = await import('/pages/auth/forgot-password.js');
    renderForgotPasswordPage(container);
});

Router.register('/register-staff', async (container) => {
    const { renderRegisterStaffPage } = await import('/pages/auth/register-staff.js');
    renderRegisterStaffPage(container);
});

// Student pages
Router.register('/student/home', async (container) => {
    const { renderStudentHome } = await import('/pages/student/home.js');
    renderStudentHome(container);
});

Router.register('/student/triage-result', async (container, params) => {
    const { renderTriageResult } = await import('/pages/student/triage-result.js');
    renderTriageResult(container, params);
});

Router.register('/student/history', async (container) => {
    const { renderStudentHistory } = await import('/pages/student/history.js');
    renderStudentHistory(container);
});

Router.register('/student/recovery', async (container, params) => {
    const { renderStudentRecovery } = await import('/pages/student/recovery.js');
    renderStudentRecovery(container, params);
});

Router.register('/student/profile', async (container) => {
    const { renderStudentProfile } = await import('/pages/student/profile.js');
    renderStudentProfile(container);
});

Router.register('/student/notifications', async (container) => {
    const { renderStudentNotifications } = await import('/pages/student/notifications.js');
    renderStudentNotifications(container);
});

Router.register('/clinic/notifications', async (container) => {
    const { renderClinicNotifications } = await import('/pages/clinic/notifications.js');
    renderClinicNotifications(container);
});

// Clinic pages
Router.register('/clinic/dashboard', async (container) => {
    const { renderClinicDashboard } = await import('/pages/clinic/dashboard.js');
    renderClinicDashboard(container);
});

Router.register('/clinic/queue', async (container) => {
    const { renderClinicQueue } = await import('/pages/clinic/queue.js');
    renderClinicQueue(container);
});

Router.register('/clinic/analytics', async (container) => {
    const { renderClinicAnalytics } = await import('/pages/clinic/analytics.js');
    renderClinicAnalytics(container);
});

Router.register('/clinic/patient', async (container, params) => {
    const { renderPatientView } = await import('/pages/clinic/patient-view.js');
    renderPatientView(container, params);
});

Router.register('/clinic/consultation', async (container, params) => {
    const { renderConsultationForm } = await import('/pages/clinic/consultation-form.js');
    renderConsultationForm(container, params);
});

Router.register('/clinic/settings', async (container) => {
    const { renderClinicSettings } = await import('/pages/clinic/settings.js');
    renderClinicSettings(container);
});

Router.register('/clinic/records', async (container) => {
    const { renderClinicRecords } = await import('/pages/clinic/records.js');
    renderClinicRecords(container);
});

// Default route
Router.register('/', async (container) => {
    if (Auth.isAuthenticated()) {
        if (Auth.isStudent()) {
            Router.navigate('/student/home');
        } else {
            Router.navigate('/clinic/dashboard');
        }
    } else {
        Router.navigate('/login');
    }
});

// ---- Global Emergency Alert (Clinic Staff) ----
const GlobalEmergencyAlert = {
    _unsubscribe: null,
    _overlayEl: null,
    _audioCtx: null,
    _alarmInterval: null,

    init() {
        AuthService.onAuthStateChanged(async (user) => {
            if (user) {
                const result = await AuthService.getUserData(user.uid);
                const role = result.data?.role;
                if (role === 'clinic_staff' || role === 'admin') {
                    this._startListener();
                }
            } else {
                this._stopListener();
                this._removeOverlay();
            }
        });
    },

    _startListener() {
        if (this._unsubscribe) return; // already listening
        this._unsubscribe = EmergencyService.onEmergencyAlert((emergencies) => {
            const active = emergencies.filter(e => e.status === 'active' || e.status === 'responding');
            if (active.length > 0) {
                this._showOverlay(active);
            } else {
                this._removeOverlay();
            }
        });
    },

    _stopListener() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        clearInterval(this._alarmInterval);
    },

    _playAlarm() {
        try {
            if (!this._audioCtx) {
                this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = this._audioCtx;
            const now = ctx.currentTime;
            [0, 0.4, 0.8].forEach(offset => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(880, now + offset);
                osc.frequency.setValueAtTime(660, now + offset + 0.2);
                gain.gain.setValueAtTime(0.3, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);
                osc.start(now + offset);
                osc.stop(now + offset + 0.35);
            });
        } catch (_) {}
    },

    _showOverlay(emergencies) {
        this._removeOverlay(); // remove stale one first

        const overlay = document.createElement('div');
        overlay.id = 'global-emergency-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(200,0,0,0.96); z-index: 99999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 24px; box-sizing: border-box; overflow-y: auto;
            animation: emergencyPulse 0.8s infinite alternate;
        `;

        // Inject pulse keyframes if not already present
        if (!document.getElementById('emergency-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'emergency-pulse-style';
            style.textContent = `
                @keyframes emergencyPulse {
                    from { background: rgba(200,0,0,0.96); }
                    to   { background: rgba(255,30,30,1); }
                }
                @keyframes emergencyBounce {
                    0%,100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                .ems-card {
                    background: rgba(0,0,0,0.45);
                    border: 3px solid rgba(255,255,255,0.6);
                    border-radius: 16px;
                    padding: 20px 24px;
                    margin-bottom: 16px;
                    width: 100%;
                    max-width: 480px;
                    color: #fff;
                    text-align: left;
                }
                .ems-card h3 { margin: 0 0 6px; font-size: 1.25rem; }
                .ems-card .ems-loc { font-size: 1.05rem; font-weight: 700; margin: 6px 0; }
                .ems-card .ems-info { font-size: 0.88rem; opacity: 0.85; margin-bottom: 12px; }
                .ems-actions { display: flex; gap: 10px; }
                .ems-btn { flex: 1; padding: 11px; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: opacity .2s; }
                .ems-btn:hover { opacity: 0.85; }
                .ems-btn--respond { background: #fff; color: #c00; }
                .ems-btn--resolve { background: #1a1a2e; color: #fff; }
            `;
            document.head.appendChild(style);
        }

        let html = `
            <div style="text-align:center; color:#fff; margin-bottom:24px; max-width:480px; width:100%;">
                <div style="font-size:72px; animation: emergencyBounce 0.8s infinite;">🚨</div>
                <div style="font-size:2rem; font-weight:900; letter-spacing:2px; text-transform:uppercase; text-shadow:0 2px 8px rgba(0,0,0,0.5);">
                    EMERGENCY ALERT
                </div>
                <div style="font-size:1.05rem; opacity:0.9; margin-top:4px;">${emergencies.length} active alert${emergencies.length > 1 ? 's' : ''}</div>
            </div>
        `;

        emergencies.forEach(em => {
            const info = em.studentInfo || {};
            const loc = em.location || {};
            const name = info.name || 'Unknown Student';
            const section = info.section || 'N/A';
            const studentId = info.studentId || '';
            const building = loc.building || 'Unknown Building';
            const room = loc.room || 'Unknown Room';
            const ts = em.timestamp ? Utils.formatTime(em.timestamp) : '';
            const statusLabel = em.status === 'responding' ? '🟡 Responding' : '🔴 Active';

            html += `
                <div class="ems-card" data-id="${em.id}">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <h3>🧑‍🎓 ${name}</h3>
                        <span style="font-size:0.8rem; opacity:0.75;">${statusLabel}</span>
                    </div>
                    <div class="ems-loc">📍 ${building}<br>&nbsp;&nbsp;&nbsp;${room}</div>
                    <div class="ems-info">
                        Section: <b>${section}</b>${studentId ? ` &nbsp;|&nbsp; ID: <b>${studentId}</b>` : ''}
                        ${ts ? `&nbsp;|&nbsp; ${ts}` : ''}
                    </div>
                    <div class="ems-actions">
                        <button class="ems-btn ems-btn--respond" data-action="respond" data-id="${em.id}"
                            ${em.status === 'responding' ? 'disabled style="opacity:0.5;"' : ''}>
                            ✅ RESPOND
                        </button>
                        <button class="ems-btn ems-btn--resolve" data-action="resolve" data-id="${em.id}">
                            ✔ RESOLVE
                        </button>
                    </div>
                </div>
            `;
        });

        overlay.innerHTML = html;
        document.body.appendChild(overlay);
        this._overlayEl = overlay;

        // Play alarm
        this._playAlarm();
        clearInterval(this._alarmInterval);
        this._alarmInterval = setInterval(() => this._playAlarm(), 4000);

        // Button handlers
        overlay.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            btn.disabled = true;
            btn.style.opacity = '0.5';
            if (action === 'respond') {
                await EmergencyService.respond(id);
                Utils.showToast('Marked as responding.', 'info');
            } else if (action === 'resolve') {
                await EmergencyService.resolve(id);
                Utils.showToast('Emergency resolved.', 'success');
            }
        });
    },

    _removeOverlay() {
        clearInterval(this._alarmInterval);
        if (this._overlayEl) {
            this._overlayEl.remove();
            this._overlayEl = null;
        }
        const existing = document.getElementById('global-emergency-overlay');
        if (existing) existing.remove();
    }
};

// ---- Auto Follow-Up Reminder Check ----
async function checkFollowUpReminders() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;

        // Only for students
        const userData = await AuthService.getUserData(user.uid);
        if (userData.data?.role !== 'student') return;

        const result = await FollowUpService.getMyFollowUps();
        if (!result.success) return;

        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 3600000);
        const notifiedKey = `followup_notified_${user.uid}`;
        let notified = {};
        try { notified = JSON.parse(localStorage.getItem(notifiedKey) || '{}'); } catch (e) {}

        for (const fu of result.data) {
            if (fu.status === 'completed' || fu.status === 'cancelled') continue;
            if (notified[fu.id]) continue;

            const scheduled = fu.scheduledDate?.toDate ? fu.scheduledDate.toDate() : new Date(fu.scheduledDate);
            if (isNaN(scheduled.getTime())) continue;

            // If follow-up is within the next 24 hours
            if (scheduled > now && scheduled <= in24h) {
                await NotificationService.create({
                    type: 'follow_up_reminder',
                    title: 'Follow-Up Reminder',
                    message: `You have a follow-up appointment scheduled for ${Utils.formatDate(fu.scheduledDate)}. Don't forget to visit the clinic!`,
                    targetRole: 'student',
                    targetUserId: user.uid,
                    relatedId: fu.id,
                    severity: 'normal'
                });
                notified[fu.id] = true;
            }
        }

        localStorage.setItem(notifiedKey, JSON.stringify(notified));
    } catch (e) {}
}

// ---- Initialize App ----
document.addEventListener('DOMContentLoaded', () => {
    // Apply dark mode from localStorage
    if (localStorage.getItem('dat_dark_mode') === '1') {
        document.body.classList.add('dark-mode');
    }

    Auth.init();
    Router.init();
    GlobalEmergencyAlert.init();
    // Seed sections collection in Firestore (runs once, skips if already seeded)
    SectionsService.seed();

    // Check follow-up reminders after auth state settles
    setTimeout(checkFollowUpReminders, 3000);
});
