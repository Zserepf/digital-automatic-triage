/* ========================================
   REGISTER PAGE
   Digital Automatic Triage
   ======================================== */

export function renderRegisterPage(container) {
    container.innerHTML = `
        <div class="auth-page">
            <div class="auth-card" style="max-width: 480px;">
                <div class="auth-header">
                    <h1>Create Account</h1>
                    <p>Register to get started</p>
                </div>

                <form id="register-form" class="auth-form">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-base);">
                        <div class="input-group">
                            <label for="reg-firstname">First Name</label>
                            <input type="text" id="reg-firstname" class="input-field" placeholder="First name" required>
                        </div>
                        <div class="input-group">
                            <label for="reg-lastname">Last Name</label>
                            <input type="text" id="reg-lastname" class="input-field" placeholder="Last name" required>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="reg-email">Email</label>
                        <input type="email" id="reg-email" class="input-field" placeholder="Enter your school email" required>
                    </div>

                    <div class="input-group">
                        <label for="reg-student-id">Student ID</label>
                        <input type="text" id="reg-student-id" class="input-field" placeholder="Enter your student ID" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-base);">
                        <div class="input-group">
                            <label for="reg-section">Strand/Section</label>
                            <input type="text" id="reg-section" class="input-field" placeholder="e.g. STEM 12-A">
                        </div>
                        <div class="input-group">
                            <label for="reg-blood-type">Blood Type</label>
                            <select id="reg-blood-type" class="input-field">
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="reg-password">Password</label>
                        <input type="password" id="reg-password" class="input-field" placeholder="Create a password" required minlength="6">
                    </div>

                    <div class="input-group">
                        <label for="reg-confirm-password">Confirm Password</label>
                        <input type="password" id="reg-confirm-password" class="input-field" placeholder="Confirm your password" required>
                    </div>

                    <button type="submit" class="btn btn--primary btn--full btn--lg">Register</button>

                    <div class="auth-links">
                        <a data-route="/login" class="auth-link">Already have an account? Login</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Form handler
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
            Utils.showToast('Passwords do not match.', 'error');
            return;
        }

        if (password.length < 6) {
            Utils.showToast('Password must be at least 6 characters.', 'warning');
            return;
        }

        const userData = {
            firstName: document.getElementById('reg-firstname').value.trim(),
            lastName: document.getElementById('reg-lastname').value.trim(),
            studentId: document.getElementById('reg-student-id').value.trim(),
            section: document.getElementById('reg-section').value.trim(),
            bloodType: document.getElementById('reg-blood-type').value,
            role: 'student',
            emergencyContacts: [],
            allergies: []
        };

        Utils.showLoading();
        const result = await AuthService.register(email, password, userData);
        Utils.hideLoading();

        if (result.success) {
            Utils.showToast('Account created successfully!', 'success');
        } else {
            Utils.showToast(result.error, 'error');
        }
    });
}
