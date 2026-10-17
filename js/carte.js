// =========================================================================
// CARTE LEAFLET
// =========================================================================
const map = L.map('map', { zoomControl: false }).setView([63.9, -19.5], 8);
L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 19,
  subdomains: ['0', '1', '2', '3'],
  attribution: '&copy; Google Maps'
}).addTo(map);

const GAS_STATIONS = [
  { brand: "Orkan", name: "Orkan KEF Airport", lat: 63.9890, lng: -22.5850 },
  { brand: "N1", name: "N1 Keflavík Fitjar", lat: 63.9745, lng: -22.5185 },
  { brand: "N1", name: "N1 Selfoss", lat: 63.9374, lng: -21.0020 },
  { brand: "N1", name: "N1 Hella", lat: 63.8344, lng: -20.3995 },
  { brand: "N1", name: "N1 Hvolsvöllur", lat: 63.7505, lng: -20.2227 },
  { brand: "N1", name: "N1 Vík í Mýrdal", lat: 63.4186, lng: -19.0062 },
  { brand: "N1", name: "N1 Kirkjubæjarklaustur", lat: 63.7915, lng: -18.0514 },
  { brand: "Orkan", name: "Orkan Freysnes (Skaftafell)", lat: 63.9878, lng: -16.8962 },
  { brand: "N1", name: "N1 Fagurhólsmýri", lat: 63.8780, lng: -16.6470 },
  { brand: "N1", name: "N1 Reykholt", lat: 64.1755, lng: -20.4435 }
];

const markerLayers = [];
const gasLayers = [];
let polylines = [];
let currentFilterMode = 'all';
let showGas = true;

function makeCustomPin(dateKey) {
  const cfg = DAYS_CONFIG.find(d => d.key === dateKey) || DAYS_CONFIG[0];
  return L.divIcon({
    className: 'custom-pin',
    html: `<div class="pin-wrap"><div class="pin-body" style="background:${cfg.color};"><div class="pin-inner">${cfg.shortLabel.slice(0,2)}</div></div></div>`,
    iconSize: [32, 40], iconAnchor: [16, 38], popupAnchor: [0, -34]
  });
}

function makeGasPin() {
  return L.divIcon({
    className: 'gas-pin-custom',
    html: `<div class="gas-pin">⛽</div>`,
    iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10]
  });
}

async function recalculateMap() {
  markerLayers.forEach(m => map.removeLayer(m));
  gasLayers.forEach(g => map.removeLayer(g));
  polylines.forEach(p => map.removeLayer(p));
  markerLayers.length = 0;
  gasLayers.length = 0;
  polylines.length = 0;

  const steps = getSteps();

  const activeSteps = steps.filter(s => {
    if (currentFilterMode === 'out') return s.dateKey <= "2027-01-29";
    if (currentFilterMode === 'in') return s.dateKey >= "2027-01-30";
    return true;
  });

  activeSteps.forEach(s => {
    const dayCfg = DAYS_CONFIG.find(d => d.key === s.dateKey) || DAYS_CONFIG[0];
    const imgSrc = getImgSrc(s.img);
    const popupContent = `
      <div>
        <div class="popup-photo-box" onclick="openLightbox('${imgSrc}', '${escAttr(s.name)}')" title="Survole pour agrandir • Clique pour le plein écran">
          <img src="${imgSrc}" class="popup-photo-img" alt="${escapeHtml(s.name)}" onerror="handleImgError(this)" />
          <div class="popup-photo-hint">Déplier ⤢</div>
        </div>
        <div class="popup-body">
          <span class="popup-tag" style="background:${dayCfg.color}; color:#fff;">${dayCfg.fullLabel}</span>
          <div class="popup-title">${escapeHtml(s.name)}</div>
          ${s.time ? `<div class="popup-time">⏰ ${escapeHtml(s.time)}</div>` : ''}
          <div class="popup-desc">${escapeHtml(s.desc)}</div>
          <div class="popup-price">💶 ${escapeHtml(s.price) || 'Gratuit'}</div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank" class="popup-link">
            🗺️ Naviguer avec Google Maps ➔
          </a>
        </div>
      </div>
    `;
    const m = L.marker([s.lat, s.lng], { icon: makeCustomPin(s.dateKey) })
      .bindPopup(popupContent, { autoPanPadding: [25, 25] })
      .addTo(map);
    markerLayers.push(m);
  });

  if (showGas) {
    GAS_STATIONS.forEach(g => {
      const gm = L.marker([g.lat, g.lng], { icon: makeGasPin() })
        .bindPopup(`<div class="gas-popup"><strong>Station ${g.brand}</strong><span>Automate carburant 24/7</span></div>`)
        .addTo(map);
      gasLayers.push(gm);
    });
  }

  for (let i = 0; i < activeSteps.length - 1; i++) {
    const p1 = activeSteps[i];
    const p2 = activeSteps[i + 1];

    let coords = [[p1.lat, p1.lng], [p2.lat, p2.lng]];

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${p1.lng},${p1.lat};${p2.lng},${p2.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      }
    } catch (e) {}

    const targetDayCfg = DAYS_CONFIG.find(d => d.key === p2.dateKey) || DAYS_CONFIG[0];
    const poly = L.polyline(coords, {
      color: targetDayCfg.color,
      weight: 4.5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      className: 'route-line'
    }).addTo(map);

    polylines.push(poly);
  }
}

function setMode(mode) {
  currentFilterMode = mode;
  ['all', 'out', 'in'].forEach(m => {
    const btn = document.getElementById('btn-' + m);
    btn.className = (m === mode) ? 'seg-btn on' : 'seg-btn';
  });
  recalculateMap();
}

function toggleGasPins() {
  showGas = !showGas;
  document.getElementById('gasFilterLabel').innerText = showGas ? 'Stations : ON' : 'Stations : OFF';
  recalculateMap();
}

function resetMapView() {
  map.setView([63.9, -19.5], 8);
}
