/* ========================================
   STUDENT PROFILE PAGE
   Digital Automatic Triage
   ======================================== */

export function renderStudentProfile(container) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    const profile = Auth.userData?.profile || {};
    const initials = Auth.getInitials();
    const displayName = Auth.getDisplayName();

    const infoRow = (label, val) => val
        ? `<div class="profile-info-item">
               <span class="profile-info-label">${label}</span>
               <span class="profile-info-value">${val}</span>
           </div>`
        : '';

    const tagList = (arr) => (arr || []).length
        ? (arr).map(t => `<span style="display:inline-block; background:#e3f2fd; color:var(--color-primary); border-radius:6px; padding:2px 9px; font-size:0.78rem; margin:2px;">${t}</span>`).join('')
        : '<span style="color:var(--color-text-hint); font-size:0.85rem;">None</span>';

    const sienanColor = profile.sienanStatus === 'New Sienan' ? '#2e7d32' : '#e65100';
    const sienanBg    = profile.sienanStatus === 'New Sienan' ? '#e8f5e9'  : '#fff3e0';

    container.innerHTML = `
        <link rel="stylesheet" href="/css/student.css">
        <div class="page-student">

            <!-- Profile Header -->
            <div class="profile-card">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="student-avatar" style="width:56px; height:56px; font-size:20px; background:rgba(255,255,255,0.2); color:white; flex-shrink:0;">
                        ${initials}
                    </div>
                    <div style="flex:1; min-width:0;">
                        <h3 style="margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayName}</h3>
                        <p style="margin:2px 0 0; font-size:0.82rem; opacity:.85;">${Auth.userData?.email || ''}</p>
                        ${profile.sienanStatus ? `<span style="background:${sienanBg}; color:${sienanColor}; border-radius:6px; padding:2px 9px; font-size:0.75rem; font-weight:700; margin-top:4px; display:inline-block;">${profile.sienanStatus}</span>` : ''}
                    </div>
                    <button class="btn btn--ghost" id="edit-profile-btn" style="color:white; flex-shrink:0;" title="Edit Profile">
                        <span class="material-icons-round">edit</span>
                    </button>
                </div>
            </div>

            <!-- Student Info -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top:0;">Student Information</h4>
                ${infoRow('Student ID', profile.studentId)}
                ${infoRow('Enrollment Year', profile.enrollmentYear)}
                ${infoRow('Strand / Section', profile.section)}
                ${infoRow('Building', profile.building)}
                ${infoRow('Room', profile.room)}
            </div>

            <!-- Personal Details -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top:0;">Personal Details</h4>
                ${infoRow('Full Name', [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' '))}
                ${infoRow('Date of Birth', profile.dob)}
                ${infoRow('Age', profile.age)}
                ${infoRow('Gender', profile.gender)}
                ${infoRow('City Address', profile.cityAddress)}
                ${infoRow('Telephone No.', profile.telNo)}
                ${infoRow('Cellphone No.', profile.cellNo)}
                ${infoRow('Religion', profile.religion)}
                ${infoRow('Nationality', profile.nationality)}
            </div>

            <!-- Family Background -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top:0;">Family Background</h4>
                ${infoRow('Living With', profile.livingWith)}
                ${infoRow("Father's Name", profile.fatherName)}
                ${infoRow("Father's Occupation", profile.fatherOccupation)}
                ${infoRow("Mother's Name", profile.motherName)}
                ${infoRow("Mother's Occupation", profile.motherOccupation)}
            </div>

            <!-- Health Information -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top:0;">Health Information</h4>
                ${infoRow('Blood Type', profile.bloodType)}
                <div class="profile-info-item" style="flex-direction:column; align-items:flex-start; gap:4px;">
                    <span class="profile-info-label">Family History</span>
                    <div style="margin-top:4px;">${tagList(profile.familyHistory)}</div>
                </div>
                <div class="profile-info-item" style="flex-direction:column; align-items:flex-start; gap:4px; margin-top:8px;">
                    <span class="profile-info-label">Personal History</span>
                    <div style="margin-top:4px;">${tagList(profile.personalHistory)}</div>
                </div>
                ${profile.hadOperation ? `
                <div class="profile-info-item" style="flex-direction:column; align-items:flex-start; gap:4px; margin-top:8px;">
                    <span class="profile-info-label">Operation / Hospitalization</span>
                    <span class="profile-info-value" style="font-size:0.85rem; margin-top:2px;">${profile.operationDetails || 'Yes (no details provided)'}</span>
                </div>` : ''}
            </div>

            <!-- Emergency Contacts -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top:0;">Emergency Contacts</h4>
                ${(profile.emergencyContacts || []).length > 0
                    ? profile.emergencyContacts.map(c => `
                        <div class="profile-info-item" style="flex-direction:column; align-items:flex-start; gap:4px;">
                            <span class="profile-info-value">${c.name} (${c.relationship})</span>
                            <span class="profile-info-label">${c.phone}</span>
                        </div>
                    `).join('')
                    : '<p style="color:var(--color-text-hint); font-size:var(--font-size-sm);">No emergency contacts added</p>'
                }
                <button class="btn btn--secondary btn--sm mt-md" id="add-contact-btn">
                    <span class="material-icons-round">add</span> Add Contact
                </button>
            </div>

            <!-- Settings -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top:0;">Settings</h4>
                <div class="profile-info-item" style="cursor:pointer;" id="dark-mode-toggle">
                    <span class="profile-info-label" style="display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-round" style="font-size:20px;">dark_mode</span>
                        Dark Mode
                    </span>
                    <div style="position:relative; width:44px; height:24px;">
                        <div id="dark-mode-switch" style="
                            width:44px; height:24px; border-radius:12px;
                            background:${document.body.classList.contains('dark-mode') ? 'var(--color-primary)' : 'var(--color-border)'};
                            transition:background 0.2s ease; cursor:pointer; position:relative;">
                            <div style="
                                position:absolute; top:2px;
                                left:${document.body.classList.contains('dark-mode') ? '22px' : '2px'};
                                width:20px; height:20px; border-radius:50%;
                                background:white; box-shadow:0 1px 3px rgba(0,0,0,0.2);
                                transition:left 0.2s ease;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <button class="btn btn--danger btn--full" id="logout-btn">
                <span class="material-icons-round">logout</span>
                Logout
            </button>
        </div>

        ${window.getStudentBottomNav ? window.getStudentBottomNav('profile') : ''}
    `;

    // Edit profile
    document.getElementById('edit-profile-btn').addEventListener('click', () => showEditProfileModal(container));

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        Utils.showLoading();
        await AuthService.logout();
        Utils.hideLoading();
        Router.navigate('/login');
    });

    // Add contact
    document.getElementById('add-contact-btn')?.addEventListener('click', () => showAddContactModal(container));

    // Dark mode toggle
    document.getElementById('dark-mode-toggle')?.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('dat_dark_mode', isDark ? '1' : '0');
        const sw = document.getElementById('dark-mode-switch');
        if (sw) {
            sw.style.background = isDark ? 'var(--color-primary)' : 'var(--color-border)';
            sw.querySelector('div').style.left = isDark ? '22px' : '2px';
        }
    });
}

/* ── Edit Profile Modal ─────────────────────────────────── */
function showEditProfileModal(container) {
    const profile = Auth.userData?.profile || {};

    const BLOOD_TYPES_MODAL = ['A+','A-','B+','B-','O+','O-','AB+','AB-',
                               'A1+','A1-','A2+','A2-','A1B+','A1B-','A2B+','A2B-'];
    const btOpts = BLOOD_TYPES_MODAL.map(bt =>
        `<option value="${bt}" ${profile.bloodType===bt?'selected':''}>${bt}</option>`
    ).join('');

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal" style="max-width:520px; width:95%; max-height:90vh; overflow-y:auto;">
            <div class="modal-header">
                <h3 class="modal-title">Edit Profile</h3>
                <button class="btn btn--ghost" id="close-edit-modal">
                    <span class="material-icons-round">close</span>
                </button>
            </div>

            <p style="font-size:0.82rem; color:var(--color-text-hint); margin:0 0 16px;">
                Student ID and email are locked. All other fields are editable.
            </p>

            <!-- Personal -->
            <div style="font-weight:700; font-size:0.78rem; color:var(--color-primary); text-transform:uppercase; margin-bottom:8px;">Personal</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="input-group" style="margin:0;">
                    <label>First Name</label>
                    <input type="text" id="ep-firstname" class="input-field" value="${profile.firstName||''}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Middle Name</label>
                    <input type="text" id="ep-middlename" class="input-field" value="${profile.middleName||''}">
                </div>
            </div>
            <div class="input-group">
                <label>Last Name</label>
                <input type="text" id="ep-lastname" class="input-field" value="${profile.lastName||''}">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="input-group" style="margin:0;">
                    <label>Date of Birth</label>
                    <input type="date" id="ep-dob" class="input-field" value="${profile.dob||''}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Age</label>
                    <input type="number" id="ep-age" class="input-field" value="${profile.age||''}" min="1" max="100">
                </div>
            </div>
            <div class="input-group">
                <label>Gender</label>
                <select id="ep-gender" class="input-field">
                    <option value="">-- Select --</option>
                    <option value="Male"   ${profile.gender==='Male'  ?'selected':''}>Male</option>
                    <option value="Female" ${profile.gender==='Female'?'selected':''}>Female</option>
                    <option value="Other"  ${profile.gender==='Other' ?'selected':''}>Other</option>
                </select>
            </div>
            <div class="input-group">
                <label>City Address</label>
                <input type="text" id="ep-address" class="input-field" value="${profile.cityAddress||''}">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="input-group" style="margin:0;">
                    <label>Telephone No.</label>
                    <input type="tel" id="ep-tel" class="input-field" value="${profile.telNo||''}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Cellphone No.</label>
                    <input type="tel" id="ep-cell" class="input-field" value="${profile.cellNo||''}">
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="input-group" style="margin:0;">
                    <label>Religion</label>
                    <input type="text" id="ep-religion" class="input-field" value="${profile.religion||''}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Nationality</label>
                    <input type="text" id="ep-nationality" class="input-field" value="${profile.nationality||''}">
                </div>
            </div>

            <!-- Family Background -->
            <div style="font-weight:700; font-size:0.78rem; color:var(--color-primary); text-transform:uppercase; margin:16px 0 8px;">Family Background</div>
            <div class="input-group">
                <label>Living With</label>
                <select id="ep-living" class="input-field">
                    <option value="">-- Select --</option>
                    ${['Parents','Grandparents','Relatives','Others'].map(o =>
                        `<option value="${o}" ${profile.livingWith===o?'selected':''}>${o}</option>`
                    ).join('')}
                </select>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="input-group" style="margin:0;">
                    <label>Father's Name</label>
                    <input type="text" id="ep-father-name" class="input-field" value="${profile.fatherName||''}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Father's Occupation</label>
                    <input type="text" id="ep-father-occ" class="input-field" value="${profile.fatherOccupation||''}">
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="input-group" style="margin:0;">
                    <label>Mother's Name</label>
                    <input type="text" id="ep-mother-name" class="input-field" value="${profile.motherName||''}">
                </div>
                <div class="input-group" style="margin:0;">
                    <label>Mother's Occupation</label>
                    <input type="text" id="ep-mother-occ" class="input-field" value="${profile.motherOccupation||''}">
                </div>
            </div>

            <!-- Health -->
            <div style="font-weight:700; font-size:0.78rem; color:var(--color-primary); text-transform:uppercase; margin:16px 0 8px;">Health</div>
            <div class="input-group">
                <label>Blood Type</label>
                <select id="ep-blood-type" class="input-field">
                    <option value="">-- Select --</option>
                    ${btOpts}
                    <option value="Other" ${!BLOOD_TYPES_MODAL.includes(profile.bloodType) && profile.bloodType ? 'selected' : ''}>Other (specify)</option>
                </select>
            </div>
            <div class="input-group" id="ep-blood-other-group" style="display:${!BLOOD_TYPES_MODAL.includes(profile.bloodType) && profile.bloodType ? 'block' : 'none'};">
                <label>Specify Blood Type</label>
                <input type="text" id="ep-blood-other" class="input-field"
                    value="${!BLOOD_TYPES_MODAL.includes(profile.bloodType) ? profile.bloodType : ''}">
            </div>

            <button class="btn btn--primary btn--full mt-lg" id="save-profile-btn">
                <span class="material-icons-round">save</span> Save Changes
            </button>
        </div>
    `;
    document.body.appendChild(backdrop);

    document.getElementById('close-edit-modal').addEventListener('click', () => backdrop.remove());
    document.getElementById('ep-blood-type')?.addEventListener('change', (e) => {
        const grp = document.getElementById('ep-blood-other-group');
        if (grp) grp.style.display = e.target.value === 'Other' ? 'block' : 'none';
    });

    document.getElementById('save-profile-btn').addEventListener('click', async () => {
        const btVal       = document.getElementById('ep-blood-type').value;
        const btOtherVal  = document.getElementById('ep-blood-other')?.value.trim() || '';
        const finalBt     = btVal === 'Other' ? (btOtherVal || 'Other') : btVal;

        const updates = {
            'profile.firstName':        document.getElementById('ep-firstname').value.trim(),
            'profile.middleName':       document.getElementById('ep-middlename').value.trim(),
            'profile.lastName':         document.getElementById('ep-lastname').value.trim(),
            'profile.dob':              document.getElementById('ep-dob').value,
            'profile.age':              document.getElementById('ep-age').value,
            'profile.gender':           document.getElementById('ep-gender').value,
            'profile.cityAddress':      document.getElementById('ep-address').value.trim(),
            'profile.telNo':            document.getElementById('ep-tel').value.trim(),
            'profile.cellNo':           document.getElementById('ep-cell').value.trim(),
            'profile.religion':         document.getElementById('ep-religion').value.trim(),
            'profile.nationality':      document.getElementById('ep-nationality').value.trim(),
            'profile.livingWith':       document.getElementById('ep-living').value,
            'profile.fatherName':       document.getElementById('ep-father-name').value.trim(),
            'profile.fatherOccupation': document.getElementById('ep-father-occ').value.trim(),
            'profile.motherName':       document.getElementById('ep-mother-name').value.trim(),
            'profile.motherOccupation': document.getElementById('ep-mother-occ').value.trim(),
            'profile.bloodType':        finalBt,
        };

        Utils.showLoading();
        try {
            await db.collection('users').doc(auth.currentUser.uid).update(updates);
            // Refresh local cache
            const refreshed = await AuthService.getUserData(auth.currentUser.uid);
            if (refreshed.success) Auth.userData = refreshed.data;
            backdrop.remove();
            Utils.showToast('Profile updated!', 'success');
            const { renderStudentProfile: rerender } = await import('/pages/student/profile.js');
            rerender(container);
        } catch (err) {
            Utils.showToast('Failed to save: ' + err.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    });
}

/* ── Add Emergency Contact Modal ────────────────────────── */
function showAddContactModal(container) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Add Emergency Contact</h3>
                <button class="btn btn--ghost" id="close-contact-modal">
                    <span class="material-icons-round">close</span>
                </button>
            </div>
            <form id="add-contact-form">
                <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" class="input-field" id="contact-name" placeholder="Full name" required>
                </div>
                <div class="input-group">
                    <label>Relationship</label>
                    <input type="text" class="input-field" id="contact-relationship" placeholder="e.g. Mother, Father, Guardian">
                </div>
                <div class="input-group">
                    <label>Phone Number</label>
                    <input type="tel" class="input-field" id="contact-phone" placeholder="09XX XXX XXXX" required>
                </div>
                <button type="submit" class="btn btn--primary btn--full">Save Contact</button>
            </form>
        </div>
    `;
    document.body.appendChild(backdrop);

    document.getElementById('close-contact-modal').addEventListener('click', () => backdrop.remove());

    document.getElementById('add-contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newContact = {
            name:         document.getElementById('contact-name').value.trim(),
            relationship: document.getElementById('contact-relationship').value.trim(),
            phone:        document.getElementById('contact-phone').value.trim()
        };
        Utils.showLoading();
        const contacts = Auth.userData?.profile?.emergencyContacts || [];
        contacts.push(newContact);
        await db.collection('users').doc(auth.currentUser.uid).update({ 'profile.emergencyContacts': contacts });
        Auth.userData.profile.emergencyContacts = contacts;
        Utils.hideLoading();
        backdrop.remove();
        Utils.showToast('Contact added!', 'success');
        const { renderStudentProfile: rerender } = await import('/pages/student/profile.js');
        rerender(container);
    });
}
        <div class="page-student">
            <!-- Profile Header -->
            <div class="profile-card">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="student-avatar" style="width: 56px; height: 56px; font-size: 20px; background: rgba(255,255,255,0.2); color: white;">
                        ${initials}
                    </div>
                    <div>
                        <h3>${displayName}</h3>
                        <p>${Auth.userData?.email || ''}</p>
                    </div>
                </div>
            </div>

            <!-- Student Information -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top: 0;">Student Information</h4>
                <div class="profile-info-item">
                    <span class="profile-info-label">Student ID</span>
                    <span class="profile-info-value">${profile.studentId || 'N/A'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Strand/Section</span>
                    <span class="profile-info-value">${profile.section || 'N/A'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Building</span>
                    <span class="profile-info-value">${profile.building || 'N/A'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Room</span>
                    <span class="profile-info-value">${profile.room || 'N/A'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Blood Type</span>
                    <span class="profile-info-value">${profile.bloodType || 'N/A'}</span>
                </div>
            </div>

            <!-- Emergency Contacts -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top: 0;">Emergency Contacts</h4>
                ${(profile.emergencyContacts || []).length > 0
                    ? profile.emergencyContacts.map(contact => `
                        <div class="profile-info-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                            <span class="profile-info-value">${contact.name} (${contact.relationship})</span>
                            <span class="profile-info-label">${contact.phone}</span>
                        </div>
                    `).join('')
                    : '<p style="color: var(--color-text-hint); font-size: var(--font-size-sm);">No emergency contacts added</p>'
                }
                <button class="btn btn--secondary btn--sm mt-md" id="add-contact-btn">
                    <span class="material-icons-round">add</span> Add Contact
                </button>
            </div>

            <!-- Settings -->
            <div class="card mb-lg">
                <h4 class="section-header" style="margin-top: 0;">Settings</h4>
                <div class="profile-info-item" style="cursor: pointer;" id="dark-mode-toggle">
                    <span class="profile-info-label" style="display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons-round" style="font-size: 20px;">dark_mode</span>
                        Dark Mode
                    </span>
                    <div style="position: relative; width: 44px; height: 24px;">
                        <div id="dark-mode-switch" style="
                            width: 44px; height: 24px; border-radius: 12px;
                            background: ${document.body.classList.contains('dark-mode') ? 'var(--color-primary)' : 'var(--color-border)'};
                            transition: background 0.2s ease; cursor: pointer; position: relative;
                        ">
                            <div style="
                                position: absolute; top: 2px;
                                left: ${document.body.classList.contains('dark-mode') ? '22px' : '2px'};
                                width: 20px; height: 20px; border-radius: 50%;
                                background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                                transition: left 0.2s ease;
                            "></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <button class="btn btn--danger btn--full" id="logout-btn">
                <span class="material-icons-round">logout</span>
                Logout
            </button>
        </div>

        ${window.getStudentBottomNav ? window.getStudentBottomNav('profile') : ''}
    `;

    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', async () => {
        Utils.showLoading();
        await AuthService.logout();
        Utils.hideLoading();
        Router.navigate('/login');
    });

    // Add contact handler
    document.getElementById('add-contact-btn')?.addEventListener('click', () => {
        showAddContactModal();
    });

    // Dark mode toggle
    document.getElementById('dark-mode-toggle')?.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('dat_dark_mode', isDark ? '1' : '0');

        // Update the toggle switch visual
        const sw = document.getElementById('dark-mode-switch');
        if (sw) {
            sw.style.background = isDark ? 'var(--color-primary)' : 'var(--color-border)';
            sw.querySelector('div').style.left = isDark ? '22px' : '2px';
        }
    });
}


