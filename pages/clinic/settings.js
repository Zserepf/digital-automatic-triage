/* ========================================
   CLINIC SETTINGS PAGE
   Digital Automatic Triage
   ======================================== */

export function renderClinicSettings(container) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/clinic.css">
        <div class="page-clinic">
            ${window.getClinicSidebar ? window.getClinicSidebar('settings') : ''}
            <div class="clinic-content">
                <h1 style="margin-bottom: 24px;">Settings</h1>

                <div style="max-width: 640px;">
                    <!-- Operating Hours -->
                    <div class="card mb-lg">
                        <h3 style="margin-bottom: 16px;">Operating Hours</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="input-group">
                                <label>Opening Time</label>
                                <input type="time" class="input-field" id="settings-open" value="08:00">
                            </div>
                            <div class="input-group">
                                <label>Closing Time</label>
                                <input type="time" class="input-field" id="settings-close" value="17:00">
                            </div>
                        </div>
                    </div>

                    <!-- Queue Settings -->
                    <div class="card mb-lg">
                        <h3 style="margin-bottom: 16px;">Queue Settings</h3>
                        <div class="input-group">
                            <label>Slots per Hour</label>
                            <input type="number" class="input-field" id="settings-slots" value="6" min="1" max="20">
                        </div>
                        <div class="input-group">
                            <label>Follow-up Slots per Day</label>
                            <input type="number" class="input-field" id="settings-followup-slots" value="5" min="0" max="20">
                        </div>
                    </div>

                    <!-- Appearance -->
                    <div class="card mb-lg">
                        <h3 style="margin-bottom: 16px;">Appearance</h3>
                        <div class="profile-info-item" style="cursor:pointer;" id="clinic-dark-mode-toggle">
                            <span style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-base); color:var(--color-text-primary);">
                                <span class="material-icons-round" style="font-size:20px;">dark_mode</span>
                                Dark Mode
                            </span>
                            <div style="position:relative; width:44px; height:24px;">
                                <div id="clinic-dark-switch" style="
                                    width:44px; height:24px; border-radius:12px;
                                    background:${document.body.classList.contains('dark-mode') ? 'var(--color-primary)' : 'var(--color-border)'};
                                    transition:background 0.2s; cursor:pointer; position:relative;">
                                    <div style="
                                        position:absolute; top:2px;
                                        left:${document.body.classList.contains('dark-mode') ? '22px' : '2px'};
                                        width:20px; height:20px; border-radius:50%;
                                        background:white; box-shadow:0 1px 3px rgba(0,0,0,0.2);
                                        transition:left 0.2s;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Account -->
                    <div class="card mb-lg">
                        <h3 style="margin-bottom: 16px;">Account</h3>
                        <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: 12px;">
                            Logged in as: <strong>${Auth.userData?.email || ''}</strong>
                        </p>
                        <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: 16px;">
                            Role: <strong>${Auth.userData?.role || ''}</strong>
                        </p>
                        <button class="btn btn--danger" id="settings-logout-btn">
                            <span class="material-icons-round">logout</span>
                            Logout
                        </button>
                    </div>

                    <button class="btn btn--primary btn--full" id="save-settings-btn">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    `;

    // Logout
    document.getElementById('settings-logout-btn')?.addEventListener('click', async () => {
        await AuthService.logout();
        Router.navigate('/login');
    });

    // Clinic dark mode toggle
    document.getElementById('clinic-dark-mode-toggle')?.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        const darkKey = 'dat_dark_mode_' + auth.currentUser.uid;
        localStorage.setItem(darkKey, isDark ? '1' : '0');
        const sw = document.getElementById('clinic-dark-switch');
        if (sw) {
            sw.style.background = isDark ? 'var(--color-primary)' : 'var(--color-border)';
            sw.querySelector('div').style.left = isDark ? '22px' : '2px';
        }
    });

    // Save settings
    document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
        Utils.showLoading();
        try {
            await db.collection('clinic_settings').doc('config').set({
                operatingHours: {
                    start: document.getElementById('settings-open').value,
                    end: document.getElementById('settings-close').value
                },
                slotsPerHour: parseInt(document.getElementById('settings-slots').value) || 6,
                followUpSlots: parseInt(document.getElementById('settings-followup-slots').value) || 5
            }, { merge: true });
            Utils.showToast('Settings saved!', 'success');
        } catch (error) {
            Utils.showToast('Failed to save settings.', 'error');
        }
        Utils.hideLoading();
    });
}
