/* ========================================
   FIREBASE SERVICE
   Digital Automatic Triage
   ======================================== */

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ---- Auth Service ----
const AuthService = {
    // Register new user
    async register(email, password, userData) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                email: email,
                role: userData.role || 'student',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                profile: {
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    studentId: userData.studentId || '',
                    section: userData.section || '',
                    bloodType: userData.bloodType || '',
                    allergies: userData.allergies || [],
                    emergencyContacts: userData.emergencyContacts || []
                },
                settings: {
                    notifications: true
                }
            });

            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Login
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Logout
    async logout() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Reset password
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    },

    // Get user data from Firestore
    async getUserData(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                return { success: true, data: { id: doc.id, ...doc.data() } };
            }
            return { success: false, error: 'User not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Listen for auth state changes
    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(callback);
    }
};

// ---- Symptom Log Service ----
const SymptomLogService = {
    // Create a new symptom log
    async create(logData) {
        try {
            const docRef = await db.collection('symptom_logs').add({
                userId: auth.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                symptoms: logData.symptoms || [],
                severityLevel: logData.severityLevel || 1,
                painScale: logData.painScale || 1,
                description: logData.description || '',
                triageResult: logData.triageResult || null,
                status: 'pending'
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get logs for current student
    async getMyLogs() {
        try {
            const snapshot = await db.collection('symptom_logs')
                .where('userId', '==', auth.currentUser.uid)
                .orderBy('timestamp', 'desc')
                .get();

            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data: logs };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get all logs (clinic staff)
    async getAll(filters = {}) {
        try {
            let query = db.collection('symptom_logs').orderBy('timestamp', 'desc');

            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            const snapshot = await query.get();
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data: logs };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Listen for real-time updates (clinic)
    onLogsUpdate(callback) {
        return db.collection('symptom_logs')
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(logs);
            });
    }
};

// ---- Appointment Service ----
const AppointmentService = {
    // Create appointment
    async create(appointmentData) {
        try {
            const docRef = await db.collection('appointments').add({
                userId: auth.currentUser.uid,
                symptomLogId: appointmentData.symptomLogId || '',
                date: appointmentData.date || firebase.firestore.FieldValue.serverTimestamp(),
                timeSlot: appointmentData.timeSlot || '',
                queueNumber: appointmentData.queueNumber || 0,
                estimatedTime: appointmentData.estimatedTime || '',
                type: appointmentData.type || 'manual',
                severity: appointmentData.severity || 'minor',
                status: 'waiting',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get today's queue (clinic)
    async getTodayQueue() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const snapshot = await db.collection('appointments')
                .where('date', '>=', today)
                .orderBy('date')
                .get();

            const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data: appointments };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update appointment status
    async updateStatus(appointmentId, status) {
        try {
            await db.collection('appointments').doc(appointmentId).update({ status });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get next queue number for today
    async getNextQueueNumber() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const snapshot = await db.collection('appointments')
                .where('date', '>=', today)
                .get();

            return snapshot.size + 1;
        } catch (error) {
            return 1;
        }
    },

    // Listen for real-time queue updates
    onQueueUpdate(callback) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return db.collection('appointments')
            .where('date', '>=', today)
            .orderBy('date')
            .onSnapshot(snapshot => {
                const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(appointments);
            });
    }
};

// ---- Consultation Service ----
const ConsultationService = {
    // Create consultation record
    async create(consultationData) {
        try {
            const docRef = await db.collection('consultations').add({
                appointmentId: consultationData.appointmentId,
                userId: consultationData.userId,
                clinicStaffId: auth.currentUser.uid,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                diagnosis: consultationData.diagnosis || '',
                prescriptions: consultationData.prescriptions || [],
                recommendations: consultationData.recommendations || '',
                notes: consultationData.notes || '',
                requiresFollowUp: consultationData.requiresFollowUp || false,
                followUpDate: consultationData.followUpDate || null,
                status: 'active'
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get consultations for a student
    async getByStudent(userId) {
        try {
            const snapshot = await db.collection('consultations')
                .where('userId', '==', userId)
                .orderBy('date', 'desc')
                .get();

            const consultations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data: consultations };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get my consultations (student)
    async getMine() {
        return this.getByStudent(auth.currentUser.uid);
    }
};

// ---- Emergency Service ----
const EmergencyService = {
    // Trigger emergency alert
    async triggerAlert(locationData = {}) {
        try {
            const userData = await AuthService.getUserData(auth.currentUser.uid);
            const profile = userData.data?.profile || {};

            const docRef = await db.collection('emergencies').add({
                userId: auth.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                location: {
                    building: locationData.building || '',
                    floor: locationData.floor || ''
                },
                studentInfo: {
                    name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                    section: profile.section || '',
                    studentId: profile.studentId || ''
                },
                status: 'active',
                respondedBy: null
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Listen for active emergencies (clinic)
    onEmergencyAlert(callback) {
        return db.collection('emergencies')
            .where('status', '==', 'active')
            .onSnapshot(snapshot => {
                const emergencies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(emergencies);
            });
    },

    // Respond to emergency
    async respond(emergencyId) {
        try {
            await db.collection('emergencies').doc(emergencyId).update({
                status: 'responding',
                respondedBy: auth.currentUser.uid
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Resolve emergency
    async resolve(emergencyId) {
        try {
            await db.collection('emergencies').doc(emergencyId).update({
                status: 'resolved'
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ---- Follow-up Service ----
const FollowUpService = {
    // Create follow-up
    async create(followUpData) {
        try {
            const docRef = await db.collection('follow_ups').add({
                consultationId: followUpData.consultationId,
                userId: followUpData.userId || auth.currentUser.uid,
                scheduledDate: followUpData.scheduledDate,
                status: 'scheduled',
                recoverySurvey: {
                    completed: false,
                    feelingScale: 0,
                    symptomsResolved: false,
                    additionalNotes: ''
                },
                needsAnotherFollowUp: false
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Submit recovery survey
    async submitSurvey(followUpId, surveyData) {
        try {
            await db.collection('follow_ups').doc(followUpId).update({
                recoverySurvey: {
                    completed: true,
                    feelingScale: surveyData.feelingScale,
                    symptomsResolved: surveyData.symptomsResolved,
                    additionalNotes: surveyData.additionalNotes || ''
                },
                needsAnotherFollowUp: surveyData.needsFollowUp || false
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get follow-ups for student
    async getMyFollowUps() {
        try {
            const snapshot = await db.collection('follow_ups')
                .where('userId', '==', auth.currentUser.uid)
                .orderBy('scheduledDate', 'desc')
                .get();

            const followUps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data: followUps };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};
