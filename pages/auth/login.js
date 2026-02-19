/* ========================================
   LOGIN PAGE
   Digital Automatic Triage
   ======================================== */

export function renderLoginPage(container) {
    container.innerHTML = `
        <div class="auth-page">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Digital Automatic Triage</h1>
                    <p>Student Wellness Monitoring</p>
                </div>

                <form id="login-form" class="auth-form">
                    <div class="input-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" class="input-field" placeholder="Enter your email" required>
                    </div>

                    <div class="input-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" class="input-field" placeholder="Enter your password" required>
                    </div>

                    <button type="submit" class="btn btn--primary btn--full btn--lg">Login</button>

                    <div class="auth-links">
                        <a data-route="/forgot-password" class="auth-link">Forgot Password?</a>
                        <a data-route="/register" class="auth-link">Don't have an account? Register</a>
                        <a data-route="/register-staff" class="auth-link" style="margin-top: 4px; opacity: 0.75; font-size: 0.8rem;">Clinic Staff? Register here</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add auth page styles
    addAuthStyles();

    // Form handler
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            Utils.showToast('Please fill in all fields.', 'warning');
            return;
        }

        Utils.showLoading();
        const result = await AuthService.login(email, password);
        Utils.hideLoading();

        if (result.success) {
            Utils.showToast('Login successful!', 'success');
            // Auth state listener will handle redirect
        } else {
            Utils.showToast(result.error, 'error');
        }
    });
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
