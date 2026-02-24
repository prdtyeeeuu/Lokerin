// Fungsi-fungsi untuk panel admin
class AdminPanel {
  constructor() {
    this.currentView = 'dashboard';
    this.userData = null;
  }

  // Menampilkan dashboard admin
  async showDashboard() {
    this.currentView = 'dashboard';
    await this.loadStats();
    this.render();
  }

  // Menampilkan daftar pengguna
  async showUsers() {
    this.currentView = 'users';
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil daftar pengguna');
      }

      const users = await response.json();
      this.renderUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Gagal memuat daftar pengguna', 'error');
    }
  }

  // Menampilkan statistik sistem
  async showSystemStats() {
    this.currentView = 'stats';
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil statistik sistem');
      }

      const stats = await response.json();
      this.renderSystemStats(stats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      showToast('Gagal memuat statistik sistem', 'error');
    }
  }

  // Menampilkan log aktivitas
  showActivityLog() {
    this.currentView = 'activity-log';
    this.render();
  }

  // Memuat statistik untuk dashboard
  async loadStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil statistik');
      }

      this.stats = await response.json();
    } catch (error) {
      console.error('Error loading stats:', error);
      this.stats = {
        total_candidates: 0,
        total_recruiters: 0,
        total_job_postings: 0,
        total_applications: 0
      };
    }
  }

  // Render tampilan berdasarkan currentView
  render() {
    switch(this.currentView) {
      case 'users':
        // Ditangani oleh showUsers()
        break;
      case 'stats':
        // Ditangani oleh showSystemStats()
        break;
      case 'activity-log':
        this.renderActivityLog();
        break;
      default:
        // Dashboard default
        this.renderDashboard();
    }
  }

  renderDashboard() {
    const container = document.getElementById('admin-dashboard-content');
    if (!container) return;

    container.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white">Dashboard Admin</h2>
        <p class="text-slate-400">Kelola sistem dan pantau aktivitas platform.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Total Pengguna</div>
          <div class="text-3xl font-bold text-indigo-400">${(this.stats?.total_candidates || 0) + (this.stats?.total_recruiters || 0)}</div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Kandidat</div>
          <div class="text-3xl font-bold text-emerald-400">${this.stats?.total_candidates || 0}</div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">HRD</div>
          <div class="text-3xl font-bold text-amber-400">${this.stats?.total_recruiters || 0}</div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Lowongan</div>
          <div class="text-3xl font-bold text-rose-400">${this.stats?.total_job_postings || 0}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="glass-card p-6 rounded-2xl">
          <h3 class="text-lg font-bold text-white mb-4">Statistik Lamaran</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-400">Total Lamaran</span>
                <span class="text-white">${this.stats?.total_applications || 0}</span>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-2">
                <div class="bg-indigo-500 h-2 rounded-full" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <h3 class="text-lg font-bold text-white mb-4">Aktivitas Terbaru</h3>
          <div id="recent-activity-admin">
            <p class="text-slate-400 text-sm">Aktivitas terbaru akan ditampilkan di sini.</p>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 rounded-2xl">
        <h3 class="text-lg font-bold text-white mb-4">Akses Cepat</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onclick="adminPanel.showUsers()" class="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-left">
            <div class="text-indigo-400 text-xl mb-2"><i class="fa-solid fa-users"></i></div>
            <h4 class="font-bold text-white">Kelola Pengguna</h4>
            <p class="text-slate-400 text-sm">Lihat dan atur akun pengguna</p>
          </button>
          <button onclick="adminPanel.showSystemStats()" class="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-left">
            <div class="text-emerald-400 text-xl mb-2"><i class="fa-solid fa-chart-line"></i></div>
            <h4 class="font-bold text-white">Statistik Sistem</h4>
            <p class="text-slate-400 text-sm">Lihat statistik penggunaan</p>
          </button>
          <button onclick="adminPanel.showActivityLog()" class="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-left">
            <div class="text-amber-400 text-xl mb-2"><i class="fa-solid fa-clipboard-list"></i></div>
            <h4 class="font-bold text-white">Log Aktivitas</h4>
            <p class="text-slate-400 text-sm">Lihat riwayat aktivitas</p>
          </button>
        </div>
      </div>
    `;
  }

  renderUsers(users) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="view-section max-w-7xl mx-auto fade-in">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white">Manajemen Pengguna</h2>
          <p class="text-slate-400">Lihat dan kelola semua akun pengguna di platform.</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full bg-slate-800/50 rounded-xl overflow-hidden">
            <thead class="bg-slate-700">
              <tr>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Nama</th>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Email</th>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Peran</th>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Status Verifikasi</th>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
              ${users.length > 0 ? 
                users.map(user => `
                  <tr>
                    <td class="py-3 px-4 text-sm text-white">${user.name}</td>
                    <td class="py-3 px-4 text-sm text-slate-300">${user.email}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                        user.role === 'recruiter' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }">
                        ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-1 rounded-full text-xs ${
                        user.is_verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }">
                        ${user.is_verified ? 'Terverifikasi' : 'Belum'}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-slate-400">${new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('') :
                `<tr><td colspan="5" class="py-8 px-4 text-center text-slate-400">Tidak ada pengguna ditemukan</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderSystemStats(stats) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="view-section max-w-7xl mx-auto fade-in">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white">Statistik Sistem</h2>
          <p class="text-slate-400">Data statistik penggunaan platform secara keseluruhan.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="glass-card p-6 rounded-2xl text-center">
            <div class="text-4xl font-bold text-indigo-400 mb-2">${stats.total_candidates || 0}</div>
            <div class="text-slate-400">Total Kandidat</div>
          </div>
          <div class="glass-card p-6 rounded-2xl text-center">
            <div class="text-4xl font-bold text-amber-400 mb-2">${stats.total_recruiters || 0}</div>
            <div class="text-slate-400">Total HRD</div>
          </div>
          <div class="glass-card p-6 rounded-2xl text-center">
            <div class="text-4xl font-bold text-emerald-400 mb-2">${stats.total_job_postings || 0}</div>
            <div class="text-slate-400">Total Lowongan</div>
          </div>
          <div class="glass-card p-6 rounded-2xl text-center">
            <div class="text-4xl font-bold text-rose-400 mb-2">${stats.total_applications || 0}</div>
            <div class="text-slate-400">Total Lamaran</div>
          </div>
        </div>

        <div class="glass-card p-6 rounded-2xl">
          <h3 class="text-lg font-bold text-white mb-4">Grafik Penggunaan</h3>
          <div class="h-64 flex items-center justify-center text-slate-500">
            <div class="text-center">
              <i class="fa-solid fa-chart-bar text-4xl mb-2"></i>
              <p>Visualisasi grafik akan ditampilkan di sini</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderActivityLog(container) {
    container.innerHTML = `
      <div class="view-section max-w-7xl mx-auto fade-in">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white">Log Aktivitas Sistem</h2>
          <p class="text-slate-400">Catatan aktivitas dan peristiwa penting di platform.</p>
        </div>

        <div class="glass-card p-6 rounded-2xl">
          <div class="space-y-4">
            <div class="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
              <div class="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
              <div>
                <h4 class="font-bold text-white">Pengguna Baru Terdaftar</h4>
                <p class="text-slate-400 text-sm">John Doe mendaftar sebagai kandidat</p>
                <p class="text-slate-500 text-xs mt-1">2 jam yang lalu</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
              <div class="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <h4 class="font-bold text-white">Lowongan Baru Dibuat</h4>
                <p class="text-slate-400 text-sm">PT Maju Jaya membuat lowongan Software Engineer</p>
                <p class="text-slate-500 text-xs mt-1">5 jam yang lalu</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
              <div class="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
              <div>
                <h4 class="font-bold text-white">Lamaran Diterima</h4>
                <p class="text-slate-400 text-sm">Lamaran untuk posisi Marketing Manager diterima</p>
                <p class="text-slate-500 text-xs mt-1">1 hari yang lalu</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
              <div class="w-2 h-2 bg-rose-500 rounded-full mt-2"></div>
              <div>
                <h4 class="font-bold text-white">Akun Diverifikasi</h4>
                <p class="text-slate-400 text-sm">Akun HRD PT Sejahtera telah diverifikasi</p>
                <p class="text-slate-500 text-xs mt-1">2 hari yang lalu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Inisialisasi objek panel admin
const adminPanel = new AdminPanel();