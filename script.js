(() => {
  const photo = document.getElementById("photo");
  const veil = document.getElementById("veil");
  const maskFill = document.getElementById("mask-fill");
  const veilFill = document.getElementById("veil-fill");
  const logoHole = document.getElementById("logo-hole");
  const cta = document.getElementById("cta");
  const copyBefore = document.getElementById("copy-before");
  const copyAfter = document.getElementById("copy-after");
  const legal = document.getElementById("legal");

  const LOGO_RATIO = 466 / 733;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let target = 0;
  let current = 0;
  let inside = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 2.4);

  function measure() {
    width = window.innerWidth;
    height = window.innerHeight;
    veil.setAttribute("viewBox", `0 0 ${width} ${height}`);
    maskFill.setAttribute("width", width);
    maskFill.setAttribute("height", height);
    veilFill.setAttribute("width", width);
    veilFill.setAttribute("height", height);
    apply(current, true);
  }

  function progressFromScroll() {
    const max = document.documentElement.scrollHeight - height;
    if (max <= 0) return 1;
    return clamp(window.scrollY / max, 0, 1);
  }

  function apply(p, instant) {
    const zoom = ease(p);
    const baseH = Math.min(height * 0.46, width * 0.34 / LOGO_RATIO);
    const baseW = baseH * LOGO_RATIO;
    const cover = Math.max(width / baseW, height / baseH) * 1.45;
    const scale = lerp(1, cover, zoom);

    logoHole.setAttribute("width", baseW * scale);
    logoHole.setAttribute("height", baseH * scale);
    logoHole.setAttribute("x", (width - baseW * scale) / 2);
    logoHole.setAttribute("y", (height - baseH * scale) / 2);

    const photoScale = lerp(1.14, 1, zoom);
    photo.style.setProperty("--photo-scale", photoScale.toFixed(4));

    const veilOpacity = p > 0.92 ? clamp(1 - (p - 0.92) / 0.08, 0, 1) : 1;
    veil.style.opacity = String(veilOpacity);

    const beforeT = clamp(1 - p / 0.22, 0, 1);
    const afterT = clamp((p - 0.62) / 0.18, 0, 1);
    const legalT = clamp((p - 0.7) / 0.16, 0, 1);

    copyBefore.style.opacity = beforeT.toFixed(3);
    copyBefore.style.transform = `translate3d(0, ${(1 - beforeT) * 8}px, 0)`;

    copyAfter.style.opacity = afterT.toFixed(3);
    copyAfter.style.transform = `translate3d(0, ${(1 - afterT) * 8}px, 0)`;

    legal.style.opacity = legalT.toFixed(3);
    legal.style.color = p > 0.55 ? "#c8c8c8" : "#7a7a7a";

    const nowInside = p > 0.48;
    if (nowInside !== inside || instant) {
      inside = nowInside;
      cta.textContent = inside ? "Let's Talk" : "Book A Call";
    }
  }

  function tick() {
    target = progressFromScroll();
    const smoothing = reduced ? 1 : 0.085;
    current += (target - current) * smoothing;
    if (Math.abs(target - current) < 0.0004) current = target;
    apply(current, false);
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", measure, { passive: true });
  measure();
  requestAnimationFrame(tick);
})();
