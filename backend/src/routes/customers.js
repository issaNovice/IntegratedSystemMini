import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// POST /api/customers
router.post('/', async (req, res, next) => {
  try {
    const { store_id = 1, first_name, last_name, email, address_id } = req.body || {};
    if (!first_name || !last_name || !address_id) {
      return res.status(400).json({ error: 'first_name, last_name, address_id required' });
    }
    const [result] = await pool.query(
      `INSERT INTO customer (store_id, first_name, last_name, email, address_id, create_date)
       VALUES (:store_id, :first_name, :last_name, :email, :address_id, NOW())`,
      { store_id, first_name, last_name, email, address_id }
    );
    res.status(201).json({ customer_id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);
    const [[customer]] = await pool.query(
      `SELECT customer_id, store_id, first_name, last_name, email, address_id, active
       FROM customer WHERE customer_id = :customerId`,
      { customerId }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const [openRentals] = await pool.query(
      `SELECT r.rental_id, r.rental_date, f.title, r.return_date
       FROM rental r
       JOIN inventory i ON r.inventory_id = i.inventory_id
       JOIN film f ON i.film_id = f.film_id
       WHERE r.customer_id = :customerId
       ORDER BY r.rental_date DESC`,
      { customerId }
    );

    res.json({ customer, openRentals });
  } catch (err) {
    next(err);
  }
});

// ✅ NEW: GET /api/customers/by-name/:name
router.get('/by-name/:name', async (req, res, next) => {
  try {
    const name = req.params.name.trim();
    const [rows] = await pool.query(
      `SELECT customer_id, first_name, last_name, email
       FROM customer
       WHERE CONCAT(first_name, ' ', last_name) LIKE :name`,
      { name: `%${name}%` }
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No customers found with that name' });
    }

    // Fetch rentals for each matched customer
    const results = await Promise.all(rows.map(async (cust) => {
      const [rentals] = await pool.query(
        `SELECT r.rental_id, r.rental_date, f.title, r.return_date
         FROM rental r
         JOIN inventory i ON r.inventory_id = i.inventory_id
         JOIN film f ON i.film_id = f.film_id
         WHERE r.customer_id = :customer_id
         ORDER BY r.rental_date DESC`,
        { customer_id: cust.customer_id }
      );
      return { customer: cust, rentals };
    }));

    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;
