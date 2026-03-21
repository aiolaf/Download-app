const rateLimit = require('express-rate-limit');

const extractLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many download requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const unlockLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many unlock requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { extractLimiter, downloadLimiter, unlockLimiter };
