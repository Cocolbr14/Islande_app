// =========================================================================
// COMPTE À REBOURS DU VOL ALLER
// =========================================================================
const TARGET_DATE = new Date("2027-01-26T04:00:00Z").getTime();

const REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const cdEls = {
  d: document.getElementById("cd-days"),
  h: document.getElementById("cd-hours"),
  m: document.getElementById("cd-minutes"),
  s: document.getElementById("cd-seconds")
};

// Ne modifie un chiffre que s'il a vraiment changé, avec un fondu vertical
function setNum(el, val) {
  if (el.dataset.v === val) return;
  const old = el.dataset.v;
  el.dataset.v = val;
  el.classList.toggle('wide', val.length > 2); // 100 jours et + : on réduit un peu pour que ça rentre
  if (old === undefined || REDUCE) { el.textContent = val; return; }
  el.innerHTML = '<span class="cd-out">' + old + '</span><span class="cd-in">' + val + '</span>';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = val; }, 520);
}

function updateCountdown() {
  const distance = Math.max(0, TARGET_DATE - Date.now());
  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);
  const p = (n) => String(n).padStart(2, "0");
  setNum(cdEls.d, p(days));
  setNum(cdEls.h, p(hours));
  setNum(cdEls.m, p(minutes));
  setNum(cdEls.s, p(seconds));
}

setInterval(updateCountdown, 250);
updateCountdown();
