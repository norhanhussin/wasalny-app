function loadProfileData() {
    // 1. جلب المستخدم الحالي (عشان نعرف إحنا في بروفايل مين)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // عرض بيانات المستخدم في الصفحة (اختياري لو عندك العناصر دي)
    if(document.getElementById('userNameDisplay')) {
        document.getElementById('userNameDisplay').innerText = currentUser.name;
    }

    // 2. جلب كل الرحلات من LocalStorage
    const allTrips = JSON.parse(localStorage.getItem('allTrips')) || [];

    // 3. التعديل السحري: فلترة الرحلات الخاصة بالمستخدم ده بس
    // بنقارن الـ userId اللي جوه الرحلة بالـ email أو الـ id بتاع المستخدم الحالي
    const myTrips = allTrips.filter(t => t.userId === currentUser.email || t.userId === currentUser.id);

    const container = document.getElementById('miniList');
    const tripsCountEl = document.getElementById('tripsCount');
    
    if (tripsCountEl) tripsCountEl.innerText = myTrips.length;

    if (myTrips.length === 0) {
        container.innerHTML = `
            <div class="text-center p-5 bg-white rounded-4 border">
                <i class="fas fa-route fa-3x text-light mb-3"></i>
                <p class="text-muted mb-0">لم تقم بإضافة أي رحلات بعد</p>
                <a href="add-trip.html" class="btn btn-link text-primary fw-bold">أضف رحلتك الأولى الآن</a>
            </div>`;
        return;
    }

    // 4. عرض آخر 3 رحلات خاصة بالمستخدم فقط
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

window.onload = loadProfileData;