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
                            <label for="reg-section">Strand / Section</label>
                            <select id="reg-section" class="input-field" required>
                                <option value="">-- Select Section --</option>
                                <optgroup label="🏫 St. Catherine Building">
                                    <option value="St. Catherine Building|Room 201|Grade 1 Joy">Grade 1 Joy (Rm 201)</option>
                                    <option value="St. Catherine Building|Room 202|Grade 1 Peace">Grade 1 Peace (Rm 202)</option>
                                    <option value="St. Catherine Building|Room 203|Grade 1 Piety">Grade 1 Piety (Rm 203)</option>
                                    <option value="St. Catherine Building|Room 204|Grade 2 Humility">Grade 2 Humility (Rm 204)</option>
                                    <option value="St. Catherine Building|Room 207|Grade 2 Kindness">Grade 2 Kindness (Rm 207)</option>
                                    <option value="St. Catherine Building|Room 208|Grade 2 Obedience">Grade 2 Obedience (Rm 208)</option>
                                    <option value="St. Catherine Building|Room 209|Grade 3 Gratitude">Grade 3 Gratitude (Rm 209)</option>
                                    <option value="St. Catherine Building|Room 307|Grade 3 Honesty">Grade 3 Honesty (Rm 307)</option>
                                    <option value="St. Catherine Building|Room 308|Grade 3 Wisdom">Grade 3 Wisdom (Rm 308)</option>
                                    <option value="St. Catherine Building|Room 303|Grade 4 Fortitude">Grade 4 Fortitude (Rm 303)</option>
                                    <option value="St. Catherine Building|Room 305|Grade 4 Justice">Grade 4 Justice (Rm 305)</option>
                                    <option value="St. Catherine Building|Room 304|Grade 4 Prudence">Grade 4 Prudence (Rm 304)</option>
                                    <option value="St. Catherine Building|Room 401|Grade 5 Modesty">Grade 5 Modesty (Rm 401)</option>
                                    <option value="St. Catherine Building|Room 302|Grade 5 Patience">Grade 5 Patience (Rm 302)</option>
                                    <option value="St. Catherine Building|Room 301|Grade 5 Providence">Grade 5 Providence (Rm 301)</option>
                                    <option value="St. Catherine Building|Room 404|Grade 6 Courage">Grade 6 Courage (Rm 404)</option>
                                    <option value="St. Catherine Building|Room 402|Grade 6 Determination">Grade 6 Determination (Rm 402)</option>
                                    <option value="St. Catherine Building|Room 403|Grade 6 Perseverance">Grade 6 Perseverance (Rm 403)</option>
                                    <option value="St. Catherine Building|Room 501|Gr. 11 St. Albert the Great (STEM)">Gr. 11 St. Albert the Great — STEM (Rm 501)</option>
                                    <option value="St. Catherine Building|Room 502|Gr. 11 St. Catherine of Siena (STEM)">Gr. 11 St. Catherine of Siena — STEM (Rm 502)</option>
                                    <option value="St. Catherine Building|Room 503|Gr. 11 St. Dominic de Guzman (STEM)">Gr. 11 St. Dominic de Guzman — STEM (Rm 503)</option>
                                    <option value="St. Catherine Building|Room 504|Gr. 11 St. Martin de Porres (STEM)">Gr. 11 St. Martin de Porres — STEM (Rm 504)</option>
                                    <option value="St. Catherine Building|Room 505|Gr. 11 St. Thomas Aquinas (STEM)">Gr. 11 St. Thomas Aquinas — STEM (Rm 505)</option>
                                    <option value="St. Catherine Building|Room 506|Gr. 11 St. Francis de Capillas (STEM)">Gr. 11 St. Francis de Capillas — STEM (Rm 506)</option>
                                </optgroup>
                                <optgroup label="🏫 St. Dominic Building">
                                    <option value="St. Dominic Building|Room 404|Grade 7 Compassionate Christian">Grade 7 Compassionate Christian (Rm 404)</option>
                                    <option value="St. Dominic Building|Room 405|Grade 7 Marian Devotee">Grade 7 Marian Devotee (Rm 405)</option>
                                    <option value="St. Dominic Building|Room 403|Grade 7 Research Motivated">Grade 7 Research Motivated (Rm 403)</option>
                                    <option value="St. Dominic Building|Room 406|Grade 7 Service Oriented">Grade 7 Service Oriented (Rm 406)</option>
                                    <option value="St. Dominic Building|Room 407|Grade 7 Truth Seeker">Grade 7 Truth Seeker (Rm 407)</option>
                                    <option value="St. Dominic Building|Room 402|Grade 7 Proud Global Pinoy">Grade 7 Proud Global Pinoy (Rm 402)</option>
                                    <option value="St. Dominic Building|Room 401|Grade 8 Family Oriented">Grade 8 Family Oriented (Rm 401)</option>
                                    <option value="St. Dominic Building|Room 408|Grade 8 Music Enthusiast">Grade 8 Music Enthusiast (Rm 408)</option>
                                    <option value="St. Dominic Building|Room 409|Grade 8 Pro-Life Advocate">Grade 8 Pro-Life Advocate (Rm 409)</option>
                                    <option value="St. Dominic Building|Room 410|Grade 8 Stewards of God's Creation">Grade 8 Stewards of God's Creation (Rm 410)</option>
                                    <option value="St. Dominic Building|Room 415|Grade 8 Technology Competent">Grade 8 Technology Competent (Rm 415)</option>
                                    <option value="St. Dominic Building|Room 412|Grade 9 Self Smart">Grade 9 Self Smart (Rm 412)</option>
                                    <option value="St. Dominic Building|Room 512|Grade 9 Body Smart A">Grade 9 Body Smart A (Rm 512)</option>
                                    <option value="St. Dominic Building|Room 511|Grade 9 Body Smart B">Grade 9 Body Smart B (Rm 511)</option>
                                    <option value="St. Dominic Building|Room 414|Grade 9 Creative Learner">Grade 9 Creative Learner (Rm 414)</option>
                                    <option value="St. Dominic Building|Room 413|Grade 9 Gospel Preacher">Grade 9 Gospel Preacher (Rm 413)</option>
                                    <option value="St. Dominic Building|Room 411|Grade 9 People Smart">Grade 9 People Smart (Rm 411)</option>
                                    <option value="St. Dominic Building|Room 313|Grade 10 Eucharist Centered">Grade 10 Eucharist Centered (Rm 313)</option>
                                    <option value="St. Dominic Building|Room 314|Grade 10 Good Samaritan">Grade 10 Good Samaritan (Rm 314)</option>
                                    <option value="St. Dominic Building|Room 312|Grade 10 Lifelong Learner">Grade 10 Lifelong Learner (Rm 312)</option>
                                    <option value="St. Dominic Building|Room 311|Grade 10 Mission Oriented">Grade 10 Mission Oriented (Rm 311)</option>
                                    <option value="St. Dominic Building|Room 202|Grade 10 Integrity">Grade 10 Integrity (Rm 202)</option>
                                    <option value="St. Dominic Building|Room 501|Gr. 11 St. Lorenzo Ruiz (ABM)">Gr. 11 St. Lorenzo Ruiz — ABM (Rm 501)</option>
                                    <option value="St. Dominic Building|Room 503|Gr. 11 St. Rose of Lima (ABM)">Gr. 11 St. Rose of Lima — ABM (Rm 503)</option>
                                    <option value="St. Dominic Building|Room 504|Gr. 11 St. Margaret of Hungary (HUMSS)">Gr. 11 St. Margaret of Hungary — HUMSS (Rm 504)</option>
                                    <option value="St. Dominic Building|Room 505|Gr. 11 St. John Macias (HUMSS)">Gr. 11 St. John Macias — HUMSS (Rm 505)</option>
                                    <option value="St. Dominic Building|Room 507|Gr. 11 St. Pius V Culinary (TVL)">Gr. 11 St. Pius V — Culinary/TVL (Rm 507)</option>
                                    <option value="St. Dominic Building|Room 506|Gr. 11 St. Louis de Montfort Travel Services (TVL)">Gr. 11 St. Louis de Montfort — Travel Svc/TVL (Rm 506)</option>
                                </optgroup>
                                <optgroup label="🏫 St. Thomas Building">
                                    <option value="St. Thomas Building|Room 403|Grade 12 STEM 1">Grade 12 STEM 1 (Rm 403)</option>
                                    <option value="St. Thomas Building|Room 501|Grade 12 STEM 2">Grade 12 STEM 2 (Rm 501)</option>
                                    <option value="St. Thomas Building|Room 502|Grade 12 STEM 3">Grade 12 STEM 3 (Rm 502)</option>
                                    <option value="St. Thomas Building|Room 503|Grade 12 STEM 4">Grade 12 STEM 4 (Rm 503)</option>
                                    <option value="St. Thomas Building|Room 505|Grade 12 STEM 5">Grade 12 STEM 5 (Rm 505)</option>
                                    <option value="St. Thomas Building|Room 504|Grade 12 ABM 1">Grade 12 ABM 1 (Rm 504)</option>
                                    <option value="St. Thomas Building|Room 301|Grade 12 HUMMS 1">Grade 12 HUMMS 1 (Rm 301)</option>
                                    <option value="St. Thomas Building|Room 506|Grade 12 HUMMS 2">Grade 12 HUMMS 2 (Rm 506)</option>
                                    <option value="St. Thomas Building|Room 401|Grade 12 Travel Services 1">Grade 12 Travel Services 1 (Rm 401)</option>
                                    <option value="St. Thomas Building|Room 402|Grade 12 Culinary 1">Grade 12 Culinary 1 (Rm 402)</option>
                                </optgroup>
                            </select>
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

        const sectionRaw = document.getElementById('reg-section').value;
        if (!sectionRaw) {
            Utils.showToast('Please select your section.', 'warning');
            return;
        }
        const [secBuilding, secRoom, secName] = sectionRaw.split('|');

        const userData = {
            firstName: document.getElementById('reg-firstname').value.trim(),
            lastName: document.getElementById('reg-lastname').value.trim(),
            studentId: document.getElementById('reg-student-id').value.trim(),
            section: secName,
            building: secBuilding,
            room: secRoom,
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
