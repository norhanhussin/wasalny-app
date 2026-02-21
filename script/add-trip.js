// --- 1. فحص الأمان (اللوجن) ---
        const checkAuth = () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                Swal.fire({
                    title: 'عفواً!',
                    text: 'يجب تسجيل الدخول أولاً لتتمكن من إضافة رحلة.',
                    icon: 'warning',
                    confirmButtonText: 'ذهاب لتسجيل الدخول',
                    allowOutsideClick: false
                }).then(() => {
                    window.location.href = 'login.html';
                });
            } else {
                document.body.style.visibility = 'visible'; // إظهار الصفحة فقط لو مسجل
            }
        };

        const egyptData = {
            "القاهرة": ["مدينة نصر", "التجمع", "شبرا", "المعادي"],
            "المنيا": ["مغاغة", "بني مزار", "العدوة", "مطاي", "سمالوط", "ملوي"],
            "الإسكندرية": ["سموحة", "المنتزة", "محرم بك"],
            "الجيزة": ["الدقي", "الهرم", "6 أكتوبر"]
        };

        window.onload = () => {
            checkAuth(); // فحص اللوجن عند التحميل
            
            const list = document.getElementById('govList');
            Object.keys(egyptData).forEach(g => {
                list.innerHTML += `<option value="${g}">`;
            });
        };

        const setupDropdowns = (govId, cityId) => {
            document.getElementById(govId).addEventListener('input', function () {
                const cityList = document.getElementById(cityId);
                cityList.innerHTML = '';
                const selectedGov = this.value;
                if (egyptData[selectedGov]) {
                    egyptData[selectedGov].forEach(city => {
                        cityList.innerHTML += `<option value="${city}">`;
                    });
                }
            });
        };
        setupDropdowns('fromGov', 'fromCityList');
        setupDropdowns('toGov', 'toCityList');

        const phoneInput = document.getElementById('phone');
        const phoneError = document.getElementById('phoneError');

        function validatePhone(phone) {
            return /^01[0125][0-9]{8}$/.test(phone);
        }

        phoneInput.addEventListener('keypress', function (e) {
            if (!/[0-9]/.test(e.key) || this.value.length >= 11) e.preventDefault();
        });

        document.getElementById('tripForm').onsubmit = (e) => {
            e.preventDefault();
            const phoneVal = phoneInput.value.trim();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            if (!validatePhone(phoneVal)) {
                phoneError.style.display = 'block';
                return;
            }

            const trip = {
                id: Date.now(),
                userId: currentUser.id,
                userName: currentUser.name,
                status: 'pending',
                from: `${document.getElementById('fromGov').value} - ${document.getElementById('fromCity').value}`,
                to: `${document.getElementById('toGov').value} - ${document.getElementById('toCity').value}`,
                date: document.getElementById('tripDate').value,
                weight: document.getElementById('weight').value,
                phone: phoneVal
            };

            let trips = JSON.parse(localStorage.getItem('allTrips')) || [];
            trips.push(trip);
            localStorage.setItem('allTrips', JSON.stringify(trips));

            Swal.fire({
                title: 'تم الإرسال!',
                text: 'رحلتك قيد المراجعة الآن.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'my-trips.html';
            });
        };