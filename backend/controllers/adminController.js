const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { validateUser, validateStore } = require('../utils/validation');

const getAdminStats = async (req, res) => {
  try {
    const [totalUsers] = await db.query('SELECT COUNT(id) AS count FROM users');
    const [totalStores] = await db.query('SELECT COUNT(id) AS count FROM stores');
    const [totalRatings] = await db.query('SELECT COUNT(user_id) AS count FROM ratings');

    res.json({
      totalUsers: totalUsers[0].count,
      totalStores: totalStores[0].count,
      totalRatings: totalRatings[0].count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats.' });
  }
};

const addUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  const validationError = validateUser({ name, email, password, address, role }, true);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  
  if (role === 3) {
      return res.status(400).json({ message: 'Store Owners must be added via the Store creation endpoint.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({ message: `User added successfully with role ${role}.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error during user creation.' });
  }
};

const addStore = async (req, res) => {
    const { name, email, address, password } = req.body;
    const storePassword = password || 'DefaultStorePass!1'; // Default password if none provided

    const validationError = validateStore({ name, email, address });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }
    
    // Validate the store owner's password (if provided/default)
    const passwordValidation = validateUser({ password: storePassword }, true);
    if (passwordValidation) {
        return res.status(400).json({ message: `Owner Password Error: ${passwordValidation}` });
    }

    try {
        await db.getConnection(async (conn) => {
            try {
                await conn.beginTransaction();
                
                // 1. Check if user (store owner) already exists by email
                const [existingUser] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
                
                let ownerId;
                if (existingUser.length === 0) {
                    // 2. Create the Store Owner user (Role 3)
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(storePassword, salt);

                    const [userResult] = await conn.query(
                        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
                        [name, email, hashedPassword, address, 3]
                    );
                    ownerId = userResult.insertId;
                } else {
                    return res.status(400).json({ message: 'A user (store owner) with this email already exists.' });
                }

                // 3. Create the store
                const [storeResult] = await conn.query(
                    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
                    [name, email, address, ownerId]
                );

                await conn.commit();
                res.status(201).json({ message: 'Store and Store Owner created successfully.' });

            } catch (error) {
                await conn.rollback();
                throw error; // Propagate error to outer catch block
            } finally {
                conn.release();
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'A store with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error during store creation.' });
    }
};


const getUsers = async (req, res) => {
    const { filter = '', sortBy = 'name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchParam = `%${filter}%`;
    const allowedSortKeys = ['name', 'email', 'address', 'role', 'store_rating'];

    const orderBy = allowedSortKeys.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Base query for users, including store rating/name for owners
    const userQuery = `
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.address, 
            u.role,
            s.name AS store_name,
            (SELECT AVG(r.rating) FROM ratings r WHERE r.store_id = s.id) AS store_rating
        FROM users u
        LEFT JOIN stores s ON u.id = s.owner_id
        WHERE 
            u.name LIKE ? OR 
            u.email LIKE ? OR 
            u.address LIKE ? OR 
            CAST(u.role AS CHAR) LIKE ?
        ORDER BY ${orderBy} ${order}
        LIMIT ?, ?`;

    const countQuery = `
        SELECT COUNT(id) AS total FROM users
        WHERE 
            name LIKE ? OR 
            email LIKE ? OR 
            address LIKE ? OR 
            CAST(role AS CHAR) LIKE ?`;

    try {
        const [users] = await db.query(userQuery, [searchParam, searchParam, searchParam, searchParam, offset, parseInt(limit)]);
        const [totalRows] = await db.query(countQuery, [searchParam, searchParam, searchParam, searchParam]);
        const total = totalRows[0].total;

        res.json({ users, total });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users.' });
    }
};

const getStores = async (req, res) => {
    const { filter = '', sortBy = 'name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchParam = `%${filter}%`;
    const allowedSortKeys = ['name', 'email', 'address', 'overall_rating'];

    const orderBy = allowedSortKeys.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const storeQuery = `
        SELECT 
            s.id, 
            s.name, 
            s.email, 
            s.address,
            (SELECT AVG(r.rating) FROM ratings r WHERE r.store_id = s.id) AS overall_rating
        FROM stores s
        WHERE 
            s.name LIKE ? OR 
            s.email LIKE ? OR 
            s.address LIKE ?
        ORDER BY ${orderBy} ${order}
        LIMIT ?, ?`;

    const countQuery = `
        SELECT COUNT(id) AS total FROM stores
        WHERE 
            name LIKE ? OR 
            email LIKE ? OR 
            address LIKE ?`;

    try {
        const [stores] = await db.query(storeQuery, [searchParam, searchParam, searchParam, offset, parseInt(limit)]);
        const [totalRows] = await db.query(countQuery, [searchParam, searchParam, searchParam]);
        const total = totalRows[0].total;

        res.json({ stores, total });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stores.' });
    }
};

module.exports = { getAdminStats, addUser, addStore, getUsers, getStores };