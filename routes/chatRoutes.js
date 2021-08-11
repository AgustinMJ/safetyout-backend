const express = require('express');
const { body } = require('express-validator');


const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/:id/messages', chatController.getMessages);
router.delete('/:id', chatController.deleteChat);
router.post('/', chatController.createChat);

module.exports = router;