import User from '../models/User.js';
import { sendTokenResponse } from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userCount = await User.countDocuments();
    const userRole = userCount === 0 ? 'admin' : role === 'admin' ? 'member' : 'member';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.password = undefined;
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

export const logout = async (_req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const updateProfile = async (req, res) => {
  try {
    const fields = ['name', 'avatar', 'theme'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });

    if (req.body.email && req.body.email !== req.user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      req.user.email = req.body.email;
    }

    await req.user.save();
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const url = `/uploads/${req.file.filename}`;
    req.user.avatar = url;
    await req.user.save();

    res.status(200).json({ success: true, user: req.user, avatar: url });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
