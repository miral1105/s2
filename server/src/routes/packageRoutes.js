const express = require('express');
const router = express.Router();
const {
  createPackage,
  getPackages,
  getMyPackages,
  updatePackageStatus,
  uploadInvoice,
  reviewInvoice,
} = require('../controllers/packageController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
  .post(protect, admin, createPackage)
  .get(protect, admin, getPackages);

router.get('/my', protect, getMyPackages);

router.put('/:id/status', protect, admin, updatePackageStatus);

router.post('/:id/invoice', protect, upload.single('invoice'), uploadInvoice);

router.put('/:id/invoice/review', protect, admin, reviewInvoice);

module.exports = router;
