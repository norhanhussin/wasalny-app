function loadProfileData() {
    // جلب البيانات الحقيقية من LocalStorage
    const trips = JSON.parse(localStorage.getItem('allTrips')) || [];
    const container = document.getElementById('miniList');
    document.getElementById('tripsCount').innerText = trips.length;

    if (trips.length === 0) {
        container.innerHTML = `
                    <div class="text-center p-5 bg-white rounded-4 border">
                        <i class="fas fa-route fa-3x text-light mb-3"></i>
                        <p class="text-muted mb-0">لم تقم بإضافة أي رحلات بعد</p>
                        <a href="add-trip.html" class="btn btn-link text-primary fw-bold">أضف رحلتك الأولى الآن</a>
                    </div>`;
        return;
    }

    // عرض آخر 3 رحلات فقط
    container.innerHTML = trips.slice(-3).reverse().map(t => `
                <div class="mini-trip-item">
                    <div>
                        <div class="route-text">
                            ${t.from} 
                            <i class="fas fa-long-arrow-alt-left mx-2 text-primary"></i> 
                            ${t.to}
                        </div>
                        <div class="date-badge">
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