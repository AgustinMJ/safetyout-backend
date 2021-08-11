const express = require('express');
const { body } = require('express-validator');

const friendRequestController = require('../controllers/friendRequestController');
const router = express.Router();

router.post('/', friendRequestController.postFriendRequest);
router.post('/:id/accept', friendRequestController.acceptFriendRequest);
router.post('/:id/deny', friendRequestController.denyFriendRequest);


module.exports = router;