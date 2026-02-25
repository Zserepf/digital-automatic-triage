/* ========================================
   STUDENT NOTIFICATIONS PAGE
   Digital Automatic Triage
   ======================================== */

export async function renderStudentNotifications(container) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/student.css">
        <div class="page-student">
            <div class="student-header">
                <div class="student-header-greeting">
                    <h1>Notifications</h1>
                    <p>Stay updated on your health journey</p>
                </div>
                <div class="student-header-actions">
                    <button class="btn btn--ghost btn--sm" id="mark-all-read-btn">
                        <span class="material-icons-round" style="font-size: 18px;">done_all</span>
                        Mark all read
                    </button>
                </div>
            </div>

            <div id="notifications-content">
                <div style="text-align: center; padding: 48px 0;">
                    <div class="spinner" style="margin: 0 auto;"></div>
                </div>
            </div>
        </div>

        ${window.getStudentBottomNav ? window.getStudentBottomNav('') : ''}
    `;

    const content = document.getElementById('notifications-content');

    document.getElementById('mark-all-read-btn')?.addEventListener('click', async () => {
        Utils.showLoading();
        await NotificationService.markAllRead();
        Utils.hideLoading();
        Utils.showToast('All notifications marked as read.', 'success');
        renderStudentNotifications(container);
    });

    try {
        const result = await NotificationService.getMyNotifications();
        const notifications = result.success ? result.data : [];

        if (notifications.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 48px 0; color: var(--color-text-hint);">
                    <span class="material-icons-round" style="font-size: 64px; margin-bottom: 16px;">notifications_none</span>
                    <p>No notifications yet</p>
                    <p style="font-size: var(--font-size-sm);">You'll see updates about your appointments and recovery here</p>
                </div>
            `;
            return;
        }

        const ICON_MAP = {
            'appointment_created': 'event_available',
            'appointment_status': 'update',
            'consultation_completed': 'medical_information',
            'follow_up_request': 'event',
            'follow_up_confirmed': 'event_available',
            'follow_up_instructions': 'message',
            'emergency_response': 'local_hospital',
            'recovery_complete': 'verified',
            'general': 'notifications'
        };

        const COLOR_MAP = {
            'urgent': 'var(--color-emergency)',
            'warning': 'var(--color-moderate)',
            'normal': 'var(--color-primary)',
            'success': 'var(--color-normal)'
        };

        content.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${notifications.map(n => {
                    const icon = ICON_MAP[n.type] || 'notifications';
                    const color = COLOR_MAP[n.severity] || 'var(--color-primary)';
                    const isUnread = !n.read;
                    const timeAgo = getTimeAgo(n.createdAt);

                    return `
                    <div class="card ${isUnread ? 'card--bordered' : ''}" 
                         style="padding: 14px; cursor: pointer; ${isUnread ? 'border-color: ' + color + '; background: #f8faff;' : 'opacity: 0.75;'}"
                         data-notif-id="${n.id}" data-notif-read="${n.read}">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <div style="min-width: 36px; height: 36px; border-radius: 50%; background: ${isUnread ? color : 'var(--color-border)'}; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <span class="material-icons-round" style="font-size: 18px;">${icon}</span>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                                    <div style="font-weight: ${isUnread ? '700' : '500'}; font-size: var(--font-size-base); color: var(--color-text-primary);">
                                        ${n.title || 'Notification'}
                                    </div>
                                    ${isUnread ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: ' + color + '; flex-shrink: 0; margin-top: 6px;"></div>' : ''}
                                </div>
                                <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 2px; line-height: 1.5;">
                                    ${n.message || ''}
                                </p>
                                <span style="font-size: var(--font-size-xs); color: var(--color-text-hint); margin-top: 4px; display: inline-block;">
                                    ${timeAgo}
                                </span>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;

        // Mark individual as read on click
        content.querySelectorAll('[data-notif-id]').forEach(el => {
            el.addEventListener('click', async () => {
                const id = el.dataset.notifId;
                if (el.dataset.notifRead === 'false') {
                    await NotificationService.markRead(id);
                    el.style.opacity = '0.75';
                    el.style.borderColor = 'var(--color-border)';
                    el.style.background = 'var(--color-surface)';
                    el.dataset.notifRead = 'true';
                    // Update badge count
                    if (window._updateNotifBadge) window._updateNotifBadge();
                }
            });
        });

    } catch (error) {
        content.innerHTML = `
            <div style="text-align: center; padding: 48px 0; color: var(--color-emergency);">
                <p>Failed to load notifications.</p>
            </div>
        `;
    }
}

function getTimeAgo(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
