const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateUser } = require('../utils/validation');

const generateToken = (id) => {
  return jwt.sign({ id }, 'YOUR_SECRET_KEY', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, address } = req.body;
  const role = 2; // Default to Normal User

  const validationError = validateUser({ name, email, password, address, role }, true);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'Registration successful. Please log in.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT id, name, email, password, address, role FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);
      
      const response = {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        token: token,
      };

      if (user.role === 3) {
        const [store] = await db.query('SELECT id, name FROM stores WHERE owner_id = ?', [user.id]);
        response.storeId = store[0]?.id || null;
        response.storeName = store[0]?.name || null;
      }

      res.json(response);

    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || !currentPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
  }

  const validationError = validateUser({ password: newPassword }, true);
  if (validationError) {
      return res.status(400).json({ message: validationError });
  }

  try {
      const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
      const user = rows[0];

      if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
          return res.status(401).json({ message: 'Invalid current password.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

      res.json({ message: 'Password updated successfully.' });

  } catch (error) {
      res.status(500).json({ message: 'Server error while updating password.' });
  }
};

module.exports = { registerUser, loginUser, updatePassword };