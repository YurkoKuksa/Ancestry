/* Спільний звук для всіх сторінок родоводу.
   Підключення (у кінці <body>):  <script src="../js/audio.js"></script>
   Шлях "../" залежить від глибини сторінки (js/ лежить у корені сайту).
   Фонова музика продовжується між сторінками: позиція треку зберігається
   і відновлюється на новій сторінці. Також: звук кліку на кнопках і
   посилання + кнопка вимкнення звуку. */
(function () {
  "use strict";

  var script = document.currentScript;
  var base = new URL("../", script.src); // корінь сайту

  var K_STARTED = "rodovid-started"; // сесія: музику вже запущено
  var K_POS = "rodovid-pos"; // сесія: позиція треку
  var K_MUTED = "rodovid-muted"; // постійно: музику вимкнено
  var K_SFX = "rodovid-sfx-muted"; // постійно: звук кліків вимкнено

  function store(area, k, v) {
    try {
      if (v === undefined) return window[area].getItem(k);
      window[area].setItem(k, v);
    } catch (e) {
      return null;
    }
  }

  var bgm = new Audio(new URL("sound/bg.mp3", base).href);
  bgm.loop = true;
  bgm.volume = 0.02; // фон ≈ 2%

  var clickUrl = new URL("sound/click.mp3", base).href;
  var CLICK_VOLUME = 0.1;
  var NAV_DELAY = 220; // мс: дати кліку прозвучати перед переходом

  var muted = store("localStorage", K_MUTED) === "1"; // музика
  var sfxMuted = store("localStorage", K_SFX) === "1"; // клік-звуки
  var started = store("sessionStorage", K_STARTED) === "1";
  var wrap = null,
    musicBtn = null,
    sfxBtn = null;

  /* ---------- позиція треку ---------- */
  function savePos() {
    if (!started) return;
    store(
      "sessionStorage",
      K_POS,
      JSON.stringify({
        t: bgm.currentTime,
        at: Date.now(),
        playing: !bgm.paused,
      }),
    );
  }
  setInterval(function () {
    if (!bgm.paused) savePos();
  }, 500);
  window.addEventListener("pagehide", savePos);

  /* ---------- відтворення ---------- */
  var waiting = false;
  function waitForGesture() {
    if (waiting) return;
    waiting = true;
    var evs = ["pointerdown", "keydown"];
    function go() {
      waiting = false;
      evs.forEach(function (e) {
        document.removeEventListener(e, go, true);
      });
      if (started && !muted) bgm.play().catch(function () {});
    }
    evs.forEach(function (e) {
      document.addEventListener(e, go, true);
    });
  }

  function play() {
    var p = bgm.play();
    if (p && p.catch) p.catch(waitForGesture); // браузер заблокував автозапуск
  }

  function resume() {
    var pos = null;
    try {
      pos = JSON.parse(store("sessionStorage", K_POS));
    } catch (e) {}
    function go() {
      if (pos && isFinite(bgm.duration) && bgm.duration > 0) {
        var t = pos.t + (pos.playing ? (Date.now() - pos.at) / 1000 : 0);
        bgm.currentTime = t % bgm.duration;
      }
      if (!muted) play();
    }
    if (bgm.readyState >= 1) go();
    else bgm.addEventListener("loadedmetadata", go, { once: true });
  }

  /* ---------- звук кліку ---------- */
  function playClick() {
    if (sfxMuted) return;
    var s = new Audio(clickUrl); // окрема копія — швидкі кліки не обривають один одного
    s.volume = CLICK_VOLUME;
    var p = s.play();
    if (p && p.catch) p.catch(function () {});
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a[href], button");
    if (!el || el.classList.contains("rv-sound")) return;
    playClick();

    if (
      el.tagName !== "A" ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      (el.target && el.target !== "_self") ||
      el.hasAttribute("download")
    )
      return;
    var href = el.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^javascript:/i.test(href)) return;
    e.preventDefault();
    savePos();
    setTimeout(function () {
      window.location.href = el.href;
    }, NAV_DELAY);
  });

  /* ---------- кнопки звуку (правий верхній кут) ---------- */
  var NOTE =
    '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>';
  var CURSOR = '<path d="M6 3l12 9-5.5 1.2L9.5 19z"/>';
  var SLASH = '<path d="M3 3l18 18"/>';

  function svg(inner, cls) {
    return (
      '<svg class="' +
      cls +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      inner +
      "</svg>"
    );
  }

  function makeButton(icon, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "rv-sound";
    b.innerHTML = svg(icon, "on") + svg(icon + SLASH, "off");
    b.addEventListener("click", onClick);
    return b;
  }

  function mountButton() {
    if (wrap) return;
    var st = document.createElement("style");
    st.textContent =
      ".rv-controls{position:fixed;top:16px;right:16px;z-index:1000;display:flex;gap:8px}" +
      ".rv-sound{width:46px;height:46px;display:grid;place-items:center;padding:0;" +
      "background:rgba(28,40,54,.78);color:#f4eedb;border:1px solid #a1802f;border-radius:50%;" +
      "cursor:pointer;transition:background .15s,color .15s}" +
      ".rv-sound:hover{background:#a1802f;color:#1c2836}" +
      ".rv-sound:focus-visible{outline:3px solid #f3e5ab;outline-offset:3px}" +
      ".rv-sound svg{width:22px;height:22px}" +
      ".rv-sound .off{display:none}.rv-sound.muted .on{display:none}.rv-sound.muted .off{display:block}";
    document.head.appendChild(st);

    wrap = document.createElement("div");
    wrap.className = "rv-controls";
    musicBtn = makeButton(NOTE, toggleMusic);
    sfxBtn = makeButton(CURSOR, toggleSfx);
    wrap.appendChild(musicBtn);
    wrap.appendChild(sfxBtn);
    document.body.appendChild(wrap);
    refreshButtons();
  }

  function refreshButtons() {
    if (!wrap) return;
    musicBtn.classList.toggle("muted", muted);
    var m = muted ? "Увімкнути фонову музику" : "Вимкнути фонову музику";
    musicBtn.setAttribute("aria-label", m);
    musicBtn.title = m;

    sfxBtn.classList.toggle("muted", sfxMuted);
    var f = sfxMuted ? "Увімкнути звук кліків" : "Вимкнути звук кліків";
    sfxBtn.setAttribute("aria-label", f);
    sfxBtn.title = f;
  }

  function toggleMusic() {
    muted = !muted;
    store("localStorage", K_MUTED, muted ? "1" : "0");
    if (muted) {
      bgm.pause();
      savePos();
    } else {
      play();
    }
    playClick();
    refreshButtons();
  }

  function toggleSfx() {
    sfxMuted = !sfxMuted;
    store("localStorage", K_SFX, sfxMuted ? "1" : "0");
    if (!sfxMuted) playClick(); // при вимкненні — тиша
    refreshButtons();
  }

  /* ---------- публічний інтерфейс ---------- */
  window.RodovidAudio = {
    started: function () {
      return started;
    },
    start: function () {
      // викликається кнопкою входу на головній
      started = true;
      store("sessionStorage", K_STARTED, "1");
      mountButton();
      if (!muted) play();
    },
    click: playClick,
  };

  /* ---------- автопродовження на новій сторінці ---------- */
  if (started) {
    resume();
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", mountButton);
    else mountButton();
  }
  // повернення кнопкою «Назад» браузера (bfcache)
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && started) {
      resume();
      mountButton();
    }
  });
})();
