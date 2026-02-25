/* ========================================
   AUTHENTICATION MODULE
   Digital Automatic Triage
   ======================================== */

const Auth = {
    currentUser: null,
    userData: null,

    // Initialize auth state listener
    init() {
        AuthService.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                const result = await AuthService.getUserData(user.uid);
                if (result.success) {
                    this.userData = result.data;
                    // Apply per-user dark mode preference
                    const darkKey = 'dat_dark_mode_' + user.uid;
                    if (localStorage.getItem(darkKey) === '1') {
                        document.body.classList.add('dark-mode');
                    } else {
                        document.body.classList.remove('dark-mode');
                    }
                    this._redirectBasedOnRole();
                }
            } else {
                this.currentUser = null;
                this.userData = null;
                // Always clear dark mode on logout so it doesn't bleed to next user
                document.body.classList.remove('dark-mode');
                // Redirect to login if not on auth pages
                const authPages = ['/login', '/register', '/forgot-password', '/register-staff'];
                if (!authPages.includes(Router.currentRoute)) {
                    Router.navigate('/login');
                }
            }
        });
    },

    // Redirect user based on role
    _redirectBasedOnRole() {
        const role = this.userData?.role;
        const currentRoute = Router.currentRoute;
        const authPages = ['/login', '/register', '/forgot-password', '/register-staff', '/'];

        if (authPages.includes(currentRoute)) {
            if (role === 'student') {
                Router.navigate('/student/home');
            } else if (role === 'clinic_staff' || role === 'admin') {
                Router.navigate('/clinic/dashboard');
            }
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    },

    // Check if user is student
    isStudent() {
        return this.userData?.role === 'student';
    },

    // Check if user is clinic staff
    isClinicStaff() {
        return this.userData?.role === 'clinic_staff' || this.userData?.role === 'admin';
    },

    // Get display name
    getDisplayName() {
        if (!this.userData?.profile) return 'User';
        return `${this.userData.profile.firstName} ${this.userData.profile.lastName}`.trim() || 'User';
    },

    // Get initials for avatar
    getInitials() {
        if (!this.userData?.profile) return '?';
        const first = this.userData.profile.firstName?.[0] || '';
        const last = this.userData.profile.lastName?.[0] || '';
        return (first + last).toUpperCase() || '?';
    }
};
