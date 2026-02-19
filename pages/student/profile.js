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

    container.innerHTML = `
        <link rel="stylesheet" href="/css/student.css">
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

function showAddContactModal() {
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
            name: document.getElementById('contact-name').value.trim(),
            relationship: document.getElementById('contact-relationship').value.trim(),
            phone: document.getElementById('contact-phone').value.trim()
        };

        Utils.showLoading();

        const contacts = Auth.userData?.profile?.emergencyContacts || [];
        contacts.push(newContact);

        await db.collection('users').doc(auth.currentUser.uid).update({
            'profile.emergencyContacts': contacts
        });

        // Update local data
        Auth.userData.profile.emergencyContacts = contacts;

        Utils.hideLoading();
        backdrop.remove();
        Utils.showToast('Contact added!', 'success');

        // Re-render profile
        const container = document.getElementById('page-container');
        const { renderStudentProfile: rerender } = await import('/pages/student/profile.js');
        rerender(container);
    });
}
