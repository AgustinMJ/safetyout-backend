const express = require('express');
const { body } = require('express-validator');

const assistanceController = require('../controllers/assistanceController');
const router = express.Router();

router.get('/consultFuture',assistanceController.consultFutureAssistance);
router.get('/consultOnDate',assistanceController.consultAssistanceOnDate);
router.post('/', assistanceController.postAssistance);
router.patch('/', assistanceController.modifyAssistance);
router.delete('/', assistanceController.deleteAssistance);


module.exports = router;