const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Manual .env loading
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 8889,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'locker_db'
};

async function migrateAdminFeatures() {
  let conn;
  try {
    console.log('🔄 Memulai migrasi database untuk fitur admin baru...');
    conn = await mysql.createConnection(dbConfig);

    // 1. Add status column to users if it doesn't exist
    console.log('⏳ Mengecek kolom status di tabel users...');
    try {
      await conn.query("ALTER TABLE users ADD COLUMN status ENUM('active', 'suspended') DEFAULT 'active'");
      console.log('✅ Kolom status berhasil ditambahkan ke tabel users.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⏩ Kolom status sudah ada di tabel users, diabaikan.');
      } else {
        throw err;
      }
    }

    // 2. Add status column to jobs if it doesn't exist
    console.log('⏳ Mengecek kolom status di tabel jobs...');
    try {
      await conn.query("ALTER TABLE jobs ADD COLUMN status ENUM('active', 'suspended') DEFAULT 'active'");
      console.log('✅ Kolom status berhasil ditambahkan ke tabel jobs.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⏩ Kolom status sudah ada di tabel jobs, diabaikan.');
      } else {
        throw err;
      }
    }

    // 3. Create warnings table
    console.log('⏳ Membuat tabel warnings...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS warnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Tabel warnings berhasil dibuat.');

    // 4. Create official admin warning table
    console.log('⏳ Membuat tabel user_warnings...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_warnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        admin_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_warnings_user_read (user_id, is_read, created_at),
        INDEX idx_user_warnings_admin (admin_id),
        CONSTRAINT fk_user_warnings_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_user_warnings_admin
          FOREIGN KEY (admin_id) REFERENCES users(id)
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabel user_warnings berhasil dibuat.');

    console.log('🎉 Migrasi selesai!');
  } catch (err) {
    console.error('❌ Error:', err.message, err.code);
  } finally {
    if (conn && conn.state !== 'disconnected') {
      try { await conn.end(); } catch (e) {}
    }
  }
}

migrateAdminFeatures();
