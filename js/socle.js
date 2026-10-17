// =========================================================================
// SÉCURITÉ : ÉCHAPPEMENT DU TEXTE SAISI PAR LES UTILISATEURS
// Empêche qu'un nom de lieu / note / téléphone contenant des caractères
// HTML (ex: " onerror=...) ne puisse injecter du code dans la page.
// =========================================================================
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Pour injecter une valeur utilisateur à l'intérieur d'un onclick="...('...')"
// (échappe d'abord pour le JavaScript, puis pour l'attribut HTML qui le contient).
function escAttr(str) {
  const jsEscaped = String(str ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
  return escapeHtml(jsEscaped);
}

// =========================================================================
// NAVIGATION MOBILE : met en surbrillance l'onglet de la section visible
// =========================================================================
(function initMobileNavHighlight() {
  const links = document.querySelectorAll('#mobileBottomNav a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.toggle('active-tab', l.dataset.tab === entry.target.id));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  links.forEach(l => {
    const section = document.getElementById(l.dataset.tab);
    if (section) observer.observe(section);
  });
})();

// =========================================================================
// HELPER GESTION IMAGES AVEC FALLBACK AUTO (JPG / PNG)
// =========================================================================
function getImgSrc(basePath) {
  if (!basePath) return '';
  if (basePath.startsWith('http')) return basePath;
  if (basePath.endsWith('.jpg') || basePath.endsWith('.jpeg') || basePath.endsWith('.png')) {
    return basePath;
  }
  return `${basePath}.jpg`;
}

function handleImgError(el) {
  if (!el.src) return;
  if (el.src.endsWith('.jpg')) {
    el.src = el.src.replace(/\.jpg$/, '.png');
  } else if (el.src.endsWith('.png')) {
    el.src = el.src.replace(/\.png$/, '.jpg');
  } else {
    el.style.display = 'none';
  }
}
