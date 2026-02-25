// --- UTILITY FUNCTIONS ---
function calcCompleteness(user) {
    // Handle edge cases where user might be undefined
    if (!user) return 0;

    let score = 0;
    if(user.jobTitle && user.jobTitle !== 'Job Seeker') score += 20;
    if(user.bio && user.bio.length > 5) score += 20;
    if(user.skills && user.skills.length > 0) score += 20;
    if(user.evidences && user.evidences.length > 0) score += 20;
    if(user.avatar && !user.avatar.includes('ui-avatars')) score += 20;
    return Math.min(score, 100); // Ensure score doesn't exceed 100%
}

function getMissingDetails(user) {
    // Handle edge cases where user might be undefined
    if (!user) return [];

    let missing = [];
    if(!user.avatar || user.avatar.includes('ui-avatars')) missing.push("Foto Profil");
    if(!user.jobTitle || user.jobTitle === 'Job Seeker') missing.push("Job Title");
    if(!user.bio || user.bio.length < 5) missing.push("Bio Singkat");
    if(!user.skills || user.skills.length === 0) missing.push("Keahlian (Skills)");
    if(!user.evidences || user.evidences.length === 0) missing.push("Bukti Kerja");
    return missing;
}

// Function to sanitize HTML content to prevent XSS
function sanitizeHTML(html) {
    if (typeof html !== 'string') return html;
    
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

function showToast(msg, type='success') {
    // Prevent duplicate toasts with same message
    const existingToast = Array.from(document.querySelectorAll('.toast')).find(toast =>
        toast.textContent.includes(msg)
    );

    if (existingToast) return;

    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return; // Guard clause if container doesn't exist

    // Sanitize message to prevent XSS
    const sanitizedMsg = sanitizeHTML(msg);
    
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeftColor = type==='error'?'#ef4444':'#10b981';
    t.innerHTML = `<i class="fa-solid ${type==='error'?'fa-circle-xmark':'fa-circle-check'}"></i> <span>${sanitizedMsg}</span>`;

    toastContainer.appendChild(t);

    // Remove toast after 3 seconds
    setTimeout(() => {
        if (t.parentNode) {
            t.remove();
        }
    }, 3000);
}

function openModal(id) { 
    const modal = document.getElementById(id);
    if (!modal) return; // Guard clause if modal doesn't exist
    
    modal.classList.remove('hidden-modal');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Close modal on Escape key press
    document.addEventListener('keydown', handleEscapeKeyPress);
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if (!modal) return; // Guard clause if modal doesn't exist
    
    modal.classList.add('hidden-modal');
    // Re-enable body scroll when modal is closed
    document.body.style.overflow = '';
    
    // Remove event listener when modal is closed
    document.removeEventListener('keydown', handleEscapeKeyPress);
}

// Helper function to handle Escape key press
function handleEscapeKeyPress(e) {
    if (e.key === 'Escape') {
        // Close the most recently opened modal
        const modals = document.querySelectorAll('.modal-overlay:not(.hidden-modal)');
        if (modals.length > 0) {
            const lastModal = modals[modals.length - 1];
            lastModal.classList.add('hidden-modal');
            document.body.style.overflow = '';
        }
    }
}

// --- CORE RENDERING ---
async function renderApp(user) {
    // Handle edge case where user might be undefined
    if (!user) {
        console.warn('renderApp called with no user data, trying localStorage');
        try {
            user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (!user || Object.keys(user).length === 0) {
                console.warn('No user data in localStorage either');
                return;
            }
        } catch (e) {
            console.error('Error getting user from localStorage:', e);
            return;
        }
    }

    console.log('renderApp called with user:', user);

    // Retry mechanism for profile elements (in case view is not yet visible)
    const maxRetries = 3;
    let retryCount = 0;
    let profileElementsFound = false;

    while (retryCount < maxRetries && !profileElementsFound) {
        const nameDisplay = document.getElementById('profile-name-display');
        const avatarDisplay = document.getElementById('profile-avatar-display');

        if (nameDisplay && avatarDisplay) {
            profileElementsFound = true;
            break;
        }

        retryCount++;
        console.log(`Profile elements not found, retry ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!profileElementsFound) {
        console.warn('Profile elements still not found after retries');
        // Continue anyway to update other elements
    }

    // 1. Dashboard Stats
    const score = calcCompleteness(user);
    const missing = getMissingDetails(user);

    const completenessEl = document.getElementById('dash-completeness');
    const progressEl = document.getElementById('dash-progress');
    const missingContainer = document.getElementById('dash-missing-container');
    const missingText = document.getElementById('dash-missing-text');

    if (completenessEl) completenessEl.innerText = score + "%";
    if (progressEl) progressEl.style.width = score + "%";

    if (missingContainer && missingText) {
        if (score < 100) {
            missingContainer.classList.remove('hidden');
            const sanitizedMissing = missing.map(item => sanitizeHTML(item)).join(", ");
            missingText.innerText = "Anda belum melengkapi: " + sanitizedMissing;
        } else {
            missingContainer.classList.add('hidden');
        }
    }

    // 2. Profile Views
    const nameDisplay = document.getElementById('profile-name-display');
    const roleDisplay = document.getElementById('profile-role-display');
    const compDisplay = document.getElementById('profile-company-display');
    const bioDisplay = document.getElementById('profile-bio-display');
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const skillsCont = document.getElementById('profile-skills-display');

    console.log('Profile elements found:', {
        nameDisplay: !!nameDisplay,
        roleDisplay: !!roleDisplay,
        compDisplay: !!compDisplay,
        bioDisplay: !!bioDisplay,
        avatarDisplay: !!avatarDisplay,
        skillsCont: !!skillsCont
    });

    if (nameDisplay) nameDisplay.innerText = user.name || 'User';
    if (roleDisplay) {
        const sanitizedJobTitle = user.jobTitle || 'Role';
        const verifiedBadge = user.isVerified ? '<i class="fa-solid fa-check-circle text-blue-400 ml-1" title="Verified Recruiter"></i>' : '';
        roleDisplay.innerHTML = sanitizedJobTitle + verifiedBadge;
    }

    if (compDisplay) {
        compDisplay.innerText = user.company || '';
        compDisplay.classList.toggle('hidden', !user.company);
    }

    if (bioDisplay) bioDisplay.innerText = user.bio || 'Belum ada bio.';
    if (avatarDisplay) {
        console.log('Setting avatar to:', user.avatar);
        avatarDisplay.src = user.avatar || '';
    }

    if (skillsCont) {
        skillsCont.innerHTML = '';
        if(!user.skills || user.skills.length === 0) {
            skillsCont.innerHTML = '<span class="text-xs text-slate-500 italic">-</span>';
        } else {
            user.skills.forEach(s => {
                if (s && s.trim()) {
                    skillsCont.innerHTML += `<span class="px-2 py-1 bg-slate-700 text-xs text-indigo-300 rounded border border-slate-600">${s.trim()}</span>`;
                }
            });
        }
    }

    // 3. Evidence View
    const grid = document.getElementById('portfolio-grid');
    if (grid) {
        grid.innerHTML = '';
        if (user.evidences && user.evidences.length > 0) {
            user.evidences.forEach(ev => {
                // Sanitize evidence properties to prevent XSS
                const sanitizedTitle = sanitizeHTML(ev.title);
                const sanitizedDesc = sanitizeHTML(ev.desc);
                
                let content = '';
                if(ev.type === 'image') {
                    content = `<img src="${ev.content}" class="w-full h-48 object-cover" loading="lazy">`;
                } else {
                    // For URLs, make sure they are properly formatted
                    const sanitizedContent = sanitizeHTML(ev.content);
                    content = `<div class="w-full h-48 bg-slate-800 flex flex-col items-center justify-center p-4 border-b border-slate-700"><i class="fa-solid fa-globe text-4xl text-indigo-500 mb-2"></i><span class="text-xs text-slate-300 text-center break-all">${sanitizedContent}</span></div>`;
                }
                grid.innerHTML += `<div class="glass-card rounded-xl overflow-hidden group relative"><div class="relative">${content}<button onclick="deleteEvidence(${ev.id})" class="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-trash"></i></button></div><div class="p-4"><h4 class="font-bold text-white text-sm truncate">${sanitizedTitle}</h4><p class="text-xs text-slate-400 line-clamp-2 mt-1">${sanitizedDesc}</p></div></div>`;
            });
        }
    }

    // 4. Notifications
    const notifArea = document.getElementById('notification-area');
    const badge = document.getElementById('notif-badge');
    if(notifArea && badge) {
        if(user.role === 'recruiter') {
            notifArea.classList.add('hidden');
        } else {
            notifArea.classList.remove('hidden');
            if(user.requests && user.requests.length > 0) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    await handleSearch();
    await renderRequests(user);
}

// --- SEARCH & PRIVACY LOGIC ---
let viewingCandidateId = null;

async function handleSearch() {
    const query = document.getElementById('search-input');
    const container = document.getElementById('candidate-list');

    if (!query || !container) return; // Guard clauses

    const searchTerm = query.value.toLowerCase();
    container.innerHTML = '';

    try {
        let candidates = [];
        
        if (searchTerm.trim() === '') {
            // If search is empty, get all candidates
            candidates = await getCandidates();
        } else {
            // Otherwise, search for candidates
            candidates = await searchCandidates(searchTerm);
        }

        if(candidates.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center text-slate-500 py-10">Tidak ada talent ditemukan.</div>`;
            return;
        }

        candidates.forEach(c => {
            // Sanitize candidate data to prevent XSS
            const sanitizedName = sanitizeHTML(c.name);
            const sanitizedJobTitle = sanitizeHTML(c.job_title || c.jobTitle);
            
            container.innerHTML += `<div class="glass-card p-4 rounded-xl cursor-pointer hover:bg-slate-800/80 transition flex gap-4" onclick="openCandidatePreview(${c.id})"><img src="${c.avatar}" class="w-16 h-16 rounded-full object-cover border border-slate-600" loading="lazy"><div class="flex-1"><h4 class="font-bold text-white">${sanitizedName}</h4><p class="text-xs text-indigo-400">${sanitizedJobTitle}</p><div class="mt-2 w-full bg-slate-700 rounded-full h-1"><div class="bg-emerald-500 h-1 rounded-full" style="width: ${calcCompleteness(c)}%"></div></div><span class="text-[10px] text-slate-400">Kelengkapan: ${calcCompleteness(c)}%</span></div><div class="text-slate-500 self-center"><i class="fa-solid fa-chevron-right"></i></div></div>`;
        });
    } catch (error) {
        console.error('Error searching candidates:', error);
        container.innerHTML = `<div class="col-span-full text-center text-slate-500 py-10">Gagal memuat data kandidat.</div>`;
    }
}

async function openCandidatePreview(id) {
    try {
        // Get current user
        const currentUser = await getUserProfile();
        if (!currentUser) return;

        // In the new system, we would fetch the candidate data from the API
        // For now, we'll simulate this by getting all candidates and finding the one with the matching ID
        const candidates = await getCandidates();
        const candidate = candidates.find(u => u.id === id);
        
        if(!candidate) return;
        viewingCandidateId = id;

        const previewAvatar = document.getElementById('preview-avatar');
        const previewName = document.getElementById('preview-name');
        const previewRole = document.getElementById('preview-role');
        const previewBio = document.getElementById('preview-bio');
        const previewSkills = document.getElementById('preview-skills');
        const previewCompleteness = document.getElementById('preview-completeness');

        if (previewAvatar) previewAvatar.src = candidate.avatar;
        if (previewName) previewName.innerText = sanitizeHTML(candidate.name);
        if (previewRole) previewRole.innerText = sanitizeHTML(candidate.job_title || candidate.jobTitle);
        if (previewBio) previewBio.innerText = "Bio disembunyikan.";
        if (previewSkills) previewSkills.innerHTML = "";
        if (previewCompleteness) previewCompleteness.style.width = calcCompleteness(candidate) + "%";

        // Check access status
        const hasAccess = candidate.access_list?.includes(currentUser.id) || false;
        const isPending = candidate.requests?.includes(currentUser.id) || false;

        const fullSection = document.getElementById('full-profile-section');
        const restrictedSection = document.getElementById('restricted-section');
        const btnRequest = document.getElementById('btn-request-access');
        const pendingMsg = document.getElementById('pending-msg');

        if(hasAccess) {
            if (fullSection) fullSection.classList.remove('hidden');
            if (restrictedSection) restrictedSection.classList.add('hidden');
            if (previewBio) previewBio.innerText = sanitizeHTML(candidate.bio || 'Bio tidak tersedia');

            if (previewSkills && candidate.skills) {
                const skillsArray = Array.isArray(candidate.skills) ? candidate.skills : candidate.skills.split(',');
                skillsArray.forEach(s => {
                    if (s && s.trim()) {
                        // Sanitize skill name to prevent XSS
                        const sanitizedSkill = sanitizeHTML(s.trim());
                        previewSkills.innerHTML += `<span class="px-2 py-1 bg-slate-700 text-xs rounded">${sanitizedSkill}</span>`;
                    }
                });
            }

            const evContainer = document.getElementById('preview-evidences');
            if (evContainer) {
                evContainer.innerHTML = '';
                if (candidate.evidences) {
                    candidate.evidences.forEach(ev => {
                        // Sanitize evidence properties to prevent XSS
                        const sanitizedTitle = sanitizeHTML(ev.title);
                        const sanitizedDesc = sanitizeHTML(ev.desc);
                        
                        let content = '';
                        if(ev.type === 'image') {
                            content = `<img src="${ev.content}" class="w-full h-32 object-cover rounded" loading="lazy">`;
                        } else {
                            // Sanitize URL to prevent XSS
                            const sanitizedUrl = sanitizeHTML(ev.content);
                            content = `<a href="${ev.content}" target="_blank" class="text-indigo-400 text-xs break-all hover:underline"><i class="fa-solid fa-link mr-1"></i>${sanitizedUrl}</a>`;
                        }
                        evContainer.innerHTML += `<div class="bg-slate-800 p-3 rounded border border-slate-700"><h5 class="font-bold text-white text-sm">${sanitizedTitle}</h5><p class="text-xs text-slate-400 mb-2">${sanitizedDesc}</p>${content}</div>`;
                    });
                }
            }

        } else {
            if (fullSection) fullSection.classList.add('hidden');
            if (restrictedSection) restrictedSection.classList.remove('hidden');
            if (btnRequest && pendingMsg) {
                if(isPending) {
                    btnRequest.classList.add('hidden');
                    pendingMsg.classList.remove('hidden');
                } else {
                    btnRequest.classList.remove('hidden');
                    pendingMsg.classList.add('hidden');
                }
            }
        }

        openModal('modal-profile-preview');
    } catch (error) {
        console.error('Error opening candidate preview:', error);
        showToast("Gagal membuka pratinjau kandidat", "error");
    }
}

async function requestAccess() {
    if(!viewingCandidateId) return;
    
    try {
        // Get current user
        const currentUser = await getUserProfile();
        if (!currentUser) return;

        // In a real implementation, this would be an API call to request access
        // For now, we'll simulate the action
        
        // Check if request already exists
        if(currentUser.requests.includes(viewingCandidateId)) {
            showToast("Permintaan akses sudah dikirim sebelumnya", "error");
            return;
        }

        // Add the request to the current user's requests
        currentUser.requests.push(viewingCandidateId);
        
        // Save the updated user data
        await saveUser(currentUser);
        
        showToast("Permintaan akses dikirim!");
        
        // Re-open the preview to reflect the updated status
        await openCandidatePreview(viewingCandidateId);
    } catch (error) {
        console.error('Error requesting access:', error);
        showToast("Gagal mengirim permintaan akses", "error");
    }
}

// --- REQUESTS HANDLING ---
async function renderRequests(user) {
    if (!user) return;

    const list = document.getElementById('requests-list');
    if (!list) return;

    list.innerHTML = '';
    
    if(!user.requests || user.requests.length === 0) {
        list.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">Tidak ada permintaan akses baru.</p>';
        return;
    }

    // In the new system, we might need to fetch recruiter details separately
    // For now, we'll use the data that's already available in the requests array
    for (const reqId of user.requests) {
        try {
            // Assuming reqId contains the recruiter's ID
            // In a real implementation, you might need to fetch recruiter details
            // from the API using reqId
            
            // For now, we'll simulate having recruiter data
            // In a real implementation, fetch this from API
            const recruiter = { 
                id: reqId, 
                name: `Recruiter ${reqId}`, 
                avatar: "https://ui-avatars.com/api/?name=Recruiter", 
                company: "Company Name",
                isVerified: false
            };
            
            if(recruiter) {
                // Sanitize recruiter data to prevent XSS
                const sanitizedName = sanitizeHTML(recruiter.name);
                const sanitizedCompany = sanitizeHTML(recruiter.company || 'Company');
                const verifiedBadge = recruiter.isVerified ? '<span class="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded border border-blue-500/30">Verified</span>' : '';
                
                list.innerHTML += `<div class="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700"><div class="flex items-center gap-3"><img src="${recruiter.avatar}" class="w-10 h-10 rounded-full" loading="lazy"><div><div class="text-sm font-bold text-white">${sanitizedName}</div><div class="text-xs text-indigo-400">${sanitizedCompany}</div>${verifiedBadge}</div></div><div class="flex gap-2"><button onclick="handleRequest(${recruiter.id}, true)" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded">Terima</button><button onclick="handleRequest(${recruiter.id}, false)" class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded">Tolak</button></div></div>`;
            }
        } catch (error) {
            console.error('Error rendering request:', error);
        }
    }
}

async function handleRequest(recruiterId, approved) {
    try {
        // In a real implementation, this would be an API call to handle the request
        // For now, we'll simulate the action
        
        // Get the current user data
        const currentUser = await getUserProfile();
        if (!currentUser) return;

        // Update the requests array to remove the handled request
        const filteredRequests = currentUser.requests.filter(id => id !== recruiterId);
        currentUser.requests = filteredRequests;
        
        // If approved, add to access list
        if(approved) {
            if(!currentUser.accessList.includes(recruiterId)) {
                currentUser.accessList.push(recruiterId);
            }
            showToast("Akses diberikan ke Recruiter");
        } else {
            showToast("Akses ditolak", "error");
        }
        
        // Save the updated user data
        await saveUser(currentUser);
        
        // Re-render the UI
        await renderRequests(currentUser);
        await renderApp(currentUser);
    } catch (error) {
        console.error('Error handling request:', error);
        showToast("Gagal memproses permintaan", "error");
    }
}

// --- EVIDENCE HANDLING ---
function toggleEvidenceInput() {
    const type = document.getElementById('ev-type');
    if (!type) return;

    const imageGroup = document.getElementById('input-image-group');
    const linkGroup = document.getElementById('input-link-group');

    if (!imageGroup || !linkGroup) return;

    if(type.value === 'image') {
        imageGroup.classList.remove('hidden');
        linkGroup.classList.add('hidden');
    } else {
        imageGroup.classList.add('hidden');
        linkGroup.classList.remove('hidden');
    }
}

async function addEvidence(e) {
    e.preventDefault();
    
    try {
        // Get current user
        const user = await getUserProfile();
        if (!user) return;

        const type = document.getElementById('ev-type');
        const title = document.getElementById('ev-title');
        const desc = document.getElementById('ev-desc');

        if (!type || !title || !desc) return;

        const typeValue = type.value;
        const titleValue = title.value;
        const descValue = desc.value;

        // Validate inputs
        if (!titleValue.trim()) {
            showToast("Judul project harus diisi", "error");
            return;
        }
        if (!descValue.trim()) {
            showToast("Deskripsi harus diisi", "error");
            return;
        }

        // Show loading indicator
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan...';
        submitBtn.disabled = true;

        const saveEvidence = async (content) => {
            // Prepare evidence data
            const evidenceData = {
                id: Date.now(),
                type: typeValue,
                title: sanitizeHTML(titleValue),
                desc: sanitizeHTML(descValue),
                content
            };

            // In a real implementation, this would be an API call to add evidence
            // For now, we'll simulate by updating the user's evidence array
            if (!user.evidences) user.evidences = [];
            user.evidences.unshift(evidenceData);

            try {
                // Save the updated user data
                await saveUser(user);
                
                // Re-render the app with updated data
                await renderApp(user);
                closeModal('modal-add-evidence');
                showToast("Project ditambahkan");

                // Reset form
                const form = e.target;
                if (form) {
                    form.reset();
                    toggleEvidenceInput(); // Reset the evidence input visibility
                }
            } catch (error) {
                showToast("Gagal menyimpan project", "error");
            }
        };

        if(typeValue === 'image') {
            const fileInput = document.getElementById('ev-img');
            if (!fileInput) return;

            const file = fileInput.files[0];
            if(file) {
                // Validate file type
                if (!file.type.match('image.*')) {
                    showToast("Silakan pilih file gambar", "error");
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showToast("Ukuran file terlalu besar (maks 5MB)", "error");
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (e) => {
                    await saveEvidence(e.target.result);
                    // Restore button
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                };
                reader.onerror = () => {
                    showToast("Gagal membaca file", "error");
                    // Restore button
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                };
                reader.readAsDataURL(file);
            } else {
                showToast("Silakan pilih file gambar", "error");
                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } else {
            const urlInput = document.getElementById('ev-url');
            if (!urlInput) return;

            const url = urlInput.value;
            if (!url.trim()) {
                showToast("Silakan masukkan URL yang valid", "error");
                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Basic URL validation
            try {
                new URL(url);
                await saveEvidence(url);
                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            } catch (err) {
                showToast("Format URL tidak valid", "error");
                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    } catch (error) {
        console.error('Error adding evidence:', error);
        showToast("Gagal menambahkan project", "error");
    }
}

async function deleteEvidence(id) {
    if(!confirm("Hapus project ini?")) return;
    
    try {
        // Get current user
        const user = await getUserProfile();
        if (!user) return;

        if (user.evidences) {
            // Filter out the evidence with the specified id
            user.evidences = user.evidences.filter(e => e.id !== id);
            
            // Save the updated user data
            await saveUser(user);
            
            // Re-render the app with updated data
            await renderApp(user);
            showToast("Project dihapus", "error");
        }
    } catch (error) {
        console.error('Error deleting evidence:', error);
        showToast("Gagal menghapus project", "error");
    }
}

// --- PROFILE EDIT HANDLING ---
async function saveProfile(e) {
    e.preventDefault();
    const user = await getUserProfile();
    if (!user) return;

    const jobInput = document.getElementById('edit-job');
    const companyInput = document.getElementById('edit-company');
    const bioInput = document.getElementById('edit-bio');
    const skillsInput = document.getElementById('edit-skills');

    if (!jobInput || !companyInput || !bioInput || !skillsInput) return;

    // Sanitize inputs to prevent XSS
    const jobTitle = sanitizeHTML(jobInput.value);
    const company = sanitizeHTML(companyInput.value);
    const bio = sanitizeHTML(bioInput.value);
    const skills = skillsInput.value.split(',').map(s => sanitizeHTML(s.trim())).filter(s => s);

    // Show loading indicator
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan...';
    submitBtn.disabled = true;

    try {
        // Update user profile via API
        await updateUserProfile({
            jobTitle,
            company,
            bio,
            skills
        });

        // Refresh user data
        const updatedUser = await getUserProfile();
        
        // Re-render app with updated data
        await renderApp(updatedUser);
        closeModal('modal-edit-profile');
        showToast("Profil diperbarui!");
    } catch (error) {
        showToast("Gagal menyimpan profil: " + error.message, "error");
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleAvatarUpload(input) {
    if(!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showToast("Silakan pilih file gambar", "error");
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast("Ukuran file terlalu besar (maks 5MB)", "error");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            // Get current user
            const user = await getUserProfile();
            if (!user) return;
            
            // Update avatar
            user.avatar = e.target.result;
            
            // Save user data
            await saveUser(user);
            
            // Re-render app with updated data
            await renderApp(user);
            showToast("Avatar diubah!");
        } catch (error) {
            console.error('Error updating avatar:', error);
            showToast("Gagal mengubah avatar", "error");
        }
    };
    reader.onerror = () => showToast("Gagal membaca file gambar", "error");
    reader.readAsDataURL(file);
}

// Export functions to global scope
window.openModal = openModal;
window.closeModal = closeModal;
window.handleAvatarUpload = handleAvatarUpload;
window.showToast = showToast;
window.renderApp = renderApp;
window.calcCompleteness = calcCompleteness;