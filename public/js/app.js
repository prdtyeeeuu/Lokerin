// Variabel global untuk menyimpan role pengguna
let currentUserRole = null;

// Make router globally available
window.router = {
    navigate: (view) => {
        try {
            // Sembunyikan semua view section
            document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
            
            // Tentukan ID elemen view berdasarkan view yang diminta
            let viewId;
            switch(view) {
                case 'home':
                    viewId = 'view-home';
                    break;
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
                console.log('Showing view:', viewId);
                targetElement.classList.remove('hidden');
            } else {
                console.warn(`View element with id '${viewId}' not found`);
                // Jika view tidak ditemukan, tetap tampilkan dashboard yang ada
                const defaultElement = document.getElementById('view-dashboard');
                if(defaultElement) {
                    defaultElement.classList.remove('hidden');
                }
                // Jangan return, tetap lanjutkan untuk update navigasi
            }

            // Sembunyikan view lain (kecuali view yang sedang ditampilkan)
            document.querySelectorAll('.view-section').forEach(el => {
                if (el.id !== viewId) {
                    el.classList.add('hidden');
                }
            });

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
                case 'profile':
                    // Render profile page with current user data
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    console.log('=== PROFILE NAVIGATION ===');
                    console.log('currentUser:', currentUser);
                    
                    // Make absolutely sure the profile view is visible
                    const profileView = document.getElementById('view-profile');
                    if (profileView) {
                        // Hide all other views first
                        document.querySelectorAll('.view-section').forEach(el => {
                            el.classList.add('hidden');
                        });
                        // Then show profile view
                        profileView.classList.remove('hidden');
                        console.log('Profile view is now visible');
                    } else {
                        console.error('ERROR: view-profile element NOT found!');
                    }
                    
                    if (currentUser && Object.keys(currentUser).length > 0) {
                        // Use setTimeout to ensure DOM is ready
                        setTimeout(() => {
                            const nameEl = document.getElementById('profile-name-display');
                            const avatarEl = document.getElementById('profile-avatar-display');
                            const roleEl = document.getElementById('profile-role-display');
                            const companyEl = document.getElementById('profile-company-display');
                            const bioEl = document.getElementById('profile-bio-display');
                            const skillsEl = document.getElementById('profile-skills-display');
                            const portfolioEl = document.getElementById('portfolio-grid');
                            
                            console.log('Elements found:', {
                                nameEl: !!nameEl,
                                avatarEl: !!avatarEl,
                                roleEl: !!roleEl,
                                bioEl: !!bioEl,
                                skillsEl: !!skillsEl,
                                portfolioEl: !!portfolioEl
                            });
                            
                            if (nameEl) {
                                nameEl.innerText = currentUser.name || 'User';
                                console.log('✓ Set name to:', currentUser.name);
                            }
                            
                            if (avatarEl) {
                                avatarEl.src = currentUser.avatar || '';
                                console.log('✓ Set avatar');
                            }
                            
                            if (roleEl) {
                                const jobTitle = currentUser.jobTitle || 'Role';
                                roleEl.innerHTML = '<span>' + jobTitle + '</span>';
                                console.log('✓ Set role');
                            }
                            
                            if (companyEl) {
                                if (currentUser.company) {
                                    companyEl.innerText = currentUser.company;
                                    companyEl.classList.remove('hidden');
                                } else {
                                    companyEl.classList.add('hidden');
                                }
                            }
                            
                            if (bioEl) {
                                bioEl.innerText = currentUser.bio || 'Belum ada bio.';
                                console.log('✓ Set bio');
                            }
                            
                            if (skillsEl) {
                                skillsEl.innerHTML = '';
                                if (currentUser.skills && currentUser.skills.length > 0) {
                                    currentUser.skills.forEach(skill => {
                                        skillsEl.innerHTML += `<span class="px-2 py-1 bg-slate-700 text-xs text-indigo-300 rounded border border-slate-600">${skill.trim()}</span>`;
                                    });
                                } else {
                                    skillsEl.innerHTML = '<span class="text-xs text-slate-500 italic">-</span>';
                                }
                            }
                            
                            if (portfolioEl) {
                                portfolioEl.innerHTML = '';
                                if (currentUser.evidences && currentUser.evidences.length > 0) {
                                    currentUser.evidences.forEach(ev => {
                                        let content = ev.type === 'image' 
                                            ? `<img src="${ev.content}" class="w-full h-48 object-cover">`
                                            : `<div class="w-full h-48 bg-slate-800 flex items-center justify-center"><i class="fa-solid fa-globe text-4xl text-indigo-500"></i></div>`;
                                        portfolioEl.innerHTML += `<div class="glass-card rounded-xl overflow-hidden"><div class="relative">${content}</div><div class="p-4"><h4 class="font-bold text-white text-sm">${ev.title}</h4></div></div>`;
                                    });
                                } else {
                                    portfolioEl.innerHTML = '<p class="text-slate-400 text-sm">Belum ada portfolio.</p>';
                                }
                            }
                            
                            updateNavbarUserInfo(currentUser);
                            console.log('=== PROFILE RENDER COMPLETE ===');
                        }, 50);
                    }
                    break;
                case 'hrd-dashboard':
                    if(window.hRDPanel && typeof window.hRDPanel.showDashboard === 'function') {
                        window.hRDPanel.showDashboard();
                    }
                    break;
                case 'hrd-create-job':
                    if(window.hRDPanel && typeof window.hRDPanel.showCreateJobPosting === 'function') {
                        console.log('Calling hRDPanel.showCreateJobPosting()');
                        window.hRDPanel.showCreateJobPosting();
                    } else {
                        console.error('hRDPanel or showCreateJobPosting not available');
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
function updateNavigation(role, user = null) {
    console.log('Updating navigation for role:', role, 'user:', user);
    console.log('Desktop nav element:', document.getElementById('desktop-nav'));
    console.log('Mobile nav element:', document.getElementById('mobile-nav'));
    currentUserRole = role;

    // Update user info di navbar
    updateNavbarUserInfo(user);

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

    const menu = menuItems[role] || menuItems.candidate;
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
            console.log('Mobile navigation updated');
        } catch (error) {
            console.error('Error updating mobile navigation:', error);
        }
    } else {
        console.warn('Mobile navigation element not found');
    }
}

// Fungsi untuk update informasi user di navbar
function updateNavbarUserInfo(user) {
    if (!user) {
        // Try to get user from localStorage if not provided
        try {
            const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (storedUser && Object.keys(storedUser).length > 0) {
                user = storedUser;
            } else {
                return;
            }
        } catch (e) {
            return;
        }
    }

    console.log('Updating navbar with user:', user);

    // Desktop navbar
    const navUsername = document.getElementById('nav-username');
    const navUserRole = document.getElementById('nav-user-role');
    const navAvatar = document.getElementById('nav-user-avatar');

    if (navUsername) navUsername.textContent = user.name || 'User';
    if (navUserRole) {
        const roleLabels = {
            'candidate': 'Candidate',
            'recruiter': 'Recruiter',
            'admin': 'Admin'
        };
        navUserRole.textContent = roleLabels[user.role] || user.role;
    }
    if (navAvatar && user.avatar) {
        navAvatar.innerHTML = `<img src="${user.avatar}" class="w-full h-full object-cover rounded-full">`;
    }

    // Mobile navbar
    const mobileUsername = document.getElementById('mobile-username');
    const mobileUserRole = document.getElementById('mobile-user-role');
    const mobileAvatar = document.getElementById('mobile-nav-avatar');

    if (mobileUsername) mobileUsername.textContent = user.name || 'User';
    if (mobileUserRole) {
        const roleLabels = {
            'candidate': 'Candidate',
            'recruiter': 'Recruiter',
            'admin': 'Admin'
        };
        mobileUserRole.textContent = roleLabels[user.role] || user.role;
    }
    if (mobileAvatar && user.avatar) {
        mobileAvatar.innerHTML = `<img src="${user.avatar}" class="w-full h-full object-cover rounded-full">`;
    }
}

async function initApp() {
    console.log('Initializing app...');

    // Check if user is authenticated
    if (!isAuthenticated()) {
        console.log('User not authenticated, showing auth screen');
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.classList.remove('hidden');
        return;
    }

    // If on homepage (/), don't hide the public content, just update navbar and show home view
    if (window.location.pathname === '/') {
        console.log('On homepage, just updating navbar');
        try {
            const user = await getUserProfile();
            updateNavigation(user.role, user);
            updateNavbarUserInfo(user);
            // Show home view on homepage for authenticated users
            const homeView = document.getElementById('view-home');
            const appLayout = document.getElementById('app-layout');
            if (homeView) {
                document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
                homeView.classList.remove('hidden');
            }
            if (appLayout) appLayout.classList.remove('hidden');
            return;
        } catch (error) {
            console.error('Error getting user profile on homepage:', error);
            return;
        }
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
        const authScreen = document.getElementById('auth-screen');
        const appLayout = document.getElementById('app-layout');
        const dashUsername = document.getElementById('dash-username');
        
        if (authScreen) authScreen.classList.add('hidden');
        if (appLayout) appLayout.classList.remove('hidden');
        if (dashUsername) dashUsername.innerText = user.name;

        // Update navigation based on user role
        console.log('Updating navigation for role:', user.role);
        updateNavigation(user.role, user);

        // Set default view based on user role AND current URL
        let defaultView = 'dashboard'; // Default for backward compatibility

        // Check if we're on the profile page URL
        if (window.location.pathname === '/profile') {
            defaultView = 'profile';
        } else if (window.location.pathname === '/jobs') {
            defaultView = 'user-jobs';
        } else if (window.location.pathname === '/applications') {
            defaultView = 'user-applications';
        } else if (window.location.pathname === '/hrd/dashboard') {
            defaultView = 'hrd-dashboard';
        } else if (window.location.pathname === '/hrd/create-job') {
            defaultView = 'hrd-create-job';
        } else if (window.location.pathname === '/hrd/my-jobs') {
            defaultView = 'hrd-my-jobs';
        } else if (window.location.pathname === '/hrd/applications') {
            defaultView = 'hrd-applications';
        } else if (window.location.pathname === '/admin/dashboard') {
            defaultView = 'admin-dashboard';
        } else if (window.location.pathname === '/admin/users') {
            defaultView = 'admin-users';
        } else if (window.location.pathname === '/admin/stats') {
            defaultView = 'admin-stats';
        } else {
            // For homepage (/) and dashboard, use role-based default
            if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
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
            }
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

        // Render user data AFTER navigation (so elements are visible)
        // Use longer delay to ensure DOM is ready
        // Skip if we're on profile page (handled separately)
        if (window.location.pathname !== '/profile') {
            setTimeout(() => {
                console.log('Calling renderApp with user:', user);
                renderApp(user);
            }, 300);
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
            const authScreen = document.getElementById('auth-screen');
            const appLayout = document.getElementById('app-layout');
            
            if (authScreen && appLayout && authScreen.classList.contains('hidden')) {
                // Jika app layout sudah terlihat, coba kembali ke dashboard
                router.navigate('dashboard');
            } else {
                // Jika auth screen terlihat, tetap di situ
                if (authScreen) authScreen.classList.remove('hidden');
                if (appLayout) appLayout.classList.add('hidden');
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

// Juga panggil ensurePanelsLoaded saat window onload untuk tambahan jaminan
window.addEventListener('load', () => {
    ensurePanelsLoaded();
});

// Make important functions globally available
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.confirmLogout = confirmLogout;
window.logout = logout;
window.router = router;

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

// Fungsi untuk konfirmasi logout
function confirmLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        logout();
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