#!/bin/bash
# Install system dependencies for the video downloader

set -e

echo "Installing yt-dlp..."
pip install --user yt-dlp 2>/dev/null || pip3 install --user yt-dlp 2>/dev/null || {
  echo "Downloading yt-dlp binary..."
  curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
  chmod a+rx /usr/local/bin/yt-dlp
}

echo "Installing ffmpeg..."
if ! command -v ffmpeg &> /dev/null; then
  if command -v apt-get &> /dev/null; then
    sudo apt-get update && sudo apt-get install -y ffmpeg
  elif command -v yum &> /dev/null; then
    sudo yum install -y ffmpeg
  elif command -v brew &> /dev/null; then
    brew install ffmpeg
  else
    echo "Please install ffmpeg manually: https://ffmpeg.org/download.html"
  fi
fi

echo "Dependencies installed successfully!"
echo "yt-dlp: $(yt-dlp --version 2>/dev/null || echo 'not found')"
echo "ffmpeg: $(ffmpeg -version 2>/dev/null | head -1 || echo 'not found')"
