const ShipRequest = require('../models/ShipRequest');
const Package = require('../models/Package');

// @desc    Create a new ship request
// @route   POST /api/ship-requests
// @access  Private/Client
const createShipRequest = async (req, res) => {
  const { packageIds, shippingMethod, destination } = req.body;

  if (!packageIds || packageIds.length === 0) {
    res.status(400);
    throw new Error('No packages selected');
  }

  // Verify all packages belong to client and have uploaded invoices
  const packages = await Package.find({
    _id: { $in: packageIds },
    client: req.user._id,
    status: { $in: ['Invoice Approved', 'Pending Invoice Review'] },
  });

  if (packages.length !== packageIds.length) {
    res.status(400);
    throw new Error('Some packages are not eligible for shipping (ensure invoices are uploaded)');
  }

  const shipRequest = await ShipRequest.create({
    packages: packageIds,
    client: req.user._id,
    shippingMethod,
    destination,
  });

  // Update package statuses
  await Package.updateMany(
    { _id: { $in: packageIds } },
    { status: 'Ship Requested' }
  );



  res.status(201).json(shipRequest);
};

// @desc    Get all ship requests
// @route   GET /api/ship-requests
// @access  Private/Admin
const getShipRequests = async (req, res) => {
  const requests = await ShipRequest.find({})
    .populate('client', 'name email suiteNumber')
    .populate('packages');
  res.json(requests);
};

// @desc    Get my ship requests
// @route   GET /api/ship-requests/my
// @access  Private/Client
const getMyShipRequests = async (req, res) => {
  const requests = await ShipRequest.find({ client: req.user._id })
    .populate('packages');
  res.json(requests);
};

// @desc    Update a package status (admin only - last 3 statuses)
// @route   PUT /api/ship-requests/packages/:id/status
// @access  Private/Admin
const updatePackageStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['Shipped', 'Ready for Pickup', 'Delivered'];

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Allowed: Shipped, Ready for Pickup, Delivered');
  }

  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }

  pkg.status = status;
  await pkg.save();
  res.json(pkg);
};

module.exports = {
  createShipRequest,
  getShipRequests,
  getMyShipRequests,
  updatePackageStatus,
};
