/* ========================================
   FIREBASE SERVICE
   Digital Automatic Triage
   ======================================== */

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyC0Mk_1If9x626enssfzCM90zc6iRrxWFE",
  authDomain: "digital-automatic-triage.firebaseapp.com",
  projectId: "digital-automatic-triage",
  storageBucket: "digital-automatic-triage.firebasestorage.app",
  messagingSenderId: "954679504143",
  appId: "1:954679504143:web:d01b73585eacf9d167e27a"
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
                    building: userData.building || '',
                    room: userData.room || '',
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

    // Batch get multiple users by UIDs (returns a map: uid → userData)
    async getUsersByIds(uids) {
        try {
            const uniqueIds = [...new Set(uids)].filter(Boolean);
            if (uniqueIds.length === 0) return {};
            const promises = uniqueIds.map(uid => db.collection('users').doc(uid).get());
            const docs = await Promise.all(promises);
            const map = {};
            docs.forEach(doc => {
                if (doc.exists) map[doc.id] = { id: doc.id, ...doc.data() };
            });
            return map;
        } catch (error) {
            return {};
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

    // Get logs for a specific user (clinic use)
    async getByUserId(userId) {
        try {
            const snapshot = await db.collection('symptom_logs')
                .where('userId', '==', userId)
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
    },

    // Get my appointments (student)
    async getMine() {
        try {
            const snapshot = await db.collection('appointments')
                .where('userId', '==', auth.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();
            const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data: appointments };
        } catch (error) {
            return { success: false, error: error.message };
        }
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
    },

    // Get ALL consultations for clinic staff (with optional limit)
    async getAllForClinic(limitCount = 100) {
        try {
            const snapshot = await db.collection('consultations')
                .orderBy('date', 'desc')
                .limit(limitCount)
                .get();
            const consultations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data: consultations };
        } catch (error) {
            return { success: false, error: error.message };
        }
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
                    building: locationData.building || profile.building || '',
                    room: locationData.room || profile.room || ''
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

// ---- Sections Service ----
const SectionsService = {
    // Master list — source of truth for seeding and fallback
    MASTER: [
        // St. Catherine Building
        { building: 'St. Catherine Building', room: 'Room 201', section: 'Grade 1 Joy' },
        { building: 'St. Catherine Building', room: 'Room 202', section: 'Grade 1 Peace' },
        { building: 'St. Catherine Building', room: 'Room 203', section: 'Grade 1 Piety' },
        { building: 'St. Catherine Building', room: 'Room 204', section: 'Grade 2 Humility' },
        { building: 'St. Catherine Building', room: 'Room 207', section: 'Grade 2 Kindness' },
        { building: 'St. Catherine Building', room: 'Room 208', section: 'Grade 2 Obedience' },
        { building: 'St. Catherine Building', room: 'Room 209', section: 'Grade 3 Gratitude' },
        { building: 'St. Catherine Building', room: 'Room 307', section: 'Grade 3 Honesty' },
        { building: 'St. Catherine Building', room: 'Room 308', section: 'Grade 3 Wisdom' },
        { building: 'St. Catherine Building', room: 'Room 303', section: 'Grade 4 Fortitude' },
        { building: 'St. Catherine Building', room: 'Room 305', section: 'Grade 4 Justice' },
        { building: 'St. Catherine Building', room: 'Room 304', section: 'Grade 4 Prudence' },
        { building: 'St. Catherine Building', room: 'Room 401', section: 'Grade 5 Modesty' },
        { building: 'St. Catherine Building', room: 'Room 302', section: 'Grade 5 Patience' },
        { building: 'St. Catherine Building', room: 'Room 301', section: 'Grade 5 Providence' },
        { building: 'St. Catherine Building', room: 'Room 404', section: 'Grade 6 Courage' },
        { building: 'St. Catherine Building', room: 'Room 402', section: 'Grade 6 Determination' },
        { building: 'St. Catherine Building', room: 'Room 403', section: 'Grade 6 Perseverance' },
        { building: 'St. Catherine Building', room: 'Room 501', section: 'Gr. 11 St. Albert the Great (STEM)' },
        { building: 'St. Catherine Building', room: 'Room 502', section: 'Gr. 11 St. Catherine of Siena (STEM)' },
        { building: 'St. Catherine Building', room: 'Room 503', section: 'Gr. 11 St. Dominic de Guzman (STEM)' },
        { building: 'St. Catherine Building', room: 'Room 504', section: 'Gr. 11 St. Martin de Porres (STEM)' },
        { building: 'St. Catherine Building', room: 'Room 505', section: 'Gr. 11 St. Thomas Aquinas (STEM)' },
        { building: 'St. Catherine Building', room: 'Room 506', section: 'Gr. 11 St. Francis de Capillas (STEM)' },
        // St. Dominic Building
        { building: 'St. Dominic Building', room: 'Room 404', section: 'Grade 7 Compassionate Christian' },
        { building: 'St. Dominic Building', room: 'Room 405', section: 'Grade 7 Marian Devotee' },
        { building: 'St. Dominic Building', room: 'Room 403', section: 'Grade 7 Research Motivated' },
        { building: 'St. Dominic Building', room: 'Room 406', section: 'Grade 7 Service Oriented' },
        { building: 'St. Dominic Building', room: 'Room 407', section: 'Grade 7 Truth Seeker' },
        { building: 'St. Dominic Building', room: 'Room 402', section: 'Grade 7 Proud Global Pinoy' },
        { building: 'St. Dominic Building', room: 'Room 401', section: 'Grade 8 Family Oriented' },
        { building: 'St. Dominic Building', room: 'Room 408', section: 'Grade 8 Music Enthusiast' },
        { building: 'St. Dominic Building', room: 'Room 409', section: 'Grade 8 Pro-Life Advocate' },
        { building: 'St. Dominic Building', room: 'Room 410', section: 'Grade 8 Stewards of God\'s Creation' },
        { building: 'St. Dominic Building', room: 'Room 415', section: 'Grade 8 Technology Competent' },
        { building: 'St. Dominic Building', room: 'Room 412', section: 'Grade 9 Self Smart' },
        { building: 'St. Dominic Building', room: 'Room 512', section: 'Grade 9 Body Smart A' },
        { building: 'St. Dominic Building', room: 'Room 511', section: 'Grade 9 Body Smart B' },
        { building: 'St. Dominic Building', room: 'Room 414', section: 'Grade 9 Creative Learner' },
        { building: 'St. Dominic Building', room: 'Room 413', section: 'Grade 9 Gospel Preacher' },
        { building: 'St. Dominic Building', room: 'Room 411', section: 'Grade 9 People Smart' },
        { building: 'St. Dominic Building', room: 'Room 313', section: 'Grade 10 Eucharist Centered' },
        { building: 'St. Dominic Building', room: 'Room 314', section: 'Grade 10 Good Samaritan' },
        { building: 'St. Dominic Building', room: 'Room 312', section: 'Grade 10 Lifelong Learner' },
        { building: 'St. Dominic Building', room: 'Room 311', section: 'Grade 10 Mission Oriented' },
        { building: 'St. Dominic Building', room: 'Room 202', section: 'Grade 10 Integrity' },
        { building: 'St. Dominic Building', room: 'Room 501', section: 'Gr. 11 St. Lorenzo Ruiz (ABM)' },
        { building: 'St. Dominic Building', room: 'Room 503', section: 'Gr. 11 St. Rose of Lima (ABM)' },
        { building: 'St. Dominic Building', room: 'Room 504', section: 'Gr. 11 St. Margaret of Hungary (HUMSS)' },
        { building: 'St. Dominic Building', room: 'Room 505', section: 'Gr. 11 St. John Macias (HUMSS)' },
        { building: 'St. Dominic Building', room: 'Room 507', section: 'Gr. 11 St. Pius V Culinary (TVL)' },
        { building: 'St. Dominic Building', room: 'Room 506', section: 'Gr. 11 St. Louis de Montfort Travel Services (TVL)' },
        // St. Thomas Building
        { building: 'St. Thomas Building', room: 'Room 403', section: 'Grade 12 STEM 1' },
        { building: 'St. Thomas Building', room: 'Room 501', section: 'Grade 12 STEM 2' },
        { building: 'St. Thomas Building', room: 'Room 502', section: 'Grade 12 STEM 3' },
        { building: 'St. Thomas Building', room: 'Room 503', section: 'Grade 12 STEM 4' },
        { building: 'St. Thomas Building', room: 'Room 505', section: 'Grade 12 STEM 5' },
        { building: 'St. Thomas Building', room: 'Room 504', section: 'Grade 12 ABM 1' },
        { building: 'St. Thomas Building', room: 'Room 301', section: 'Grade 12 HUMMS 1' },
        { building: 'St. Thomas Building', room: 'Room 506', section: 'Grade 12 HUMMS 2' },
        { building: 'St. Thomas Building', room: 'Room 401', section: 'Grade 12 Travel Services 1' },
        { building: 'St. Thomas Building', room: 'Room 402', section: 'Grade 12 Culinary 1' }
    ],

    // Seed Firestore with all sections (idempotent — skips if already seeded)
    async seed() {
        try {
            const snapshot = await db.collection('sections').limit(1).get();
            if (!snapshot.empty) return { success: true, skipped: true };

            const batch = db.batch();
            this.MASTER.forEach((s, i) => {
                const ref = db.collection('sections').doc();
                batch.set(ref, { ...s, order: i });
            });
            await batch.commit();
            return { success: true, seeded: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Fetch all sections from Firestore, grouped by building
    async getAll() {
        try {
            const snapshot = await db.collection('sections').orderBy('order').get();
            if (snapshot.empty) {
                // Fallback to master list if DB has nothing yet
                return { success: true, data: this.MASTER };
            }
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data };
        } catch (error) {
            // Always fall back to master list on error
            return { success: true, data: this.MASTER };
        }
    }
};
