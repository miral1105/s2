const Package = require('../models/Package');
const Invoice = require('../models/Invoice');

// @desc    Create a new package intake
// @route   POST /api/packages
// @access  Private/Admin
const createPackage = async (req, res) => {
  const { trackingNumber, dimensions, weight, contents, clientId } = req.body;

  const pkg = await Package.create({
    trackingNumber,
    dimensions,
    weight,
    contents,
    client: clientId,
  });
  res.status(201).json(pkg);
};

// @desc    Get all packages
// @route   GET /api/packages
// @access  Private/Admin
const getPackages = async (req, res) => {
  const packages = await Package.find({}).populate('client', 'name email suiteNumber').populate('invoice');
  res.json(packages);
};

// @desc    Get client's packages
// @route   GET /api/packages/my
// @access  Private/Client
const getMyPackages = async (req, res) => {
  const packages = await Package.find({ client: req.user._id }).populate('invoice');
  res.json(packages);
};

// @desc    Update package status
// @route   PUT /api/packages/:id/status
// @access  Private/Admin
const updatePackageStatus = async (req, res) => {
  const { status } = req.body;
  const pkg = await Package.findById(req.params.id);

  if (pkg) {
    const oldStatus = pkg.status;
    pkg.status = status;
    await pkg.save();
    res.json(pkg);
  } else {
    res.status(404);
    throw new Error('Package not found');
  }
};

// @desc    Upload invoice for package
// @route   POST /api/packages/:id/invoice
// @access  Private/Client
const uploadInvoice = async (req, res) => {
  const pkg = await Package.findById(req.params.id);

  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }

  if (pkg.client.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const invoice = await Invoice.create({
    fileUrl: `/uploads/${req.file.filename}`,
    package: pkg._id,
  });

  pkg.invoice = invoice._id;
  pkg.status = 'Pending Invoice Review';
  await pkg.save();
  res.status(201).json(invoice);
};

// @desc    Review invoice
// @route   PUT /api/packages/:id/invoice/review
// @access  Private/Admin
const reviewInvoice = async (req, res) => {
  const { reviewStatus, adminNotes } = req.body;
  const pkg = await Package.findById(req.params.id).populate('invoice');

  if (!pkg || !pkg.invoice) {
    res.status(404);
    throw new Error('Package or invoice not found');
  }

  const invoice = await Invoice.findById(pkg.invoice._id);
  invoice.reviewStatus = reviewStatus;
  invoice.adminNotes = adminNotes;
  await invoice.save();

  if (reviewStatus === 'Approved') {
    pkg.status = 'Invoice Approved';
  } else if (reviewStatus === 'Rejected') {
    pkg.status = 'Ready to Send'; // Back to start or custom status
  }
  
  await pkg.save();
  res.json({ pkg, invoice });
};

module.exports = {
  createPackage,
  getPackages,
  getMyPackages,
  updatePackageStatus,
  uploadInvoice,
  reviewInvoice,
};
