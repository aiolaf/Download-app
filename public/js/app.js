(function () {
  const urlInput = document.getElementById('url-input');
  const downloadBtn = document.getElementById('download-btn');
  const pasteBtn = document.getElementById('paste-btn');
  const resultsSection = document.getElementById('results');
  const formatsList = document.getElementById('formats-list');

  let currentJob = null;
  let hdToken = null;

  downloadBtn.addEventListener('click', handleExtract);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleExtract();
  });

  urlInput.addEventListener('paste', () => {
    setTimeout(() => {
      if (urlInput.value.trim().startsWith('http')) {
        handleExtract();
      }
    }, 100);
  });

  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          urlInput.value = text;
          urlInput.focus();
          if (text.trim().startsWith('http')) {
            handleExtract();
          }
        }
      } catch {
        showToast('Kan niet plakken. Klik in het invoerveld en gebruik Cmd/Ctrl+V.', 'error');
        urlInput.focus();
      }
    });
  }

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
    const thumb = document.getElementById('video-thumb');
    thumb.src = data.thumbnail || '';
    thumb.onerror = () => {
      thumb.style.background = 'linear-gradient(135deg, var(--primary), var(--accent-2))';
    };

    document.getElementById('video-title').textContent = data.title;

    const uploaderEl = document.getElementById('video-uploader');
    const uploaderSpan = uploaderEl.querySelector('span');
    if (data.uploader) {
      uploaderSpan.textContent = data.uploader;
      uploaderEl.style.display = 'inline-flex';
    } else {
      uploaderEl.style.display = 'none';
    }

    const durationBadge = document.getElementById('video-duration-badge');
    const duration = formatDuration(data.duration);
    if (duration) {
      durationBadge.textContent = duration;
      durationBadge.style.display = 'inline-block';
    } else {
      durationBadge.style.display = 'none';
    }

    document.getElementById('video-platform').textContent = data.platform;

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

    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
})();
