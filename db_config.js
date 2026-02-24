const mysql = require('mysql2');

// Konfigurasi koneksi database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lokerin_db'
});

// Membuat koneksi
connection.connect((err) => {
  if (err) {
    console.error('Kesalahan koneksi ke database:', err);
    return;
  }
  console.log('Terhubung ke database MySQL');
});

module.exports = connection;