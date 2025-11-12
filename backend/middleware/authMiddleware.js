const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, 'YOUR_SECRET_KEY'); 

      const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'User not found, token failed.' });
      }
      
      req.user = rows[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
  }
  next();
};

module.exports = { protect, authorize };