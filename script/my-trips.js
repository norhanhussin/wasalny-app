// دالة الفحص الأساسية
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        // لو مفيش مستخدم.. امسح المحتوى وحوله فوراً
        document.body.innerHTML = "";
        window.location.href = 'login.html';
        return;
    } else {
        // لو مسجل دخول.. اظهر الصفحة ونفذ العرض
        document.body.style.visibility = 'visible';

        // إضافة اسم المستخدم بجانب العنوان للترحيب
        document.querySelector('h1').innerHTML += ` <small class="fs-5 opacity-50">(${currentUser.name})</small>`;

        renderMyTrips(currentUser.id); // نمرر الـ ID لعرض رحلاته فقط
    }
});

// دالة العرض المعدلة لتناسب المستخدم الحالي
function renderMyTrips(userId) {
    const allTrips = JSON.parse(localStorage.getItem('allTrips')) || [];
    const container = document.getElementById('myTripsList');

    // فلترة الرحلات: اعرض فقط الرحلات اللي الـ userId بتاعها يساوي الـ ID بتاع المسجل حالياً
    const myTrips = allTrips.filter(trip => trip.userId === userId);

    if (myTrips.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center p-5">
                <div class="py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">لم تقم بنشر أي رحلات بعد</h4>
                </div>
            </div>`;
        return;
    }

    container.innerHTML = myTrips.map(trip => `
        <div class="col-md-6 col-lg-4" id="trip-card-${trip.id}">
            <div class="trip-manage-card">
                <div class="route-display">
                    <span class="city-name">${trip.from}</span>
                    <i class="fas fa-arrow-left route-arrow"></i>
                    <span class="city-name text-primary">${trip.to}</span>
                </div>

                <div class="trip-specs">
                    <div class="spec-item">
                        <i class="far fa-calendar-alt"></i>
                        ${trip.date}
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-weight-hanging"></i>
                        ${trip.weight} كجم
                    </div>
                </div>

                <div class="action-btns">
                    <button onclick="handleDelete(${trip.id})" class="btn-base btn-del">حذف</button>
                    <button class="btn-base btn-edit">تعديل</button>
                </div>
            </div>
        </div>
    `).join('');
}

// دالة الحذف (لا تحتاج تعديل كبير، فقط نمرر الـ ID للفحص بعد الحذف)
function handleDelete(id) {
    Swal.fire({
        title: 'حذف الرحلة؟',
        text: "لن تظهر هذه الرحلة للمسافرين بعد الآن.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        confirmButtonText: 'نعم، حذف',
        cancelButtonText: 'إلغاء',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            let trips = JSON.parse(localStorage.getItem('allTrips')) || [];
            trips = trips.filter(t => t.id !== id);
            localStorage.setItem('allTrips', JSON.stringify(trips));

            // إعادة عرض الرحلات الخاصة بالمستخدم الحالي فقط بعد الحذف
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            renderMyTrips(currentUser.id);

            Swal.fire('تم الحذف!', 'تمت إزالة الرحلة بنجاح.', 'success');
        }
    });
}
// تشغيل عند التحميل
window.onload = renderMyTrips;