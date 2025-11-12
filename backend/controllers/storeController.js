const db = require('../config/db');

const getStoreDashboard = async (req, res) => {
  const ownerId = req.user.id;
  
  try {
    // 1. Find the store owned by this user
    const [storeRows] = await db.query('SELECT id, name FROM stores WHERE owner_id = ?', [ownerId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ message: 'No store found associated with this user.' });
    }
    const storeId = storeRows[0].id;

    // 2. Calculate average rating
    const [avgRatingRows] = await db.query(
      'SELECT AVG(rating) AS averageRating FROM ratings WHERE store_id = ?',
      [storeId]
    );
    
    const averageRating = avgRatingRows[0].averageRating ? parseFloat(avgRatingRows[0].averageRating).toFixed(2) : 'N/A';

    // 3. Get list of users who have submitted ratings
    const [userRatings] = await db.query(
      `SELECT 
          u.name, 
          u.email, 
          u.address, 
          r.rating 
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?`,
      [storeId]
    );

    res.json({
      storeName: storeRows[0].name,
      averageRating,
      userRatings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store dashboard data.' });
  }
};

module.exports = { getStoreDashboard };