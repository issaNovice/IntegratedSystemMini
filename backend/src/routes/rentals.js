// backend/src/routes/rentals.js
import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// POST /api/rentals
// body: { customer_name OR customer_id, inventory_id, staff_id }
router.post('/', async (req, res, next) => {
  try {
    const { customer_id, customer_name, inventory_id, staff_id } = req.body || {};

    // Ensure required fields exist
    if ((!customer_id && !customer_name) || !inventory_id || !staff_id) {
      return res.status(400).json({
        error: 'Provide either customer_id or customer_name, plus inventory_id and staff_id',
      });
    }

    // If name provided, fetch customer_id
    let resolvedCustomerId = customer_id;
    if (!resolvedCustomerId && customer_name) {
      const [rows] = await pool.query(
        `SELECT customer_id FROM customer 
         WHERE CONCAT(first_name, ' ', last_name) = :customer_name
         LIMIT 1`,
        { customer_name }
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Customer not found by that name' });
      }
      resolvedCustomerId = rows[0].customer_id;
    }

    // Check inventory availability
    const [[row]] = await pool.query(
      `SELECT NOT EXISTS (
          SELECT 1 FROM rental r 
          WHERE r.inventory_id = :inventory_id AND r.return_date IS NULL
        ) AS available`,
      { inventory_id }
    );

    if (!row || row.available !== 1) {
      return res.status(409).json({ error: 'Inventory not available' });
    }

    // Insert rental
    const [result] = await pool.query(
      `INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
       VALUES (NOW(), :inventory_id, :resolvedCustomerId, :staff_id)`,
      { inventory_id, resolvedCustomerId, staff_id }
    );

    res.status(201).json({ rental_id: result.insertId });
  } catch (err) {
    next(err);
  }
});

export default router;
