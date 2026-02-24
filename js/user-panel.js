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

    container.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white">Dashboard User</h2>
        <p class="text-slate-400">Selamat datang di panel pengguna Anda.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Total Lamaran</div>
          <div class="text-3xl font-bold text-indigo-400" id="total-applications">0</div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Lamaran Diterima</div>
          <div class="text-3xl font-bold text-emerald-400" id="accepted-applications">0</div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Lamaran Ditolak</div>
          <div class="text-3xl font-bold text-rose-400" id="rejected-applications">0</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-6 rounded-2xl">
          <h3 class="text-lg font-bold text-white mb-4">Profil Saya</h3>
          <div id="user-profile-summary">
            <!-- Ditampilkan oleh fungsi renderApp -->
          </div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <h3 class="text-lg font-bold text-white mb-4">Aktivitas Terbaru</h3>
          <div id="recent-activity">
            <p class="text-slate-400 text-sm">Belum ada aktivitas terbaru.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderJobListings(jobs) {
    const container = document.getElementById('user-jobs-content');
    if (!container) return;

    container.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white">Daftar Lowongan Pekerjaan</h2>
        <p class="text-slate-400">Temukan pekerjaan impian Anda.</p>
      </div>

      <div id="job-listings-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
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