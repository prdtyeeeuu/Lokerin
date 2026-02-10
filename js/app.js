const router = {
    navigate: (view) => {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${view}`).classList.remove('hidden');
        
        // Update Nav Styling
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-white', 'bg-slate-700');
            btn.classList.add('text-slate-400');
        });
    }
};

function initApp() {
    const user = db.getCurrentUser();
    if(!user) {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('app-layout').classList.add('hidden');
    } else {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        document.getElementById('dash-username').innerText = user.name;
        
        // Sync data from DB
        const freshUser = db.getUsers().find(u => u.id === user.id);
        db.setCurrentUser(freshUser);
        
        // Set default view
        renderApp(freshUser);
    }
}

document.addEventListener('DOMContentLoaded', initApp);