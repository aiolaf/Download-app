const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { validateUrl } = require('../middleware/validator');
const { extractLimiter, downloadLimiter, unlockLimiter } = require('../middleware/rateLimiter');
const { extractMetadata, downloadVideo } = require('../services/extractor');
const { createJob, getJob, getOutputPath, canStartDownload, incrementActive, decrementActive } = require('../services/downloadManager');
const { generateHDToken, verifyHDToken } = require('../services/tokenService');
const { detectPlatform } = require('../utils/platforms');
const config = require('../config');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Extract video metadata
router.post('/extract', extractLimiter, validateUrl, async (req, res) => {
  try {
    const url = req.videoUrl;
    const platform = detectPlatform(url);

    const metadata = await extractMetadata(url);

    // Check duration limit
    if (metadata.duration > config.maxVideoDuration) {
      return res.status(400).json({
        error: `Video is too long. Maximum duration is ${Math.floor(config.maxVideoDuration / 60)} minutes.`,
      });
    }

    const job = createJob(url, platform, metadata);

    res.json({
      id: job.id,
      platform: job.platform,
      title: job.title,
      thumbnail: job.thumbnail,
      duration: job.duration,
      uploader: job.uploader,
      formats: job.formats.map(({ quality, format_id, ext, filesize, hd }) => ({
        quality,
        format_id,
        ext,
        filesize,
        hd,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to extract video info' });
  }
});

// Unlock HD after watching ad
router.post('/unlock-hd', unlockLimiter, (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  const job = getJob(id);
  if (!job) {
    return res.status(404).json({ error: 'Video not found. Please extract again.' });
  }

  const hdToken = generateHDToken(id);
  res.json({ hdToken });
});

// Download video
router.get('/download/:id', downloadLimiter, async (req, res) => {
  const { id } = req.params;
  const { format_id, token } = req.query;

  const job = getJob(id);
  if (!job) {
    return res.status(404).json({ error: 'Video not found. Please extract again.' });
  }

  if (!format_id) {
    return res.status(400).json({ error: 'format_id is required' });
  }

  // Find the requested format
  const format = job.formats.find((f) => f.format_id === format_id);
  if (!format) {
    return res.status(400).json({ error: 'Invalid format' });
  }

  // Check HD access
  if (format.hd) {
    if (!token || !verifyHDToken(token, id)) {
      return res.status(403).json({ error: 'Watch an ad to unlock HD download' });
    }
  }

  // Check file size limit
  if (format.filesize && format.filesize > config.maxFileSizeMB * 1024 * 1024) {
    return res.status(400).json({ error: 'File is too large to download' });
  }

  // Check concurrency
  if (!canStartDownload()) {
    return res.status(429).json({ error: 'Server is busy. Please try again in a moment.' });
  }

  const outputPath = getOutputPath(id, format_id);

  try {
    incrementActive();

    // Download if file doesn't already exist
    if (!fs.existsSync(outputPath)) {
      await downloadVideo(job.url, format_id, outputPath);
    }

    // Sanitize filename for Content-Disposition
    const safeTitle = job.title.replace(/[^a-zA-Z0-9\s\-_]/g, '').substring(0, 100) || 'video';
    const filename = `${safeTitle}_${format.quality}.mp4`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    const stat = fs.statSync(outputPath);
    res.setHeader('Content-Length', stat.size);

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream video' });
      }
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Download failed' });
    }
  } finally {
    decrementActive();
  }
});

module.exports = router;
