// Ad management module
const AdManager = (() => {
  let adCompleteCallback = null;
  let isAdPlaying = false;

  function init() {
    // In production, initialize Google AdSense and IMA SDK here
    // For now, we use a simulated ad flow for development
  }

  // Simulate watching a rewarded ad
  // In production, this would use Google IMA SDK
  function showRewardedAd(onComplete, onCancel) {
    const modal = document.getElementById('ad-modal');
    const watchBtn = document.getElementById('watch-ad-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const adContainer = document.getElementById('ad-container');

    modal.classList.remove('hidden');
    adCompleteCallback = onComplete;

    // Watch ad button handler
    const handleWatch = () => {
      if (isAdPlaying) return;
      isAdPlaying = true;

      watchBtn.disabled = true;
      watchBtn.textContent = 'Advertentie wordt afgespeeld...';

      adContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div class="spinner" style="margin: 0 auto 16px;"></div>
          <p style="color: var(--text-muted);">Advertentie wordt afgespeeld...</p>
          <div class="ad-progress">
            <div class="ad-progress-bar" id="ad-progress-bar"></div>
          </div>
          <p id="ad-countdown" style="color: var(--text-muted); margin-top: 8px;">5 seconden resterend</p>
        </div>
      `;

      // Add progress bar styles
      const style = document.createElement('style');
      style.textContent = `
        .ad-progress { width: 100%; height: 4px; background: var(--border); border-radius: 2px; margin-top: 16px; overflow: hidden; }
        .ad-progress-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); width: 0%; transition: width 1s linear; }
      `;
      document.head.appendChild(style);

      // Simulate 5-second ad
      let remaining = 5;
      const progressBar = document.getElementById('ad-progress-bar');
      const countdown = document.getElementById('ad-countdown');

      const timer = setInterval(() => {
        remaining--;
        const pct = ((5 - remaining) / 5) * 100;
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (countdown) countdown.textContent = `${remaining} seconden resterend`;

        if (remaining <= 0) {
          clearInterval(timer);
          isAdPlaying = false;
          closeModal();
          if (adCompleteCallback) {
            adCompleteCallback();
            adCompleteCallback = null;
          }
        }
      }, 1000);
    };

    const handleClose = () => {
      if (isAdPlaying) return;
      closeModal();
      if (onCancel) onCancel();
    };

    watchBtn.onclick = handleWatch;
    closeBtn.onclick = handleClose;
  }

  function closeModal() {
    const modal = document.getElementById('ad-modal');
    const watchBtn = document.getElementById('watch-ad-btn');
    const adContainer = document.getElementById('ad-container');

    modal.classList.add('hidden');
    isAdPlaying = false;
    watchBtn.disabled = false;
    watchBtn.textContent = 'Bekijk advertentie';
    adContainer.innerHTML = '<div class="ad-placeholder-large">Advertentie wordt geladen...</div>';
  }

  return { init, showRewardedAd };
})();

// Initialize on load
AdManager.init();
