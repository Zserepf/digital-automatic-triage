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

// ---- Initialize App ----
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
    Router.init();
});
