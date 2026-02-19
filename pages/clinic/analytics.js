/* ========================================
   CLINIC ANALYTICS PAGE
   Digital Automatic Triage
   ======================================== */

export async function renderClinicAnalytics(container) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/clinic.css">
        <div class="page-clinic">
            ${window.getClinicSidebar ? window.getClinicSidebar('analytics') : ''}
            <div class="clinic-content">
                <div class="clinic-page-header">
                    <h1>Analytics</h1>
                </div>

                <!-- Period Filter -->
                <div class="period-filter">
                    <button class="period-filter-btn active" data-period="day">Day</button>
                    <button class="period-filter-btn" data-period="week">Week</button>
                    <button class="period-filter-btn" data-period="month">Month</button>
                </div>

                <div id="analytics-content">
                    <div style="text-align: center; padding: 48px;">
                        <div class="spinner" style="margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Period filter
    const filterBtns = document.querySelectorAll('.period-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadAnalytics(btn.dataset.period);
        });
    });

    loadAnalytics('day');
}

async function loadAnalytics(period) {
    const content = document.getElementById('analytics-content');
    if (!content) return;

    try {
        const logsResult = await SymptomLogService.getAll();
        const logs = logsResult.success ? logsResult.data : [];

        // Filter by period
        const now = new Date();
        let filteredLogs = logs;

        if (period === 'day') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            filteredLogs = logs.filter(l => {
                const d = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
                return d >= today;
            });
        } else if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 86400000);
            filteredLogs = logs.filter(l => {
                const d = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
                return d >= weekAgo;
            });
        } else if (period === 'month') {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            filteredLogs = logs.filter(l => {
                const d = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
                return d >= monthAgo;
            });
        }

        // Aggregate data
        const symptomCounts = {};
        const severityCounts = { minor: 0, moderate: 0, severe: 0, emergency: 0 };

        filteredLogs.forEach(log => {
            (log.symptoms || []).forEach(s => {
                symptomCounts[s] = (symptomCounts[s] || 0) + 1;
            });
            const cat = log.triageResult?.category || 'minor';
            severityCounts[cat] = (severityCounts[cat] || 0) + 1;
        });

        // Sort symptoms by count
        const topSymptoms = Object.entries(symptomCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const total = filteredLogs.length;

        content.innerHTML = `
            <!-- Summary Stat -->
            <div style="margin-bottom: 24px;">
                <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    Total Logs (${period}): <strong>${total}</strong>
                </p>
            </div>

            <div class="analytics-grid">
                <!-- Top Symptoms -->
                <div class="analytics-card">
                    <h3>Top Symptoms</h3>
                    ${topSymptoms.length > 0 ? `
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${topSymptoms.map(([symptom, count], i) => `
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: var(--font-size-sm);">${i + 1}. ${symptom}</span>
                                    <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-primary);">${count}</span>
                                </div>
                                <div style="background: var(--color-border); border-radius: 4px; height: 6px; overflow: hidden;">
                                    <div style="background: var(--color-primary); height: 100%; width: ${(count / (topSymptoms[0]?.[1] || 1)) * 100}%; border-radius: 4px;"></div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--color-text-hint);">No data</p>'}
                </div>

                <!-- Severity Distribution -->
                <div class="analytics-card">
                    <h3>Severity Distribution</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${Object.entries(severityCounts).map(([sev, count]) => {
                            const colors = {
                                minor: 'var(--color-normal)',
                                moderate: 'var(--color-moderate)',
                                severe: 'var(--color-severe)',
                                emergency: 'var(--color-emergency)'
                            };
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                            return `
                                <div>
                                    <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); margin-bottom: 4px;">
                                        <span style="color: ${colors[sev]}; font-weight: 600;">${sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
                                        <span>${pct}% (${count})</span>
                                    </div>
                                    <div style="background: var(--color-border); border-radius: 4px; height: 8px; overflow: hidden;">
                                        <div style="background: ${colors[sev]}; height: 100%; width: ${pct}%; border-radius: 4px; transition: width 0.3s ease;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `
            <div style="text-align: center; padding: 48px; color: var(--color-emergency);">
                <p>Failed to load analytics.</p>
            </div>
        `;
    }
}
