const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const config = require('../config');

function cleanDownloads() {
  const dir = path.resolve(config.downloadDir);
  if (!fs.existsSync(dir)) return;

  const now = Date.now();
  const ttl = config.fileTTLMinutes * 60 * 1000;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.gitkeep') continue;
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > ttl) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // file may have been deleted already
    }
  }
}

function startCleanupCron() {
  const interval = config.cleanupIntervalMinutes;
  cron.schedule(`*/${interval} * * * *`, () => {
    cleanDownloads();
  });
  // Run once on startup
  cleanDownloads();
}

module.exports = { startCleanupCron, cleanDownloads };
