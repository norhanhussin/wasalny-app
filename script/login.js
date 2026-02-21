let isLogin = true;
const usersKey = 'wasalny_users';
// التعديل هنا: غيرنا logged_user إلى currentUser لتتوافق مع باقي صفحات الموقع
const currentUserKey = 'currentUser'; 

const switchBtn = document.getElementById('switchBtn');
const nameGroup = document.getElementById('nameGroup');
const submitBtn = document.getElementById('submitBtn');

// التبديل بين الدخول والإنشاء
switchBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    document.getElementById('formTitle').innerText = isLogin ? "تسجيل الدخول" : "انضم إلينا";
    document.getElementById('formSub').innerText = isLogin ? "يسعدنا رؤيتك مرة أخرى في وصلني" : "ابدأ رحلتك معنا ووفر تكاليف شحنك";
    nameGroup.style.display = isLogin ? "none" : "block";
    submitBtn.innerText = isLogin ? "دخول" : "إنشاء الحساب";
    document.getElementById('switchText').innerText = isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟";
    switchBtn.innerText = isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول";
});

document.getElementById('authForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('userEmail').value.trim();
    const pass = document.getElementById('userPass').value;
    const users = JSON.parse(localStorage.getItem(usersKey)) || [];

    if (isLogin) {
        // --- منطق الأدمن ---
        if (email === 'admin@wasalny.com' && pass === 'admin123') {
            const adminData = { name: 'المدير العام', email: email, isAdmin: true };
            localStorage.setItem(currentUserKey, JSON.stringify(adminData));

            Swal.fire({
                title: 'مرحباً أيها المدير!',
                text: 'جاري فتح لوحة التحكم...',
                icon: 'info',
                timer: 1500,
                showConfirmButton: false
            }).then(() => window.location.href = 'admin.html');
            return;
        }

        // --- منطق المستخدم العادي ---
        const user = users.find(u => u.email === email && u.pass === pass);
        if (user) {
            localStorage.setItem(currentUserKey, JSON.stringify(user));
            Swal.fire({
                title: 'أهلاً بك!',
                text: 'تم تسجيل دخولك بنجاح',
                icon: 'success',
                confirmButtonColor: '#0b152d'
            }).then(() => window.location.href = 'index.html');
        } else {
            Swal.fire({ text: 'بيانات الدخول غير صحيحة', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }

    } else {
        // --- منطق إنشاء حساب جديد ---
        const name = document.getElementById('userName').value.trim();

        // منع التسجيل بإيميل الأدمن
        if (email === 'admin@wasalny.com') {
            return Swal.fire({ text: 'هذا البريد محجوز للنظام', icon: 'error' });
        }

        if (name.split(/\s+/).length < 3) {
            return Swal.fire({ text: 'يرجى إدخال الاسم ثلاثياً', icon: 'warning', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }

        // منع تكرار الإيميل
        if (users.some(u => u.email === email)) {
            return Swal.fire({ text: 'هذا البريد مسجل بالفعل', icon: 'warning' });
        }

        users.push({ name, email, pass });
        localStorage.setItem(usersKey, JSON.stringify(users));

        Swal.fire('تم بنجاح!', 'يمكنك الآن تسجيل الدخول بحسابك الجديد', 'success')
            .then(() => {
                // العودة لنموذج تسجيل الدخول تلقائياً
                isLogin = false;
                switchBtn.click();
            });
    }
});