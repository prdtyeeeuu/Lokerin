// Fungsi-fungsi untuk panel HRD
class HRDPanel {
  constructor() {
    this.currentView = 'dashboard';
    this.userData = null;
  }

  // Menampilkan dashboard HRD
  showDashboard() {
    this.currentView = 'dashboard';
    this.render();
  }

  // Menampilkan form pembuatan lowongan
  showCreateJobPosting() {
    this.currentView = 'create-job';
    this.render();
  }

  // Menampilkan daftar lowongan yang diposting
  async showMyJobPostings() {
    this.currentView = 'my-jobs';
    try {
      const user = await getUserProfile();
      
      // Dalam implementasi nyata, kita akan mengambil lowongan berdasarkan user ID
      // Untuk simulasi, kita panggil endpoint yang sesuai
      const response = await fetch(`${API_BASE_URL}/job-postings`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil daftar lowongan');
      }

      const jobs = await response.json();
      this.renderMyJobPostings(jobs);
    } catch (error) {
      console.error('Error fetching job postings:', error);
      showToast('Gagal memuat daftar lowongan', 'error');
    }
  }

  // Menampilkan lamaran untuk lowongan yang diposting
  async showJobApplications() {
    this.currentView = 'job-applications';
    try {
      const response = await fetch(`${API_BASE_URL}/my-job-applications`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil lamaran');
      }

      const applications = await response.json();
      this.renderJobApplications(applications);
    } catch (error) {
      console.error('Error fetching job applications:', error);
      showToast('Gagal memuat lamaran', 'error');
    }
  }

  // Membuat lowongan baru
  async createJobPosting(jobData) {
    try {
      const response = await fetch(`${API_BASE_URL}/job-postings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat lowongan');
      }

      showToast('Lowongan berhasil dibuat!', 'success');
      this.showMyJobPostings(); // Refresh daftar lowongan
    } catch (error) {
      console.error('Error creating job posting:', error);
      showToast(error.message || 'Gagal membuat lowongan', 'error');
    }
  }

  // Memperbarui status lamaran
  async updateApplicationStatus(applicationId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/job-applications/${applicationId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memperbarui status lamaran');
      }

      showToast(`Status lamaran diperbarui menjadi ${status}`, 'success');
      this.showJobApplications(); // Refresh daftar lamaran
    } catch (error) {
      console.error('Error updating application status:', error);
      showToast(error.message || 'Gagal memperbarui status lamaran', 'error');
    }
  }

  // Render tampilan berdasarkan currentView
  render() {
    switch(this.currentView) {
      case 'create-job':
        this.renderCreateJobForm();
        break;
      case 'my-jobs':
        // Ditangani oleh showMyJobPostings()
        break;
      case 'job-applications':
        // Ditangani oleh showJobApplications()
        break;
      default:
        // Dashboard default
        this.renderDashboard();
    }
  }

  renderDashboard() {
    const container = document.getElementById('hrd-dashboard-content');
    if (!container) return;

    container.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white">Dashboard HRD</h2>
        <p class="text-slate-400">Kelola lowongan dan lamaran karyawan Anda.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Total Lowongan</div>
          <div class="text-3xl font-bold text-indigo-400" id="total-job-postings">0</div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Total Lamaran</div>
          <div class="text-3xl font-bold text-emerald-400" id="total-applications">0</div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <div class="text-slate-400 text-sm mb-1">Lamaran Diterima</div>
          <div class="text-3xl font-bold text-amber-400" id="accepted-applications">0</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-6 rounded-2xl">
          <h3 class="text-lg font-bold text-white mb-4">Statistik Perusahaan</h3>
          <div id="company-stats">
            <p class="text-slate-400 text-sm">Statistik perusahaan Anda akan ditampilkan di sini.</p>
          </div>
        </div>
        <div class="glass-card p-6 rounded-2xl">
          <h3 class="text-lg font-bold text-white mb-4">Aktivitas Terbaru</h3>
          <div id="recent-activity">
            <p class="text-slate-400 text-sm">Aktivitas terbaru akan ditampilkan di sini.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderCreateJobForm(container) {
    container.innerHTML = `
      <div class="view-section max-w-3xl mx-auto fade-in">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white">Buat Lowongan Pekerjaan Baru</h2>
          <p class="text-slate-400">Publikasikan lowongan pekerjaan untuk menarik kandidat terbaik.</p>
        </div>

        <div class="glass-card p-6 rounded-2xl">
          <form id="create-job-form">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="text-xs text-slate-400 block mb-1">Judul Pekerjaan *</label>
                <input type="text" id="job-title" required class="w-full input-dark rounded p-2 text-sm" placeholder="Contoh: Software Engineer">
              </div>
              <div>
                <label class="text-xs text-slate-400 block mb-1">Lokasi</label>
                <input type="text" id="job-location" class="w-full input-dark rounded p-2 text-sm" placeholder="Contoh: Jakarta">
              </div>
            </div>

            <div class="mb-6">
              <label class="text-xs text-slate-400 block mb-1">Deskripsi Pekerjaan *</label>
              <textarea id="job-description" rows="5" required class="w-full input-dark rounded p-2 text-sm" placeholder="Deskripsikan pekerjaan dan tanggung jawabnya..."></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="text-xs text-slate-400 block mb-1">Gaji Minimum</label>
                <input type="number" id="salary-min" class="w-full input-dark rounded p-2 text-sm" placeholder="Rp">
              </div>
              <div>
                <label class="text-xs text-slate-400 block mb-1">Gaji Maksimum</label>
                <input type="number" id="salary-max" class="w-full input-dark rounded p-2 text-sm" placeholder="Rp">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label class="text-xs text-slate-400 block mb-1">Tipe Pekerjaan</label>
                <select id="job-type" class="w-full input-dark rounded p-2 text-sm">
                  <option value="">Pilih Tipe</option>
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                  <option value="contract">Kontrak</option>
                  <option value="internship">Magang</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-slate-400 block mb-1">Level Pengalaman</label>
                <select id="experience-level" class="w-full input-dark rounded p-2 text-sm">
                  <option value="">Pilih Level</option>
                  <option value="entry">Pemula (Entry)</option>
                  <option value="mid">Menengah (Mid)</option>
                  <option value="senior">Senior</option>
                  <option value="executive">Eksekutif</option>
                </select>
              </div>
            </div>

            <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all">
              Publikasikan Lowongan
            </button>
          </form>
        </div>
      </div>
    `;

    // Tambahkan event listener untuk form
    document.getElementById('create-job-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitJobForm();
    });
  }

  async submitJobForm() {
    const jobData = {
      title: document.getElementById('job-title').value,
      description: document.getElementById('job-description').value,
      salary_min: document.getElementById('salary-min').value || null,
      salary_max: document.getElementById('salary-max').value || null,
      location: document.getElementById('job-location').value || null,
      job_type: document.getElementById('job-type').value || null,
      experience_level: document.getElementById('experience-level').value || null
    };

    await this.createJobPosting(jobData);
  }

  renderMyJobPostings(jobs) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="view-section max-w-7xl mx-auto fade-in">
        <div class="mb-8 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-white">Lowongan Saya</h2>
            <p class="text-slate-400">Daftar lowongan yang telah Anda publikasikan.</p>
          </div>
          <button onclick="hRDPanel.showCreateJobPosting()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-600/20">
            + Buat Lowongan Baru
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="job-postings-container">
          ${jobs.map(job => `
            <div class="glass-card rounded-xl p-5">
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-white">${job.title}</h4>
                <span class="text-xs px-2 py-1 bg-slate-700 rounded">${job.job_type || 'N/A'}</span>
              </div>
              
              <p class="text-slate-300 text-sm mb-4 line-clamp-2">${job.description || 'Deskripsi tidak tersedia'}</p>
              
              <div class="flex flex-wrap gap-2 mb-4 text-xs">
                <span class="px-2 py-1 bg-slate-700 rounded">${job.location || 'Remote'}</span>
                <span class="px-2 py-1 bg-slate-700 rounded">${job.experience_level || 'Any Level'}</span>
              </div>
              
              ${job.salary_min && job.salary_max ? 
                `<p class="text-emerald-400 font-medium mb-4">Rp ${parseInt(job.salary_min).toLocaleString()} - Rp ${parseInt(job.salary_max).toLocaleString()}/bulan</p>` 
                : ''}
              
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400">${new Date(job.created_at).toLocaleDateString()}</span>
                <span class="text-indigo-400">${job.applicants_count || 0} pelamar</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderJobApplications(applications) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="view-section max-w-7xl mx-auto fade-in">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white">Lamaran Pekerjaan</h2>
          <p class="text-slate-400">Daftar lamaran untuk lowongan yang Anda posting.</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full bg-slate-800/50 rounded-xl overflow-hidden">
            <thead class="bg-slate-700">
              <tr>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Pelamar</th>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Posisi</th>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Tanggal Lamar</th>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Status</th>
                <th class="py-3 px-4 text-left text-sm font-medium text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
              ${applications.length > 0 ? 
                applications.map(app => `
                  <tr>
                    <td class="py-3 px-4 text-sm">
                      <div class="flex items-center gap-2">
                        <img src="${app.applicant_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(app.applicant_name)}" class="w-8 h-8 rounded-full">
                        <span class="text-white">${app.applicant_name}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-white">${app.job_title}</td>
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
                    <td class="py-3 px-4">
                      <div class="flex gap-2">
                        <select onchange="hRDPanel.updateApplicationStatus(${app.id}, this.value)" class="text-xs bg-slate-700 text-slate-200 rounded p-1">
                          <option value="submitted" ${app.status === 'submitted' ? 'selected' : ''}>Submitted</option>
                          <option value="reviewed" ${app.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                          <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                          <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                `).join('') :
                `<tr><td colspan="5" class="py-8 px-4 text-center text-slate-400">Belum ada lamaran untuk lowongan Anda</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

// Inisialisasi objek panel HRD
const hRDPanel = new HRDPanel();