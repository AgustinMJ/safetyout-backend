const express = require('express');
const { body } = require('express-validator');

const placeController = require('../controllers/placeController');
const router = express.Router();

router.get('/occupation', placeController.getOccupation);



module.exports = router;