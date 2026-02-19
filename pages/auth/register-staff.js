/* ========================================
   STAFF REGISTRATION PAGE
   Digital Automatic Triage
   ======================================== */

// Clinic access code - change this to your preferred code
const CLINIC_ACCESS_CODE = 'CLINIC2026';

export function renderRegisterStaffPage(container) {
    container.innerHTML = `
        <link rel="stylesheet" href="/css/main.css">
        <div class="auth-page">
            <div class="auth-card" style="max-width: 480px;">
                <div class="auth-header">
                    <div style="width: 56px; height: 56px; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-base);">
                        <span class="material-icons-round" style="color: white; font-size: 28px;">local_hospital</span>
                    </div>
                    <h1>Staff Registration</h1>
                    <p>Create a clinic staff account</p>
                </div>

                <!-- Step 1: Access Code -->
                <div id="step-access-code">
                    <form id="access-code-form" class="auth-form">
                        <div class="input-group">
                            <label for="access-code">Clinic Access Code</label>
                            <input type="password" id="access-code" class="input-field"
                                placeholder="Enter the clinic access code" required>
                            <span class="input-hint">Contact the clinic administrator for this code.</span>
                        </div>
                        <button type="submit" class="btn btn--primary btn--full btn--lg">Continue</button>
                        <div class="auth-links">
                            <a data-route="/login" class="auth-link">← Back to Login</a>
                        </div>
                    </form>
                </div>

                <!-- Step 2: Staff Details (hidden until code verified) -->
                <div id="step-register-form" style="display: none;">
                    <form id="staff-register-form" class="auth-form">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-base);">
                            <div class="input-group">
                                <label for="staff-firstname">First Name</label>
                                <input type="text" id="staff-firstname" class="input-field" placeholder="First name" required>
                            </div>
                            <div class="input-group">
                                <label for="staff-lastname">Last Name</label>
                                <input type="text" id="staff-lastname" class="input-field" placeholder="Last name" required>
                            </div>
                        </div>

                        <div class="input-group">
                            <label for="staff-email">Email</label>
                            <input type="email" id="staff-email" class="input-field" placeholder="Enter your email" required>
                        </div>

                        <div class="input-group">
                            <label for="staff-position">Position / Title</label>
                            <select id="staff-position" class="input-field" required>
                                <option value="">Select position</option>
                                <option value="School Nurse">School Nurse</option>
                                <option value="School Doctor">School Doctor</option>
                                <option value="Clinic Staff">Clinic Staff</option>
                                <option value="Health Aide">Health Aide</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label for="staff-employee-id">Employee ID</label>
                            <input type="text" id="staff-employee-id" class="input-field" placeholder="Enter your employee ID" required>
                        </div>

                        <div class="input-group">
                            <label for="staff-password">Password</label>
                            <input type="password" id="staff-password" class="input-field" placeholder="Create a password" required minlength="6">
                        </div>

                        <div class="input-group">
                            <label for="staff-confirm-password">Confirm Password</label>
                            <input type="password" id="staff-confirm-password" class="input-field" placeholder="Confirm your password" required>
                        </div>

                        <button type="submit" class="btn btn--primary btn--full btn--lg" id="staff-submit-btn">
                            Create Staff Account
                        </button>

                        <div class="auth-links">
                            <a id="back-to-code" class="auth-link" style="cursor: pointer;">← Change Access Code</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Step 1: Verify access code
    const accessCodeForm = document.getElementById('access-code-form');
    accessCodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('access-code').value.trim().toUpperCase();
        if (code === CLINIC_ACCESS_CODE) {
            document.getElementById('step-access-code').style.display = 'none';
            document.getElementById('step-register-form').style.display = 'block';
        } else {
            Utils.showToast('Invalid access code. Please contact the clinic administrator.', 'error');
        }
    });

    // Back to code step
    document.getElementById('back-to-code').addEventListener('click', () => {
        document.getElementById('step-register-form').style.display = 'none';
        document.getElementById('step-access-code').style.display = 'block';
        document.getElementById('access-code').value = '';
    });

    // Step 2: Register staff account
    const staffForm = document.getElementById('staff-register-form');
    staffForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('staff-password').value;
        const confirmPassword = document.getElementById('staff-confirm-password').value;

        if (password !== confirmPassword) {
            Utils.showToast('Passwords do not match.', 'error');
            return;
        }

        if (password.length < 6) {
            Utils.showToast('Password must be at least 6 characters.', 'warning');
            return;
        }

        const email = document.getElementById('staff-email').value.trim();
        const userData = {
            firstName: document.getElementById('staff-firstname').value.trim(),
            lastName: document.getElementById('staff-lastname').value.trim(),
            employeeId: document.getElementById('staff-employee-id').value.trim(),
            position: document.getElementById('staff-position').value,
            role: 'clinic_staff',
            emergencyContacts: [],
            allergies: []
        };

        const btn = document.getElementById('staff-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Creating Account...';

        Utils.showLoading();
        const result = await AuthService.register(email, password, userData);
        Utils.hideLoading();

        if (result.success) {
            Utils.showToast('Staff account created! Welcome to the clinic dashboard.', 'success');
            // Auth state listener will redirect to /clinic/dashboard automatically
        } else {
            btn.disabled = false;
            btn.textContent = 'Create Staff Account';
            Utils.showToast(result.error, 'error');
        }
    });
}
