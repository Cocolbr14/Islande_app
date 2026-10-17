// =========================================================================
// HÉBERGEMENTS PAR NUITÉE
// =========================================================================
const BLANK_LODGINGS = [
  { night: 1, date: "Mardi 26 Janvier", name: "", location: "Zone Selfoss", checkin: "Dès 15h00", address: "", phone: "", notes: "Arrivée après Raufarhólshellir et courses Bónus" },
  { night: 2, date: "Mercredi 27 Janvier", name: "", location: "Zone Vík í Mýrdal", checkin: "Dès 16h00", address: "", phone: "", notes: "Proche des falaises de Reynisfjara et Dyrhólaey" },
  { night: 3, date: "Jeudi 28 Janvier", name: "", location: "Zone Skaftafell / Hof", checkin: "Dès 16h00", address: "", phone: "", notes: "Au pied du parc national et de Svartifoss" },
  { night: 4, date: "Vendredi 29 Janvier", name: "", location: "Zone Jökulsárlón / Glaciers", checkin: "Dès 16h00", address: "", phone: "", notes: "Dormir sur place : permet d'être à 10 min de la grotte samedi matin sans rouler" },
  { night: 5, date: "Samedi 30 Janvier", name: "", location: "Zone Hella / Repli Ouest", checkin: "Dès 17h00", address: "", phone: "", notes: "Repli Ouest après la grotte de glace" },
  { night: 6, date: "Dimanche 31 Janvier", name: "", location: "Zone Flúðir / Cercle d'Or", checkin: "Dès 16h00", address: "", phone: "", notes: "Après les bains chauds de Secret Lagoon" },
  { night: 7, date: "Lundi 01 Février", name: "", location: "Zone Aéroport Keflavík", checkin: "Dès 15h00", address: "", phone: "", notes: "4x4 rendu à 19h00. Nuit à pied/navette de l'aéroport pour dépose-bagages à 06h30" }
];

function getLodgings() {
  return JSON.parse(localStorage.getItem("iceland_lodgings_data_v11") || JSON.stringify(BLANK_LODGINGS));
}

// N'accepte que http(s) pour éviter les liens javascript:
function bookingHref(raw) {
  let v = (raw || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? escapeHtml(u.href) : ''; } catch (e) { return ''; }
}

function renderLodgings() {
  const lodgings = getLodgings();
  const container = document.getElementById("lodging-cards-container");
  container.innerHTML = lodgings.map((l, index) => {
    const isFilled = l.name && l.name.trim() !== "";
    const dayColor = DAYS_CONFIG[index] ? DAYS_CONFIG[index].color : '#38bdf8';
    return `
      <article class="night ${isFilled ? 'filled' : 'empty'}" style="--dc:${dayColor}">
        <div class="night-sky" aria-hidden="true">
          <span class="moon"></span>
          <i style="left:14%;top:30%"></i><i style="left:34%;top:58%"></i><i style="left:62%;top:22%"></i><i style="left:82%;top:52%"></i><i style="left:48%;top:12%"></i>
          <svg class="ridge" viewBox="0 0 300 50" preserveAspectRatio="none"><path d="M0 50V30l30-14 28 16 40-26 36 24 42-18 44 26 36-18 44 20v34z"/></svg>
        </div>
        <div class="night-body">
          <div class="night-top">
            <span class="night-no">Nuit <b>${index + 1}</b></span>
            <span class="night-date">${escapeHtml(l.date)}</span>
          </div>

          <h3 class="night-name ${isFilled ? '' : 'blank'}">
            ${isFilled ? escapeHtml(l.name) : 'Aucun hébergement renseigné'}
          </h3>
          <p class="night-loc">
            <i data-lucide="map-pin"></i> ${escapeHtml(l.location) || 'Localisation à préciser'}
          </p>

          <dl class="night-info">
            <div><dt>Arrivée</dt><dd>${escapeHtml(l.checkin) || '—'}</dd></div>
            <div><dt>Contact</dt><dd>${l.phone ? `<a href="tel:${encodeURIComponent(l.phone)}">${escapeHtml(l.phone)}</a>` : '—'}</dd></div>
            <div class="key"><dt>Accès / Boîte à clés</dt><dd class="${l.notes ? 'note' : 'none'}">${escapeHtml(l.notes) || 'Aucune consigne saisie'}</dd></div>
          </dl>

          <div class="night-actions">
            ${bookingHref(l.booking_url) ? `<a href="${bookingHref(l.booking_url)}" target="_blank" rel="noopener noreferrer" class="btn-ghost sm"><i data-lucide="ticket"></i> Ma réservation</a>` : ''}
            ${isFilled && (l.address || l.location) ? `
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(l.address || l.location)}" target="_blank" rel="noopener" class="btn-aurora sm">
                📍 Naviguer ➔
              </a>
            ` : `
              <button onclick="openLodgingModal(${index})" class="btn-ghost dashed">+ Ajouter les coordonnées</button>
            `}
            <button onclick="openLodgingModal(${index})" class="btn-quiet">
              <i data-lucide="${isFilled ? 'edit-3' : 'plus-circle'}"></i> ${isFilled ? 'Modifier' : 'Renseigner'}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
  lucide.createIcons();
}

function openLodgingModal(index) {
  const lodgings = getLodgings();
  const l = lodgings[index];
  document.getElementById('editLodgingIndex').value = index;
  document.getElementById('modalLodgingTitle').innerText = `${l.date} — ${l.location}`;
  document.getElementById('editLodgingName').value = l.name || '';
  document.getElementById('editLodgingLocation').value = l.location || '';
  document.getElementById('editLodgingCheckin').value = l.checkin || '';
  document.getElementById('editLodgingAddress').value = l.address || '';
  document.getElementById('editLodgingPhone').value = l.phone || '';
  document.getElementById('editLodgingNotes').value = l.notes || '';
  document.getElementById('editLodgingUrl').value = l.booking_url || '';
  document.getElementById('lodgingModal').classList.remove('hidden');
}

function closeLodgingModal() {
  document.getElementById('lodgingModal').classList.add('hidden');
}

async function saveLodgingData() {
  const index = parseInt(document.getElementById('editLodgingIndex').value);
  const lodgings = getLodgings();
  const updated = {
    ...lodgings[index],
    name: document.getElementById('editLodgingName').value.trim(),
    location: document.getElementById('editLodgingLocation').value.trim(),
    checkin: document.getElementById('editLodgingCheckin').value.trim(),
    address: document.getElementById('editLodgingAddress').value.trim(),
    phone: document.getElementById('editLodgingPhone').value.trim(),
    notes: document.getElementById('editLodgingNotes').value.trim(),
    booking_url: document.getElementById('editLodgingUrl').value.trim()
  };
  lodgings[index] = updated;
  localStorage.setItem("iceland_lodgings_data_v11", JSON.stringify(lodgings));
  closeLodgingModal();
  renderLodgings();

  if (supabaseClient && navigator.onLine) {
    await supabaseClient.from('iceland_lodgings').upsert([{
      night: updated.night,
      date_label: updated.date,
      name: updated.name,
      location: updated.location,
      checkin: updated.checkin,
      address: updated.address,
      phone: updated.phone,
      notes: updated.notes,
      booking_url: updated.booking_url,
      updated_at: new Date()
    }]);
  }
}

async function clearAllLodgings() {
  if (confirm("Voulez-vous réinitialiser toutes les fiches d'hébergement à blanc ?")) {
    localStorage.setItem("iceland_lodgings_data_v11", JSON.stringify(BLANK_LODGINGS));
    renderLodgings();

    if (supabaseClient && navigator.onLine) {
      await supabaseClient.from('iceland_lodgings').upsert(BLANK_LODGINGS.map(l => ({
        night: l.night,
        date_label: l.date,
        name: '',
        location: l.location,
        checkin: '',
        address: '',
        phone: '',
        notes: '',
        booking_url: '',
        updated_at: new Date()
      })));
    }
  }
}
renderLodgings();
