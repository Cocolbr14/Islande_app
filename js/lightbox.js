// =========================================================================
// MODULE LIGHTBOX / ZOOM PLEIN ÉCRAN
// =========================================================================
let currentZoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

function openLightbox(imgSrc, title = "Lieu clé") {
  const modal = document.getElementById("imageLightbox");
  const img = document.getElementById("lightboxImg");
  const titleEl = document.getElementById("lightboxTitle");

  img.src = imgSrc;
  titleEl.innerText = title;
  resetLightboxZoom();
  modal.classList.remove("hidden");
}

function closeLightbox() {
  const modal = document.getElementById("imageLightbox");
  modal.classList.add("hidden");
  resetLightboxZoom();
}

function updateLightboxTransform() {
  const img = document.getElementById("lightboxImg");
  const zoomText = document.getElementById("zoomLevelDisplay");
  img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
  zoomText.innerText = `${Math.round(currentZoom * 100)}%`;
}

function zoomLightbox(delta) {
  currentZoom = Math.min(Math.max(0.5, currentZoom + delta), 4.0);
  if (currentZoom === 1) {
    panX = 0;
    panY = 0;
  }
  updateLightboxTransform();
}

function resetLightboxZoom() {
  currentZoom = 1;
  panX = 0;
  panY = 0;
  updateLightboxTransform();
}

const viewport = document.getElementById("lightboxViewport");

viewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.2 : -0.2;
  zoomLightbox(delta);
}, { passive: false });

viewport.addEventListener("mousedown", (e) => {
  if (currentZoom <= 1 && e.target.id !== "lightboxImg") return;
  isDragging = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  updateLightboxTransform();
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

viewport.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX - panX;
    startY = e.touches[0].clientY - panY;
  }
});

viewport.addEventListener("touchmove", (e) => {
  if (isDragging && e.touches.length === 1) {
    panX = e.touches[0].clientX - startX;
    panY = e.touches[0].clientY - startY;
    updateLightboxTransform();
  }
});

viewport.addEventListener("touchend", () => {
  isDragging = false;
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
  if (e.key === "+" || e.key === "=") zoomLightbox(0.25);
  if (e.key === "-") zoomLightbox(-0.25);
  if (e.key === "0") resetLightboxZoom();
});
