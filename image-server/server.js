// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Security headers
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Rate limiter
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
  })
);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = mime.extension(file.mimetype) || path.extname(file.originalname);
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9_\-]/gi, '_')
      .toLowerCase();
    cb(null, `${Date.now()}_${base}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `${req.protocol}://${req.get('host')}/wallpapers/${req.file.filename}`;
  res.json({ ok: true, url, filename: req.file.filename });
});

// Static serving
app.use('/wallpapers', express.static(UPLOAD_DIR));

// Healthcheck route
app.get('/_status', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ error: err.message || 'Server error' });
});

// Start only if not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Image server running at http://localhost:${PORT}`);
  });
}

export default { app };

