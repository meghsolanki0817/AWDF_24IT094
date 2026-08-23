const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const memoryUsers = [];
let nextMemoryId = 1;
const useMongo = () => require('mongoose').connection.readyState === 1;

const issueToken = (user) => jwt.sign({ id: user._id, email: user.email }, auth.secret(), { expiresIn: '1h' });
const publicUser = (user) => ({ id: user._id, email: user.email });

router.post('/register', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = useMongo() ? await User.findOne({ email }) : memoryUsers.find((user) => user.email === email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = useMongo()
      ? await User.create({ email, password: hashedPassword })
      : { _id: `local-user-${nextMemoryId++}`, email, password: hashedPassword };
    if (!useMongo()) memoryUsers.push(user);
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const user = useMongo() ? await User.findOne({ email }) : memoryUsers.find((item) => item.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid email or password' });
    res.status(200).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = useMongo() ? await User.findById(req.user.id).select('-password') : memoryUsers.find((item) => item._id === req.user.id);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    res.status(200).json(publicUser(user));
  } catch (error) {
    next(error);
  }
});

module.exports = router;