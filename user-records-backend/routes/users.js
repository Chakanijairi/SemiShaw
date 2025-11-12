// routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User'); // ✅ FIXED PATH

const router = express.Router();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

// POST /api/users/register - create a new user
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'user',
    });

    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users - list all users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email role createdAt');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
