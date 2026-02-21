// تفعيل AOS بطريقة احترافية
AOS.init({
    duration: 1000,
    once: false,
    mirror: false,
    offset: 50,
    anchorPlacement: 'top-bottom',
});

const checkUserStatus = () => {
    // التعديل هنا: غيرنا 'logged_user' إلى 'currentUser'
    const loggedUser = JSON.parse(localStorage.getItem('currentUser'));
    const userSection = document.getElementById('userSection');

    if (loggedUser && userSection) {
        const firstName = loggedUser.name ? loggedUser.name.split(' ')[0] : 'مسافر';
        userSection.innerHTML = `
                <div class="dropdown">
                    <button class="user-profile-trigger dropdown-toggle d-flex align-items-center gap-3 border-0" 
                            type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="background:transparent">
                        <div class="user-meta text-end">
                            <span class="d-block fw-bold text-white mb-1">${firstName}</span>
                            <div class="verified-badge">
                                <i class="fas fa-check-circle"></i>
                                <span>حساب موثق</span>
                            </div>
                        </div>
                        <div class="user-avatar-sm">${firstName.charAt(0)}</div>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-start shadow-lg border-0 p-2">
                        <li><a class="dropdown-item rounded-3 text-end" href="profile.html">حسابي</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item rounded-3 text-end text-danger" href="#" onclick="logout()">خروج</a></li>
                    </ul>
                </div>`;

        const dropdownElement = document.getElementById('userDropdown');
        if (dropdownElement) {
            new bootstrap.Dropdown(dropdownElement);
        }
    }
};

const logout = () => {
    // التعديل هنا: نمسح 'currentUser'
    localStorage.removeItem('currentUser');
    window.location.reload();
};

// --- الجزء المعدل لهندلة رحلات الأدمن ---
const loadStatsAndTrips = () => {
    const allTrips = JSON.parse(localStorage.getItem('allTrips')) || [];

    // 1. فلترة الرحلات المقبولة فقط لعرضها للزوار
    const approvedTrips = allTrips.filter(t => t.status === 'approved');

    // 2. تحديث الإحصائيات (تأكدي إن الـ IDs دي موجودة في الـ HTML بتاعك)
    const totalTripsEl = document.getElementById('totalTrips');
    const totalWeightEl = document.getElementById('totalWeight');

    if (totalTripsEl) totalTripsEl.innerText = approvedTrips.length;
    if (totalWeightEl) totalWeightEl.innerText = approvedTrips.reduce((a, b) => a + Number(b.weight || 0), 0);

    const latestContainer = document.getElementById('latestTripsRow');

    if (latestContainer) {
        if (approvedTrips.length > 0) {
            // عرض آخر 3 رحلات تم قبولها
            latestContainer.innerHTML = approvedTrips.slice(-3).reverse().map((t, index) => `
                <div class="col-md-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="home-trip-card">
                        <div class="d-flex justify-content-between mb-3">
                            <span class="badge bg-light text-primary rounded-pill px-3">${t.date}</span>
                            <span class="fw-bold text-success"><i class="fas fa-weight-hanging ms-1"></i>${t.weight} كجم</span>
                        </div>
                        <div class="fw-black fs-5 mb-2 text-end">${t.from} <i class="fas fa-arrow-left mx-2 text-muted small"></i> ${t.to}</div>
                        <div class="d-flex align-items-center justify-content-end gap-2 mb-3">
                             <small class="text-muted">بواسطة ${t.userName || 'مسافر موثق'}</small>
                             <div class="user-avatar-sm" style="width:25px; height:25px; font-size:10px;">${t.userName ? t.userName.charAt(0) : 'U'}</div>
                        </div>
                        <a href="browse-trips.html" class="btn btn-link p-0 text-decoration-none mt-1 fw-bold">شحن الآن <i class="fas fa-chevron-left ms-1" style="font-size: 10px;"></i></a>
                    </div>
                </div>
            `).join('');
        } else {
            latestContainer.innerHTML = `
                <div class="col-12 text-center p-5" data-aos="fade-up">
                    <img src="https://cdn-icons-png.flaticon.com/512/1437/1437185.png" width="80" class="opacity-25 mb-3">
                    <p class="text-muted">لا توجد رحلات نشطة حالياً. كن أول من يضيف رحلة!</p>
                </div>`;
        }
    }
};

window.onload = () => {
    checkUserStatus();
    loadStatsAndTrips();
};