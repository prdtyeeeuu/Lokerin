const { query, rawQuery } = require('../config/db');

const Warning = {
  create: async ({ userId, adminId, message }) => {
    const result = await query(
      `INSERT INTO user_warnings (user_id, admin_id, message)
       VALUES (?, ?, ?)`,
      [userId, adminId, message]
    );

    return result.insertId;
  },

  findByIdForUser: async (warningId, userId) => {
    const rows = await query(
      `SELECT id, user_id, admin_id, message, is_read, created_at
       FROM user_warnings
       WHERE id = ?
         AND user_id = ?
       LIMIT 1`,
      [warningId, userId]
    );

    return rows[0] || null;
  },

  findByUserId: async (userId, limit = 5) => {
    const safeLimit = Math.min(50, Math.max(parseInt(limit, 10) || 5, 1));
    const rows = await rawQuery(
      `SELECT id, message, is_read, created_at
       FROM user_warnings
       WHERE user_id = ?
         AND is_read = FALSE
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, safeLimit]
    );

    return rows;
  },

  findUnreadByUserId: async (userId, limit = 5) => {
    return Warning.findByUserId(userId, limit);
  },

  markAsRead: async (warningId, userId) => {
    const result = await query(
      `UPDATE user_warnings
       SET is_read = TRUE
       WHERE id = ?
         AND user_id = ?
         AND is_read = FALSE`,
      [warningId, userId]
    );

    return result.affectedRows > 0;
  },

  acknowledge: async (warningId, userId) => {
    return Warning.markAsRead(warningId, userId);
  },

  countByUserId: async (userId) => {
    const rows = await query(
      'SELECT COUNT(*) as total FROM user_warnings WHERE user_id = ?',
      [userId]
    );

    return rows[0]?.total || 0;
  }
};

module.exports = Warning;
