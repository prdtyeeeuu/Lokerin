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
