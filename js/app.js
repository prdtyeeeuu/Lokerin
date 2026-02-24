// Variabel global untuk menyimpan role pengguna
let currentUserRole = null;

const router = {
    navigate: (view) => {
        try {
            // Sembunyikan semua view section
            document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
            
            // Tentukan ID elemen view berdasarkan view yang diminta
            let viewId;
            switch(view) {
                case 'dashboard':
                    viewId = 'view-dashboard';
                    break;
                case 'profile':
                    viewId = 'view-profile';
                    break;
                case 'jobs':
                    viewId = 'view-jobs';
                    break;
                case 'user-dashboard':
                    viewId = 'view-user-dashboard';
                    break;
                case 'user-jobs':
                    viewId = 'view-user-jobs';
                    break;
                case 'user-applications':
                    viewId = 'view-user-applications';
                    break;
                case 'hrd-dashboard':
                    viewId = 'view-hrd-dashboard';
                    break;
                case 'hrd-create-job':
                    viewId = 'view-hrd-create-job';
                    break;
                case 'hrd-my-jobs':
                    viewId = 'view-hrd-my-jobs';
                    break;
                case 'hrd-applications':
                    viewId = 'view-hrd-applications';
                    break;
                case 'admin-dashboard':
                    viewId = 'view-admin-dashboard';
                    break;
                case 'admin-users':
                    viewId = 'view-admin-users';
                    break;
                case 'admin-stats':
                    viewId = 'view-admin-stats';
                    break;
                case 'admin-activity':
                    viewId = 'view-admin-activity';
                    break;
                default:
                    viewId = 'view-dashboard'; // Default ke dashboard
                    break;
            }
            
            // Tampilkan view yang diminta
            const targetElement = document.getElementById(viewId);
            if(targetElement) {
                targetElement.classList.remove('hidden');
            } else {
                console.warn(`View element with id '${viewId}' not found`);
                // Jika view tidak ditemukan, tampilkan view dashboard default
                const defaultElement = document.getElementById('view-dashboard');
                if(defaultElement) {
                    defaultElement.classList.remove('hidden');
                }
                return;
            }

            // Update Nav Styling
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('text-white', 'bg-slate-700');
                btn.classList.add('text-slate-400');
            });
            
            // Highlight active nav button
            const activeBtn = document.querySelector(`[onclick="router.navigate('${view}')"]`);
            if(activeBtn) {
                activeBtn.classList.remove('text-slate-400');
                activeBtn.classList.add('text-white', 'bg-slate-700');
            }
            
            // Close mobile menu after navigation
            if(document.getElementById('mobile-menu')) {
                document.getElementById('mobile-menu').classList.add('hidden');
            }
            
            // Jika ini adalah navigasi ke panel tertentu, panggil fungsi panel yang sesuai
            switch(view) {
                case 'user-dashboard':
                    if(window.userPanel && typeof window.userPanel.showDashboard === 'function') {
                        window.userPanel.showDashboard();
                    }
                    break;
                case 'user-jobs':
                    if(window.userPanel && typeof window.userPanel.showJobListings === 'function') {
                        window.userPanel.showJobListings();
                    }
                    break;
                case 'user-applications':
                    if(window.userPanel && typeof window.userPanel.showMyApplications === 'function') {
                        window.userPanel.showMyApplications();
                    }
                    break;
                case 'hrd-dashboard':
                    if(window.hRDPanel && typeof window.hRDPanel.showDashboard === 'function') {
                        window.hRDPanel.showDashboard();
                    }
                    break;
                case 'hrd-create-job':
                    if(window.hRDPanel && typeof window.hRDPanel.showCreateJobPosting === 'function') {
                        window.hRDPanel.showCreateJobPosting();
                    }
                    break;
                case 'hrd-my-jobs':
                    if(window.hRDPanel && typeof window.hRDPanel.showMyJobPostings === 'function') {
                        window.hRDPanel.showMyJobPostings();
                    }
                    break;
                case 'hrd-applications':
                    if(window.hRDPanel && typeof window.hRDPanel.showJobApplications === 'function') {
                        window.hRDPanel.showJobApplications();
                    }
                    break;
                case 'admin-dashboard':
                    if(window.adminPanel && typeof window.adminPanel.showDashboard === 'function') {
                        window.adminPanel.showDashboard();
                    }
                    break;
                case 'admin-users':
                    if(window.adminPanel && typeof window.adminPanel.showUsers === 'function') {
                        window.adminPanel.showUsers();
                    }
                    break;
                case 'admin-stats':
                    if(window.adminPanel && typeof window.adminPanel.showSystemStats === 'function') {
                        window.adminPanel.showSystemStats();
                    }
                    break;
                case 'admin-activity':
                    if(window.adminPanel && typeof window.adminPanel.showActivityLog === 'function') {
                        window.adminPanel.showActivityLog();
                    }
                    break;
                default:
                    // Default behavior for existing views
                    break;
            }
        } catch (error) {
            console.error('Error in router.navigate:', error);
            // Jika terjadi error, kembali ke dashboard
            if(document.getElementById('view-dashboard')) {
                document.getElementById('view-dashboard').classList.remove('hidden');
            }
        }
    }
};

// Fungsi untuk memperbarui navigasi berdasarkan role pengguna
function updateNavigation(role) {
    console.log('Updating navigation for role:', role);
    currentUserRole = role;
    
    // Definisikan menu berdasarkan role
    const menuItems = {
        candidate: [
            { id: 'user-dashboard', label: 'Dashboard', icon: 'fa-home' },
            { id: 'user-jobs', label: 'Cari Pekerjaan', icon: 'fa-search' },
            { id: 'user-applications', label: 'Lamaran Saya', icon: 'fa-file-alt' },
            { id: 'profile', label: 'Profil Saya', icon: 'fa-user' }
        ],
        recruiter: [
            { id: 'hrd-dashboard', label: 'Dashboard', icon: 'fa-home' },
            { id: 'hrd-create-job', label: 'Buat Lowongan', icon: 'fa-plus-circle' },
            { id: 'hrd-my-jobs', label: 'Lowongan Saya', icon: 'fa-briefcase' },
            { id: 'hrd-applications', label: 'Lamaran Masuk', icon: 'fa-envelope' },
            { id: 'profile', label: 'Profil Saya', icon: 'fa-user' }
        ],
        admin: [
            { id: 'admin-dashboard', label: 'Dashboard', icon: 'fa-home' },
            { id: 'admin-users', label: 'Manajemen Pengguna', icon: 'fa-users' },
            { id: 'admin-stats', label: 'Statistik Sistem', icon: 'fa-chart-bar' },
            { id: 'admin-activity', label: 'Log Aktivitas', icon: 'fa-clipboard-list' },
            { id: 'profile', label: 'Profil Saya', icon: 'fa-user' }
        ]
    };
    
    const menu = menuItems[role] || menuItems.candidate; // Default ke candidate
    console.log('Menu items for role:', menu);
    
    // Update desktop navigation
    const desktopNav = document.getElementById('desktop-nav');
    if (desktopNav) {
        try {
            desktopNav.innerHTML = menu.map(item =>
                `<button onclick="router.navigate('${item.id}')" class="nav-btn px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white transition-all">
                    <i class="fa-solid ${item.icon} mr-2"></i>${item.label}
                </button>`
            ).join('');
            
            // Tambahkan tombol logout di akhir menu desktop
            desktopNav.innerHTML += `<button onclick="logout()" class="nav-btn px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-red-400 transition-all ml-2">
                <i class="fa-solid fa-right-from-bracket mr-2"></i>Keluar
            </button>`;
            
            console.log('Desktop navigation updated');
        } catch (error) {
            console.error('Error updating desktop navigation:', error);
        }
    } else {
        console.warn('Desktop navigation element not found');
    }
    
    // Update mobile navigation
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
        try {
            mobileNav.innerHTML = menu.map(item => 
                `<button onclick="router.navigate('${item.id}'); closeMobileMenu();" class="px-6 py-3 text-left text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50">
                    <i class="fa-solid ${item.icon} mr-2"></i>${item.label}
                </button>`
            ).join('');
            
            // Tambahkan tombol logout di akhir menu mobile
            mobileNav.innerHTML += `<button onclick="logout(); closeMobileMenu();" class="px-6 py-3 text-left text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/50">
                <i class="fa-solid fa-sign-out-alt mr-2"></i>Keluar
            </button>`;
            console.log('Mobile navigation updated');
        } catch (error) {
            console.error('Error updating mobile navigation:', error);
        }
    } else {
        console.warn('Mobile navigation element not found');
    }
}

async function initApp() {
    console.log('Initializing app...');
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
        console.log('User not authenticated, showing auth screen');
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('app-layout').classList.add('hidden');
        return;
    }
    
    try {
        console.log('Fetching user profile...');
        // Get user profile from API
        const user = await getUserProfile();
        
        // Double-check authentication after getting user profile
        if (!isAuthenticated()) {
            console.log('Authentication failed after fetching profile');
            throw new Error('Sesi habis, silakan login kembali');
        }
        
        console.log('User authenticated, showing app layout');
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        document.getElementById('dash-username').innerText = user.name;

        // Update navigation based on user role
        console.log('Updating navigation for role:', user.role);
        updateNavigation(user.role);
        
        // Set default view based on user role
        let defaultView = 'dashboard'; // Default for backward compatibility
        switch(user.role) {
            case 'candidate':
                defaultView = 'user-dashboard';
                break;
            case 'recruiter':
                defaultView = 'hrd-dashboard';
                break;
            case 'admin':
                defaultView = 'admin-dashboard';
                break;
        }
        
        console.log('Navigating to:', defaultView);
        
        // Set user data for panels FIRST, before navigation
        if (window.userPanel) {
            try {
                window.userPanel.userData = user;
                console.log('User panel data set');
            } catch (error) {
                console.error('Error setting user panel data:', error);
            }
        }
        if (window.hRDPanel) {
            try {
                window.hRDPanel.userData = user;
                console.log('HRD panel data set');
            } catch (error) {
                console.error('Error setting HRD panel data:', error);
            }
        }
        if (window.adminPanel) {
            try {
                window.adminPanel.userData = user;
                console.log('Admin panel data set');
            } catch (error) {
                console.error('Error setting admin panel data:', error);
            }
        }
        
        // Navigate to appropriate dashboard
        try {
            router.navigate(defaultView);
        } catch (error) {
            console.error('Error navigating to dashboard:', error);
            // Jika gagal navigasi, coba navigasi ke dashboard default
            router.navigate('dashboard');
        }
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        // If there's an error getting user profile, redirect to login
        // Tapi sebelum logout, cek dulu apakah error karena token expired
        if (error.message.includes('Sesi habis') || error.message.includes('expired')) {
            console.log('Token expired, logging out');
            logout(true);
        } else {
            // Jika error bukan karena token expired, mungkin ada masalah lain
            console.log('Other error occurred, staying logged in');
            // Tetap di halaman yang sama atau kembali ke dashboard default
            if (document.getElementById('auth-screen').classList.contains('hidden')) {
                // Jika app layout sudah terlihat, coba kembali ke dashboard
                router.navigate('dashboard');
            } else {
                // Jika auth screen terlihat, tetap di situ
                document.getElementById('auth-screen').classList.remove('hidden');
                document.getElementById('app-layout').classList.add('hidden');
            }
        }
    }
}

// Fungsi untuk memastikan panel-panel telah dimuat
function ensurePanelsLoaded() {
    // Pastikan semua panel telah didefinisikan
    if (typeof UserPanel !== 'undefined' && !window.userPanel) {
        window.userPanel = new UserPanel();
        console.log('UserPanel initialized');
    }
    if (typeof HRDPanel !== 'undefined' && !window.hRDPanel) {
        window.hRDPanel = new HRDPanel();
        console.log('HRDPanel initialized');
    }
    if (typeof AdminPanel !== 'undefined' && !window.adminPanel) {
        window.adminPanel = new AdminPanel();
        console.log('AdminPanel initialized');
    }
}

// Panggil initApp saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    // Tunggu sebentar untuk memastikan semua script telah dimuat
    setTimeout(() => {
        ensurePanelsLoaded();
        initApp();
    }, 100);
});

// Juga panggil ensurePanelsLoaded saat window onload untuk tambahan jaminan
window.addEventListener('load', () => {
    ensurePanelsLoaded();
});

// Fungsi untuk menutup menu mobile
function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.add('hidden');
    }
}

// Fungsi untuk toggle menu mobile
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Fungsi logout yang diperbarui
async function logout(force = false) { 
    console.log('Logout function called, force:', force);
    
    try {
        // Panggil fungsi logout dari API
        await logoutUser();
        
        // Hapus data pengguna dari memori
        window.currentUser = null;
        window.userPanel = null;
        window.hRDPanel = null;
        window.adminPanel = null;
        
        // Tutup menu mobile jika terbuka
        closeMobileMenu();
        
        // Tampilkan pesan jika bukan logout paksa
        if (!force) {
            showToast("Anda telah logout", "success");
        }
        
        // Alihkan ke halaman login
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('app-layout').classList.add('hidden');
        
    } catch (error) {
        console.error('Error during logout:', error);
        // Jika terjadi error, tetap arahkan ke halaman login
        localStorage.clear(); // Bersihkan semua data lokal
        window.currentUser = null;
        window.userPanel = null;
        window.hRDPanel = null;
        window.adminPanel = null;
        
        // Tutup menu mobile jika terbuka
        closeMobileMenu();
        
        if (!force) {
            showToast("Terjadi kesalahan saat logout", "error");
        }
        
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('app-layout').classList.add('hidden');
    }
}

// Fungsi untuk toggle menu mobile
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});