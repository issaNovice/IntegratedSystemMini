// backend/src/routes/films.js
import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/films
// Query params: q, category_id, rating, limit, offset
router.get('/', async (req, res, next) => {
  try {
    const { q, category_id, rating } = req.query;
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);

    const where = [];
    const params = {};

    if (q) {
      where.push('(f.title LIKE :q OR f.description LIKE :q)');
      params.q = `%${q}%`;
    }
    if (category_id) {
      where.push('c.category_id = :category_id');
      params.category_id = Number(category_id);
    }
    if (rating) {
      where.push('f.rating = :rating');
      params.rating = rating;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT f.film_id, f.title, f.description, f.poster, f.release_year, f.rating, GROUP_CONCAT(DISTINCT c.name) AS categories
       FROM film f
       LEFT JOIN film_category fc ON f.film_id = fc.film_id
       LEFT JOIN category c ON fc.category_id = c.category_id
       ${whereSql}
       GROUP BY f.film_id
       ORDER BY f.film_id
       LIMIT :limit OFFSET :offset`,
      { ...params, limit, offset }
    );

    const [[{ total } = { total: 0 }]] = await pool.query(
      `SELECT COUNT(DISTINCT f.film_id) AS total
       FROM film f
       LEFT JOIN film_category fc ON f.film_id = fc.film_id
       LEFT JOIN category c ON fc.category_id = c.category_id
       ${whereSql}`,
      params
    );

    res.json({ data: rows, pagination: { total, limit, offset } });
  } catch (err) {
    next(err);
  }
});

// GET /api/films/:id
router.get('/:id', async (req, res, next) => {
  try {
    const filmId = Number(req.params.id);
    const [[film]] = await pool.query(
      `SELECT f.*, GROUP_CONCAT(DISTINCT c.name) AS categories
       FROM film f
       LEFT JOIN film_category fc ON f.film_id = fc.film_id
       LEFT JOIN category c ON fc.category_id = c.category_id
       WHERE f.film_id = :filmId
       GROUP BY f.film_id`,
      { filmId }
    );
    if (!film) return res.status(404).json({ error: 'Film not found' });

    const [cast] = await pool.query(
      `SELECT a.actor_id, CONCAT(a.first_name, ' ', a.last_name) AS name
       FROM actor a
       JOIN film_actor fa ON a.actor_id = fa.actor_id
       WHERE fa.film_id = :filmId
       ORDER BY name`,
      { filmId }
    );

    const [inventory] = await pool.query(
      `SELECT i.inventory_id,
              NOT EXISTS (
                SELECT 1 FROM rental r
                WHERE r.inventory_id = i.inventory_id AND r.return_date IS NULL
              ) AS available
       FROM inventory i
       WHERE i.film_id = :filmId`,
      { filmId }
    );

    const availableCount = inventory.filter(i => i.available === 1 || i.available === true).length;

    res.json({
      film,
      cast,
      availability: { total: inventory.length, available: availableCount },
      inventory: inventory.map(i => ({ inventory_id: i.inventory_id, available: i.available === 1 || i.available === true }))
    });
  } catch (err) {
    next(err);
  }
});

export default router;


