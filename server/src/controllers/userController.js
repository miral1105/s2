const User = require('../models/User');

// @desc    Get all clients (with optional search)
// @route   GET /api/users/clients?search=
// @access  Private/Admin
const getClients = async (req, res) => {
  const { search } = req.query;
  const query = { role: 'Client' };

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: regex },
      { email: regex },
    ];
  }

  const clients = await User.find(query).select('-password').limit(20);
  res.json(clients);
};

// @desc    Admin creates a new client
// @route   POST /api/users/clients
// @access  Private/Admin
const createClient = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'Client',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

module.exports = {
  getClients,
  createClient,
};
