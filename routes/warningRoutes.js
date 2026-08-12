const express = require('express');
const router = express.Router();
const warningController = require('../controllers/warningController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/warnings/:id/acknowledge', requireAuth, warningController.acknowledgeWarning);
router.get('/user/warnings/unread', requireAuth, warningController.getUnreadWarnings);
router.patch('/user/read-warning/:warningId', requireAuth, warningController.readWarning);
router.post('/admin/warn-user/:id', requireAdmin, warningController.warnUser);

module.exports = router;
