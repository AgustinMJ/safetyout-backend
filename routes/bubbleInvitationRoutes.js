const express = require('express');
const { body } = require('express-validator');

const bubbleInvitationController = require('../controllers/bubbleInvitationController');
const router = express.Router();

router.post('/', bubbleInvitationController.postInvitation);
router.post('/:id/accept', bubbleInvitationController.acceptInvitation);
router.post('/:id/deny', bubbleInvitationController.denyInvitation);

module.exports = router;