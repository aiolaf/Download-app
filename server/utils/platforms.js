const PLATFORMS = [
  {
    name: 'youtube',
    patterns: [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\//,
      /^https?:\/\/youtu\.be\//,
      /^https?:\/\/(www\.)?youtube\.com\/embed\//,
    ],
  },
  {
    name: 'tiktok',
    patterns: [
      /^https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\//,
      /^https?:\/\/vm\.tiktok\.com\//,
      /^https?:\/\/(www\.)?tiktok\.com\/t\//,
    ],
  },
  {
    name: 'instagram',
    patterns: [
      /^https?:\/\/(www\.)?instagram\.com\/(reel|p|reels)\//,
    ],
  },
  {
    name: 'twitter',
    patterns: [
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[^/]+\/status\//,
    ],
  },
  {
    name: 'facebook',
    patterns: [
      /^https?:\/\/(www\.|m\.)?facebook\.com\/.+\/videos\//,
      /^https?:\/\/(www\.|m\.)?facebook\.com\/watch\//,
      /^https?:\/\/(www\.|m\.)?facebook\.com\/reel\//,
      /^https?:\/\/fb\.watch\//,
    ],
  },
];

function detectPlatform(url) {
  for (const platform of PLATFORMS) {
    for (const pattern of platform.patterns) {
      if (pattern.test(url)) {
        return platform.name;
      }
    }
  }
  return null;
}

function isSupported(url) {
  return detectPlatform(url) !== null;
}

module.exports = { detectPlatform, isSupported, PLATFORMS };
