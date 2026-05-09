const express = require('express');
const router = express.Router();
const { getClients, createClient } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/clients')
  .get(protect, admin, getClients)
  .post(protect, admin, createClient);

module.exports = router;
