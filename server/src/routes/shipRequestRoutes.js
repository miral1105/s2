const express = require('express');
const router = express.Router();
const {
  createShipRequest,
  getShipRequests,
  getMyShipRequests,
  updatePackageStatus,
} = require('../controllers/shipRequestController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createShipRequest)
  .get(protect, admin, getShipRequests);

router.get('/my', protect, getMyShipRequests);
router.put('/packages/:id/status', protect, admin, updatePackageStatus);

module.exports = router;
