// Fungsi untuk mendapatkan pengguna saat ini dari localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return null;
    
    try {
        return JSON.parse(userData);
    } catch (e) {
        console.error('Error parsing current user data:', e);
        return null;
    }
}

// Fungsi untuk menyimpan pengguna saat ini ke localStorage
function setCurrentUser(user) {
    if (!user) {
        localStorage.removeItem('currentUser');
        return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Fungsi untuk mendapatkan semua pengguna (akan diambil dari API)
async function getAllUsers() {
    try {
        // Di masa depan, ini akan diambil dari API
        // Untuk sekarang, kita gunakan data dari localStorage sebagai fallback
        const currentUser = getCurrentUser();
        if (!currentUser) return [];
        
        // Panggil API untuk mendapatkan semua pengguna
        const response = await fetch(`${API_BASE_URL}/candidates`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Gagal mengambil data pengguna');
        }
        
        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}

// Fungsi untuk menyimpan pengguna (akan disimpan ke database melalui API)
async function saveUser(user) {
    try {
        // Panggil API untuk menyimpan pengguna
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                jobTitle: user.jobTitle,
                company: user.company,
                bio: user.bio,
                skills: user.skills
            })
        });
        
        if (!response.ok) {
            throw new Error('Gagal menyimpan data pengguna');
        }
        
        const result = await response.json();
        
        // Update data pengguna lokal
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === user.id) {
            Object.assign(currentUser, user);
            setCurrentUser(currentUser);
        }
        
        return result;
    } catch (error) {
        console.error('Error saving user:', error);
        return null;
    }
}

// Fungsi untuk menyimpan profil pengguna
async function saveUserProfile(profileData) {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal menyimpan profil');
        }
        
        // Update data pengguna lokal
        const currentUser = getCurrentUser();
        if (currentUser) {
            Object.assign(currentUser, profileData);
            setCurrentUser(currentUser);
        }
        
        return result;
    } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
    }
}