const { execFile } = require('child_process');
const path = require('path');
const config = require('../config');

const YTDLP_BIN = 'yt-dlp';

function extractMetadata(url) {
  return new Promise((resolve, reject) => {
    const args = [
      '--dump-json',
      '--no-download',
      '--no-warnings',
      '--no-playlist',
      url,
    ];

    execFile(YTDLP_BIN, args, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Failed to extract video info: ${error.message}`));
      }

      try {
        const info = JSON.parse(stdout);
        const formats = parseFormats(info.formats || []);
        resolve({
          title: info.title || 'Untitled',
          thumbnail: info.thumbnail || '',
          duration: info.duration || 0,
          uploader: info.uploader || '',
          formats,
        });
      } catch (e) {
        reject(new Error('Failed to parse video metadata'));
      }
    });
  });
}

function parseFormats(rawFormats) {
  const seen = new Map();

  // Filter to mp4 formats with video
  const videoFormats = rawFormats.filter(
    (f) => f.vcodec && f.vcodec !== 'none' && f.ext === 'mp4'
  );

  for (const f of videoFormats) {
    const height = f.height || 0;
    if (height < 240) continue;

    const label = `${height}p`;
    const existing = seen.get(label);

    // Keep the best (largest filesize) for each resolution
    if (!existing || (f.filesize || 0) > (existing.filesize || 0)) {
      seen.set(label, {
        quality: label,
        format_id: f.format_id,
        ext: 'mp4',
        filesize: f.filesize || f.filesize_approx || 0,
        height,
        hd: height >= 720,
        hasAudio: f.acodec && f.acodec !== 'none',
      });
    }
  }

  // If no standalone mp4 with video+audio at a resolution, try to find
  // best video-only + best audio for merging
  const audioFormats = rawFormats
    .filter((f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))
    .sort((a, b) => (b.abr || 0) - (a.abr || 0));

  const bestAudio = audioFormats[0];

  // For video-only formats, create merged format IDs
  const videoOnly = rawFormats.filter(
    (f) => f.vcodec && f.vcodec !== 'none' && (!f.acodec || f.acodec === 'none')
  );

  for (const f of videoOnly) {
    const height = f.height || 0;
    if (height < 240) continue;

    const label = `${height}p`;
    const existing = seen.get(label);

    if (!existing && bestAudio) {
      seen.set(label, {
        quality: label,
        format_id: `${f.format_id}+${bestAudio.format_id}`,
        ext: 'mp4',
        filesize: (f.filesize || f.filesize_approx || 0) + (bestAudio.filesize || 0),
        height,
        hd: height >= 720,
        hasAudio: true,
      });
    }
  }

  // Sort by height ascending
  const result = Array.from(seen.values()).sort((a, b) => a.height - b.height);

  // If no mp4 formats found, provide a "best" fallback
  if (result.length === 0) {
    result.push({
      quality: 'best',
      format_id: 'best',
      ext: 'mp4',
      filesize: 0,
      height: 0,
      hd: false,
      hasAudio: true,
    });
  }

  return result;
}

function downloadVideo(url, formatId, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-f', formatId,
      '-o', outputPath,
      '--merge-output-format', 'mp4',
      '--no-playlist',
      '--no-warnings',
      url,
    ];

    execFile(YTDLP_BIN, args, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Download failed: ${error.message}`));
      }
      resolve(outputPath);
    });
  });
}

module.exports = { extractMetadata, downloadVideo };
