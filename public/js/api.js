// Konfigurasi API
const API_BASE_URL = 'http://localhost:5000/api';

// Fungsi untuk mendapatkan token dari localStorage
function getToken() {
  const token = localStorage.getItem('authToken');
  console.log('Retrieved token:', token ? 'Exists' : 'Does not exist');
  return token;
}

// Fungsi untuk menyimpan token
function setToken(token) {
  localStorage.setItem('authToken', token);
  
  // Juga simpan waktu ekspirasi untuk referensi cepat
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      localStorage.setItem('tokenExpiry', payload.exp);
    }
  } catch (e) {
    console.error('Error parsing token for expiry:', e);
  }
}

// Fungsi untuk menghapus token
function removeToken() {
  console.log('Removing token and user data');
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('tokenExpiry');
}

// Fungsi untuk logout
async function logoutUser() {
  try {
    // Hapus token dan data pengguna dari localStorage
    removeToken();
    
    // Jika backend memiliki endpoint logout, panggil endpoint tersebut
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (apiError) {
      // Jika endpoint logout gagal, tetap lanjutkan proses logout
      console.warn('API logout failed, continuing with local logout:', apiError);
    }
    
    console.log('User logged out successfully');
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    // Tetap hapus token lokal meskipun ada error
    removeToken();
    return true;
  }
}

// Fungsi untuk menambahkan header otorisasi
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Fungsi untuk mengecek apakah pengguna sudah login
function isAuthenticated() {
  const token = getToken();
  if (!token) {
    console.log('No token found');
    return false;
  }
  
  try {
    // Decode token JWT tanpa verifikasi signature (karena ini client-side)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid token format');
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Periksa apakah token sudah kadaluarsa
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp <= currentTime;
    
    if (isExpired) {
      console.log('Token has expired');
      removeToken(); // Hapus token yang kadaluarsa
    }
    
    return !isExpired;
  } catch (e) {
    console.error('Error validating token:', e);
    removeToken(); // Hapus token yang bermasalah
    return false;
  }
}

// Fungsi untuk mengecek apakah token akan segera kadaluarsa (kurang dari 5 menit)
function isTokenExpiringSoon() {
  const token = getToken();
  if (!token) return true; // Jika tidak ada token, anggap perlu login
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60; // 5 menit dalam detik
    
    // Jika token akan kadaluarsa dalam 5 menit ke depan
    return payload.exp - currentTime < fiveMinutes;
  } catch (e) {
    console.error('Error checking token expiry:', e);
    return true;
  }
}

// Fungsi untuk registrasi
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mendaftar');
    }
    
    return data;
  } catch (error) {
    console.error('Kesalahan registrasi:', error);
    throw error;
  }
}

// Fungsi untuk login
async function loginUser(credentials) {
  try {
    console.log('Attempting login with credentials:', credentials);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    console.log('Login response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.message || 'Gagal login');
    }

    // Simpan token
    setToken(data.token);
    console.log('Token saved to localStorage');

    // Simpan data pengguna ke localStorage
    console.log('Saving user data to localStorage:', JSON.stringify(data.user, null, 2));
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    console.log('User data saved. Verified by reading back:', JSON.parse(localStorage.getItem('currentUser')));

    return data;
  } catch (error) {
    console.error('Kesalahan login:', error);
    throw error;
  }
}

// Fungsi untuk mendapatkan profil pengguna
async function getUserProfile() {
  try {
    console.log('Getting user profile...');
    
    // Cek apakah token masih valid
    if (!isAuthenticated()) {
      console.log('Token is not valid, removing token');
      removeToken();
      throw new Error('Sesi habis, silakan login kembali');
    }
    
    // Ambil data pengguna dari localStorage jika tersedia
    const cachedUser = localStorage.getItem('currentUser');
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        console.log('Returning cached user data:', user);
        return user;
      } catch (e) {
        console.warn('Cached user data is invalid, fetching from API');
      }
    }
    
    console.log('Fetching user profile from API...');
    // Jika tidak ada data tercache, ambil dari API
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, data);
      if (response.status === 401) {
        // Token kadaluarsa, hapus token
        removeToken();
        throw new Error('Sesi habis, silakan login kembali');
      }
      throw new Error(data.message || 'Gagal mengambil profil');
    }
    
    console.log('Received user data from API:', data);
    
    // Simpan data pengguna ke localStorage
    localStorage.setItem('currentUser', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Kesalahan mengambil profil:', error);
    throw error;
  }
}

// Fungsi untuk memperbarui token secara berkala
function setupTokenRefresh() {
  // Periksa token setiap 5 menit
  setInterval(() => {
    if (isAuthenticated()) {
      if (isTokenExpiringSoon()) {
        console.log('Token will expire soon, consider refreshing');
        // Di sini Anda bisa menambahkan logika untuk refresh token jika diperlukan
        // Misalnya dengan memanggil endpoint refresh token
      } else {
        console.log('Token is still valid');
      }
    } else {
      console.log('Token has expired or is invalid');
      // Jika token tidak valid, arahkan ke login
      if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = '/';
      }
    }
  }, 5 * 60 * 1000); // 5 menit
}

// Fungsi untuk memperbarui profil
async function updateUserProfile(profileData) {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal memperbarui profil');
    }
    
    return data;
  } catch (error) {
    console.error('Kesalahan memperbarui profil:', error);
    throw error;
  }
}

// Fungsi untuk mendapatkan semua kandidat
async function getCandidates() {
  try {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil kandidat');
    }
    
    return data;
  } catch (error) {
    console.error('Kesalahan mengambil kandidat:', error);
    throw error;
  }
}

// Fungsi untuk pencarian kandidat
async function searchCandidates(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/search-candidates?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mencari kandidat');
    }
    
    return data;
  } catch (error) {
    console.error('Kesalahan mencari kandidat:', error);
    throw error;
  }
}

// Mulai setup token refresh saat file dimuat
setupTokenRefresh();