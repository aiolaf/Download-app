const AdManager = (() => {
  let adCompleteCallback = null;
  let isAdPlaying = false;

  function init() {
    // In production: initialize Google AdSense / IMA SDK
  }

  function showRewardedAd(onComplete, onCancel) {
    const modal = document.getElementById('ad-modal');
    const watchBtn = document.getElementById('watch-ad-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const adContainer = document.getElementById('ad-container');

    modal.classList.remove('hidden');
    adCompleteCallback = onComplete;

    const handleWatch = () => {
      if (isAdPlaying) return;
      isAdPlaying = true;

      watchBtn.disabled = true;
      watchBtn.textContent = 'Advertentie wordt afgespeeld...';

      adContainer.innerHTML = `
        <div style="text-align: center; padding: 30px 20px; width: 100%;">
          <div class="spinner" style="margin: 0 auto 20px; width: 32px; height: 32px; border-width: 3px;"></div>
          <p style="color: var(--text-muted); margin-bottom: 16px;">Advertentie wordt afgespeeld...</p>
          <div class="ad-progress">
            <div class="ad-progress-bar" id="ad-progress-bar"></div>
          </div>
          <p id="ad-countdown" style="color: var(--text-dim); margin-top: 10px; font-size: 0.85rem;">5 seconden resterend</p>
        </div>
      `;

      if (!document.getElementById('ad-progress-style')) {
        const style = document.createElement('style');
        style.id = 'ad-progress-style';
        style.textContent = `
          .ad-progress { width: 100%; height: 6px; background: rgba(148, 163, 184, 0.15); border-radius: 3px; margin-top: 16px; overflow: hidden; }
          .ad-progress-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent-2)); width: 0%; transition: width 1s linear; border-radius: 3px; }
        `;
        document.head.appendChild(style);
      }

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

AdManager.init();
