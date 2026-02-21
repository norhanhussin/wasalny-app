AOS.init({
    duration: 800,
    offset: 50,
    once: false,
    mirror: true
});

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navBtn = document.getElementById('navActionBtn');

    // تحديث شكل زرار النافبار بناءً على الحالة
    if (currentUser) {
        navBtn.innerHTML = `<i class="fas fa-box"></i> طلباتي`;
        navBtn.href = 'my-bookings.html';
    } else {
        navBtn.innerHTML = `<i class="fas fa-user"></i> دخول`;
        navBtn.href = 'login.html';
    }

    renderTrips();
});
function renderTrips() {
    const container = document.getElementById('tripsList');
    const noResults = document.getElementById('noResults');
    const fromSearch = document.getElementById('searchFrom').value.toLowerCase().trim();
    const toSearch = document.getElementById('searchTo').value.toLowerCase().trim();

    const trips = JSON.parse(localStorage.getItem('allTrips')) || [];

    const filtered = trips.filter(trip => {
        const isApproved = trip.status === 'approved';
        const tripFrom = (trip.from || "").toLowerCase();
        const tripTo = (trip.to || "").toLowerCase();
        return isApproved && (fromSearch === "" || tripFrom.includes(fromSearch)) && (toSearch === "" || tripTo.includes(toSearch));
    });

    container.innerHTML = "";

    if (filtered.length === 0) {
        noResults.classList.remove('d-none');
    } else {
        noResults.classList.add('d-none');
        filtered.reverse().forEach((trip, index) => {
            container.innerHTML += `
                        <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                            <div class="trip-card">
                                <div class="card-header-pro">
                                    <span class="small fw-bold text-secondary"><i class="far fa-calendar-alt text-primary"></i> ${trip.date}</span>
                                    <span class="weight-badge">${trip.weight} كجم</span>
                                </div>
                                <div class="journey-container">
                                    <div class="journey-line"></div>
                                    <div class="location-step">
                                        <div class="loc-dot"></div>
                                        <span class="loc-label">من</span>
                                        <span class="loc-name">${trip.from}</span>
                                    </div>
                                    <div class="location-step destination">
                                        <div class="loc-dot"></div>
                                        <span class="loc-label">إلى</span>
                                        <span class="loc-name">${trip.to}</span>
                                    </div>
                                </div>
                                <div class="px-4 pb-2">
                                     <div class="d-flex align-items-center gap-2 mb-2">
                                         <div style="width:28px; height:28px; background:var(--dark-navy); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold;">
                                            ${trip.userName ? trip.userName.charAt(0) : 'U'}
                                         </div>
                                         <span class="small fw-bold text-muted">${trip.userName || 'مسافر موثق'}</span>
                                     </div>
                                </div>
                                <button onclick="openBookingModal(${trip.id}, '${trip.userName}')" class="btn-order-pro">
                                    <i class="fas fa-box-open"></i> اطلب شحن طردك
                                </button>
                            </div>
                        </div>
                    `;
        });
    }
    AOS.refresh();
}

function openBookingModal(tripId, travelerName) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // --- هذا هو الجزء الأهم ---
    if (!currentUser) {
        Swal.fire({
            title: 'يجب تسجيل الدخول',
            text: "عذراً، لا يمكنك طلب شحن طرد إلا بعد تسجيل الدخول إلى حسابك.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'ذهاب لتسجيل الدخول',
            cancelButtonText: 'إلغاء',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'login.html';
            }
        });
        return; // توقف الوظيفة هنا ولا تفتح المودال
    }

    // لو مسجل دخول، الكود بيكمل عادي ويفتح الفورم
    Swal.fire({
        title: 'تفاصيل طلب الشحن',
        html: `
            <div class="text-end mb-2 small fw-bold">وصف الشحنة:</div>
            <input type="text" id="itemDesc" class="form-control mb-3" placeholder="مثلاً: كرتونة ملابس...">
            <div class="text-end mb-2 small fw-bold">صورة الشحنة:</div>
            <input type="file" id="itemImage" class="form-control" accept="image/*">
        `,
        // بقية كود الـ preConfirm والـ then كما هي عندك...
        showCancelButton: true,
        confirmButtonText: 'إرسال للمراجعة',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
            const desc = document.getElementById('itemDesc').value;
            const file = document.getElementById('itemImage').files[0];
            if (!desc || !file) {
                Swal.showValidationMessage('برجاء إدخال الوصف وصورة الشحنة');
            }
            return { desc: desc, file: file };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // كود الـ FileReader وحفظ الطلب في الـ LocalStorage كما هو في كودك الأصلي
            const reader = new FileReader();
            reader.onload = function (e) {
                const newRequest = {
                    id: Date.now(),
                    tripId: tripId,
                    travelerName: travelerName,
                    itemDesc: result.value.desc,
                    itemImage: e.target.result,
                    status: 'pending',
                    senderName: currentUser.name,
                    senderEmail: currentUser.email,
                    date: new Date().toLocaleDateString('ar-EG')
                };

                let requests = JSON.parse(localStorage.getItem('allRequests')) || [];
                requests.push(newRequest);
                localStorage.setItem('allRequests', JSON.stringify(requests));

                Swal.fire({
                    title: 'تم الإرسال بنجاح!',
                    text: 'سيتم مراجعة طلبك من قبل الإدارة.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    window.location.href = 'my-bookings.html';
                }, 2000);
            };
            reader.readAsDataURL(result.value.file);
        }
    });
}

document.getElementById('searchFrom').addEventListener('input', renderTrips);
document.getElementById('searchTo').addEventListener('input', renderTrips);
