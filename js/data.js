// Fungsi-fungsi yang sekarang didefinisikan di database.js
// File ini tetap ada untuk kompatibilitas, tetapi sebagian besar fungsionalitas
// sekarang menggunakan API backend yang didefinisikan di api.js dan database.js

// Alias untuk fungsi-fungsi dari database.js
const db = {
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    getUsers: getAllUsers,
    saveUser: saveUser
};

// Fungsi tambahan untuk kompatibilitas
function getUsers() {
    // Kembali ke fungsi getAllUsers dari database.js
    return getAllUsers();
}