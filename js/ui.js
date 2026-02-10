// --- UTILITY FUNCTIONS ---
function calcCompleteness(user) {
    let score = 0;
    if(user.jobTitle && user.jobTitle !== 'Job Seeker') score += 20;
    if(user.bio && user.bio.length > 5) score += 20;
    if(user.skills && user.skills.length > 0) score += 20;
    if(user.evidences && user.evidences.length > 0) score += 20;
    if(user.avatar && !user.avatar.includes('ui-avatars')) score += 20;
    return score;
}

function getMissingDetails(user) {
    let missing = [];
    if(!user.avatar || user.avatar.includes('ui-avatars')) missing.push("Foto Profil");
    if(!user.jobTitle || user.jobTitle === 'Job Seeker') missing.push("Job Title");
    if(!user.bio || user.bio.length < 5) missing.push("Bio Singkat");
    if(!user.skills || user.skills.length === 0) missing.push("Keahlian (Skills)");
    if(!user.evidences || user.evidences.length === 0) missing.push("Bukti Kerja");
    return missing;
}

function showToast(msg, type='success') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeftColor = type==='error'?'#ef4444':'#10b981';
    t.innerHTML = `<i class="fa-solid ${type==='error'?'fa-circle-xmark':'fa-circle-check'}"></i> <span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(()=>t.remove(),3000);
}

function openModal(id) { document.getElementById(id).classList.remove('hidden-modal'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden-modal'); }

// --- CORE RENDERING ---
function renderApp(user) {
    // 1. Dashboard Stats
    const score = calcCompleteness(user);
    const missing = getMissingDetails(user);

    document.getElementById('dash-completeness').innerText = score + "%";
    document.getElementById('dash-progress').style.width = score + "%";

    const missingContainer = document.getElementById('dash-missing-container');
    const missingText = document.getElementById('dash-missing-text');

    if (score < 100) {
        missingContainer.classList.remove('hidden');
        missingText.innerText = "Anda belum melengkapi: " + missing.join(", ");
    } else {
        missingContainer.classList.add('hidden');
    }

    // 2. Profile Views
    document.getElementById('profile-name-display').innerText = user.name;
    document.getElementById('profile-role-display').innerHTML = user.jobTitle + (user.isVerified ? '<i class="fa-solid fa-check-circle text-blue-400 ml-1" title="Verified Recruiter"></i>' : '');
    
    const compDisplay = document.getElementById('profile-company-display');
    compDisplay.innerText = user.company || '';
    compDisplay.classList.toggle('hidden', !user.company);
    
    document.getElementById('profile-bio-display').innerText = user.bio || 'Belum ada bio.';
    document.getElementById('profile-avatar-display').src = user.avatar;
    
    const skillsCont = document.getElementById('profile-skills-display');
    skillsCont.innerHTML = '';
    if(!user.skills || user.skills.length === 0) skillsCont.innerHTML = '<span class="text-xs text-slate-500 italic">-</span>';
    else user.skills.forEach(s => {
        skillsCont.innerHTML += `<span class="px-2 py-1 bg-slate-700 text-xs text-indigo-300 rounded border border-slate-600">${s}</span>`;
    });

    // 3. Evidence View
    const grid = document.getElementById('portfolio-grid');
    grid.innerHTML = '';
    user.evidences.forEach(ev => {
        let content = '';
        if(ev.type === 'image') {
            content = `<img src="${ev.content}" class="w-full h-48 object-cover">`;
        } else {
            content = `<div class="w-full h-48 bg-slate-800 flex flex-col items-center justify-center p-4 border-b border-slate-700"><i class="fa-solid fa-globe text-4xl text-indigo-500 mb-2"></i><span class="text-xs text-slate-300 text-center break-all">${ev.content}</span></div>`;
        }
        grid.innerHTML += `<div class="glass-card rounded-xl overflow-hidden group relative">${content}<div class="p-4"><h4 class="font-bold text-white text-sm truncate">${ev.title}</h4><p class="text-xs text-slate-400 line-clamp-2 mt-1">${ev.desc}</p></div><button onclick="deleteEvidence(${ev.id})" class="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-trash"></i></button></div>`;
    });

    // 4. Notifications
    const notifArea = document.getElementById('notification-area');
    const badge = document.getElementById('notif-badge');
    if(user.role === 'recruiter') {
        notifArea.classList.add('hidden');
    } else {
        notifArea.classList.remove('hidden');
        if(user.requests.length > 0) badge.classList.remove('hidden');
        else badge.classList.add('hidden');
    }

    handleSearch();
    renderRequests(user);
}

// --- SEARCH & PRIVACY LOGIC ---
let viewingCandidateId = null;

function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const currentUser = db.getCurrentUser();
    const users = db.getUsers();
    const container = document.getElementById('candidate-list');
    container.innerHTML = '';

    const candidates = users.filter(u => u.role === 'candidate' && u.id !== currentUser.id && 
        (u.name.toLowerCase().includes(query) || u.jobTitle.toLowerCase().includes(query) || (u.skills && u.skills.some(s => s.toLowerCase().includes(query)))));

    if(candidates.length === 0) {
        container.innerHTML = `<div class="col-span-3 text-center text-slate-500 py-10">Tidak ada talent ditemukan.</div>`;
        return;
    }

    candidates.forEach(c => {
        container.innerHTML += `<div class="glass-card p-4 rounded-xl cursor-pointer hover:bg-slate-800/80 transition flex gap-4" onclick="openCandidatePreview(${c.id})"><img src="${c.avatar}" class="w-16 h-16 rounded-full object-cover border border-slate-600"><div class="flex-1"><h4 class="font-bold text-white">${c.name}</h4><p class="text-xs text-indigo-400">${c.jobTitle}</p><div class="mt-2 w-full bg-slate-700 rounded-full h-1"><div class="bg-emerald-500 h-1 rounded-full" style="width: ${calcCompleteness(c)}%"></div></div><span class="text-[10px] text-slate-400">Kelengkapan: ${calcCompleteness(c)}%</span></div><div class="text-slate-500 self-center"><i class="fa-solid fa-chevron-right"></i></div></div>`;
    });
}

function openCandidatePreview(id) {
    const currentUser = db.getCurrentUser();
    const candidate = db.getUsers().find(u => u.id === id);
    if(!candidate) return;
    viewingCandidateId = id;

    document.getElementById('preview-avatar').src = candidate.avatar;
    document.getElementById('preview-name').innerText = candidate.name;
    document.getElementById('preview-role').innerText = candidate.jobTitle;
    
    document.getElementById('preview-bio').innerText = "Bio disembunyikan.";
    document.getElementById('preview-skills').innerHTML = "";
    document.getElementById('preview-completeness').style.width = calcCompleteness(candidate) + "%";

    const hasAccess = candidate.accessList.includes(currentUser.id);
    const isPending = candidate.requests.includes(currentUser.id);

    const fullSection = document.getElementById('full-profile-section');
    const restrictedSection = document.getElementById('restricted-section');
    const btnRequest = document.getElementById('btn-request-access');
    const pendingMsg = document.getElementById('pending-msg');

    if(hasAccess) {
        fullSection.classList.remove('hidden');
        restrictedSection.classList.add('hidden');
        document.getElementById('preview-bio').innerText = candidate.bio;
        candidate.skills.forEach(s => {
            document.getElementById('preview-skills').innerHTML += `<span class="px-2 py-1 bg-slate-700 text-xs rounded">${s}</span>`;
        });
        
        const evContainer = document.getElementById('preview-evidences');
        evContainer.innerHTML = '';
        candidate.evidences.forEach(ev => {
            let content = '';
            if(ev.type === 'image') {
                content = `<img src="${ev.content}" class="w-full h-32 object-cover rounded">`;
            } else {
                content = `<a href="${ev.content}" target="_blank" class="text-indigo-400 text-xs break-all hover:underline"><i class="fa-solid fa-link mr-1"></i>${ev.content}</a>`;
            }
            evContainer.innerHTML += `<div class="bg-slate-800 p-3 rounded border border-slate-700"><h5 class="font-bold text-white text-sm">${ev.title}</h5><p class="text-xs text-slate-400 mb-2">${ev.desc}</p>${content}</div>`;
        });

    } else {
        fullSection.classList.add('hidden');
        restrictedSection.classList.remove('hidden');
        if(isPending) {
            btnRequest.classList.add('hidden');
            pendingMsg.classList.remove('hidden');
        } else {
            btnRequest.classList.remove('hidden');
            pendingMsg.classList.add('hidden');
        }
    }

    openModal('modal-profile-preview');
}

function requestAccess() {
    if(!viewingCandidateId) return;
    const currentUser = db.getCurrentUser();
    const candidates = db.getUsers();
    const idx = candidates.findIndex(u => u.id === viewingCandidateId);
    
    if(!candidates[idx].requests.includes(currentUser.id)) {
        candidates[idx].requests.push(currentUser.id);
        db.saveUser(candidates[idx]);
        showToast("Permintaan akses dikirim!");
        openCandidatePreview(viewingCandidateId); 
    }
}

// --- REQUESTS HANDLING ---
function renderRequests(user) {
    const list = document.getElementById('requests-list');
    list.innerHTML = '';
    if(user.requests.length === 0) {
        list.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">Tidak ada permintaan akses baru.</p>';
        return;
    }
    const allUsers = db.getUsers();
    user.requests.forEach(reqId => {
        const recruiter = allUsers.find(u => u.id === reqId);
        if(recruiter) {
            list.innerHTML += `<div class="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700"><div class="flex items-center gap-3"><img src="${recruiter.avatar}" class="w-10 h-10 rounded-full"><div><div class="text-sm font-bold text-white">${recruiter.name}</div><div class="text-xs text-indigo-400">${recruiter.company || 'Company'}</div>${recruiter.isVerified ? '<span class="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded border border-blue-500/30">Verified</span>' : ''}</div></div><div class="flex gap-2"><button onclick="handleRequest(${recruiter.id}, true)" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded">Terima</button><button onclick="handleRequest(${recruiter.id}, false)" class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded">Tolak</button></div></div>`;
        }
    });
}

function handleRequest(recruiterId, approved) {
    const currentUser = db.getCurrentUser();
    currentUser.requests = currentUser.requests.filter(id => id !== recruiterId);
    if(approved) {
        if(!currentUser.accessList.includes(recruiterId)) currentUser.accessList.push(recruiterId);
        showToast("Akses diberikan ke Recruiter");
    } else {
        showToast("Akses ditolak", "error");
    }
    db.saveUser(currentUser);
    db.setCurrentUser(currentUser);
    renderRequests(currentUser);
    renderApp(currentUser);
}

// --- EVIDENCE HANDLING ---
function toggleEvidenceInput() {
    const type = document.getElementById('ev-type').value;
    if(type === 'image') {
        document.getElementById('input-image-group').classList.remove('hidden');
        document.getElementById('input-link-group').classList.add('hidden');
    } else {
        document.getElementById('input-image-group').classList.add('hidden');
        document.getElementById('input-link-group').classList.remove('hidden');
    }
}

function addEvidence(e) {
    e.preventDefault();
    const user = db.getCurrentUser();
    const type = document.getElementById('ev-type').value;
    const title = document.getElementById('ev-title').value;
    const desc = document.getElementById('ev-desc').value;
    
    const saveEvidence = (content) => {
        user.evidences.unshift({ id: Date.now(), type, title, desc, content });
        db.saveUser(user);
        db.setCurrentUser(user);
        renderApp(user);
        closeModal('modal-add-evidence');
        showToast("Project ditambahkan");
        e.target.reset();
        toggleEvidenceInput();
    };

    if(type === 'image') {
        const file = document.getElementById('ev-img').files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (e) => saveEvidence(e.target.result);
            reader.readAsDataURL(file);
        }
    } else {
        const url = document.getElementById('ev-url').value;
        saveEvidence(url);
    }
}

function deleteEvidence(id) {
    if(!confirm("Hapus project ini?")) return;
    const user = db.getCurrentUser();
    user.evidences = user.evidences.filter(e => e.id !== id);
    db.saveUser(user);
    db.setCurrentUser(user);
    renderApp(user);
    showToast("Project dihapus", "error");
}

// --- PROFILE EDIT HANDLING ---
function saveProfile(e) {
    e.preventDefault();
    const user = db.getCurrentUser();
    user.jobTitle = document.getElementById('edit-job').value;
    user.company = document.getElementById('edit-company').value;
    user.bio = document.getElementById('edit-bio').value;
    user.skills = document.getElementById('edit-skills').value.split(',').filter(s => s.trim());
    db.saveUser(user);
    db.setCurrentUser(user);
    renderApp(user);
    closeModal('modal-edit-profile');
    showToast("Profil diperbarui!");
}

function handleAvatarUpload(input) {
    if(input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const user = db.getCurrentUser();
            user.avatar = e.target.result;
            db.saveUser(user);
            db.setCurrentUser(user);
            renderApp(user);
            showToast("Avatar diubah!");
        }
        reader.readAsDataURL(input.files[0]);
    }
}