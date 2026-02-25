<div align="center">
  <img src="assets/icons/SCT LOGO.png" alt="SCT Logo" width="100" />

  # Digital Automatic Triage (DAT)

  **Student Wellness Monitoring and Automatic Triage System**

  *Sienna College of Taytay — School Clinic Portal*

  [![Live App](https://img.shields.io/badge/Live%20App-digital--automatic--triage.web.app-a31d32?style=for-the-badge&logo=firebase)](https://digital-automatic-triage.web.app)
  [![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
  [![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa)](https://digital-automatic-triage.web.app)

</div>

---

## 📖 Overview

**Digital Automatic Triage (DAT)** is a Progressive Web App developed for the school clinic of **Sienna College of Taytay**. It addresses the common problem of clinic manpower shortage by automating simple triage — filtering minor cases automatically while ensuring severe and emergency cases receive immediate attention.

Students can log symptoms from any device, receive instant triage results, and book appointments automatically. Clinic staff get a real-time dashboard, queue management system, and emergency alert notifications — all without installing a native app.

---

## ✨ Features

### 🎒 Student Side

| Feature | Description |
|---|---|
| **Symptom Logging** | Log current symptoms with a 5-level severity selector, pain scale (1–10), and free-text description |
| **Automatic Triage** | Real-time severity scoring algorithm assigns a category (Minor / Moderate / Severe / Emergency) |
| **Auto & Manual Booking** | Severe/Emergency cases are automatically booked; mild cases can self-schedule |
| **Triage Result View** | Clear recommendations, prescription suggestions, and appointment details |
| **Consultation History** | View all past symptom logs, triage results, and consultation records |
| **Post-Consultation Checklist** | See clinic-provided prescriptions, diagnoses, and recovery instructions |
| **Recovery Follow-up** | Complete recovery surveys, track healing progress, and request re-scheduling |
| **SCT 911 Emergency** | One-tap SOS button sends a real-time alert to all clinic staff with student name, location, and section |
| **In-App Notifications** | Receive updates when clinic responds to SOS, appointment status changes, or follow-ups are due |
| **Symptom Trend Chart** | Visual chart of recent symptom history on the home screen |

### 🏥 Clinic Staff Side

| Feature | Description |
|---|---|
| **Live Dashboard** | Real-time queue stats: Waiting, In Progress, Completed, Emergency counts |
| **Queue Management** | Full patient queue sorted by severity, with status controls (In Progress → Completed) |
| **Emergency Alert Overlay** | Full-screen alarm overlay with student info, location, and RESPOND / RESOLVE buttons |
| **Respond & Resolve Flow** | RESPOND notifies the student that help is on the way; RESOLVE stops the alarm |
| **Patient Records** | Browse all consultation history and symptom logs per student |
| **Consultation Form** | Add diagnosis, prescriptions, follow-up schedules, and recovery notes |
| **Analytics** | Daily/weekly/monthly symptom trend charts and section-level breakdowns |
| **Follow-up Management** | View and manage recovery follow-up requests from students |
| **Notifications Panel** | Aggregated notification feed for appointments, follow-ups, and emergencies |
| **Settings** | Clinic profile, notification preferences, dark mode |

---

## 🚨 SCT 911 Emergency Flow

```
Student presses SOS
       │
       ▼
Confirmation dialog (building + room populated from profile)
       │
       ▼
Emergency document created in Firestore (status: "active")
       │
       ▼
Clinic staff see full-screen alarm overlay with student info
       │
       ├── RESPOND → status: "responding"
       │              Student receives notification: "Clinic is On the Way!"
       │              Alarm stays visible, RESPOND button disabled
       │
       └── RESOLVE → status: "resolved"
                      Alarm overlay dismissed, alarm sound stops
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| **Routing** | Custom client-side SPA router |
| **Backend / Database** | Firebase Firestore (NoSQL, real-time) |
| **Authentication** | Firebase Auth (email/password) |
| **Hosting** | Firebase Hosting |
| **Offline Support** | Service Worker + Cache API (PWA) |
| **Charts** | Custom HTML/CSS bar charts (no external library) |
| **Icons** | Google Material Icons Round |
| **Fonts** | Inter (Google Fonts) |

---

## 🗂️ Project Structure

```
digital-automatic-triage/
│
├── index.html                  # SPA entry point
├── manifest.json               # PWA manifest
├── service-worker.js           # Offline caching
├── offline.html                # Offline fallback page
├── firebase.json               # Firebase project config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
│
├── css/
│   ├── variables.css           # Design tokens (colors, spacing, typography)
│   ├── main.css                # Global layout & reset
│   ├── components.css          # Reusable UI components
│   ├── student.css             # Student-specific styles
│   └── clinic.css              # Clinic-specific styles
│
├── js/
│   ├── app.js                  # Route registration, global emergency listener, triage engine
│   ├── router.js               # Client-side hash/history router
│   ├── auth.js                 # Auth state helpers
│   └── firebase-service.js     # All Firestore + Auth service methods
│
├── pages/
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── register-staff.js
│   │   └── forgot-password.js
│   │
│   ├── student/
│   │   ├── home.js             # Symptom logging + SOS button
│   │   ├── triage-result.js    # Triage result & booking confirmation
│   │   ├── history.js          # Past consultations & symptom logs
│   │   ├── recovery.js         # Follow-up recovery survey
│   │   ├── profile.js          # Student profile management
│   │   └── notifications.js    # In-app notification feed
│   │
│   └── clinic/
│       ├── dashboard.js        # Live queue dashboard
│       ├── queue.js            # Full queue management
│       ├── analytics.js        # Symptom trend analytics
│       ├── patient-view.js     # Individual patient records
│       ├── consultation-form.js# Post-consultation input form
│       ├── records.js          # All patient records
│       ├── notifications.js    # Clinic notification feed
│       └── settings.js         # Clinic settings & dark mode
│
└── assets/
    ├── icons/
    │   ├── SCT LOGO.png        # School logo (favicon + UI)
    │   └── icon-*.png          # PWA icons (72–512px)
    └── sounds/
        └── emergency-alert.mp3 # Emergency alarm audio
```

---

## 🔥 Firestore Data Model

```
firestore/
│
├── users/{userId}
│   ├── role: "student" | "clinic_staff" | "admin"
│   ├── profile: { firstName, lastName, studentId, section, building, room, ... }
│   └── settings: { notifications: boolean }
│
├── symptom_logs/{logId}
│   ├── userId, timestamp, symptoms[], severityLevel (1–5), painScale (1–10)
│   ├── triageResult: { category, recommendations[], autoBooking }
│   └── status: "pending" | "reviewed" | "completed"
│
├── appointments/{appointmentId}
│   ├── userId, symptomLogId, date, queueNumber
│   ├── type: "manual" | "auto" | "follow_up"
│   ├── severity: "minor" | "moderate" | "severe" | "emergency"
│   └── status: "waiting" | "in_progress" | "completed" | "cancelled"
│
├── consultations/{consultationId}
│   ├── appointmentId, userId, clinicStaffId
│   ├── diagnosis, prescriptions[], recommendations, notes
│   └── requiresFollowUp: boolean
│
├── follow_ups/{followUpId}
│   ├── consultationId, userId, scheduledDate
│   ├── recoverySurvey: { completed, feelingScale, symptomsResolved, notes }
│   └── needsAnotherFollowUp: boolean
│
├── emergencies/{emergencyId}
│   ├── userId, timestamp
│   ├── location: { building, room }
│   ├── studentInfo: { name, section, studentId }
│   ├── status: "active" | "responding" | "resolved"
│   └── respondedBy: string (staff uid)
│
└── notifications/{notifId}
    ├── type, title, message, severity
    ├── targetUserId | targetRole
    └── read: boolean
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- A Firebase project with **Firestore** and **Authentication** enabled

### Clone & Configure

```bash
# 1. Clone the repository
git clone https://github.com/Zserepf/digital-automatic-triage.git
cd digital-automatic-triage

# 2. Log in to Firebase
firebase login

# 3. Link to your Firebase project
firebase use --add

# 4. Update Firebase config in js/firebase-service.js
#    Replace the firebaseConfig object with your own project credentials
```

### Local Development

```bash
firebase serve
```

Open `http://localhost:5000` in your browser.

### Deploy to Firebase Hosting

```bash
firebase deploy
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Student** | Symptom logging, triage results, appointments, history, recovery, SOS |
| **Clinic Staff** | Dashboard, queue, records, consultation form, analytics, emergency alerts |
| **Admin** | All clinic features + settings management |

---

## 🎨 Design System

### Brand Colors

| Variable | Value | Usage |
|---|---|---|
| `--color-primary` | `#a31d32` | Buttons, sidebar active, headers |
| `--color-primary-dark` | `#7d1526` | Hover states |
| `--color-primary-light` | `#fce8eb` | Active backgrounds, tints |
| `--color-gold` | `#f6d118` | Brand accent |
| `--color-background` | `#f5f5f5` | Page background (light gray) |

### Severity Colors

| Level | Label | Color |
|---|---|---|
| 1 — Normal | Recovered / Feeling fine | `#4CAF50` Green |
| 2 — Mild | Minor discomfort | `#8BC34A` Light Green |
| 3 — Moderate | Pain, needs meds | `#FFC107` Amber |
| 4 — Severe | Hard to function | `#FF9800` Orange |
| 5 — Emergency | Needs doctor now | `#F44336` Red |

---

## 🔒 Security

- Firestore security rules enforce role-based access on all collections
- Students can only read/write their own documents
- Clinic staff can read all patient data but cannot modify student profiles
- Emergency and notification creation is restricted to authenticated users only
- Passwords handled entirely by Firebase Auth (never stored in Firestore)

---

## 📱 PWA Support

- Installable on Android and iOS home screens
- Offline fallback page when network is unavailable
- Service worker caches all static assets
- App manifest includes SCT logo icons and maroon theme color

---

## 🏫 About

Developed for the **School Clinic of St. Louis de Montfort College (SCT)** as a capstone project to modernize student health monitoring and automate frontline triage, reducing the burden on clinic staff while improving response time for emergencies.

---

<div align="center">
  <sub>Built with ❤️ for St. Louis de Montfort College</sub>
</div>


## License
This project is for educational purposes.
