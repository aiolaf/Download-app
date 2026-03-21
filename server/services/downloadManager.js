const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// In-memory store for download jobs
const jobs = new Map();

// Track active downloads to limit concurrency
let activeDownloads = 0;
const MAX_CONCURRENT = 3;

function createJob(url, platform, metadata) {
  const id = uuidv4().split('-')[0]; // short ID
  const job = {
    id,
    url,
    platform,
    title: metadata.title,
    thumbnail: metadata.thumbnail,
    duration: metadata.duration,
    uploader: metadata.uploader,
    formats: metadata.formats,
    createdAt: Date.now(),
  };
  jobs.set(id, job);

  // Clean up old jobs (older than TTL)
  const ttl = config.fileTTLMinutes * 60 * 1000;
  for (const [key, j] of jobs) {
    if (Date.now() - j.createdAt > ttl) {
      jobs.delete(key);
    }
  }

  return job;
}

function getJob(id) {
  return jobs.get(id) || null;
}

function getOutputPath(id, formatId) {
  const dir = path.resolve(config.downloadDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const safeFormatId = formatId.replace(/[^a-zA-Z0-9+_-]/g, '');
  return path.join(dir, `${id}_${safeFormatId}.mp4`);
}

function canStartDownload() {
  return activeDownloads < MAX_CONCURRENT;
}

function incrementActive() {
  activeDownloads++;
}

function decrementActive() {
  activeDownloads = Math.max(0, activeDownloads - 1);
}

module.exports = {
  createJob,
  getJob,
  getOutputPath,
  canStartDownload,
  incrementActive,
  decrementActive,
};
