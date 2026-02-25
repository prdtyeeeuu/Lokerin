// Fungsi-fungsi untuk panel user
class UserPanel {
  constructor() {
    this.currentView = 'dashboard';
    this.userData = null;
  }

  // Menampilkan dashboard user
  showDashboard() {
    this.currentView = 'dashboard';
    this.render();
  }

  // Menampilkan daftar lowongan
  async showJobListings() {
    this.currentView = 'job-listings';
    try {
      const response = await fetch(`${API_BASE_URL}/job-postings`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil daftar lowongan');
      }

      const jobs = await response.json();
      this.renderJobListings(jobs);
    } catch (error) {
      console.error('Error fetching job listings:', error);
      showToast('Gagal memuat daftar lowongan', 'error');
    }
  }

  // Menampilkan lamaran yang diajukan
  async showMyApplications() {
    this.currentView = 'my-applications';
    try {
      const response = await fetch(`${API_BASE_URL}/my-applications`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil lamaran Anda');
      }

      const applications = await response.json();
      this.renderMyApplications(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Gagal memuat lamaran Anda', 'error');
    }
  }

  // Melamar pekerjaan
  async applyForJob(jobId, coverLetter) {
    try {
      const response = await fetch(`${API_BASE_URL}/job-applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          job_id: jobId,
          cover_letter: coverLetter
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim lamaran');
      }

      showToast('Lamaran berhasil dikirim!', 'success');
      this.showMyApplications(); // Refresh daftar lamaran
    } catch (error) {
      console.error('Error applying for job:', error);
      showToast(error.message || 'Gagal mengirim lamaran', 'error');
    }
  }

  // Render tampilan berdasarkan currentView
  render() {
    switch(this.currentView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'job-listings':
        // Ditangani oleh showJobListings()
        break;
      case 'my-applications':
        // Ditangani oleh showMyApplications()
        break;
      default:
        // Dashboard default
        this.renderDashboard();
    }
  }

  renderDashboard() {
    const container = document.getElementById('user-dashboard-content');
    if (!container) return;

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const name = user.name || 'User';

    container.innerHTML = `
      <!-- Welcome Banner -->
      <div class="relative w-full overflow-hidden rounded-3xl mb-8">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
        <div class="absolute inset-0 bg-[url('https://picsum.photos/seed/techwave/1920/600')] bg-cover bg-center opacity-20"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div class="relative z-10 px-6 py-12 sm:px-10 sm:py-16">
          <div class="max-w-3xl">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Halo, ${name}! 👋
            </h1>
            <p class="text-lg text-slate-200 mb-6">
              Siap menemukan pekerjaan impian Anda? Mulai perjalanan karir Anda sekarang!
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button onclick="router.navigate('user-jobs')" class="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:scale-105 text-center">
                <i class="fa-solid fa-search mr-2"></i>Cari Pekerjaan
              </button>
              <button onclick="router.navigate('profile')" class="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/30 hover:scale-105 text-center">
                <i class="fa-solid fa-user-pen mr-2"></i>Lengkapi Profil
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="glass-card p-5 rounded-2xl text-center hover:scale-105 transition-transform">
          <div class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">10K+</div>
          <div class="text-xs text-slate-400">Lowongan Aktif</div>
        </div>
        <div class="glass-card p-5 rounded-2xl text-center hover:scale-105 transition-transform">
          <div class="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">5K+</div>
          <div class="text-xs text-slate-400">Perusahaan</div>
        </div>
        <div class="glass-card p-5 rounded-2xl text-center hover:scale-105 transition-transform">
          <div class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">95%</div>
          <div class="text-xs text-slate-400">Success Rate</div>
        </div>
        <div class="glass-card p-5 rounded-2xl text-center hover:scale-105 transition-transform">
          <div class="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-1">24/7</div>
          <div class="text-xs text-slate-400">Akses</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-white mb-4"><i class="fa-solid fa-bolt text-yellow-400 mr-2"></i>Aksi Cepat</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="glass-card p-5 rounded-xl hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('user-jobs')">
            <div class="w-12 h-12 mb-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/30">
              <i class="fa-solid fa-search text-white text-xl"></i>
            </div>
            <h3 class="text-lg font-bold text-white mb-1">Cari Pekerjaan</h3>
            <p class="text-sm text-slate-400">Jelajahi ribuan lowongan dari perusahaan terpercaya</p>
          </div>
          <div class="glass-card p-5 rounded-xl hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('user-applications')">
            <div class="w-12 h-12 mb-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/30">
              <i class="fa-solid fa-file-alt text-white text-xl"></i>
            </div>
            <h3 class="text-lg font-bold text-white mb-1">Lamaran Saya</h3>
            <p class="text-sm text-slate-400">Pantau status lamaran pekerjaan Anda</p>
          </div>
          <div class="glass-card p-5 rounded-xl hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('profile')">
            <div class="w-12 h-12 mb-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/30">
              <i class="fa-solid fa-user text-white text-xl"></i>
            </div>
            <h3 class="text-lg font-bold text-white mb-1">Profil Saya</h3>
            <p class="text-sm text-slate-400">Lengkapi profil untuk menarik recruiter</p>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white"><i class="fa-solid fa-layer-group text-indigo-400 mr-2"></i>Kategori Populer</h2>
          <button onclick="router.navigate('user-jobs')" class="text-indigo-400 hover:text-indigo-300 text-sm font-medium">Lihat Semua <i class="fa-solid fa-arrow-right ml-1"></i></button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="glass-card p-4 rounded-xl text-center hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('user-jobs')">
            <div class="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/30">
              <i class="fa-solid fa-code text-white text-lg"></i>
            </div>
            <div class="text-sm font-medium text-white">IT & Software</div>
          </div>
          <div class="glass-card p-4 rounded-xl text-center hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('user-jobs')">
            <div class="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/30">
              <i class="fa-solid fa-chart-line text-white text-lg"></i>
            </div>
            <div class="text-sm font-medium text-white">Marketing</div>
          </div>
          <div class="glass-card p-4 rounded-xl text-center hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('user-jobs')">
            <div class="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/30">
              <i class="fa-solid fa-palette text-white text-lg"></i>
            </div>
            <div class="text-sm font-medium text-white">Design</div>
          </div>
          <div class="glass-card p-4 rounded-xl text-center hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('user-jobs')">
            <div class="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/30">
              <i class="fa-solid fa-calculator text-white text-lg"></i>
            </div>
            <div class="text-sm font-medium text-white">Finance</div>
          </div>
          <div class="glass-card p-4 rounded-xl text-center hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('user-jobs')">
            <div class="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/30">
              <i class="fa-solid fa-user-doctor text-white text-lg"></i>
            </div>
            <div class="text-sm font-medium text-white">Healthcare</div>
          </div>
          <div class="glass-card p-4 rounded-xl text-center hover:scale-105 transition-all cursor-pointer group" onclick="router.navigate('user-jobs')">
            <div class="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/30">
              <i class="fa-solid fa-bullhorn text-white text-lg"></i>
            </div>
            <div class="text-sm font-medium text-white">Sales</div>
          </div>
        </div>
      </div>
    `;
  }

  renderJobListings(jobs) {
    const container = document.getElementById('user-jobs-content');
    if (!container) {
      console.error('user-jobs-content container not found!');
      return;
    }

    console.log('Rendering jobs:', jobs);

    if (!jobs || jobs.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-10">Belum ada lowongan pekerjaan saat ini.</div>';
      return;
    }

    container.innerHTML = `
      ${jobs.map(job => `
        <div class="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform">
          <div class="flex items-start gap-3 mb-3">
            <img src="${job.company_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(job.company_name)}" class="w-12 h-12 rounded-lg object-cover">
            <div>
              <h4 class="font-bold text-white">${job.title}</h4>
              <p class="text-indigo-400 text-sm">${job.company_name}</p>
            </div>
          </div>

          <p class="text-slate-300 text-sm mb-4 line-clamp-2">${job.description || 'Deskripsi tidak tersedia'}</p>

          <div class="flex flex-wrap gap-2 mb-4 text-xs">
            <span class="px-2 py-1 bg-slate-700 rounded">${job.location || 'Remote'}</span>
            <span class="px-2 py-1 bg-slate-700 rounded">${job.job_type || 'Full Time'}</span>
            <span class="px-2 py-1 bg-slate-700 rounded">${job.experience_level || 'Any Level'}</span>
          </div>

          ${job.salary_min && job.salary_max ?
            `<p class="text-emerald-400 font-medium mb-4">Rp ${parseInt(job.salary_min).toLocaleString()} - Rp ${parseInt(job.salary_max).toLocaleString()}/bulan</p>`
            : ''}

          <button onclick="userPanel.applyForJobDialog(${job.id})" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all">
            Lamar Sekarang
          </button>
        </div>
      `).join('')}
    `;
  }

  renderMyApplications(applications) {
    const container = document.getElementById('user-applications-content');
    if (!container) return;

    container.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white">Lamaran Saya</h2>
        <p class="text-slate-400">Status lamaran pekerjaan Anda.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-slate-800/50 rounded-xl overflow-hidden">
          <thead class="bg-slate-700">
            <tr>
              <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Posisi</th>
              <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Perusahaan</th>
              <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Tanggal Lamar</th>
              <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700">
            ${applications.length > 0 ? 
              applications.map(app => `
                <tr>
                  <td class="py-3 px-4 text-sm text-white">${app.job_title}</td>
                  <td class="py-3 px-4 text-sm text-slate-300">${app.company_name}</td>
                  <td class="py-3 px-4 text-sm text-slate-400">${new Date(app.applied_at).toLocaleDateString()}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs ${
                      app.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                      app.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                      app.status === 'reviewed' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }">
                      ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                </tr>
              `).join('') :
              `<tr><td colspan="4" class="py-8 px-4 text-center text-slate-400">Anda belum memiliki lamaran</td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;
  }

  // Dialog untuk melamar pekerjaan
  applyForJobDialog(jobId) {
    // Membuka modal untuk cover letter
    const modal = document.createElement('div');
    modal.id = 'apply-job-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
        <button onclick="userPanel.closeApplyModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white"><i class="fa-solid fa-times"></i></button>
        <h3 class="text-xl font-bold mb-4">Lamar Pekerjaan</h3>
        <form onsubmit="userPanel.submitApplication(event, ${jobId})">
          <div class="space-y-4">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Surat Lamaran</label>
              <textarea id="cover-letter" rows="5" required class="w-full input-dark rounded p-2 text-sm" placeholder="Tulis surat lamaran Anda di sini..."></textarea>
            </div>
            <button type="submit" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium">Kirim Lamaran</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  async submitApplication(e, jobId) {
    e.preventDefault();
    
    const coverLetter = document.getElementById('cover-letter').value;
    
    if (!coverLetter.trim()) {
      showToast('Surat lamaran harus diisi', 'error');
      return;
    }
    
    await this.applyForJob(jobId, coverLetter);
    this.closeApplyModal();
  }

  closeApplyModal() {
    const modal = document.getElementById('apply-job-modal');
    if (modal) {
      modal.remove();
    }
  }
}

// Inisialisasi objek panel user
const userPanel = new UserPanel();