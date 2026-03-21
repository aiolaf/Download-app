// Main application logic
(function () {
  const urlInput = document.getElementById('url-input');
  const downloadBtn = document.getElementById('download-btn');
  const resultsSection = document.getElementById('results');
  const formatsList = document.getElementById('formats-list');

  let currentJob = null;
  let hdToken = null;

  // Event listeners
  downloadBtn.addEventListener('click', handleExtract);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleExtract();
  });

  // Handle paste event for auto-extract
  urlInput.addEventListener('paste', () => {
    setTimeout(() => {
      if (urlInput.value.trim().startsWith('http')) {
        handleExtract();
      }
    }, 100);
  });

  async function handleExtract() {
    const url = urlInput.value.trim();
    if (!url) {
      showError('Plak een video link om te beginnen');
      return;
    }

    hideError();
    resultsSection.classList.add('hidden');
    currentJob = null;
    hdToken = null;
    showLoading(downloadBtn);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Er is iets misgegaan');
        return;
      }

      currentJob = data;
      displayResults(data);
    } catch (err) {
      showError('Kan geen verbinding maken met de server. Probeer het opnieuw.');
    } finally {
      hideLoading(downloadBtn);
    }
  }

  function displayResults(data) {
    // Set video info
    document.getElementById('video-thumb').src = data.thumbnail || '';
    document.getElementById('video-title').textContent = data.title;
    document.getElementById('video-uploader').textContent = data.uploader || '';
    document.getElementById('video-duration').textContent = formatDuration(data.duration);
    document.getElementById('video-platform').textContent = data.platform;

    // Build format buttons
    formatsList.innerHTML = '';
    for (const format of data.formats) {
      const btn = document.createElement('button');
      btn.className = `format-btn ${format.hd ? 'is-hd' : ''}`;
      btn.innerHTML = `
        <span class="quality">${format.quality}</span>
        ${format.filesize ? `<span class="size">${formatFileSize(format.filesize)}</span>` : ''}
        ${format.hd ? '<span class="hd-badge">HD</span>' : ''}
      `;
      btn.addEventListener('click', () => handleFormatClick(format));
      formatsList.appendChild(btn);
    }

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleFormatClick(format) {
    if (format.hd && !hdToken) {
      // Show rewarded ad for HD
      AdManager.showRewardedAd(
        () => unlockHD(format),
        () => showToast('HD download geannuleerd', 'error')
      );
    } else {
      startDownload(format);
    }
  }

  async function unlockHD(format) {
    try {
      const res = await fetch('/api/unlock-hd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentJob.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Kan HD niet ontgrendelen', 'error');
        return;
      }

      hdToken = data.hdToken;
      showToast('HD ontgrendeld! Download begint...');
      startDownload(format);
    } catch {
      showToast('Er is iets misgegaan. Probeer het opnieuw.', 'error');
    }
  }

  function startDownload(format) {
    if (!currentJob) return;

    let url = `/api/download/${currentJob.id}?format_id=${encodeURIComponent(format.format_id)}`;
    if (format.hd && hdToken) {
      url += `&token=${encodeURIComponent(hdToken)}`;
    }

    showToast(`Download begint: ${format.quality}...`);

    // Trigger download via hidden link
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
})();
