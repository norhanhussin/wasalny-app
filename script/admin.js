    window.onload = () => {
        loadDashboard();
        document.getElementById('currentTime').innerText = new Date().toLocaleDateString('ar-EG');
    };

    function switchTab(tab) {
        const sections = ['tripsSection', 'usersSection', 'bookingsSection'];
        sections.forEach(sec => document.getElementById(sec).classList.add('d-none'));
        
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => link.classList.remove('active'));
        
        document.getElementById(tab + 'Section').classList.remove('d-none');
        
        // تفعيل الزر المناسب
        if(tab === 'trips') { loadDashboard(); links[0].classList.add('active'); }
        if(tab === 'bookings') { renderBookings(); links[1].classList.add('active'); }
        if(tab === 'users') { renderUsers(); links[2].classList.add('active'); }
    }

const loadDashboard = () => {
    const trips = JSON.parse(localStorage.getItem('allTrips')) || [];
    const users = JSON.parse(localStorage.getItem('wasalny_users')) || [];
    const requests = JSON.parse(localStorage.getItem('allRequests')) || [];

    document.getElementById('statTotalTrips').innerText = trips.length;
    document.getElementById('statPendingBookings').innerText = requests.filter(r => r.status === 'pending').length;
    document.getElementById('statUsers').innerText = users.length;

    const tBody = document.getElementById('tripsTableBody');
    
    tBody.innerHTML = trips.length ? [...trips].reverse().map(trip => {
        // التأكد من وجود اسم للمستخدم، وإذا لم يوجد نضع 'مستخدم غير معروف'
        const displayName = trip.userName ? trip.userName : 'مستخدم عام';
        
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
    }).join('') : '<tr><td colspan="5" class="text-center p-4">لا يوجد رحلات</td></tr>';
};

    // --- نظام مراجعة طلبات الشحن ---
    const renderBookings = () => {
        const requests = JSON.parse(localStorage.getItem('allRequests')) || [];
        const bBody = document.getElementById('bookingsTableBody');
        
        bBody.innerHTML = requests.length ? requests.reverse().map(req => `
            <tr>
                <td><div class="fw-bold">${req.senderName}</div></td>
                <td><span class="badge bg-info-subtle text-info">${req.travelerName || 'مسافر'}</span></td>
                <td>${req.itemDesc}</td>
                <td>
                    <img src="${req.itemImage}" class="booking-img" onclick="previewImage('${req.itemImage}', '${req.itemDesc}')">
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

    const previewImage = (src, desc) => {
        Swal.fire({
            title: 'معاينة محتوى الشحنة',
            text: desc,
            imageUrl: src,
            imageWidth: 400,
            confirmButtonText: 'إغلاق',
            confirmButtonColor: '#0b152d'
        });
    };

const handleBookingStatus = (id, newStatus) => {
    let requests = JSON.parse(localStorage.getItem('allRequests')) || [];
    const idx = requests.findIndex(r => r.id == id);

    if (idx !== -1) {
        if (newStatus === 'rejected') {
            // لو الأدمن اختار رفض، نطلب منه السبب
            Swal.fire({
                title: 'سبب رفض الشحنة',
                input: 'textarea',
                inputPlaceholder: 'اكتب هنا سبب الرفض (مثلاً: محتوى غير مسموح به)...',
                showCancelButton: true,
                confirmButtonText: 'تأكيد الرفض',
                cancelButtonText: 'تراجع',
                confirmButtonColor: '#d33',
                inputValidator: (value) => {
                    if (!value) {
                        return 'يجب كتابة سبب الرفض لإعلام المستخدم';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    requests[idx].status = 'rejected';
                    requests[idx].rejectReason = result.value; 
                    localStorage.setItem('allRequests', JSON.stringify(requests));
                    
                    Swal.fire('تم الرفض', 'تم إرسال سبب الرفض للمستخدم', 'info');
                    renderBookings();
                } else {
                    renderBookings(); 
                }
            });
        } else {
            requests[idx].status = newStatus;
            if (newStatus === 'approved') requests[idx].rejectReason = ""; 
            
            localStorage.setItem('allRequests', JSON.stringify(requests));
            Swal.fire({
                icon: 'success',
                title: newStatus === 'approved' ? 'تمت الموافقة بنجاح' : 'تم النقل للمراجعة',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
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
            title: 'سبب الحذف؟',
            input: 'select',
            inputOptions: { 'بيانات غلط': 'بيانات غلط', 'محتوى مخالف': 'محتوى مخالف' },
            showCancelButton: true,
            confirmButtonText: 'حذف'
        }).then((res) => {
            if (res.isConfirmed) {
                let trips = JSON.parse(localStorage.getItem('allTrips')) || [];
                trips = trips.filter(t => t.id != id);
                localStorage.setItem('allTrips', JSON.stringify(trips));
                loadDashboard();
            }
        });
    };

    const renderUsers = () => {
        const users = JSON.parse(localStorage.getItem('wasalny_users')) || [];
        const uBody = document.getElementById('usersTableBody');
        uBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '---'}</td>
                <td><button onclick="deleteUser('${user.email}')" class="btn btn-sm btn-outline-danger">حظر</button></td>
            </tr>
        `).join('');
    };

    const deleteUser = (email) => {
        Swal.fire({ title: 'حظر؟', showCancelButton: true }).then(res => {
            if(res.isConfirmed) {
                let users = JSON.parse(localStorage.getItem('wasalny_users')) || [];
                users = users.filter(u => u.email !== email);
                localStorage.setItem('wasalny_users', JSON.stringify(users));
                renderUsers();
            }
        });
    };

    const viewTripDetails = (trip) => {
        Swal.fire({
            title: 'تفاصيل الرحلة',
            html: `<div class="text-end"><b>المسافر:</b> ${trip.userName}<br><b>الهاتف:</b> ${trip.phone}</div>`,
            confirmButtonColor: '#0b152d'
        });
    };