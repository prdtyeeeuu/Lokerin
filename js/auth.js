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
    const roleSelect = document.getElementById('reg-role');
    if (!roleSelect) return;
    
    const role = roleSelect.value;
    const companyField = document.getElementById('reg-company');
    if (!companyField) return;
    
    companyField.classList.toggle('hidden', role !== 'recruiter');
}

// Function to hash password (simple client-side hashing for basic protection)
function hashPassword(password) {
    // Note: This is not cryptographically secure, but adds a basic layer of obfuscation
    // In production, passwords should be handled server-side with proper bcrypt/scrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

async function handleRegister(e) {
    e.preventDefault();
    
    // Get form elements
    const roleSelect = document.getElementById('reg-role');
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-pass');
    const companyInput = document.getElementById('reg-company');
    
    // Check if elements exist
    if (!roleSelect || !nameInput || !emailInput || !passwordInput) {
        showToast("Form tidak lengkap", "error");
        return;
    }
    
    // Get values and trim whitespace
    const role = roleSelect.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const company = companyInput ? companyInput.value.trim() : '';

    // Validation
    if (!name) {
        showToast("Nama harus diisi", "error");
        return;
    }
    
    if (!email) {
        showToast("Email harus diisi", "error");
        return;
    }
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
        showToast("Format email tidak valid", "error");
        return;
    }
    
    if (password.length < 6) {
        showToast("Password minimal 6 karakter", "error");
        return;
    }
    
    // Additional password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
        showToast("Password harus mengandung huruf besar, huruf kecil, dan angka", "error");
        return;
    }
    
    if (role === 'recruiter' && !company) {
        showToast("Nama perusahaan harus diisi", "error");
        return;
    }

    // Show loading indicator
    const submitBtn = document.querySelector('#form-register button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Mendaftar...';
    submitBtn.disabled = true;

    try {
        // Register user via API
        await registerUser({
            name,
            email,
            password,
            role,
            company: role === 'recruiter' ? company : null
        });
        
        showToast("Registrasi berhasil! Silakan login.");
        switchAuthTab('login');
        
        // Reset form
        document.getElementById('form-register').reset();
        if (companyInput) {
            companyInput.classList.add('hidden');
        }
    } catch (error) {
        showToast(error.message || "Gagal mendaftar. Silakan coba lagi.", "error");
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-pass');
    
    if (!emailInput || !passwordInput) {
        showToast("Form tidak lengkap", "error");
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation
    if (!email) {
        showToast("Email harus diisi", "error");
        return;
    }
    
    if (!password) {
        showToast("Password harus diisi", "error");
        return;
    }
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
        showToast("Format email tidak valid", "error");
        return;
    }
    
    // Show loading indicator
    const submitBtn = document.querySelector('#form-login button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Masuk...';
    submitBtn.disabled = true;

    try {
        // Login user via API
        const response = await loginUser({
            email,
            password
        });
        
        // Save user data to localStorage
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        // Redirect to main app
        initApp();
    } catch (error) {
        showToast(error.message || "Email atau password salah", "error");
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Function to create a session token
function createSessionToken(userId) {
    // Create a simple session token (in a real app, this would be more secure)
    const payload = {
        userId: userId,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // In a real application, you would sign this token with a secret
    return btoa(JSON.stringify(payload)); // Base64 encode for simplicity
}

// Function to validate session token
function validateSessionToken(token) {
    try {
        const decoded = JSON.parse(atob(token));
        if (decoded.expires < Date.now()) {
            return null; // Token expired
        }
        return decoded;
    } catch (e) {
        return null; // Invalid token
    }
}

// Function to check if user session is still valid
function isSessionValid() {
    const token = sessionStorage.getItem('session_token');
    if (!token) return false;
    
    const sessionData = validateSessionToken(token);
    return !!sessionData; // Return true if session is valid
}

// Function to extend session
function extendSession() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return false;
    
    const token = createSessionToken(currentUser.id);
    sessionStorage.setItem('session_token', token);
    return true;
}

// Function to periodically check session validity
function setupSessionMonitoring() {
    setInterval(() => {
        if (!isSessionValid()) {
            // Session expired, log out user
            showToast("Sesi Anda telah habis. Silakan login kembali.", "error");
            setTimeout(() => {
                logout(true); // Force logout
            }, 2000);
        } else {
            // Extend session if it's still valid
            extendSession();
        }
    }, 10 * 60 * 1000); // Check every 10 minutes
}

function logout(force = false) { 
    // Clear current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Clear auth token
    removeToken();
    
    // Clear session token
    sessionStorage.removeItem('session_token');
    
    // Clear login attempts
    sessionStorage.removeItem('loginAttempts');
    
    // Clear any sensitive data from memory
    window.currentUser = null;
    
    // Show message if not a forced logout
    if (!force) {
        showToast("Anda telah logout", "success");
    }
    
    location.reload(); 
}