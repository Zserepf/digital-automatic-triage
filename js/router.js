/* ========================================
   CLIENT-SIDE ROUTER
   Digital Automatic Triage
   ======================================== */

const Router = {
    routes: {},
    currentRoute: null,

    // Register a route
    register(path, handler) {
        this.routes[path] = handler;
    },

    // Navigate to a route
    async navigate(path, params = {}) {
        // Update URL without reload
        window.history.pushState({ path, params }, '', path);

        await this._loadRoute(path, params);
    },

    // Load a route
    async _loadRoute(path, params = {}) {
        const container = document.getElementById('page-container');
        if (!container) return;

        // Find matching route
        const handler = this.routes[path];

        if (handler) {
            this.currentRoute = path;
            try {
                await handler(container, params);
            } catch (error) {
                console.error('Error loading route:', error);
                container.innerHTML = `
                    <div style="padding: 24px; text-align: center;">
                        <h2>Something went wrong</h2>
                        <p>${error.message}</p>
                        <button class="btn btn--primary mt-lg" onclick="Router.navigate('/')">Go Home</button>
                    </div>`;
            }
        } else {
            // 404
            container.innerHTML = `
                <div style="padding: 24px; text-align: center;">
                    <h2>Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                    <button class="btn btn--primary mt-lg" onclick="Router.navigate('/')">Go Home</button>
                </div>`;
        }
    },

    // Initialize router
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            const path = event.state?.path || window.location.pathname;
            this._loadRoute(path, event.state?.params || {});
        });

        // Handle link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const path = link.getAttribute('data-route');
                const params = link.dataset.params ? JSON.parse(link.dataset.params) : {};
                this.navigate(path, params);
            }
        });

        // Load initial route
        const initialPath = window.location.pathname === '' ? '/' : window.location.pathname;
        this._loadRoute(initialPath);
    }
};
