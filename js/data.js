const db = {
    getUsers: () => JSON.parse(localStorage.getItem('lokerin_users')) || [],
    
    getCurrentUser: () => JSON.parse(localStorage.getItem('lokerin_current_user')),
    
    saveUser: (user) => {
        let users = db.getUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if(idx >= 0) users[idx] = user; else users.push(user);
        localStorage.setItem('lokerin_users', JSON.stringify(users));
    },
    
    setCurrentUser: (user) => localStorage.setItem('lokerin_current_user', JSON.stringify(user))
};