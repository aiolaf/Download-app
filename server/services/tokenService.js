const jwt = require('jsonwebtoken');
const config = require('../config');

function generateHDToken(jobId) {
  return jwt.sign(
    { jobId, type: 'hd-unlock' },
    config.jwtSecret,
    { expiresIn: '10m' }
  );
}

function verifyHDToken(token, jobId) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded.jobId === jobId && decoded.type === 'hd-unlock';
  } catch {
    return false;
  }
}

module.exports = { generateHDToken, verifyHDToken };
