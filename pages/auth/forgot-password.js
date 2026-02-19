/* ========================================
   FORGOT PASSWORD PAGE
   Digital Automatic Triage
   ======================================== */

export function renderForgotPasswordPage(container) {
    container.innerHTML = `
        <div class="auth-page">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Reset Password</h1>
                    <p>Enter your email to receive a reset link</p>
                </div>

                <form id="forgot-form" class="auth-form">
                    <div class="input-group">
                        <label for="forgot-email">Email</label>
                        <input type="email" id="forgot-email" class="input-field" placeholder="Enter your email" required>
                    </div>

                    <button type="submit" class="btn btn--primary btn--full btn--lg">Send Reset Link</button>

                    <div class="auth-links">
                        <a data-route="/login" class="auth-link">Back to Login</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('forgot-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgot-email').value.trim();
        if (!email) {
            Utils.showToast('Please enter your email.', 'warning');
            return;
        }

        Utils.showLoading();
        const result = await AuthService.resetPassword(email);
        Utils.hideLoading();

        if (result.success) {
            Utils.showToast('Password reset email sent! Check your inbox.', 'success');
        } else {
            Utils.showToast(result.error, 'error');
        }
    });
}
