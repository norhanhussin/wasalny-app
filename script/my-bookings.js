document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        // لو مفيش مستخدم.. يمسح المحتوى ويحوله للوجين
        document.body.innerHTML = "";
        window.location.href = 'login.html';
        return;
    } else {
        // لو مسجل دخول:
        // 1. نظهر الصفحة
        document.body.style.visibility = 'visible';

        // 2. السطر اللي سألتي عليه (إضافة اسم المستخدم بجانب العنوان)
        document.querySelector('h3').innerHTML += ` <small class="text-muted fs-6" style="font-weight:bold"> - أهلاً ${currentUser.name}</small>`;

        // 3. تشغيل دالة عرض الطلبات
        renderMyRequests(currentUser.email);
    }
});

function renderMyRequests(userEmail) {
    const allRequests = JSON.parse(localStorage.getItem('allRequests')) || [];
    const allTrips = JSON.parse(localStorage.getItem('allTrips')) || [];
    const container = document.getElementById('myRequestsList');
    const emptyState = document.getElementById('emptyState');

    const myRequests = allRequests.filter(req => req.senderEmail === userEmail);

    if (myRequests.length === 0) {
        emptyState.classList.remove('d-none');
        return;
    }

    container.innerHTML = myRequests.reverse().map(req => {
        const tripData = allTrips.find(t => t.id == req.tripId);
        const phone = tripData ? tripData.phone : '';

        let statusBadge = '';
        let actionContent = '';

        if (req.status === 'pending') {
            statusBadge = `<span class="status-badge bg-pending">قيد المراجعة</span>`;
            actionContent = `<p class="text-muted small mt-2 mb-0">انتظر موافقة الأدمن لرؤية رقم التواصل.</p>`;
        }
        else if (req.status === 'approved') {
            statusBadge = `<span class="status-badge bg-approved">تم قبول الشحنة</span>`;
            actionContent = `
                        <a href="https://wa.me/${phone}" target="_blank" class="whatsapp-btn mt-2">
                            <i class="fab fa-whatsapp fs-5"></i> مراسلة المسافر
                        </a>`;
        }
        else if (req.status === 'rejected') {
            statusBadge = `<span class="status-badge bg-rejected">تم الرفض</span>`;
            actionContent = `
                        <div class="alert alert-danger py-2 px-3 mt-2 mb-0" style="font-size: 13px;">
                            <i class="fas fa-info-circle me-1"></i> <b>السبب:</b> ${req.rejectReason || 'بيانات غير كافية'}
                        </div>`;
        }

        return `
                    <div class="col-md-6">
                        <div class="booking-card p-3">
                            <div class="d-flex align-items-center gap-3">
                                <img src="${req.itemImage}" class="item-preview">
                                <div class="flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <h6 class="fw-bold m-0 text-truncate" style="max-width: 150px;">${req.itemDesc}</h6>
                                        ${statusBadge}
                                    </div>
                                    <p class="text-muted small mb-2">إلى المسافر: <span class="text-dark fw-semibold">${req.travelerName}</span></p>
                                    <div class="pt-2 border-top">
                                        ${actionContent}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
    }).join('');
}