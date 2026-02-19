/* ========================================
   CLINIC RECORDS PAGE
   Digital Automatic Triage
   ======================================== */

export async function renderClinicRecords(container) {
    if (!Auth.isAuthenticated() || !Auth.isClinicStaff()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/clinic.css">
        <div class="page-clinic">
            ${window.getClinicSidebar ? window.getClinicSidebar('records') : ''}
            <div class="clinic-content">
                <div class="clinic-page-header">
                    <h1>Consultation Records</h1>
                    <span class="date-display">All past consultations</span>
                </div>

                <!-- Search / Filter bar -->
                <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                    <input type="text" id="records-search" class="input-field"
                        placeholder="Search by name, diagnosis..."
                        style="flex: 1; min-width: 200px;">
                    <select id="records-filter" class="input-field" style="width: 160px;">
                        <option value="">All Severity</option>
                        <option value="emergency">Emergency</option>
                        <option value="severe">Severe</option>
                        <option value="moderate">Moderate</option>
                        <option value="minor">Minor</option>
                    </select>
                </div>

                <div id="records-content">
                    <div style="text-align: center; padding: 48px;">
                        <div class="spinner" style="margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const recordsContent = document.getElementById('records-content');

    try {
        // Load consultations + appointments in parallel
        const [consultResult, appointResult] = await Promise.all([
            ConsultationService.getAllForClinic(),
            db.collection('appointments').orderBy('createdAt', 'desc').limit(200).get()
                .then(snap => ({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) }))
                .catch(() => ({ success: false, data: [] }))
        ]);

        const consultations = consultResult.success ? consultResult.data : [];
        const appointments = appointResult.data || [];

        // Build appointment map: appointmentId → appointment
        const aptMap = {};
        appointments.forEach(a => { aptMap[a.id] = a; });

        if (consultations.length === 0) {
            recordsContent.innerHTML = `
                <div style="text-align: center; padding: 64px 0; color: var(--color-text-hint);">
                    <span class="material-icons-round" style="font-size: 64px; margin-bottom: 16px;">folder_open</span>
                    <p>No consultation records yet</p>
                    <p style="font-size: var(--font-size-sm);">Completed consultations will appear here</p>
                </div>
            `;
            return;
        }

        // Batch load all unique user IDs
        const userIds = [...new Set(consultations.map(c => c.userId).filter(Boolean))];
        const userMap = await AuthService.getUsersByIds(userIds);

        // Store for filtering
        let allRecords = consultations.map(c => ({
            consultation: c,
            appointment: aptMap[c.appointmentId] || null,
            user: userMap[c.userId] || null
        }));

        function renderRecords(records) {
            if (records.length === 0) {
                recordsContent.innerHTML = `
                    <div style="text-align: center; padding: 48px; color: var(--color-text-hint);">
                        <p>No records match your search</p>
                    </div>
                `;
                return;
            }

            recordsContent.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${records.map(({ consultation: c, appointment: apt, user }) => {
                        const name = user?.profile
                            ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
                            : 'Unknown Student';
                        const studentId = user?.profile?.studentId || '';
                        const section = user?.profile?.section || '';
                        const severity = apt?.severity || 'minor';
                        const date = c.date?.toDate ? c.date.toDate() : new Date(c.date);
                        const prescriptions = c.prescriptions || [];

                        const sevColorMap = {
                            emergency: 'var(--color-emergency)',
                            severe: 'var(--color-severe)',
                            moderate: 'var(--color-moderate)',
                            minor: 'var(--color-normal)'
                        };
                        const sevColor = sevColorMap[severity] || 'var(--color-normal)';

                        return `
                        <div class="card card--elevated" style="border-left: 4px solid ${sevColor};">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                                <div>
                                    <div style="font-size: var(--font-size-md); font-weight: 700;">${name}</div>
                                    ${studentId ? `<div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">ID: ${studentId}${section ? ` · ${section}` : ''}</div>` : ''}
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: var(--font-size-xs); font-weight: 700; color: ${sevColor}; text-transform: uppercase; margin-bottom: 4px;">${severity}</div>
                                    <div style="font-size: var(--font-size-xs); color: var(--color-text-hint);">
                                        ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div style="font-size: var(--font-size-xs); font-weight: 600; color: var(--color-text-hint); text-transform: uppercase; margin-bottom: 4px;">Diagnosis</div>
                                <div style="font-size: var(--font-size-sm);">${c.diagnosis || 'N/A'}</div>
                            </div>

                            ${prescriptions.length > 0 ? `
                                <div style="margin-bottom: 10px; background: #f0f7ff; border-radius: 8px; padding: 10px;">
                                    <div style="font-size: var(--font-size-xs); font-weight: 600; color: var(--color-primary); text-transform: uppercase; margin-bottom: 6px;">
                                        <span class="material-icons-round" style="font-size: 14px; vertical-align: middle;">medication</span>
                                        Prescriptions
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        ${prescriptions.map(p => `
                                            <div style="font-size: var(--font-size-sm);">
                                                <strong>${p.medicine}</strong>${p.dosage ? ` — ${p.dosage}` : ''}
                                                ${p.instructions ? `<span style="color: var(--color-text-secondary);"> · ${p.instructions}</span>` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${c.recommendations ? `
                                <div style="margin-bottom: 10px;">
                                    <div style="font-size: var(--font-size-xs); font-weight: 600; color: var(--color-text-hint); text-transform: uppercase; margin-bottom: 4px;">Recommendations</div>
                                    <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${c.recommendations}</div>
                                </div>
                            ` : ''}

                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--color-border);">
                                <div>
                                    ${c.requiresFollowUp ? `
                                        <span style="font-size: var(--font-size-xs); font-weight: 600; color: var(--color-moderate);">
                                            <span class="material-icons-round" style="font-size: 14px; vertical-align: middle;">event</span>
                                            Follow-up required
                                        </span>
                                    ` : `
                                        <span style="font-size: var(--font-size-xs); color: var(--color-text-hint);">No follow-up needed</span>
                                    `}
                                </div>
                                <button class="btn btn--ghost btn--sm" onclick="viewPatient('${c.userId}')">
                                    <span class="material-icons-round" style="font-size: 16px;">person</span>
                                    View Patient
                                </button>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // Initial render
        renderRecords(allRecords);

        // Search + filter
        function applyFilters() {
            const searchTerm = document.getElementById('records-search')?.value.toLowerCase().trim() || '';
            const severityFilter = document.getElementById('records-filter')?.value || '';

            const filtered = allRecords.filter(({ consultation: c, appointment: apt, user }) => {
                const name = user?.profile
                    ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.toLowerCase()
                    : '';
                const diagnosis = (c.diagnosis || '').toLowerCase();
                const matchesSearch = !searchTerm ||
                    name.includes(searchTerm) ||
                    diagnosis.includes(searchTerm) ||
                    (user?.profile?.studentId || '').toLowerCase().includes(searchTerm);
                const matchesSeverity = !severityFilter || (apt?.severity || 'minor') === severityFilter;
                return matchesSearch && matchesSeverity;
            });

            renderRecords(filtered);
        }

        document.getElementById('records-search')?.addEventListener('input', applyFilters);
        document.getElementById('records-filter')?.addEventListener('change', applyFilters);

    } catch (error) {
        console.error(error);
        recordsContent.innerHTML = `
            <div style="text-align: center; padding: 48px; color: var(--color-emergency);">
                <p>Failed to load records. Please try again.</p>
            </div>
        `;
    }
}

window.viewPatient = function(userId) {
    Router.navigate('/clinic/patient', { userId });
};
