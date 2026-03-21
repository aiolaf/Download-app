require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  adsensePublisherId: process.env.ADSENSE_PUBLISHER_ID || '',
  imaVastTagUrl: process.env.IMA_VAST_TAG_URL || '',
  maxVideoDuration: parseInt(process.env.MAX_VIDEO_DURATION, 10) || 1800,
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 500,
  downloadDir: process.env.DOWNLOAD_DIR || './downloads',
  cleanupIntervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES, 10) || 15,
  fileTTLMinutes: parseInt(process.env.FILE_TTL_MINUTES, 10) || 30,
};
