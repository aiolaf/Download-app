const { isSupported } = require('../utils/platforms');

function validateUrl(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const trimmed = url.trim();

  // Basic URL validation
  try {
    new URL(trimmed);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Must be HTTPS or HTTP
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return res.status(400).json({ error: 'URL must start with http:// or https://' });
  }

  // Check supported platform
  if (!isSupported(trimmed)) {
    return res.status(400).json({
      error: 'Unsupported platform. We support YouTube, TikTok, Instagram, Twitter/X, and Facebook.',
    });
  }

  req.videoUrl = trimmed;
  next();
}

module.exports = { validateUrl };
