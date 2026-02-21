/**
 * ملف البروفايل الكامل - وصلني
 */

function loadProfileData() {
    // 1. جلب المستخدم الحالي
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // لو مش مسجل، يرجعه للوجن
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // 2. تحديث الاسم والأفاتار في الواجهة
    const profileNameEl = document.getElementById('profileName');
    const userAvatarEl = document.querySelector('.user-avatar');

    if (profileNameEl) {
        profileNameEl.innerText = currentUser.name; 
    }

    if (userAvatarEl) {
        // عرض أول حرف من الاسم كشعار شخصي
        const firstLetter = currentUser.name.charAt(0).toUpperCase();
        userAvatarEl.innerHTML = `<span>${firstLetter}</span>`;
    }

    // 3. جلب الرحلات وفلترتها الخاصة بالمستخدم الحالي فقط
    const allTrips = JSON.parse(localStorage.getItem('allTrips')) || [];
    const myTrips = allTrips.filter(t => t.userId === currentUser.email || t.userId === currentUser.id);

    const container = document.getElementById('miniList');
    const tripsCountEl = document.getElementById('tripsCount');
    
    if (tripsCountEl) tripsCountEl.innerText = myTrips.length;

    // حالة عدم وجود رحلات
    if (myTrips.length === 0) {
        container.innerHTML = `
            <div class="text-center p-5 bg-white rounded-4 border">
                <i class="fas fa-route fa-3x text-light mb-3"></i>
                <p class="text-muted mb-0">لم تقم بإضافة أي رحلات بعد</p>
                <a href="add-trip.html" class="btn btn-link text-primary fw-bold">أضف رحلتك الأولى الآن</a>
            </div>`;
    } else {
        // عرض آخر 3 رحلات مضافة
        container.innerHTML = myTrips.slice(-3).reverse().map(t => `
            <div class="mini-trip-item">
                <div>
                    <div class="route-text text-end">
                        ${t.from} 
                        <i class="fas fa-long-arrow-alt-left mx-2 text-primary"></i> 
                        ${t.to}
                    </div>
                    <div class="date-badge text-end">
                        <i class="far fa-calendar-alt me-1"></i> ${t.date}
                    </div>
                </div>
                <div class="weight-tag">
                    ${t.weight} كجم
                </div>
            </div>
        `).join('');
    }
}

// --- وظيفة تعديل بيانات الملف الشخصي ---
const handleEditProfile = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    Swal.fire({
        title: 'تعديل البيانات الشخصية',
        html: `
            <div class="text-end" dir="rtl">
                <label class="form-label fw-bold">الاسم بالكامل</label>
                <input type="text" id="newName" class="form-control mb-3 text-end" value="${currentUser.name}">
                
                <label class="form-label fw-bold">رقم الهاتف</label>
                <input type="text" id="newPhone" class="form-control text-end" value="${currentUser.phone || ''}" placeholder="أدخل رقم هاتفك">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'حفظ التعديلات',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#64748b',
        preConfirm: () => {
            const name = document.getElementById('newName').value.trim();
            const phone = document.getElementById('newPhone').value.trim();
            
            if (!name) {
                Swal.showValidationMessage('يرجى إدخال الاسم');
                return false;
            }
            return { name, phone };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // 1. تحديث الكائن الحالي (currentUser)
            currentUser.name = result.value.name;
            currentUser.phone = result.value.phone;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // 2. تحديث قائمة المستخدمين الكلية (wasalny_users)
            let allUsers = JSON.parse(localStorage.getItem('wasalny_users')) || [];
            const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
            
            if (userIndex !== -1) {
                allUsers[userIndex].name = result.value.name;
                allUsers[userIndex].phone = result.value.phone;
                localStorage.setItem('wasalny_users', JSON.stringify(allUsers));
            }

            // 3. نجاح العملية وإعادة تحميل الصفحة لتحديث الواجهة
            Swal.fire({
                icon: 'success',
                title: 'تم التحديث!',
                text: 'تم حفظ تغييراتك بنجاح',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                location.reload();
            });
        }
    });
};

// تشغيل الوظائف عند التحميل
window.onload = () => {
    loadProfileData();

    // ربط زر التعديل بالوظيفة
    const editBtn = document.querySelector('.btn-edit-profile');
    if (editBtn) {
        editBtn.addEventListener('click', handleEditProfile);
    }
};