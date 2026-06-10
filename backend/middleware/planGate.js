const pool = require('../db');

module.exports = function requirePro(req, res, next) {
  const hotel_id = req.hotel?.hotel_id;

  pool.query('SELECT plan FROM hotels WHERE id = $1', [hotel_id])
    .then(result => {
      const plan = result.rows[0]?.plan;
      if (plan === 'professional' || plan === 'enterprise') {
        next();
      } else {
        res.status(403).json({ 
          error: 'upgrade_required',
          message: 'This feature requires a Professional plan. Please upgrade to continue.'
        });
      }
    })
    .catch(() => res.status(500).json({ error: 'Something went wrong' }));
};