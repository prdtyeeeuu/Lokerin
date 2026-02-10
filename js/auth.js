function switchAuthTab(t) {
    const login = document.getElementById('form-login'), reg = document.getElementById('form-register');
    const tL = document.getElementById('tab-login'), tR = document.getElementById('tab-register');
    if(t === 'login') {
        login.classList.remove('hidden'); reg.classList.add('hidden');
        tL.className = "flex-1 py-4 text-sm font-bold text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50 transition-all";
        tR.className = "flex-1 py-4 text-sm font-bold text-slate-400 border-b-2 border-transparent hover:text-slate-200 transition-all";
    } else {
        login.classList.add('hidden'); reg.classList.remove('hidden');
        tR.className = "flex-1 py-4 text-sm font-bold text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50 transition-all";
        tL.className = "flex-1 py-4 text-sm font-bold text-slate-400 border-b-2 border-transparent hover:text-slate-200 transition-all";
    }
}

function toggleCompanyField() {
    const role = document.getElementById('reg-role').value;
    document.getElementById('reg-company').classList.toggle('hidden', role !== 'recruiter');
}

function handleRegister(e) {
    e.preventDefault();
    const role = document.getElementById('reg-role').value;
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;
    const company = document.getElementById('reg-company').value;
    
    const newUser = {
        id: Date.now(), email, password, role, name, 
        avatar: "https://ui-avatars.com/api/?name=" + name,
        jobTitle: role === 'candidate' ? 'Job Seeker' : 'HRD',
        company: role === 'recruiter' ? company : null,
        isVerified: false, 
        bio: '', skills: [],
        evidences: [],
        accessList: [], 
        requests: [] 
    };

    if(email.includes("hrd") || (company && company.toLowerCase().includes("google"))) newUser.isVerified = true;

    const users = db.getUsers();
    if(users.find(u => u.email === email)) return showToast("Email sudah ada", "error");
    
    db.saveUser(newUser);
    showToast("Registrasi Berhasil!");
    switchAuthTab('login');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.password === pass);
    if(user) {
        db.setCurrentUser(user);
        initApp();
    } else {
        showToast("Login Gagal", "error");
    }
}

function logout() { location.reload(); }