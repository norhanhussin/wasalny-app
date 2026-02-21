// --- 1. فحص الأمان (اللوجن) ---
const checkAuth = () => {
    // استخدمنا currentUserKey الموحد
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        Swal.fire({
            title: 'عفواً!',
            text: 'يجب تسجيل الدخول أولاً لتتمكن من إضافة رحلة.',
            icon: 'warning',
            confirmButtonText: 'ذهاب لتسجيل الدخول',
            allowOutsideClick: false,
            confirmButtonColor: '#0b152d'
        }).then(() => {
            window.location.href = 'login.html';
        });
    } else {
        document.body.style.visibility = 'visible';
    }
};

// بيانات المحافظات والمدن
const egyptData = {
    "القاهرة": ["مدينة نصر", "التجمع", "شبرا", "المعادي"],
    "المنيا": ["مغاغة", "بني مزار", "العدوة", "مطاي", "سمالوط", "ملوي"],
    "الإسكندرية": ["سموحة", "المنتزة", "محرم بك"],
    "الجيزة": ["الدقي", "الهرم", "6 أكتوبر"]
};

window.onload = () => {
    checkAuth(); // فحص اللوجن فوراً
    
    const list = document.getElementById('govList');
    if (list) {
        Object.keys(egyptData).forEach(g => {
            list.innerHTML += `<option value="${g}">`;
        });
    }
};

// هندلة القوائم المنسدلة
const setupDropdowns = (govId, cityId, cityListId) => {
    const govInput = document.getElementById(govId);
    if (govInput) {
        govInput.addEventListener('input', function () {
            const cityList = document.getElementById(cityListId);
            cityList.innerHTML = '';
            const selectedGov = this.value;
            if (egyptData[selectedGov]) {
                egyptData[selectedGov].forEach(city => {
                    cityList.innerHTML += `<option value="${city}">`;
                });
            }
        });
    }
};

// تشغيل القوائم للمكان (من / إلى)
setupDropdowns('fromGov', 'fromCity', 'fromCityList');
setupDropdowns('toGov', 'toCity', 'toCityList');

const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');

function validatePhone(phone) {
    return /^01[0125][0-9]{8}$/.test(phone);
}

if (phoneInput) {
    phoneInput.addEventListener('keypress', function (e) {
        if (!/[0-9]/.test(e.key) || this.value.length >= 11) e.preventDefault();
    });
}

// --- 2. إرسال الفورم وحفظ الرحلة ---
document.getElementById('tripForm').onsubmit = (e) => {
    e.preventDefault();
    
    const phoneVal = phoneInput.value.trim();
    // سحب بيانات المستخدم الحالي الموحدة
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!validatePhone(phoneVal)) {
        phoneError.style.display = 'block';
        return;
    } else {
        phoneError.style.display = 'none';
    }

    const trip = {
        id: Date.now(),
        // التأكد من ربط الرحلة بمعرف المستخدم أو إيميله
        userId: currentUser.email || currentUser.id, 
        userName: currentUser.name,
        status: 'pending', // تبدأ دائمًا قيد الانتظار لمراجعة الأدمن
        from: `${document.getElementById('fromGov').value} - ${document.getElementById('fromCity').value}`,
        to: `${document.getElementById('toGov').value} - ${document.getElementById('toCity').value}`,
        date: document.getElementById('tripDate').value,
        weight: document.getElementById('weight').value,
        phone: phoneVal,
        createdAt: new Date().toISOString()
    };

    let trips = JSON.parse(localStorage.getItem('allTrips')) || [];
    trips.push(trip);
    localStorage.setItem('allTrips', JSON.stringify(trips));

    Swal.fire({
        title: 'تم الإرسال بنجاح!',
        text: 'رحلتك الآن قيد مراجعة الإدارة.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    }).then(() => {
        // التوجيه لصفحة رحلاتي (تأكدي من اسم الملف عندك)
        window.location.href = 'my-trips.html'; 
    });
};