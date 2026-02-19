# Student Wellness Monitoring and Automatic Triage App
## Progressive Web App Project Plan

---

## 📋 Project Overview

**Project Name:** Digital Automatic Triage (DAT)  
**Type:** Progressive Web App (PWA)  
**Backend:** Firebase (Firestore, Authentication, Cloud Functions, Hosting)  
**Frontend:** HTML, CSS, JavaScript (Vanilla)  
**Target Users:** Students & Clinic Staff  

### Mission Statement
To aid the school clinic with simple triaging by addressing the common issue of manpower shortage. This app bridges accessibility between students and the school's medical facilities, filtering minor cases automatically while ensuring severe cases receive immediate attention.

---

## 🎯 Core Features Summary

| # | Feature | Student Side | Clinic Side |
|---|---------|--------------|-------------|
| 1 | Symptom Logging | Log symptoms online | Analytics dashboard (daily/weekly/monthly) |
| 2 | Triage & Scheduling | View triage result, Manual/Auto booking | Sorted schedule logs by severity |
| 3 | Post-Consultation Checklist | View prescriptions, notes, follow-ups | Provide medical prescriptions via form |
| 4 | Follow-up Checkup | Auto/manual scheduling, Recovery survey | Manage follow-up slots, Complete transactions |
| 5 | SCT 911 Emergency | Press to alert | Real-time emergency alerts |

---

## 📱 Design System (Extracted from Figma)

### Color Palette

| Purpose | Color | Hex Code |
|---------|-------|----------|
| Primary/Normal | Green | `#4CAF50` |
| Secondary/Waiting | Yellow | `#FFC107` |
| Warning/Moderate | Orange | `#FF9800` |
| Danger/Severe | Red | `#F44336` |
| Info/Actions | Blue | `#2196F3` |
| Background | White | `#FFFFFF` |
| Text Primary | Dark Gray | `#333333` |
| Text Secondary | Gray | `#666666` |

### Severity Scale (5 Levels)

| Level | Label | Color | Action |
|-------|-------|-------|--------|
| 1 | I feel normal / recovered | Green | No action needed |
| 2 | Mild discomfort | Light Green | Self-care suggestions |
| 3 | Moderate pain, need meds | Yellow/Orange | Auto-prescription suggestions |
| 4 | Severe, hard to focus | Orange/Red | Manual booking available |
| 5 | Emergency, I need a doctor now | Red | Auto-booking + Alert to clinic |

### Pain Scale (1-10 Numeric)
Visual numeric scale from 1-10 with gradient coloring:
- 1-3: Green shades
- 4-6: Yellow/Orange shades  
- 7-9: Orange/Red shades
- 10: Deep Red

### Status Badges

| Status | Color | Icon |
|--------|-------|------|
| WAITING | Yellow | Clock |
| EMERGENCY | Red | Lightning bolt |
| COMPLETED | Green | Checkmark |
| IN PROGRESS | Blue | Arrow |

### UI Components

#### Buttons
- **Primary Button:** Blue background, white text, rounded corners
- **Secondary Button:** White background, blue border, blue text
- **Danger Button:** Red background, white text
- **Success Button:** Green background, white text

#### Cards
- White background with subtle shadow
- Rounded corners (8-12px)
- Padding: 16px

#### Navigation (Student - Bottom Nav)
- Home icon
- Notifications/Bell icon
- Calendar icon
- User/Profile icon
- SOS button (prominent, red)

#### Navigation (Clinic - Sidebar)
- Dashboard
- Queue Management
- Patient Records
- Analytics
- Settings

---

## 🗂️ Project Structure

```
digital-automatic-triage/
├── index.html                    # Entry point / Router
├── manifest.json                 # PWA manifest
├── service-worker.js             # Offline support
├── firebase-config.js            # Firebase initialization
│
├── css/
│   ├── main.css                  # Global styles
│   ├── variables.css             # CSS variables (colors, spacing)
│   ├── components.css            # Reusable components
│   ├── student.css               # Student-specific styles
│   └── clinic.css                # Clinic-specific styles
│
├── js/
│   ├── app.js                    # Main app logic
│   ├── router.js                 # Client-side routing
│   ├── auth.js                   # Authentication logic
│   ├── firebase-service.js       # Firebase operations
│   │
│   ├── student/
│   │   ├── symptom-logger.js     # Symptom logging module
│   │   ├── triage.js             # Triage results & booking
│   │   ├── history.js            # View past consultations
│   │   ├── recovery.js           # Follow-up & recovery
│   │   └── emergency.js          # SCT 911 functionality
│   │
│   └── clinic/
│       ├── dashboard.js          # Main dashboard
│       ├── queue.js              # Queue management
│       ├── analytics.js          # Symptom analytics
│       ├── patients.js           # Patient records
│       ├── consultation.js       # Post-consultation form
│       └── emergency-alert.js    # Emergency notifications
│
├── pages/
│   ├── auth/
│   │   ├── login.html
│   │   ├── register.html
│   │   └── forgot-password.html
│   │
│   ├── student/
│   │   ├── home.html             # Homepage with symptom logging
│   │   ├── triage-result.html    # Triage result display
│   │   ├── booking.html          # Appointment booking
│   │   ├── history.html          # Past consultations
│   │   ├── recovery.html         # Recovery tracking
│   │   └── profile.html          # Student profile
│   │
│   └── clinic/
│       ├── dashboard.html        # Main dashboard
│       ├── queue.html            # Today's queue
│       ├── analytics.html        # Symptom analytics
│       ├── patient-view.html     # Individual patient view
│       ├── consultation-form.html
│       └── settings.html
│
├── components/
│   ├── navbar-student.html
│   ├── sidebar-clinic.html
│   ├── severity-selector.html
│   ├── pain-scale.html
│   ├── status-badge.html
│   ├── queue-card.html
│   └── sos-button.html
│
├── assets/
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   ├── images/
│   └── sounds/
│       └── emergency-alert.mp3
│
└── docs/
    └── PROJECT_PLAN.md
```

---

## 🔥 Firebase Database Schema

### Collections Structure

```
firestore/
│
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── role: "student" | "clinic_staff" | "admin"
│       ├── createdAt: timestamp
│       ├── profile: {
│       │   ├── firstName: string
│       │   ├── lastName: string
│       │   ├── studentId: string (for students)
│       │   ├── section: string (for students)
│       │   ├── bloodType: string
│       │   ├── allergies: array
│       │   └── emergencyContacts: [{
│       │       ├── name: string
│       │       ├── relationship: string
│       │       └── phone: string
│       │   }]
│       }
│       └── settings: {
│           └── notifications: boolean
│       }
│
├── symptom_logs/
│   └── {logId}/
│       ├── userId: string (reference)
│       ├── timestamp: timestamp
│       ├── symptoms: array of strings
│       ├── severityLevel: number (1-5)
│       ├── painScale: number (1-10)
│       ├── description: string
│       ├── triageResult: {
│       │   ├── category: "minor" | "moderate" | "severe" | "emergency"
│       │   ├── recommendations: array
│       │   └── autoBooking: boolean
│       }
│       └── status: "pending" | "reviewed" | "completed"
│
├── appointments/
│   └── {appointmentId}/
│       ├── userId: string (reference)
│       ├── symptomLogId: string (reference)
│       ├── date: timestamp
│       ├── timeSlot: string
│       ├── queueNumber: number
│       ├── estimatedTime: string
│       ├── type: "manual" | "auto" | "follow_up"
│       ├── severity: "minor" | "moderate" | "severe" | "emergency"
│       ├── status: "waiting" | "in_progress" | "completed" | "cancelled"
│       └── createdAt: timestamp
│
├── consultations/
│   └── {consultationId}/
│       ├── appointmentId: string (reference)
│       ├── userId: string (reference)
│       ├── clinicStaffId: string (reference)
│       ├── date: timestamp
│       ├── diagnosis: string
│       ├── prescriptions: [{
│       │   ├── medicine: string
│       │   ├── dosage: string
│       │   └── instructions: string
│       }]
│       ├── recommendations: string
│       ├── notes: string
│       ├── requiresFollowUp: boolean
│       ├── followUpDate: timestamp (optional)
│       └── status: "active" | "completed"
│
├── follow_ups/
│   └── {followUpId}/
│       ├── consultationId: string (reference)
│       ├── userId: string (reference)
│       ├── scheduledDate: timestamp
│       ├── status: "scheduled" | "completed" | "cancelled"
│       ├── recoverySurvey: {
│       │   ├── completed: boolean
│       │   ├── feelingScale: number (1-5)
│       │   ├── symptomsResolved: boolean
│       │   └── additionalNotes: string
│       }
│       └── needsAnotherFollowUp: boolean
│
├── emergencies/
│   └── {emergencyId}/
│       ├── userId: string (reference)
│       ├── timestamp: timestamp
│       ├── location: {
│       │   ├── building: string
│       │   └── floor: string
│       }
│       ├── studentInfo: {
│       │   ├── name: string
│       │   ├── section: string
│       │   └── studentId: string
│       }
│       ├── status: "active" | "responding" | "resolved"
│       └── respondedBy: string (staff userId)
│
├── analytics/
│   └── symptom_trends/
│       └── {year_month}/
│           ├── totalLogs: number
│           ├── bySymptom: map { symptom: count }
│           ├── bySeverity: map { level: count }
│           ├── byDay: map { day: count }
│           └── commonPrescriptions: array
│
└── clinic_settings/
    └── config/
        ├── operatingHours: {
        │   ├── start: string
        │   └── end: string
        }
        ├── slotsPerHour: number
        ├── followUpSlots: number
        ├── symptomKeywords: map { symptom: weight }
        └── autoResponses: map { severity: recommendations }
```

---

## 📄 Page Flow & Wireframes

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   LOGIN     │────▶│  REGISTER   │────▶│   VERIFY    │
│   FORM      │     │   FORM      │     │   EMAIL     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────┐                        ┌─────────────┐
│   FORGOT    │                        │  STUDENT/   │
│  PASSWORD   │                        │   CLINIC    │
└─────────────┘                        │   HOME      │
                                       └─────────────┘
```

### Student User Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        STUDENT HOMEPAGE                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Welcome, [Name]!                    [Profile] [SOS Button] │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  HOW ARE YOU FEELING TODAY?                                       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                        │
│  │ 😊  │ │ 🙂  │ │ 😐  │ │ 😣  │ │ 🚨  │                        │
│  │Green│ │L.Grn│ │Yellw│ │Ornge│ │ Red │                        │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                        │
│                                                                   │
│  [Select Symptoms]     [Pain Scale 1-10]                         │
│  [Describe Issue]                                                 │
│                                                                   │
│  [Submit for Triage]                                              │
│                                                                   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                                │
│  │Home │ │Hist │ │Recov│ │Prof │   ← Bottom Navigation           │
│  └─────┘ └─────┘ └─────┘ └─────┘                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                       TRIAGE RESULT                              │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  STATUS: [WAITING/EMERGENCY]                      [Badge]   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  YOUR TRIAGE RESULT: [MINOR/MODERATE/SEVERE/EMERGENCY]          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  RECOMMENDATIONS:                                           │ │
│  │  • Take [Medicine] as prescribed                            │ │
│  │  • Rest for [X] hours                                       │ │
│  │  • Drink plenty of fluids                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  IF MINOR:                      IF SEVERE/EMERGENCY:             │
│  [Book Appointment (Optional)]  [Auto-Booked: Queue #XX]        │
│                                 [Estimated Time: XX:XX]          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                       HISTORY PAGE                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  TODAY                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │ [Date]  Diagnosis: [Details]           [Status Badge]   ││ │
│  │  │         Queue #00                                       ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  PAST                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │ [Date]  Diagnosis: [Details]           [Completed]      ││ │
│  │  │         Medications given                               ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      RECOVERY PAGE                               │
│                                                                   │
│  POST-CONSULTATION CHECKLIST:                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ☑ Prescriptions received                                   │ │
│  │  ☑ Recommendations noted                                    │ │
│  │  ☐ Follow-up scheduled (if needed)                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  RECOVERY SURVEY:                                                │
│  How are you feeling now?                                        │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                        │
│  │  1  │ │  2  │ │  3  │ │  4  │ │  5  │                        │
│  │Worse│ │     │ │Same │ │     │ │Recov│                        │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                        │
│                                                                   │
│  [Request Follow-up]  [Mark as Recovered]                        │
└──────────────────────────────────────────────────────────────────┘
```

### Clinic Staff User Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  CLINIC DASHBOARD (Desktop View)                                              │
│                                                                               │
│  ┌────────────┐  ┌────────────────────────────────────────────────────────┐  │
│  │            │  │  OVERVIEW                              [Date: Today]   │  │
│  │  SIDEBAR   │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │            │  │  │ Waiting  │ │In Progress│ │Completed │ │Emergency │  │  │
│  │ ▶Dashboard │  │  │    12    │ │     3    │ │    45    │ │    0     │  │  │
│  │  Queue     │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  │  Analytics │  │                                                        │  │
│  │  Patients  │  │  TODAY'S QUEUE (Sorted by Severity)                    │  │
│  │  Settings  │  │  ┌─────────────────────────────────────────────────┐   │  │
│  │            │  │  │ 🔴 EMERGENCY │ Name │ Section │ Time │ [View]  │   │  │
│  │            │  │  │ 🟠 SEVERE    │ Name │ Section │ Time │ [View]  │   │  │
│  │            │  │  │ 🟡 MODERATE  │ Name │ Section │ Time │ [View]  │   │  │
│  │            │  │  │ 🟢 MINOR     │ Name │ Section │ Time │ [View]  │   │  │
│  │            │  │  └─────────────────────────────────────────────────┘   │  │
│  │            │  │                                                        │  │
│  └────────────┘  └────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🚨 EMERGENCY ALERT BANNER (When SCT 911 is triggered)                 │  │
│  │  Student: [Name] | Section: [Section] | Floor: [X]     [RESPOND]       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Analytics Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ANALYTICS                                        [Week ▼] [Month ▼] [Day]  │
│                                                                               │
│  SYMPTOM TRENDS                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │     📊 Bar Chart / Line Graph                                           │ │
│  │     Showing symptom frequency over time                                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  TOP SYMPTOMS THIS [PERIOD]          SEVERITY DISTRIBUTION                   │
│  ┌─────────────────────────┐         ┌─────────────────────────┐            │
│  │ 1. Headache      (45)  │         │  🟢 Minor:    40%       │            │
│  │ 2. Fever         (32)  │         │  🟡 Moderate: 35%       │            │
│  │ 3. Stomach Pain  (28)  │         │  🟠 Severe:   20%       │            │
│  │ 4. Cough         (21)  │         │  🔴 Emergency: 5%       │            │
│  └─────────────────────────┘         └─────────────────────────┘            │
│                                                                               │
│  COMMON PRESCRIPTIONS                PEAK HOURS                              │
│  ┌─────────────────────────┐         ┌─────────────────────────┐            │
│  │ • Paracetamol           │         │  9:00 AM - 10:00 AM ████│            │
│  │ • Ibuprofen             │         │ 11:00 AM - 12:00 PM ██  │            │
│  │ • Antacids              │         │  2:00 PM -  3:00 PM ███ │            │
│  └─────────────────────────┘         └─────────────────────────┘            │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### PWA Requirements

#### manifest.json
```json
{
  "name": "Digital Automatic Triage",
  "short_name": "DAT",
  "description": "Student Wellness Monitoring and Automatic Triage App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "any",
  "icons": [
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker Features
- Cache static assets (CSS, JS, images)
- Cache Firebase SDK
- Offline fallback page
- Background sync for symptom submissions
- Push notifications for:
  - Queue updates
  - Emergency alerts (clinic)
  - Follow-up reminders (students)

### Responsive Design Strategy

| Breakpoint | Target | Student View | Clinic View |
|------------|--------|--------------|-------------|
| < 768px | Mobile | Primary (Mobile-first) | Functional |
| 768px - 1024px | Tablet | Optimized | Good |
| > 1024px | Desktop | Functional | Primary |

### Symptom Scoring Algorithm

```javascript
// Word-based severity scoring
const symptomWeights = {
  // Level 1-2 symptoms (Minor)
  'tired': 1,
  'headache': 2,
  'runny nose': 1,
  'mild cough': 2,
  
  // Level 3 symptoms (Moderate)
  'fever': 4,
  'vomiting': 4,
  'diarrhea': 4,
  'stomach pain': 3,
  
  // Level 4-5 symptoms (Severe/Emergency)
  'chest pain': 8,
  'difficulty breathing': 9,
  'severe bleeding': 10,
  'unconscious': 10,
  'allergic reaction': 9
};

function calculateTriageScore(symptoms, painScale, severitySelection) {
  let score = 0;
  
  // Sum symptom weights
  symptoms.forEach(symptom => {
    score += symptomWeights[symptom.toLowerCase()] || 2;
  });
  
  // Factor in pain scale (1-10)
  score += painScale;
  
  // Factor in user severity selection (1-5)
  score += severitySelection * 2;
  
  // Determine category
  if (score >= 25 || severitySelection === 5) return 'emergency';
  if (score >= 15 || severitySelection === 4) return 'severe';
  if (score >= 8 || severitySelection === 3) return 'moderate';
  return 'minor';
}
```

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || isClinicStaff());
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Symptom logs
    match /symptom_logs/{logId} {
      allow create: if request.auth != null && isStudent();
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || isClinicStaff());
      allow update: if request.auth != null && isClinicStaff();
    }
    
    // Appointments
    match /appointments/{appointmentId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || isClinicStaff());
      allow update: if request.auth != null && isClinicStaff();
    }
    
    // Emergencies
    match /emergencies/{emergencyId} {
      allow create: if request.auth != null && isStudent();
      allow read: if request.auth != null && isClinicStaff();
      allow update: if request.auth != null && isClinicStaff();
    }
    
    // Helper functions
    function isStudent() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    function isClinicStaff() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['clinic_staff', 'admin'];
    }
  }
}
```

---

## 📅 Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup and folder structure
- [ ] Firebase project configuration
- [ ] PWA manifest and service worker
- [ ] Authentication system (Login, Register, Forgot Password)
- [ ] Basic routing system
- [ ] CSS design system and components

### Phase 2: Student Core Features (Week 3-4)
- [ ] Student homepage with symptom logging
- [ ] Severity selector component (5 levels)
- [ ] Pain scale component (1-10)
- [ ] Triage algorithm implementation
- [ ] Triage result page
- [ ] Manual booking system
- [ ] Auto-booking for severe cases

### Phase 3: Clinic Core Features (Week 5-6)
- [ ] Clinic dashboard
- [ ] Queue management system
- [ ] Patient sorting by severity
- [ ] Individual patient view
- [ ] Post-consultation form
- [ ] Prescription entry system

### Phase 4: Advanced Features (Week 7-8)
- [ ] SCT 911 Emergency system
- [ ] Real-time emergency alerts
- [ ] Analytics dashboard
- [ ] Symptom trend detection
- [ ] Follow-up scheduling system
- [ ] Recovery survey

### Phase 5: Polish & Testing (Week 9-10)
- [ ] Responsive design refinement
- [ ] Push notifications
- [ ] Offline functionality
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] User acceptance testing

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] User registration (student/clinic staff)
- [ ] User login/logout
- [ ] Password reset
- [ ] Symptom logging submission
- [ ] Triage calculation accuracy
- [ ] Appointment booking (manual/auto)
- [ ] Queue display and ordering
- [ ] Post-consultation form submission
- [ ] Follow-up scheduling
- [ ] Recovery survey submission
- [ ] SCT 911 alert trigger and display

### PWA Testing
- [ ] Install prompt appears
- [ ] App installs correctly
- [ ] Offline fallback works
- [ ] Push notifications received
- [ ] Background sync works

### Responsive Testing
- [ ] Mobile (320px - 480px)
- [ ] Mobile Large (481px - 767px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1025px+)

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 📋 Student Information Card (From Design)

```
┌─────────────────────────────────────┐
│  STUDENT INFORMATION                │
│  ─────────────────────────          │
│  ID: XXXXXXXXXXXX                   │
│  Strand/Section:                    │
│  Blood Type:                        │
│                                     │
│  EMERGENCY CONTACTS                 │
│  ─────────────────────────          │
│  Maria Dela Cruz (Guardian)         │
│  0912 345 6789                      │
│                                     │
│  Maria Dela Cruz (Mother)           │
│  0987 654 3210                      │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment

### Firebase Hosting Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Select:
# - Firestore
# - Hosting
# - Functions (for Cloud Functions)

# Deploy
firebase deploy
```

### Environment Configuration
```javascript
// firebase-config.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 📝 Notes

1. **Mobile-First Approach**: Student interfaces should prioritize mobile usability
2. **Desktop-First for Clinic**: Clinic staff will primarily use desktop for efficiency
3. **Real-time Updates**: Use Firestore real-time listeners for queue updates and emergency alerts
4. **Accessibility**: Ensure color-blind friendly design (don't rely solely on color)
5. **Privacy**: Student health data must be handled with appropriate security measures
6. **Scalability**: Design database structure to handle multiple schools if needed

---

## ✅ Next Steps

1. Review this project plan
2. Set up Firebase project
3. Create initial project structure
4. Begin Phase 1 development

---

*Document Version: 1.0*  
*Last Updated: February 19, 2026*
