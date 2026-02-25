/* ========================================
   REGISTER PAGE  (multi-step wizard)
   Digital Automatic Triage
   ======================================== */

/* ─── constants ──────────────────────────────────────────── */
const BLOOD_TYPES = ['A+','A-','B+','B-','O+','O-','AB+','AB-',
                     'A1+','A1-','A2+','A2-','A1B+','A1B-','A2B+','A2B-'];

const FAMILY_CONDITIONS  = ['Asthma','Heart Disease','Diabetes','Allergy','Hypertension'];

const PERSONAL_CONDITIONS = [
    'Allergy','Rhinitis','Nosebleeding','Otitis Media','Tonsillitis','Mumps',
    'Thyroid Problem','Pneumonia','Primary Complex / PTB','Asthma','Typhoid',
    'Hypertension','Heart Disease','Hepatitis','Seizure Disorder / Epilepsy',
    'Diabetes','Measles','Chicken Pox','Fracture','Physical Defect',
    'Urinary Tract Infection'
];

const STEPS = [
    'Account Setup',
    'Personal Info',
    'Family Background',
    'Academic & Basic Health',
    'Medical History',
    'Confirmation'
];

/* ─── main renderer ──────────────────────────────────────── */
export async function renderRegisterPage(container) {
    addAuthStyles();

    const sectionsResult = await SectionsService.getAll();
    const sections = sectionsResult.data || SectionsService.MASTER;

    // Group sections by building
    const byBuilding = {};
    sections.forEach(s => {
        if (!byBuilding[s.building]) byBuilding[s.building] = [];
        byBuilding[s.building].push(s);
    });

    const sectionsOptionsHTML = Object.entries(byBuilding).map(([building, rooms]) => `
        <optgroup label="🏫 ${building}">
            ${rooms.map(s => `<option value="${s.id || ''}" data-building="${s.building}" data-room="${s.room}" data-section="${s.section}">
                ${s.section} (${s.room})
            </option>`).join('')}
        </optgroup>
    `).join('');

    // Wizard state — persists across step renders
    const formData = {
        // Step 1
        email: '', password: '', studentId: '', sienanStatus: '', enrollmentYear: '',
        // Step 2
        firstName: '', middleName: '', lastName: '',
        dob: '', age: '', gender: '',
        cityAddress: '', telNo: '', cellNo: '',
        religion: '', nationality: '',
        // Step 3
        livingWith: '', fatherName: '', fatherOccupation: '',
        motherName: '', motherOccupation: '',
        // Step 4
        section: '', building: '', room: '',
        bloodType: '', bloodTypeOther: '',
        // Step 5
        familyHistory: [],
        personalHistory: [],
        hadOperation: false, operationDetails: '',
        // internal
        _password: ''
    };

    let currentStep = 1;

    function renderWizard() {
        container.innerHTML = `
            <div class="auth-page" style="align-items: flex-start; padding: 24px 16px;">
                <div class="auth-card" style="max-width: 520px; width: 100%;">

                    <!-- Progress bar -->
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-weight: 700; font-size: 1rem; color: var(--color-primary);">
                                Step ${currentStep} of ${STEPS.length}
                            </span>
                            <span style="font-size: 0.8rem; color: var(--color-text-secondary);">
                                ${STEPS[currentStep - 1]}
                            </span>
                        </div>
                        <div style="height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden;">
                            <div style="height:100%; width:${(currentStep/STEPS.length)*100}%; background: var(--color-primary); border-radius: 3px; transition: width 0.3s;"></div>
                        </div>
                    </div>

                    <div id="wizard-step-content">
                        ${renderStepContent(currentStep)}
                    </div>

                    <!-- Nav buttons -->
                    <div id="wizard-nav" style="display: flex; gap: 12px; margin-top: 24px;">
                        ${currentStep > 1 ? `<button class="btn btn--secondary btn--full" id="wizard-back">← Back</button>` : ''}
                        ${currentStep < STEPS.length
                            ? `<button class="btn btn--primary btn--full" id="wizard-next">Next →</button>`
                            : `<button class="btn btn--primary btn--full" id="wizard-submit">
                                <span class="material-icons-round">check_circle</span> Submit Registration
                               </button>`
                        }
                    </div>

                    <div class="auth-links" style="margin-top: 12px;">
                        <a data-route="/login" class="auth-link">Already have an account? Login</a>
                    </div>
                </div>
            </div>
        `;

        // Attach navigation
        document.getElementById('wizard-back')?.addEventListener('click', () => { goBack(); });
        document.getElementById('wizard-next')?.addEventListener('click', () => { goNext(); });
        document.getElementById('wizard-submit')?.addEventListener('click', () => { submitRegistration(); });

        // Step-specific dynamic handlers
        attachStepHandlers(currentStep);
    }

    /* ── step content ──────────────────────────────────────── */
    function renderStepContent(step) {
        switch (step) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            case 5: return renderStep5();
            case 6: return renderStep6();
            default: return '';
        }
    }

    /* step 1 — Account Setup */
    function renderStep1() {
        return `
            <h2 style="margin:0 0 16px; font-size:1.2rem;">Account Setup</h2>

            <div class="input-group">
                <label>Student ID <span style="color:red">*</span></label>
                <input type="text" id="s1-student-id" class="input-field"
                    placeholder="e.g. 2024-0001" value="${formData.studentId}" required
                    style="font-family: monospace; letter-spacing: 1px;">
                <div id="sienan-badge" style="margin-top:6px; font-size:0.8rem; font-weight:600; min-height:18px;"></div>
            </div>

            <div class="input-group">
                <label>School Email <span style="color:red">*</span></label>
                <input type="email" id="s1-email" class="input-field"
                    placeholder="yourname@school.edu" value="${formData.email}" required>
            </div>

            <div class="input-group">
                <label>Password <span style="color:red">*</span></label>
                <input type="password" id="s1-password" class="input-field"
                    placeholder="At least 6 characters" value="${formData._password}" required minlength="6">
            </div>

            <div class="input-group">
                <label>Confirm Password <span style="color:red">*</span></label>
                <input type="password" id="s1-confirm-password" class="input-field"
                    placeholder="Repeat your password" required>
            </div>
        `;
    }

    /* step 2 — Personal Info */
    function renderStep2() {
        return `
            <h2 style="margin:0 0 16px; font-size:1.2rem;">Personal Information</h2>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="input-group" style="margin:0;">
                    <label>First Name <span style="color:red">*</span></label>
                    <input type="text" id="s2-firstname" class="input-field" placeholder="First name" value="${formData.firstName}" required>
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Middle Name</label>
                    <input type="text" id="s2-middlename" class="input-field" placeholder="Middle name" value="${formData.middleName}">
                </div>
            </div>
            <div class="input-group">
                <label>Last Name <span style="color:red">*</span></label>
                <input type="text" id="s2-lastname" class="input-field" placeholder="Last name" value="${formData.lastName}" required>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="input-group" style="margin:0; grid-column: span 1;">
                    <label>Date of Birth <span style="color:red">*</span></label>
                    <input type="date" id="s2-dob" class="input-field" value="${formData.dob}" required>
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Age</label>
                    <input type="number" id="s2-age" class="input-field" placeholder="Age" value="${formData.age}" min="1" max="100">
                </div>
            </div>

            <div class="input-group">
                <label>Gender <span style="color:red">*</span></label>
                <select id="s2-gender" class="input-field" required>
                    <option value="">-- Select --</option>
                    <option value="Male"   ${formData.gender==='Male'   ? 'selected':''}>Male</option>
                    <option value="Female" ${formData.gender==='Female' ? 'selected':''}>Female</option>
                    <option value="Other"  ${formData.gender==='Other'  ? 'selected':''}>Other</option>
                </select>
            </div>

            <div class="input-group">
                <label>City Address <span style="color:red">*</span></label>
                <input type="text" id="s2-address" class="input-field" placeholder="City / Municipality, Province" value="${formData.cityAddress}" required>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="input-group" style="margin:0;">
                    <label>Telephone No.</label>
                    <input type="tel" id="s2-tel" class="input-field" placeholder="(02) 8XXX-XXXX" value="${formData.telNo}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Cellphone No.</label>
                    <input type="tel" id="s2-cell" class="input-field" placeholder="09XX-XXX-XXXX" value="${formData.cellNo}">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px;">
                <div class="input-group" style="margin:0;">
                    <label>Religion</label>
                    <input type="text" id="s2-religion" class="input-field" placeholder="e.g. Roman Catholic" value="${formData.religion}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Nationality</label>
                    <input type="text" id="s2-nationality" class="input-field" placeholder="e.g. Filipino" value="${formData.nationality}">
                </div>
            </div>
        `;
    }

    /* step 3 — Family Background */
    function renderStep3() {
        const livingOpts = ['Parents','Grandparents','Relatives','Others'];
        return `
            <h2 style="margin:0 0 16px; font-size:1.2rem;">Family Background</h2>

            <div class="input-group">
                <label>Living With <span style="color:red">*</span></label>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px;">
                    ${livingOpts.map(o => `
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;
                            border:2px solid ${formData.livingWith===o ? 'var(--color-primary)' : 'var(--color-border)'};
                            border-radius:10px; padding:10px 12px; font-size:0.9rem;
                            font-weight:${formData.livingWith===o?'600':'400'};
                            color:${formData.livingWith===o?'var(--color-primary)':'var(--color-text-primary)'}; transition:.2s;">
                            <input type="radio" name="living-with" value="${o}"
                                ${formData.livingWith===o ? 'checked' : ''} style="accent-color: var(--color-primary);">
                            ${o}
                        </label>
                    `).join('')}
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px;">
                <div class="input-group" style="margin:0;">
                    <label>Father's Name</label>
                    <input type="text" id="s3-father-name" class="input-field" placeholder="Full name" value="${formData.fatherName}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Father's Occupation</label>
                    <input type="text" id="s3-father-occ" class="input-field" placeholder="Occupation" value="${formData.fatherOccupation}">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px;">
                <div class="input-group" style="margin:0;">
                    <label>Mother's Name</label>
                    <input type="text" id="s3-mother-name" class="input-field" placeholder="Full name" value="${formData.motherName}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Mother's Occupation</label>
                    <input type="text" id="s3-mother-occ" class="input-field" placeholder="Occupation" value="${formData.motherOccupation}">
                </div>
            </div>
        `;
    }

    /* step 4 — Academic & Basic Health */
    function renderStep4() {
        const btOptions = BLOOD_TYPES.map(bt =>
            `<option value="${bt}" ${formData.bloodType===bt?'selected':''}>${bt}</option>`
        ).join('');
        return `
            <h2 style="margin:0 0 16px; font-size:1.2rem;">Academic &amp; Basic Health</h2>

            <div class="input-group">
                <label>Strand / Section <span style="color:red">*</span></label>
                <select id="s4-section" class="input-field" required>
                    <option value="">-- Select Section --</option>
                    ${sectionsOptionsHTML}
                </select>
            </div>

            <div class="input-group">
                <label>Blood Type</label>
                <select id="s4-blood-type" class="input-field">
                    <option value="">-- Select --</option>
                    ${btOptions}
                    <option value="Other" ${formData.bloodType==='Other'?'selected':''}>Other (specify below)</option>
                </select>
            </div>

            <div class="input-group" id="blood-other-group" style="display:${formData.bloodType==='Other'?'block':'none'};">
                <label>Specify Blood Type</label>
                <input type="text" id="s4-blood-other" class="input-field"
                    placeholder="e.g. Bombay / hh blood type" value="${formData.bloodTypeOther}">
            </div>
        `;
    }

    /* step 5 — Medical History */
    function renderStep5() {
        const famChecks = FAMILY_CONDITIONS.map(c => `
            <label style="display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:8px;
                background:${formData.familyHistory.includes(c)?'#e3f2fd':'transparent'};
                border:1px solid ${formData.familyHistory.includes(c)?'var(--color-primary)':'var(--color-border)'};
                cursor:pointer; font-size:0.88rem; transition:.15s;">
                <input type="checkbox" value="${c}" ${formData.familyHistory.includes(c)?'checked':''}
                    name="family-cond" style="accent-color: var(--color-primary);">
                ${c}
            </label>
        `).join('');

        const perChecks = PERSONAL_CONDITIONS.map(c => `
            <label style="display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:8px;
                background:${formData.personalHistory.includes(c)?'#e3f2fd':'transparent'};
                border:1px solid ${formData.personalHistory.includes(c)?'var(--color-primary)':'var(--color-border)'};
                cursor:pointer; font-size:0.88rem; transition:.15s;">
                <input type="checkbox" value="${c}" ${formData.personalHistory.includes(c)?'checked':''}
                    name="personal-cond" style="accent-color: var(--color-primary);">
                ${c}
            </label>
        `).join('');

        return `
            <h2 style="margin:0 0 16px; font-size:1.2rem;">Medical History</h2>

            <div style="font-weight:600; margin-bottom:8px; color:var(--color-text-secondary); font-size:0.85rem; text-transform:uppercase; letter-spacing:.5px;">
                Family History
            </div>
            <p style="font-size:0.82rem; color:var(--color-text-hint); margin:-4px 0 10px;">
                Check if any immediate family members have been diagnosed with:
            </p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:20px;">
                ${famChecks}
            </div>

            <div style="font-weight:600; margin-bottom:8px; color:var(--color-text-secondary); font-size:0.85rem; text-transform:uppercase; letter-spacing:.5px;">
                Personal History
            </div>
            <p style="font-size:0.82rem; color:var(--color-text-hint); margin:-4px 0 10px;">
                Check all conditions you have personally experienced or been diagnosed with:
            </p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:20px;">
                ${perChecks}
            </div>

            <div style="font-weight:600; margin-bottom:8px; color:var(--color-text-secondary); font-size:0.85rem; text-transform:uppercase; letter-spacing:.5px;">
                Operation &amp; Hospitalization
            </div>
            <div style="display:flex; gap:16px; margin-bottom:10px;">
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.9rem;">
                    <input type="radio" name="had-op" value="no"
                        ${!formData.hadOperation?'checked':''} style="accent-color: var(--color-primary);"> None
                </label>
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.9rem;">
                    <input type="radio" name="had-op" value="yes"
                        ${formData.hadOperation?'checked':''} style="accent-color: var(--color-primary);"> Yes, I have had an operation/hospitalization
                </label>
            </div>
            <div id="op-details-group" style="display:${formData.hadOperation?'block':'none'};">
                <textarea id="s5-op-details" class="input-field" rows="3"
                    placeholder="Briefly describe the operation/hospitalization, including approximate year..."
                    style="resize:vertical;">${formData.operationDetails}</textarea>
            </div>
        `;
    }

    /* step 6 — Confirmation */
    function renderStep6() {
        const bt = formData.bloodType === 'Other'
            ? (formData.bloodTypeOther || 'Other (unspecified)')
            : formData.bloodType;

        const row = (label, val) => val
            ? `<div style="display:flex; gap:8px; padding:6px 0; border-bottom:1px solid var(--color-border); font-size:0.88rem; flex-wrap:wrap;">
                   <span style="color:var(--color-text-secondary); min-width:160px; flex-shrink:0;">${label}</span>
                   <span style="font-weight:600; color:var(--color-text-primary); flex:1;">${val}</span>
               </div>`
            : '';

        const checkList = (items) => items.length
            ? items.map(i => `<span style="display:inline-block; background:#e3f2fd; color:var(--color-primary); border-radius:6px; padding:2px 9px; font-size:0.8rem; margin:2px;">${i}</span>`).join('')
            : '<span style="color:var(--color-text-hint); font-size:0.85rem;">None</span>';

        const section = (title, content) => `
            <div style="background:var(--color-background); border-radius:12px; padding:12px; margin-bottom:12px;">
                <div style="font-weight:700; font-size:0.78rem; color:var(--color-primary); text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px;">${title}</div>
                ${content}
            </div>`;

        return `
            <h2 style="margin:0 0 4px; font-size:1.2rem;">Review &amp; Confirm</h2>
            <p style="font-size:0.82rem; color:var(--color-text-hint); margin:0 0 16px;">
                Please review carefully. Press <strong>← Back</strong> if you need to make changes.
            </p>

            ${section('Account',
                row('Email', formData.email) +
                row('Student ID', formData.studentId) +
                row('Enrollment Status', formData.sienanStatus
                    ? `<span style="background:${formData.sienanStatus==='New Sienan'?'#e8f5e9':'#fff3e0'};
                           color:${formData.sienanStatus==='New Sienan'?'#2e7d32':'#e65100'};
                           padding:2px 10px; border-radius:6px; font-size:0.82rem; font-weight:700;">${formData.sienanStatus}</span>`
                    : '')
            )}

            ${section('Personal Information',
                row('Full Name', [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ')) +
                row('Date of Birth', formData.dob) +
                row('Age', formData.age) +
                row('Gender', formData.gender) +
                row('City Address', formData.cityAddress) +
                row('Telephone No.', formData.telNo) +
                row('Cellphone No.', formData.cellNo) +
                row('Religion', formData.religion) +
                row('Nationality', formData.nationality)
            )}

            ${section('Family Background',
                row('Living With', formData.livingWith) +
                row("Father's Name", formData.fatherName) +
                row("Father's Occupation", formData.fatherOccupation) +
                row("Mother's Name", formData.motherName) +
                row("Mother's Occupation", formData.motherOccupation)
            )}

            ${section('Academic &amp; Health',
                row('Section', formData.section) +
                row('Building', formData.building) +
                row('Room', formData.room) +
                row('Blood Type', bt)
            )}

            ${section('Medical History',
                `<div style="font-size:0.82rem; color:var(--color-text-secondary); margin-bottom:4px;">Family History:</div>
                 <div style="margin-bottom:10px;">${checkList(formData.familyHistory)}</div>
                 <div style="font-size:0.82rem; color:var(--color-text-secondary); margin-bottom:4px;">Personal History:</div>
                 <div style="margin-bottom:${formData.hadOperation?'10px':'0'};">${checkList(formData.personalHistory)}</div>
                 ${formData.hadOperation ? row('Operation / Hospitalization', formData.operationDetails || '(details not provided)') : ''}`
            )}

            <div style="background:#fff3e0; border:2px solid #ff9800; border-radius:12px; padding:12px; font-size:0.83rem; color:#5d4037;">
                <span class="material-icons-round" style="font-size:16px; vertical-align:middle; margin-right:4px; color:#e65100;">info</span>
                By submitting, you confirm that the information above is accurate and complete.
            </div>
        `;
    }

    /* ── step-specific event handlers ─────────────────────── */
    function attachStepHandlers(step) {
        if (step === 1) {
            const idInput = document.getElementById('s1-student-id');
            const badge   = document.getElementById('sienan-badge');
            function updateSienanBadge() {
                const val  = (idInput.value || '').trim();
                const year = parseInt(val.substring(0, 4), 10);
                const currentYear = new Date().getFullYear();
                if (!isNaN(year) && val.length >= 4) {
                    if (year >= currentYear) {
                        badge.innerHTML = `<span style="color:#2e7d32; background:#e8f5e9; padding:2px 10px; border-radius:6px;">✔ New Sienan (Enrolled ${year})</span>`;
                    } else {
                        badge.innerHTML = `<span style="color:#e65100; background:#fff3e0; padding:2px 10px; border-radius:6px;">📋 Old Sienan (Enrolled ${year})</span>`;
                    }
                } else {
                    badge.innerHTML = '';
                }
            }
            idInput?.addEventListener('input', updateSienanBadge);
            if (idInput?.value) updateSienanBadge();
        }

        if (step === 2) {
            document.getElementById('s2-dob')?.addEventListener('change', (e) => {
                const dob = new Date(e.target.value);
                if (!isNaN(dob)) {
                    const today = new Date();
                    let age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                    const ageField = document.getElementById('s2-age');
                    if (ageField) ageField.value = age;
                }
            });
        }

        if (step === 4) {
            // Restore previously selected section
            const sel = document.getElementById('s4-section');
            if (sel && formData.section) {
                for (const opt of sel.options) {
                    if (opt.dataset.section === formData.section) { opt.selected = true; break; }
                }
            }
            document.getElementById('s4-blood-type')?.addEventListener('change', (e) => {
                const grp = document.getElementById('blood-other-group');
                if (grp) grp.style.display = e.target.value === 'Other' ? 'block' : 'none';
            });
        }

        if (step === 5) {
            document.querySelectorAll('[name="had-op"]').forEach(r => {
                r.addEventListener('change', () => {
                    const grp = document.getElementById('op-details-group');
                    if (grp) grp.style.display = r.value === 'yes' ? 'block' : 'none';
                });
            });
        }
    }

    /* ── collect & validate current step data ─────────────── */
    function collectStep(step) {
        if (step === 1) {
            const sid      = document.getElementById('s1-student-id').value.trim();
            const email    = document.getElementById('s1-email').value.trim();
            const password = document.getElementById('s1-password').value;
            const confirm  = document.getElementById('s1-confirm-password').value;
            if (!sid)       { Utils.showToast('Student ID is required.', 'warning'); return false; }
            if (!email)     { Utils.showToast('Email is required.', 'warning'); return false; }
            if (!password)  { Utils.showToast('Password is required.', 'warning'); return false; }
            if (password.length < 6) { Utils.showToast('Password must be at least 6 characters.', 'warning'); return false; }
            if (password !== confirm) { Utils.showToast('Passwords do not match.', 'error'); return false; }
            const year = parseInt(sid.substring(0, 4), 10);
            const currentYear = new Date().getFullYear();
            formData.studentId      = sid;
            formData.email          = email;
            formData._password      = password;
            formData.enrollmentYear = isNaN(year) ? '' : String(year);
            formData.sienanStatus   = isNaN(year) ? '' : (year >= currentYear ? 'New Sienan' : 'Old Sienan');
            return true;
        }

        if (step === 2) {
            formData.firstName   = document.getElementById('s2-firstname').value.trim();
            formData.middleName  = document.getElementById('s2-middlename').value.trim();
            formData.lastName    = document.getElementById('s2-lastname').value.trim();
            formData.dob         = document.getElementById('s2-dob').value;
            formData.age         = document.getElementById('s2-age').value;
            formData.gender      = document.getElementById('s2-gender').value;
            formData.cityAddress = document.getElementById('s2-address').value.trim();
            formData.telNo       = document.getElementById('s2-tel').value.trim();
            formData.cellNo      = document.getElementById('s2-cell').value.trim();
            formData.religion    = document.getElementById('s2-religion').value.trim();
            formData.nationality = document.getElementById('s2-nationality').value.trim();
            if (!formData.firstName)    { Utils.showToast('First name is required.', 'warning'); return false; }
            if (!formData.lastName)     { Utils.showToast('Last name is required.', 'warning'); return false; }
            if (!formData.dob)          { Utils.showToast('Date of birth is required.', 'warning'); return false; }
            if (!formData.gender)       { Utils.showToast('Please select your gender.', 'warning'); return false; }
            if (!formData.cityAddress)  { Utils.showToast('City address is required.', 'warning'); return false; }
            return true;
        }

        if (step === 3) {
            const checked = document.querySelector('[name="living-with"]:checked');
            formData.livingWith       = checked ? checked.value : '';
            formData.fatherName       = document.getElementById('s3-father-name').value.trim();
            formData.fatherOccupation = document.getElementById('s3-father-occ').value.trim();
            formData.motherName       = document.getElementById('s3-mother-name').value.trim();
            formData.motherOccupation = document.getElementById('s3-mother-occ').value.trim();
            if (!formData.livingWith) { Utils.showToast('Please select who you are living with.', 'warning'); return false; }
            return true;
        }

        if (step === 4) {
            const sel = document.getElementById('s4-section');
            const opt = sel.options[sel.selectedIndex];
            if (!opt || !opt.value) { Utils.showToast('Please select your section.', 'warning'); return false; }
            formData.section  = opt.dataset.section  || '';
            formData.building = opt.dataset.building || '';
            formData.room     = opt.dataset.room     || '';
            formData.bloodType      = document.getElementById('s4-blood-type').value;
            formData.bloodTypeOther = document.getElementById('s4-blood-other')?.value.trim() || '';
            if (formData.bloodType === 'Other' && !formData.bloodTypeOther) {
                Utils.showToast('Please specify your blood type.', 'warning'); return false;
            }
            return true;
        }

        if (step === 5) {
            formData.familyHistory   = [...document.querySelectorAll('[name="family-cond"]:checked')].map(cb => cb.value);
            formData.personalHistory = [...document.querySelectorAll('[name="personal-cond"]:checked')].map(cb => cb.value);
            const opRadio = document.querySelector('[name="had-op"]:checked');
            formData.hadOperation    = opRadio ? opRadio.value === 'yes' : false;
            formData.operationDetails = formData.hadOperation
                ? (document.getElementById('s5-op-details')?.value.trim() || '')
                : '';
            return true;
        }

        return true; // step 6 = confirmation only
    }

    function goNext() {
        if (!collectStep(currentStep)) return;
        currentStep++;
        renderWizard();
        window.scrollTo(0, 0);
    }

    function goBack() {
        currentStep--;
        renderWizard();
        window.scrollTo(0, 0);
    }

    /* ── final submit ──────────────────────────────────────── */
    async function submitRegistration() {
        const finalBloodType = formData.bloodType === 'Other'
            ? (formData.bloodTypeOther || 'Other')
            : formData.bloodType;

        const userData = {
            firstName:        formData.firstName,
            lastName:         formData.lastName,
            middleName:       formData.middleName,
            studentId:        formData.studentId,
            enrollmentYear:   formData.enrollmentYear,
            sienanStatus:     formData.sienanStatus,
            section:          formData.section,
            building:         formData.building,
            room:             formData.room,
            bloodType:        finalBloodType,
            gender:           formData.gender,
            dob:              formData.dob,
            age:              formData.age,
            cityAddress:      formData.cityAddress,
            telNo:            formData.telNo,
            cellNo:           formData.cellNo,
            religion:         formData.religion,
            nationality:      formData.nationality,
            livingWith:       formData.livingWith,
            fatherName:       formData.fatherName,
            fatherOccupation: formData.fatherOccupation,
            motherName:       formData.motherName,
            motherOccupation: formData.motherOccupation,
            familyHistory:    formData.familyHistory,
            personalHistory:  formData.personalHistory,
            hadOperation:     formData.hadOperation,
            operationDetails: formData.operationDetails,
            role: 'student',
            emergencyContacts: [],
            allergies: formData.personalHistory.includes('Allergy') ? ['See Personal History'] : []
        };

        Utils.showLoading();
        const result = await AuthService.register(formData.email, formData._password, userData);
        Utils.hideLoading();

        if (result.success) {
            Utils.showToast('Account created successfully! Welcome!', 'success');
        } else {
            Utils.showToast(result.error, 'error');
        }
    }

    // Kick off the wizard
    renderWizard();
}

function addAuthStyles() {
    if (document.getElementById('auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = `
        .auth-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-base);
            background: linear-gradient(135deg, #2196F3 0%, #1565C0 100%);
        }
        .auth-card {
            background: var(--color-white);
            border-radius: var(--radius-xl);
            padding: var(--space-2xl);
            width: 100%;
            max-width: 400px;
            box-shadow: var(--shadow-xl);
        }
        .auth-header {
            text-align: center;
            margin-bottom: var(--space-2xl);
        }
        .auth-header h1 {
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-bold);
            color: var(--color-primary);
            margin-bottom: var(--space-xs);
        }
        .auth-header p {
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
        }
        .auth-form {
            display: flex;
            flex-direction: column;
            gap: var(--space-base);
        }
        .auth-links {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-sm);
            margin-top: var(--space-md);
        }
        .auth-link {
            font-size: var(--font-size-sm);
            color: var(--color-primary);
            cursor: pointer;
        }
        .auth-link:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
}
