// backend/src/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Check if user already exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
      [first_name, last_name, email, password_hash]
    );

    // Generate JWT
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
