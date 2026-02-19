/* ========================================
   CLINIC CONSULTATION FORM PAGE
   Digital Automatic Triage
   ======================================== */

export function renderConsultationForm(container, params = {}) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <link rel="stylesheet" href="/css/clinic.css">
        <div class="page-clinic">
            ${window.getClinicSidebar ? window.getClinicSidebar('') : ''}
            <div class="clinic-content">
                <button class="btn btn--ghost mb-lg" data-route="/clinic/queue">
                    <span class="material-icons-round">arrow_back</span> Back to Queue
                </button>

                <h1 style="margin-bottom: 24px;">Post-Consultation Form</h1>

                <form id="consultation-form" class="consultation-form">
                    <!-- Diagnosis -->
                    <div class="input-group">
                        <label for="diagnosis">Diagnosis</label>
                        <textarea id="diagnosis" class="input-field" rows="3" placeholder="Enter diagnosis..." required></textarea>
                    </div>

                    <!-- Prescriptions -->
                    <div>
                        <label style="font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-secondary); display: block; margin-bottom: 8px;">Prescriptions</label>
                        <div id="prescription-list" class="prescription-list"></div>
                        <div class="prescription-entry mt-md">
                            <div class="input-group" style="margin-bottom: 0;">
                                <input type="text" class="input-field" id="rx-medicine" placeholder="Medicine name">
                            </div>
                            <div class="input-group" style="margin-bottom: 0;">
                                <input type="text" class="input-field" id="rx-dosage" placeholder="Dosage">
                            </div>
                            <div class="input-group" style="margin-bottom: 0;">
                                <input type="text" class="input-field" id="rx-instructions" placeholder="Instructions">
                            </div>
                            <button type="button" class="btn btn--primary btn--sm" id="add-rx-btn">
                                <span class="material-icons-round">add</span>
                            </button>
                        </div>
                    </div>

                    <!-- Recommendations -->
                    <div class="input-group">
                        <label for="recommendations">Recommendations / Notes</label>
                        <textarea id="recommendations" class="input-field" rows="3" placeholder="Additional recommendations or notes..."></textarea>
                    </div>

                    <!-- Follow-up -->
                    <div class="card card--bordered">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <input type="checkbox" id="requires-followup" style="width: 20px; height: 20px;">
                            <label for="requires-followup" style="font-weight: 600;">Requires Follow-up Checkup</label>
                        </div>
                        <div id="followup-date-group" class="hidden">
                            <div class="input-group">
                                <label for="followup-date">Follow-up Date</label>
                                <input type="date" id="followup-date" class="input-field">
                            </div>
                        </div>
                    </div>

                    <!-- Submit -->
                    <div style="display: flex; gap: 12px;">
                        <button type="button" class="btn btn--secondary btn--full" data-route="/clinic/queue">Cancel</button>
                        <button type="submit" class="btn btn--success btn--full btn--lg">
                            <span class="material-icons-round">check</span>
                            Complete Consultation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Prescription management
    const prescriptions = [];

    document.getElementById('add-rx-btn').addEventListener('click', () => {
        const medicine = document.getElementById('rx-medicine').value.trim();
        const dosage = document.getElementById('rx-dosage').value.trim();
        const instructions = document.getElementById('rx-instructions').value.trim();

        if (!medicine) {
            Utils.showToast('Enter medicine name.', 'warning');
            return;
        }

        prescriptions.push({ medicine, dosage, instructions });
        renderPrescriptionList();

        // Clear inputs
        document.getElementById('rx-medicine').value = '';
        document.getElementById('rx-dosage').value = '';
        document.getElementById('rx-instructions').value = '';
    });

    function renderPrescriptionList() {
        const list = document.getElementById('prescription-list');
        list.innerHTML = prescriptions.map((rx, i) => `
            <div class="prescription-item">
                <div>
                    <strong>${rx.medicine}</strong> — ${rx.dosage || 'N/A'}
                    ${rx.instructions ? `<br><span style="color: var(--color-text-secondary);">${rx.instructions}</span>` : ''}
                </div>
                <button type="button" class="btn btn--ghost btn--sm" onclick="removePrescription(${i})">
                    <span class="material-icons-round" style="color: var(--color-emergency);">delete</span>
                </button>
            </div>
        `).join('');
    }

    window.removePrescription = function(index) {
        prescriptions.splice(index, 1);
        renderPrescriptionList();
    };

    // Follow-up checkbox
    document.getElementById('requires-followup').addEventListener('change', (e) => {
        document.getElementById('followup-date-group').classList.toggle('hidden', !e.target.checked);
    });

    // Form submission
    document.getElementById('consultation-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const diagnosis = document.getElementById('diagnosis').value.trim();
        const recommendations = document.getElementById('recommendations').value.trim();
        const requiresFollowUp = document.getElementById('requires-followup').checked;
        const followUpDateStr = document.getElementById('followup-date').value;

        if (!diagnosis) {
            Utils.showToast('Please enter a diagnosis.', 'warning');
            return;
        }

        Utils.showLoading();

        const consultationData = {
            appointmentId: params.appointmentId || '',
            userId: params.userId || '',
            diagnosis,
            prescriptions,
            recommendations,
            notes: recommendations,
            requiresFollowUp,
            followUpDate: followUpDateStr ? firebase.firestore.Timestamp.fromDate(new Date(followUpDateStr)) : null
        };

        const result = await ConsultationService.create(consultationData);

        if (result.success) {
            // Mark appointment as completed
            if (params.appointmentId) {
                await AppointmentService.updateStatus(params.appointmentId, 'completed');
            }

            // Create follow-up if needed
            if (requiresFollowUp && followUpDateStr) {
                await FollowUpService.create({
                    consultationId: result.id,
                    userId: params.userId,
                    scheduledDate: firebase.firestore.Timestamp.fromDate(new Date(followUpDateStr))
                });
            }

            Utils.hideLoading();
            Utils.showToast('Consultation completed!', 'success');
            Router.navigate('/clinic/queue');
        } else {
            Utils.hideLoading();
            Utils.showToast('Failed to save consultation.', 'error');
        }
    });
}
