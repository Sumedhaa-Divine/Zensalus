(function () {
  const stage = document.getElementById('stage');
  const slides = Array.from(stage.querySelectorAll('.slide'));
  const chrome = document.getElementById('chrome');
  const n = slides.length;
  let i = 0;

  // ---- Fill in details from js/config.js ----
  const cfg = window.SITE_CONFIG || {};
  const val = k => (typeof cfg[k] === 'string' ? cfg[k].trim() : '');
  stage.querySelectorAll('[data-bind]').forEach(el => {
    const v = val(el.dataset.bind);
    if (v) el.textContent = v;
  });
  if (val('productName')) document.title = val('productName') + ' – Hospital Management System';
  function setLink(name, href, external) {
    stage.querySelectorAll('[data-link="' + name + '"]').forEach(a => {
      if (!href) { a.removeAttribute('href'); return; }
      a.href = href;
      if (external) { a.target = '_blank'; a.rel = 'noopener'; }
    });
  }
  const site = val('website');
  setLink('website', site ? (/^https?:/.test(site) ? site : 'https://' + site) : '', true);
  const mail = val('email');
  setLink('email', mail ? 'mailto:' + mail : '');
  const phone = val('phone');
  const digits = phone.replace(/[^0-9]/g, '');
  setLink('phone', digits ? (cfg.phoneIsWhatsApp ? 'https://wa.me/' + digits : 'tel:+' + digits) : '', !!cfg.phoneIsWhatsApp);
  const demo = val('demoLink') || (mail ? 'mailto:' + mail + '?subject=' + encodeURIComponent('Demo request: ' + (val('productName') || 'Hospital Management System')) : '');
  setLink('demo', demo, /^https?:/.test(demo));

  // ---- Motion helpers ----
  // Give each item in a list a running index so it can cascade in
  stage.querySelectorAll('.stagger').forEach(list => {
    Array.from(list.children).forEach((el, k) => el.style.setProperty('--d', k));
  });
  stage.querySelectorAll('.tstep').forEach((el, k) => el.style.setProperty('--d', k));
  stage.querySelectorAll('.plist li').forEach((el, k) => el.querySelector('svg').style.setProperty('--d', k));

  // Split headlines into words that rise one by one
  function splitWords(el) {
    let w = 0;
    const wrap = node => {
      const outer = document.createElement('span'); outer.className = 'w';
      const inner = document.createElement('span'); inner.className = 'wi';
      inner.style.setProperty('--w', w++);
      outer.appendChild(inner);
      return { outer, inner };
    };
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const { outer, inner } = wrap(); inner.textContent = part; frag.appendChild(outer);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1) {
        const { outer, inner } = wrap(); node.replaceWith(outer); inner.appendChild(node);
      }
    });
  }

  // Count numbers up on the results slide (only when real numbers are set)
  function countUp(slide) {
    slide.querySelectorAll('.metric [data-bind]').forEach(el => {
      const original = el.dataset.final || el.textContent;
      el.dataset.final = original;
      const m = original.match(/^(\D*)([\d.,]+)(.*)$/);
      if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = original; return; }
      const target = parseFloat(m[2].replace(/,/g, ''));
      const decimals = (m[2].split('.')[1] || '').length;
      const start = performance.now(), dur = 1400, delay = 500;
      el.textContent = m[1] + (0).toFixed(decimals) + m[3];
      const tick = now => {
        const t = Math.min(1, Math.max(0, (now - start - delay) / dur));
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = m[1] + (target * eased).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + m[3];
        if (t < 1 && slide.classList.contains('active')) requestAnimationFrame(tick);
        else if (t >= 1) el.textContent = original;
      };
      requestAnimationFrame(tick);
    });
  }

  // Fit the 1600x900 stage to the window
  function fit() {
    const pad = window.innerWidth < 700 ? 0 : 32;
    const s = Math.min((window.innerWidth - pad) / 1600, (window.innerHeight - pad) / 900);
    stage.style.transform = 'scale(' + s + ')';
    stage.style.borderRadius = pad ? '28px' : '0';
  }
  window.addEventListener('resize', fit);
  fit();

  // Build ECG paths
  function ecg(width, base, beats, amp) {
    const step = width / beats;
    let d = 'M0 ' + base;
    for (let b = 0; b < beats; b++) {
      const x = b * step;
      d += ' L' + (x + step * 0.38) + ' ' + base;
      d += ' Q' + (x + step * 0.43) + ' ' + (base - amp * 0.18) + ' ' + (x + step * 0.48) + ' ' + base;
      d += ' L' + (x + step * 0.54) + ' ' + base;
      d += ' L' + (x + step * 0.57) + ' ' + (base + amp * 0.15);
      d += ' L' + (x + step * 0.61) + ' ' + (base - amp);
      d += ' L' + (x + step * 0.65) + ' ' + (base + amp * 0.4);
      d += ' L' + (x + step * 0.68) + ' ' + base;
      d += ' Q' + (x + step * 0.78) + ' ' + (base - amp * 0.25) + ' ' + (x + step * 0.86) + ' ' + base;
      d += ' L' + (x + step) + ' ' + base;
    }
    return d;
  }
  const heroD = ecg(1600, 120, 5, 100);
  stage.querySelectorAll('.ecg-hero path').forEach(p => p.setAttribute('d', heroD));

  const progD = ecg(1228, 40, n, 34);
  const track = chrome.querySelector('.track');
  const live = chrome.querySelector('.live');
  const dot = chrome.querySelector('.dot');
  const pulse = chrome.querySelector('.pulse');
  track.setAttribute('d', progD);
  live.setAttribute('d', progD);
  const total = track.getTotalLength();

  function pointForSlide(k) {
    // Land on the flat line just after each slide's beat
    const target = ((k + 0.95) / n) * 1228;
    let lo = 0, hi = total;
    for (let it = 0; it < 30; it++) {
      const mid = (lo + hi) / 2;
      if (track.getPointAtLength(mid).x < target) lo = mid; else hi = mid;
    }
    return lo;
  }

  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const soundToggle = document.getElementById('soundToggle');
  const count = document.getElementById('count');

  const sound = (() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let enabled = true;
    let ctx = null;

    function ensureCtx() {
      if (!AudioCtx) return null;
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function note(freq, duration, volume, startOffset, type) {
      const c = ensureCtx();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime + startOffset);
      gain.gain.setValueAtTime(0.0001, c.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(volume, c.currentTime + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + startOffset + duration);
      osc.connect(gain).connect(c.destination);
      osc.start(c.currentTime + startOffset);
      osc.stop(c.currentTime + startOffset + duration);
    }

    function playSlideChime() {
      if (!enabled) return;
      note(220, 0.24, 0.012, 0, 'sine');
      note(293.66, 0.28, 0.010, 0.06, 'triangle');
      note(440, 0.32, 0.008, 0.12, 'sine');
      note(587.33, 0.18, 0.006, 0.24, 'triangle');
    }

    function playClick() {
      if (!enabled) return;
      note(523.25, 0.08, 0.008, 0, 'triangle');
      note(659.25, 0.10, 0.006, 0.03, 'sine');
    }

    function setEnabled(value) {
      enabled = !!value;
      if (soundToggle) {
        soundToggle.textContent = enabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !enabled);
      }
      if (enabled) ensureCtx();
    }

    soundToggle && soundToggle.addEventListener('click', () => {
      setEnabled(!enabled);
      if (enabled) playClick();
    });

    return { setEnabled, playSlideChime, playClick };
  })();

  function show(k) {
    const wasChange = k !== i;
    k = Math.max(0, Math.min(n - 1, k));
    i = k;
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === k);
      s.classList.toggle('before', idx < k);
      s.setAttribute('aria-hidden', idx === k ? 'false' : 'true');
      s.inert = idx !== k;
    });
    if (wasChange) sound.playSlideChime();
    const len = pointForSlide(k);
    live.style.strokeDashoffset = 1 - len / total;
    const pt = track.getPointAtLength(len);
    [dot, pulse].forEach(c => { c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); });
    count.textContent = (k + 1) + ' / ' + n;
    if (slides[k].querySelector('.metrics')) countUp(slides[k]);
    prev.disabled = k === 0;
    next.disabled = k === n - 1;
    stage.classList.toggle('on-dark', slides[k].classList.contains('on-dark'));
    chrome.classList.toggle('on-dark', slides[k].classList.contains('on-dark'));
    const h = '#slide-' + (k + 1);
    if (location.hash !== h) history.replaceState(null, '', h);
  }

  prev.addEventListener('click', () => { sound.playClick(); show(i - 1); });
  next.addEventListener('click', () => { sound.playClick(); show(i + 1); });

  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('.faq button') && (e.key === ' ' || e.key === 'Enter')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); sound.playClick(); show(i + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); sound.playClick(); show(i - 1); }
    else if (e.key === 'Home') { sound.playClick(); show(0); }
    else if (e.key === 'End') { sound.playClick(); show(n - 1); }
  });

  // Swipe
  let sx = null;
  stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
    sx = null;
  });

  // FAQ toggles
  stage.querySelectorAll('.faq .item').forEach(item => {
    const btn = item.querySelector('button');
    btn.addEventListener('click', () => {
      sound.playClick();
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  stage.querySelectorAll('.slide h1, .slide h2').forEach(splitWords);

  // Start from hash
  function fromHash() {
    const m = location.hash.match(/slide-(\d+)/);
    show(m ? parseInt(m[1], 10) - 1 : 0);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
