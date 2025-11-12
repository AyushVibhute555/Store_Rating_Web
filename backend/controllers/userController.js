const db = require('../config/db');

const getAllStores = async (req, res) => {
  const userId = req.user.id;
  const { search = '', sortBy = 'name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const searchParam = `%${search}%`;
  const allowedSortKeys = ['name', 'address'];

  const orderBy = allowedSortKeys.includes(sortBy) ? sortBy : 'name';
  const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const storeQuery = `
    SELECT 
        s.id, 
        s.name, 
        s.address,
        (SELECT AVG(r.rating) FROM ratings r WHERE r.store_id = s.id) AS overall_rating,
        (SELECT r.rating FROM ratings r WHERE r.store_id = s.id AND r.user_id = ?) AS user_submitted_rating
    FROM stores s
    WHERE 
        s.name LIKE ? OR 
        s.address LIKE ?
    ORDER BY ${orderBy} ${order}
    LIMIT ?, ?`;

  const countQuery = `
    SELECT COUNT(id) AS total FROM stores
    WHERE 
        name LIKE ? OR 
        address LIKE ?`;

  try {
    const [stores] = await db.query(storeQuery, [userId, searchParam, searchParam, offset, parseInt(limit)]);
    const [totalRows] = await db.query(countQuery, [searchParam, searchParam]);
    const total = totalRows[0].total;

    res.json({ stores, total });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stores.' });
  }
};

const submitRating = async (req, res) => {
  const userId = req.user.id;
  const { storeId, rating } = req.body;

  if (!storeId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid store ID or rating (must be 1-5).' });
  }

  try {
    const [storeExists] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeExists.length === 0) {
        return res.status(404).json({ message: 'Store not found.' });
    }
    
    // Check if rating exists (for modification)
    const [existingRating] = await db.query('SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);

    if (existingRating.length > 0) {
      // Modify existing rating
      await db.query('UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?', [rating, userId, storeId]);
      res.status(200).json({ message: 'Rating modified successfully.' });
    } else {
      // Submit new rating
      await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userId, storeId, rating]);
      res.status(201).json({ message: 'Rating submitted successfully.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error submitting rating.' });
  }
};

module.exports = { getAllStores, submitRating };