require('dotenv').config();
const mysql = require('mysql2');

// Konfigurasi koneksi database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lokerin_db'
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