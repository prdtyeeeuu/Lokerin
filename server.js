require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory

// Konfigurasi koneksi database
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lokerin_db'
});

// Membuat koneksi
db.connect((err) => {
  if (err) {
    console.error('Kesalahan koneksi ke database:', err);
    return;
  }
  console.log('Terhubung ke database MySQL');
});

// Membuat tabel pengguna jika belum ada
const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'recruiter') DEFAULT 'candidate',
    avatar TEXT,
    job_title VARCHAR(255),
    company VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    skills TEXT,
    evidences JSON,
    access_list JSON,
    requests JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

db.query(createUserTableQuery, (err, result) => {
  if (err) {
    console.error('Kesalahan membuat tabel users:', err);
  } else {
    console.log('Tabel users siap digunakan');
  }
});

// Endpoint untuk registrasi
app.post('/api/register', async (req, res) => {
  const { name, email, password, role, company } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Avatar default
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

    // Job title default
    const jobTitle = role === 'candidate' ? 'Job Seeker' : 'HRD';

    // Query untuk menyimpan pengguna baru
    const insertUserQuery = `
      INSERT INTO users (name, email, password, role, company, avatar, job_title)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertUserQuery,
      [name, email, hashedPassword, role, company || null, avatar, jobTitle],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
          }
          console.error('Kesalahan menyimpan pengguna:', err);
          return res.status(500).json({ message: 'Kesalahan server' });
        }

        res.status(201).json({ message: 'Registrasi berhasil' });
      }
    );
  } catch (error) {
    console.error('Kesalahan registrasi:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// Endpoint untuk login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Query untuk mendapatkan pengguna berdasarkan email
  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  
  db.query(getUserQuery, [email], async (err, results) => {
    if (err) {
      console.error('Kesalahan mengambil pengguna:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const user = results[0];

    try {
      // Bandingkan password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Email atau password salah' });
      }

      // Buat token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '24h' }
      );

      // Kirim respons dengan token dan data pengguna
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          jobTitle: user.job_title,
          company: user.company,
          isVerified: user.is_verified,
          bio: user.bio,
          skills: user.skills ? JSON.parse(user.skills) : [],
          evidences: user.evidences ? JSON.parse(user.evidences) : [],
          accessList: user.access_list ? JSON.parse(user.access_list) : [],
          requests: user.requests ? JSON.parse(user.requests) : []
        }
      });
    } catch (error) {
      console.error('Kesalahan membandingkan password:', error);
      res.status(500).json({ message: 'Kesalahan server' });
    }
  });
});

// Endpoint untuk mendapatkan profil pengguna
app.get('/api/profile', authenticateToken, (req, res) => {
  const getUserQuery = 'SELECT * FROM users WHERE id = ?';
  
  db.query(getUserQuery, [req.user.id], (err, results) => {
    if (err) {
      console.error('Kesalahan mengambil profil:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const user = results[0];
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      jobTitle: user.job_title,
      company: user.company,
      isVerified: user.is_verified,
      bio: user.bio,
      skills: user.skills ? JSON.parse(user.skills) : [],
      evidences: user.evidences ? JSON.parse(user.evidences) : [],
      accessList: user.access_list ? JSON.parse(user.access_list) : [],
      requests: user.requests ? JSON.parse(user.requests) : []
    });
  });
});

// Endpoint untuk memperbarui profil
app.put('/api/profile', authenticateToken, (req, res) => {
  const { jobTitle, company, bio, skills } = req.body;
  
  const updateUserQuery = `
    UPDATE users 
    SET job_title = ?, company = ?, bio = ?, skills = ?
    WHERE id = ?
  `;
  
  db.query(
    updateUserQuery,
    [jobTitle, company, bio, JSON.stringify(skills), req.user.id],
    (err, result) => {
      if (err) {
        console.error('Kesalahan memperbarui profil:', err);
        return res.status(500).json({ message: 'Kesalahan server' });
      }
      
      res.json({ message: 'Profil berhasil diperbarui' });
    }
  );
});

// Middleware untuk otentikasi token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key', (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Endpoint untuk mendapatkan semua kandidat
app.get('/api/candidates', (req, res) => {
  const getCandidatesQuery = 'SELECT id, name, avatar, job_title, skills FROM users WHERE role = "candidate"';
  
  db.query(getCandidatesQuery, (err, results) => {
    if (err) {
      console.error('Kesalahan mengambil kandidat:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }
    
    // Parse skills untuk setiap kandidat
    const candidates = results.map(candidate => ({
      ...candidate,
      skills: candidate.skills ? JSON.parse(candidate.skills) : []
    }));
    
    res.json(candidates);
  });
});

// Endpoint untuk pencarian kandidat
app.get('/api/search-candidates', (req, res) => {
  const { query } = req.query;
  
  const searchQuery = `
    SELECT id, name, avatar, job_title, skills 
    FROM users 
    WHERE role = 'candidate' 
    AND (name LIKE ? OR job_title LIKE ? OR skills LIKE ?)
  `;
  
  const searchTerm = `%${query}%`;
  
  db.query(searchQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error('Kesalahan mencari kandidat:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }
    
    // Parse skills untuk setiap kandidat
    const candidates = results.map(candidate => ({
      ...candidate,
      skills: candidate.skills ? JSON.parse(candidate.skills) : []
    }));
    
    res.json(candidates);
  });
});

// Endpoint untuk membuat lowongan pekerjaan (khusus HRD)
app.post('/api/job-postings', authenticateToken, (req, res) => {
  const { title, description, salary_min, salary_max, location, job_type, experience_level } = req.body;
  const userId = req.user.id;

  // Cek apakah pengguna adalah HRD
  const checkRoleQuery = 'SELECT role, company FROM users WHERE id = ?';
  
  db.query(checkRoleQuery, [userId], (err, results) => {
    if (err) {
      console.error('Kesalahan memeriksa role pengguna:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }

    if (results.length === 0 || results[0].role !== 'recruiter') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya HRD yang dapat membuat lowongan.' });
    }

    const company = results[0].company;
    
    // Insert lowongan pekerjaan
    const insertJobQuery = `
      INSERT INTO job_postings (title, description, company_id, posted_by, salary_min, salary_max, location, job_type, experience_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(insertJobQuery, [title, description, userId, userId, salary_min, salary_max, location, job_type, experience_level], (err, result) => {
      if (err) {
        console.error('Kesalahan membuat lowongan:', err);
        return res.status(500).json({ message: 'Kesalahan server' });
      }

      res.status(201).json({ message: 'Lowongan berhasil dibuat', jobId: result.insertId });
    });
  });
});

// Endpoint untuk mendapatkan semua lowongan (untuk user)
app.get('/api/job-postings', authenticateToken, (req, res) => {
  const getJobsQuery = `
    SELECT jp.*, u.name as company_name, u.avatar as company_avatar
    FROM job_postings jp
    JOIN users u ON jp.company_id = u.id
    ORDER BY jp.created_at DESC
  `;
  
  db.query(getJobsQuery, (err, results) => {
    if (err) {
      console.error('Kesalahan mengambil lowongan:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }
    
    res.json(results);
  });
});

// Endpoint untuk melamar pekerjaan
app.post('/api/job-applications', authenticateToken, (req, res) => {
  const { job_id, cover_letter } = req.body;
  const applicant_id = req.user.id;

  // Cek apakah pengguna adalah kandidat
  const checkRoleQuery = 'SELECT role FROM users WHERE id = ?';
  
  db.query(checkRoleQuery, [applicant_id], (err, results) => {
    if (err) {
      console.error('Kesalahan memeriksa role pengguna:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }

    if (results.length === 0 || results[0].role !== 'candidate') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya kandidat yang dapat melamar.' });
    }

    // Cek apakah sudah melamar
    const checkApplicationQuery = 'SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?';
    
    db.query(checkApplicationQuery, [job_id, applicant_id], (err, results) => {
      if (err) {
        console.error('Kesalahan memeriksa lamaran:', err);
        return res.status(500).json({ message: 'Kesalahan server' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Anda sudah melamar pekerjaan ini.' });
      }

      // Insert lamaran
      const insertApplicationQuery = `
        INSERT INTO job_applications (job_id, applicant_id, cover_letter)
        VALUES (?, ?, ?)
      `;
      
      db.query(insertApplicationQuery, [job_id, applicant_id, cover_letter], (err, result) => {
        if (err) {
          console.error('Kesalahan membuat lamaran:', err);
          return res.status(500).json({ message: 'Kesalahan server' });
        }

        // Buat notifikasi untuk HRD
        const jobDetailsQuery = 'SELECT title, posted_by FROM job_postings WHERE id = ?';
        db.query(jobDetailsQuery, [job_id], (err, jobResults) => {
          if (err) {
            console.error('Kesalahan mengambil detail lowongan:', err);
          } else if (jobResults.length > 0) {
            const notificationQuery = `
              INSERT INTO notifications (user_id, title, message, type)
              VALUES (?, ?, ?, 'info')
            `;
            const message = `Anda memiliki lamaran baru untuk posisi "${jobResults[0].title}"`;
            db.query(notificationQuery, [jobResults[0].posted_by, 'Lamaran Baru', message], (err) => {
              if (err) {
                console.error('Kesalahan membuat notifikasi:', err);
              }
            });
          }
        });

        res.status(201).json({ message: 'Lamaran berhasil dikirim', applicationId: result.insertId });
      });
    });
  });
});

// Endpoint untuk mendapatkan lamaran yang diajukan oleh pengguna
app.get('/api/my-applications', authenticateToken, (req, res) => {
  const applicant_id = req.user.id;
  
  const getApplicationsQuery = `
    SELECT ja.*, jp.title as job_title, u.name as company_name
    FROM job_applications ja
    JOIN job_postings jp ON ja.job_id = jp.id
    JOIN users u ON jp.company_id = u.id
    WHERE ja.applicant_id = ?
    ORDER BY ja.applied_at DESC
  `;
  
  db.query(getApplicationsQuery, [applicant_id], (err, results) => {
    if (err) {
      console.error('Kesalahan mengambil lamaran:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }
    
    res.json(results);
  });
});

// Endpoint untuk mendapatkan lamaran untuk lowongan yang diposting oleh HRD
app.get('/api/my-job-applications', authenticateToken, (req, res) => {
  const hr_id = req.user.id;

  // Cek apakah pengguna adalah HRD
  const checkRoleQuery = 'SELECT role FROM users WHERE id = ?';
  
  db.query(checkRoleQuery, [hr_id], (err, results) => {
    if (err) {
      console.error('Kesalahan memeriksa role pengguna:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }

    if (results.length === 0 || results[0].role !== 'recruiter') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya HRD yang dapat melihat lamaran.' });
    }

    const getApplicationsQuery = `
      SELECT ja.*, jp.title as job_title, u.name as applicant_name, u.avatar as applicant_avatar
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_id = jp.id
      JOIN users u ON ja.applicant_id = u.id
      WHERE jp.posted_by = ?
      ORDER BY ja.applied_at DESC
    `;
    
    db.query(getApplicationsQuery, [hr_id], (err, results) => {
      if (err) {
        console.error('Kesalahan mengambil lamaran:', err);
        return res.status(500).json({ message: 'Kesalahan server' });
      }
      
      res.json(results);
    });
  });
});

// Endpoint untuk mengupdate status lamaran (oleh HRD)
app.put('/api/job-applications/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const hr_id = req.user.id;

  // Validasi status
  if (!['submitted', 'reviewed', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  // Cek apakah HRD ini yang memposting lowongan
  const checkOwnershipQuery = `
    SELECT ja.id FROM job_applications ja
    JOIN job_postings jp ON ja.job_id = jp.id
    WHERE ja.id = ? AND jp.posted_by = ?
  `;
  
  db.query(checkOwnershipQuery, [id, hr_id], (err, results) => {
    if (err) {
      console.error('Kesalahan memeriksa kepemilikan:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }

    if (results.length === 0) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk mengupdate lamaran ini.' });
    }

    // Update status lamaran
    const updateStatusQuery = 'UPDATE job_applications SET status = ? WHERE id = ?';
    
    db.query(updateStatusQuery, [status, id], (err, result) => {
      if (err) {
        console.error('Kesalahan mengupdate status lamaran:', err);
        return res.status(500).json({ message: 'Kesalahan server' });
      }

      // Dapatkan detail pelamar untuk notifikasi
      const applicationDetailsQuery = `
        SELECT ja.applicant_id, jp.title, u.name as applicant_name
        FROM job_applications ja
        JOIN job_postings jp ON ja.job_id = jp.id
        JOIN users u ON ja.applicant_id = u.id
        WHERE ja.id = ?
      `;
      
      db.query(applicationDetailsQuery, [id], (err, appResults) => {
        if (err) {
          console.error('Kesalahan mengambil detail lamaran:', err);
        } else if (appResults.length > 0) {
          // Buat notifikasi untuk pelamar
          const notificationQuery = `
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, ?, ?, ?)
          `;
          
          let messageType = 'info';
          let message = '';
          
          if (status === 'accepted') {
            message = `Selamat! Lamaran Anda untuk posisi "${appResults[0].title}" telah diterima.`;
            messageType = 'success';
          } else if (status === 'rejected') {
            message = `Mohon maaf, Lamaran Anda untuk posisi "${appResults[0].title}" tidak diterima.`;
            messageType = 'error';
          } else {
            message = `Status lamaran Anda untuk posisi "${appResults[0].title}" telah diperbarui.`;
          }
          
          db.query(notificationQuery, [appResults[0].applicant_id, `Status Lamaran: ${status}`, message, messageType], (err) => {
            if (err) {
              console.error('Kesalahan membuat notifikasi:', err);
            }
          });
        }
      });

      res.json({ message: 'Status lamaran berhasil diperbarui' });
    });
  });
});

// Endpoint untuk mendapatkan notifikasi pengguna
app.get('/api/notifications', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  
  const getNotificationsQuery = `
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  
  db.query(getNotificationsQuery, [user_id], (err, results) => {
    if (err) {
      console.error('Kesalahan mengambil notifikasi:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }
    
    res.json(results);
  });
});

// Endpoint untuk menandai notifikasi sebagai sudah dibaca
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  
  const updateNotificationQuery = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = ? AND user_id = ?
  `;
  
  db.query(updateNotificationQuery, [id, user_id], (err, result) => {
    if (err) {
      console.error('Kesalahan memperbarui notifikasi:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }
    
    res.json({ message: 'Notifikasi berhasil ditandai sebagai sudah dibaca' });
  });
});

// Endpoint untuk mendapatkan statistik (khusus admin)
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  // Cek apakah pengguna adalah admin
  const checkRoleQuery = 'SELECT role FROM users WHERE id = ?';
  
  db.query(checkRoleQuery, [user_id], (err, results) => {
    if (err) {
      console.error('Kesalahan memeriksa role pengguna:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }

    if (results.length === 0 || results[0].role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses statistik.' });
    }

    // Ambil statistik
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'candidate') as total_candidates,
        (SELECT COUNT(*) FROM users WHERE role = 'recruiter') as total_recruiters,
        (SELECT COUNT(*) FROM job_postings) as total_job_postings,
        (SELECT COUNT(*) FROM job_applications) as total_applications
    `;
    
    db.query(statsQuery, (err, results) => {
      if (err) {
        console.error('Kesalahan mengambil statistik:', err);
        return res.status(500).json({ message: 'Kesalahan server' });
      }
      
      res.json(results[0]);
    });
  });
});

// Endpoint untuk mendapatkan semua pengguna (khusus admin)
app.get('/api/admin/users', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  // Cek apakah pengguna adalah admin
  const checkRoleQuery = 'SELECT role FROM users WHERE id = ?';
  
  db.query(checkRoleQuery, [user_id], (err, results) => {
    if (err) {
      console.error('Kesalahan memeriksa role pengguna:', err);
      return res.status(500).json({ message: 'Kesalahan server' });
    }

    if (results.length === 0 || results[0].role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses daftar pengguna.' });
    }

    const getUsersQuery = 'SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC';
    
    db.query(getUsersQuery, (err, results) => {
      if (err) {
        console.error('Kesalahan mengambil pengguna:', err);
        return res.status(500).json({ message: 'Kesalahan server' });
      }

      res.json(results);
    });
  });
});

// ==================== WEB ROUTES ====================

// Public routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Candidate/User routes
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
});

app.get('/profile', (req, res) => {
  res.render('dashboard', { title: 'Profil' });
});

app.get('/jobs', (req, res) => {
  res.render('dashboard', { title: 'Lowongan Kerja' });
});

app.get('/applications', (req, res) => {
  res.render('dashboard', { title: 'Lamaran Saya' });
});

// HRD routes
app.get('/hrd/dashboard', (req, res) => {
  res.render('hrd-dashboard', { title: 'Dashboard HRD' });
});

app.get('/hrd/create-job', (req, res) => {
  res.render('hrd-create-job', { title: 'Buat Lowongan' });
});

app.get('/hrd/my-jobs', (req, res) => {
  res.render('hrd-my-jobs', { title: 'Lowongan Saya' });
});

app.get('/hrd/applications', (req, res) => {
  res.render('hrd-applications', { title: 'Lamaran Masuk' });
});

// Admin routes
app.get('/admin/dashboard', (req, res) => {
  res.render('admin-dashboard', { title: 'Dashboard Admin' });
});

app.get('/admin/users', (req, res) => {
  res.render('admin-users', { title: 'Manajemen Pengguna' });
});

app.get('/admin/stats', (req, res) => {
  res.render('admin-stats', { title: 'Statistik' });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});