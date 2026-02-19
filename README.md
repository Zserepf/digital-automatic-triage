# Digital Automatic Triage (DAT)

**Student Wellness Monitoring and Automatic Triage App**

A Progressive Web App that bridges accessibility between students and school medical facilities, automating simple triage to address clinic manpower shortages.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Firebase (Auth, Firestore, Hosting)
- **Type:** Progressive Web App (PWA)

## Features
1. **Symptom Logging** — Students log symptoms; clinic views analytics
2. **Triage & Scheduling** — Automatic severity scoring with auto/manual booking
3. **Post-Consultation Checklist** — Prescriptions, notes, follow-up schedules
4. **Follow-up Checkup** — Recovery surveys and re-scheduling
5. **SCT 911 Emergency** — One-tap emergency alerts to clinic staff

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for Firebase CLI)
- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

### Setup
1. Clone the repo
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Login: `firebase login`
4. Init: `firebase init` (select Firestore + Hosting)
5. Update `js/firebase-service.js` with your Firebase config
6. Deploy: `firebase deploy`

### Local Development
```bash
# Serve locally
firebase serve
```

## Project Structure
```
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline support
├── css/                    # Stylesheets
├── js/                     # Core scripts
├── pages/
│   ├── auth/               # Login, Register, Forgot Password
│   ├── student/            # Student-facing pages
│   └── clinic/             # Clinic staff pages
└── assets/                 # Icons, images, sounds
```

## License
This project is for educational purposes.
