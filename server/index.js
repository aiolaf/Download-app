const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const apiRoutes = require('./routes/api');
const { startCleanupCron } = require('./utils/cleanup');

const app = express();

// Security headers (relaxed CSP for ads)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://pagead2.googlesyndication.com',
          'https://imasdk.googleapis.com',
          'https://www.googletagservices.com',
          'https://tpc.googlesyndication.com',
        ],
        frameSrc: [
          "'self'",
          'https://googleads.g.doubleclick.net',
          'https://tpc.googlesyndication.com',
          'https://www.google.com',
        ],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https://pagead2.googlesyndication.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        mediaSrc: ["'self'", 'blob:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', apiRoutes);

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start cleanup cron
startCleanupCron();

app.listen(config.port, () => {
  console.log(`Video Downloader running on http://localhost:${config.port}`);
});
