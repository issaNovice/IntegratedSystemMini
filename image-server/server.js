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
const UPLOAD_DIR = path.join(__dirname, 'uploads'); // ensure this exists

// Basic security headers
app.use(helmet());

// Allow your frontend origin(s) here; use '*' only for quick testing.
app.use(cors({
  origin: 'http://localhost:5173', // default Vite dev server
  credentials: true
}));

// Basic rate limiter (prevent brute force)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
});
app.use(limiter);

// Ensure upload dir exists ""
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer config for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // sanitize & avoid collisions: timestamp + safe name

    const ext = mime.extension(file.mimetype) || path.extname(file.originalname);
    const base = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9_\-]/gi, '_')
      .toLowerCase();
    const filename = `${Date.now()}_${base}.${ext}`;
    cb(null, filename);
  }
});

// Accept only common image MIME types and limit size
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // return the public URL for the uploaded file
  const url = `${req.protocol}://${req.get('host')}/wallpapers/${req.file.filename}`;
  res.json({ ok: true, url, filename: req.file.filename });
});

// Static serving for wallpapers with cache-control
app.use('/wallpapers', express.static(UPLOAD_DIR, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // 👇 add this line to allow cross-origin resource sharing for images
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless'); // optional but recommended
  }
}));

// Health check + listing (optional, for admin)
app.get('/_status', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// List all uploaded files (for quick admin, remove in production or protect with auth)
app.get('/_list', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to list files' });
    const urls = files.map(fn => `${req.protocol}://${req.get('host')}/wallpapers/${fn}`);
    res.json({ files, urls });
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ error: err.message || 'Server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Image server running: http://localhost:${PORT}`);
    console.log(`Uploads dir: ${UPLOAD_DIR}`);
  });
}

export default { app };
