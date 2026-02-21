// --- 1. حماية صفحة الأدمن ---
const checkAdminAuth = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // لو مش مسجل أو مسجل بس مش أدمن، توجيه لصفحة اللوجن
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'login.html';
    }
};

// --- 2. التحميل عند فتح الصفحة ---
window.onload = () => {
    checkAdminAuth();
    loadDashboard();
    const timeEl = document.getElementById('currentTime');
    if (timeEl) timeEl.innerText = new Date().toLocaleDateString('ar-EG');
};

// --- 3. إدارة التبويبات (Tabs) ---
function switchTab(tab) {
    const sections = ['tripsSection', 'usersSection', 'bookingsSection'];
    sections.forEach(sec => {
        const el = document.getElementById(sec);
        if (el) el.classList.add('d-none');
    });

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => link.classList.remove('active'));

    const targetSection = document.getElementById(tab + 'Section');
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }

    // تفعيل الزر وتحميل البيانات المناسبة
    if (tab === 'trips') { loadDashboard(); links[0].classList.add('active'); }
    if (tab === 'bookings') { renderBookings(); links[1].classList.add('active'); }
    if (tab === 'users') { renderUsers(); links[2].classList.add('active'); }
}

// --- 4. لوحة التحكم الرئيسية (الرحلات) ---
const loadDashboard = () => {
    const trips = JSON.parse(localStorage.getItem('allTrips')) || [];
    const users = JSON.parse(localStorage.getItem('wasalny_users')) || [];
    const requests = JSON.parse(localStorage.getItem('allRequests')) || [];

    // تحديث الإحصائيات
    if (document.getElementById('statTotalTrips')) document.getElementById('statTotalTrips').innerText = trips.length;
    if (document.getElementById('statPendingBookings')) document.getElementById('statPendingBookings').innerText = requests.filter(r => r.status === 'pending').length;
    if (document.getElementById('statUsers')) document.getElementById('statUsers').innerText = users.length;

    const tBody = document.getElementById('tripsTableBody');
    if (!tBody) return;

    tBody.innerHTML = trips.length ? [...trips].reverse().map(trip => {
        const displayName = trip.userName || 'مستخدم عام';
        return `
            <tr>
                <td>
                    <div class="fw-bold">${displayName}</div>
                    <small class="text-muted" style="font-size: 10px;">ID: ${trip.userId || '---'}</small>
                </td>
                <td>${trip.from} <i class="fas fa-long-arrow-alt-left mx-2 text-muted"></i> ${trip.to}</td>
                <td><span class="badge bg-primary-subtle text-primary">${trip.weight} كجم</span></td>
                <td>
                    <select onchange="handleStatusChange(${trip.id}, this.value)" 
                            class="form-select form-select-sm fw-bold ${trip.status === 'approved' ? 'text-success border-success' : 'text-warning border-warning'}">
                        <option value="pending" ${trip.status === 'pending' ? 'selected' : ''}>⏳ مراجعة</option>
                        <option value="approved" ${trip.status === 'approved' ? 'selected' : ''}>✅ موافقة</option>
                        <option value="delete">❌ حذف</option>
                    </select>
                </td>
                <td>
                    <button onclick="viewTripDetails(${JSON.stringify(trip).replace(/"/g, '&quot;')})" class="btn btn-sm btn-light border">
                        <i class="fas fa-eye text-primary"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('') : '<tr><td colspan="5" class="text-center p-4">لا يوجد رحلات حالياً</td></tr>';
};

// --- 5. مراجعة طلبات الشحن (Bookings) ---
const renderBookings = () => {
    const requests = JSON.parse(localStorage.getItem('allRequests')) || [];
    const bBody = document.getElementById('bookingsTableBody');
    if (!bBody) return;

    bBody.innerHTML = requests.length ? [...requests].reverse().map(req => `
        <tr>
            <td><div class="fw-bold">${req.senderName}</div></td>
            <td><span class="badge bg-info-subtle text-info">${req.travelerName || 'مسافر'}</span></td>
            <td>${req.itemDesc}</td>
            <td>
                <img src="${req.itemImage}" class="booking-img" style="width:50px; cursor:pointer;" onclick="previewImage('${req.itemImage}', '${req.itemDesc}')">
            </td>
            <td>
                <select onchange="handleBookingStatus(${req.id}, this.value)" 
                        class="form-select form-select-sm fw-bold ${req.status === 'approved' ? 'text-success' : 'text-warning'}">
                    <option value="pending" ${req.status === 'pending' ? 'selected' : ''}>⏳ مراجعة</option>
                    <option value="approved" ${req.status === 'approved' ? 'selected' : ''}>✅ قبول</option>
                    <option value="rejected" ${req.status === 'rejected' ? 'selected' : ''}>❌ رفض</option>
                </select>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="text-center p-4">لا توجد طلبات شحن حالياً</td></tr>';
};

// --- 6. هندلة حالات الطلبات والرحلات ---
const handleBookingStatus = (id, newStatus) => {
    let requests = JSON.parse(localStorage.getItem('allRequests')) || [];
    const idx = requests.findIndex(r => r.id == id);

    if (idx !== -1) {
        if (newStatus === 'rejected') {
            Swal.fire({
                title: 'سبب رفض الشحنة',
                input: 'textarea',
                inputPlaceholder: 'اكتب هنا سبب الرفض...',
                showCancelButton: true,
                confirmButtonText: 'تأكيد الرفض',
                confirmButtonColor: '#d33'
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    requests[idx].status = 'rejected';
                    requests[idx].rejectReason = result.value;
                    localStorage.setItem('allRequests', JSON.stringify(requests));
                    Swal.fire('تم الرفض', 'تم إبلاغ المستخدم بالسبب', 'info');
                    renderBookings();
                } else {
                    renderBookings();
                }
            });
        } else {
            requests[idx].status = newStatus;
            localStorage.setItem('allRequests', JSON.stringify(requests));
            renderBookings();
        }
    }
};

const handleStatusChange = (id, value) => {
    if (value === 'delete') promptDeleteReason(id);
    else updateStatus(id, value);
};

const updateStatus = (id, newStatus) => {
    let trips = JSON.parse(localStorage.getItem('allTrips')) || [];
    const index = trips.findIndex(t => t.id == id);
    if (index !== -1) {
        trips[index].status = newStatus;
        localStorage.setItem('allTrips', JSON.stringify(trips));
        loadDashboard();
    }
};

const promptDeleteReason = (id) => {
    Swal.fire({
        title: 'هل أنت متأكد من الحذف؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، حذف',
        confirmButtonColor: '#d33'
    }).then((res) => {
        if (res.isConfirmed) {
            let trips = JSON.parse(localStorage.getItem('allTrips')) || [];
            trips = trips.filter(t => t.id != id);
            localStorage.setItem('allTrips', JSON.stringify(trips));
            loadDashboard();
        } else {
            loadDashboard();
        }
    });
};

// --- 7. إدارة المستخدمين ---
const renderUsers = () => {
    const users = JSON.parse(localStorage.getItem('wasalny_users')) || [];
    const uBody = document.getElementById('usersTableBody');
    if (!uBody) return;

    uBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge bg-light text-dark">عضو نشط</span></td>
            <td><button onclick="deleteUser('${user.email}')" class="btn btn-sm btn-outline-danger">حظر</button></td>
        </tr>
    `).join('');
};

const deleteUser = (email) => {
    Swal.fire({
        title: 'حظر المستخدم؟',
        text: "لن يتمكن هذا المستخدم من الدخول مرة أخرى",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، حظر',
        confirmButtonColor: '#d33'
    }).then(res => {
        if (res.isConfirmed) {
            let users = JSON.parse(localStorage.getItem('wasalny_users')) || [];
            users = users.filter(u => u.email !== email);
            localStorage.setItem('wasalny_users', JSON.stringify(users));
            renderUsers();
            loadDashboard();
        }
    });
};

// --- 8. المعاينة والتفاصيل ---
const previewImage = (src, desc) => {
    Swal.fire({
        title: 'معاينة الشحنة',
        text: desc,
        imageUrl: src,
        imageWidth: 400,
        confirmButtonColor: '#0b152d'
    });
};

const viewTripDetails = (trip) => {
    Swal.fire({
        title: 'تفاصيل الرحلة',
        html: `<div class="text-end"><b>المسافر:</b> ${trip.userName}<br><b>الهاتف:</b> ${trip.phone}<br><b>التاريخ:</b> ${trip.date}</div>`,
        confirmButtonColor: '#0b152d'
    });
};