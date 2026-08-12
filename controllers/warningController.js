const Warning = require('../models/Warning');
const User = require('../models/User');
const { sendWarningEmail } = require('../services/emailService');
const { validateReturnUrl } = require('../utils/helpers');

function wantsJson(req) {
  return req.xhr || req.headers.accept?.includes('application/json') || req.is('application/json');
}

function formatDateId(value) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

const warnUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = req.user.id;
    const message = String(req.body.message || '').trim();

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'User tidak valid.' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Pesan peringatan wajib diisi.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    const warningId = await Warning.create({ userId, adminId, message });
    const warningDate = formatDateId(new Date());

    await sendWarningEmail({
      to: targetUser.email,
      userName: targetUser.name,
      warningMessage: message,
      warningDate
    });

    if (wantsJson(req)) {
      return res.status(201).json({
        success: true,
        warning: {
          id: warningId,
          user_id: userId,
          admin_id: adminId,
          message,
          is_read: false,
          created_at: new Date().toISOString()
        }
      });
    }

    return res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};

const getUnreadWarnings = async (req, res, next) => {
  try {
    const warnings = await Warning.findUnreadByUserId(req.user.id, 10);
    res.json({ warnings });
  } catch (error) {
    next(error);
  }
};

const acknowledgeWarning = async (req, res, next) => {
  try {
    const warningId = req.params.id;
    const returnUrl = validateReturnUrl(req.body.returnUrl || req.query.returnUrl || '/dashboard') || '/dashboard';

    await Warning.acknowledge(warningId, req.user.id);
    res.redirect(returnUrl);
  } catch (error) {
    next(error);
  }
};

const readWarning = async (req, res, next) => {
  try {
    const warningId = Number(req.params.warningId);
    if (!Number.isInteger(warningId) || warningId <= 0) {
      return res.status(400).json({ error: 'Warning tidak valid.' });
    }

    const updated = await Warning.markAsRead(warningId, req.user.id);
    if (!updated) {
      return res.status(404).json({ error: 'Warning tidak ditemukan atau sudah dibaca.' });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  warnUser,
  getUnreadWarnings,
  acknowledgeWarning,
  readWarning
};
