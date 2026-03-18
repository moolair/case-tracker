const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../authenticate');

// POST /users/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password, firstname, lastname } = req.body;

    const existing = await User.findByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const user = await User.create({ username, email, password, firstname, lastname, role: 'viewer' });
    const token = authenticate.getToken(user);
    res.status(201).json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// POST /users/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);

    if (!user || !(await User.verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = authenticate.getToken(user);
    res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// GET /users (admin only)
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
