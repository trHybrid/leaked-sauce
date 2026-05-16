const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_KEY = process.env.UPLOAD_KEY || 'changeme';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Make sure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config — accept images only, max 20MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = uuidv4().split('-')[0]; // short unique ID e.g. a3f9c2b1
    cb(null, `${id}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Auth middleware — checks upload key
function authCheck(req, res, next) {
  const key = req.headers['x-upload-key'] || req.query.key;
  if (key !== UPLOAD_KEY) return res.status(401).json({ error: 'Unauthorised' });
  next();
}

// Upload endpoint
app.post('/upload', authCheck, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `${BASE_URL}/${req.file.filename}`;
  res.json({ url });
});

// Serve image page with Discord Open Graph embed
app.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(uploadDir, filename);

  if (!fs.existsSync(filepath)) return res.status(404).send('Not found');

  const ext = path.extname(filename).toLowerCase();
  const imageUrl = `${BASE_URL}/raw/${filename}`;
  const isVideo = ext === '.mp4';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta property="og:title" content="Leaked Sauce 🔥">
  <meta property="og:site_name" content="Leaked Sauce">
  <meta property="og:url" content="${BASE_URL}/${filename}">
  ${isVideo
    ? `<meta property="og:type" content="video.other">
       <meta property="og:video" content="${imageUrl}">
       <meta property="og:video:type" content="video/mp4">`
    : `<meta property="og:type" content="image">
       <meta property="og:image" content="${imageUrl}">
       <meta property="og:image:width" content="1200">
       <meta property="og:image:height" content="630">`
  }
  <meta name="twitter:card" content="${isVideo ? 'player' : 'summary_large_image'}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="theme-color" content="#e8b96a">
  <title>Leaked Sauce</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0f0f1e;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
    }
    .wrap { text-align: center; padding: 2rem; }
    img, video { max-width: 90vw; max-height: 85vh; border-radius: 8px; box-shadow: 0 4px 40px rgba(0,0,0,0.6); }
    p { color: #e8b96a; margin-top: 1rem; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="wrap">
    ${isVideo
      ? `<video controls autoplay loop><source src="${imageUrl}" type="video/mp4"></video>`
      : `<img src="${imageUrl}" alt="Leaked Sauce">`
    }
    <p>Leaked Sauce 🔥</p>
  </div>
</body>
</html>`;

  res.send(html);
});

// Serve raw file (for OG image tag)
app.get('/raw/:filename', (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filepath)) return res.status(404).send('Not found');
  res.sendFile(filepath);
});

app.listen(PORT, () => console.log(`Leaked Sauce running on port ${PORT}`));
