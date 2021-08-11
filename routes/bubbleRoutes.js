const express = require('express');
const { body } = require('express-validator');

const bubbleController = require('../controllers/bubbleController');
const router = express.Router();

router.get('/:id', bubbleController.getBubble);
router.post('/',bubbleController.createBubble);
router.delete('/:id',bubbleController.deleteBubble);
router.patch('/:id',bubbleController.modifyBubble);
router.delete('/:id/members/:memberId', bubbleController.deleteBubbleMember);

module.exports = router;