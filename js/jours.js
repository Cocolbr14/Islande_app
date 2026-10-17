// =========================================================================
// LISTE DES ÉTAPES & MENUS DU JOUR
// =========================================================================
let sortableInstances = [];

function renderPlacesList() {
  sortableInstances.forEach(s => s.destroy());
  sortableInstances = [];

  const steps = getSteps();
  const meals = getMeals();
  const container = document.getElementById("places-container");

  container.innerHTML = DAYS_CONFIG.map((dayCfg, dayIdx) => {
    const daySteps = steps.filter(s => s.dateKey === dayCfg.key);
    const dayMeal = meals[dayCfg.key] || { lunch: { title: "", notes: "" }, dinner: { title: "", notes: "" } };

    // Trajet "entre les jours" : dernier arrêt (nuitée) de la veille -> premier arrêt du jour
    let prevLast = null;
    for (let j = dayIdx - 1; j >= 0 && !prevLast; j--) {
      const ps = steps.filter(x => x.dateKey === DAYS_CONFIG[j].key);
      if (ps.length) prevLast = ps[ps.length - 1];
    }
    let approachKm = 0;
    if (prevLast && daySteps.length) {
      approachKm = calculateDistance(prevLast.lat, prevLast.lng, daySteps[0].lat, daySteps[0].lng);
    }
    const approachTag = (prevLast && daySteps.length && approachKm > 0)
      ? `<div class="leg leg-day"><span>⇡ ~${approachKm} km · depuis ${escapeHtml(prevLast.name.replace(/^Nuitée\s*:\s*/, ''))}</span></div>`
      : '';

    let totalDayKm = approachKm;
    for (let i = 0; i < daySteps.length - 1; i++) {
      totalDayKm += calculateDistance(daySteps[i].lat, daySteps[i].lng, daySteps[i+1].lat, daySteps[i+1].lng);
    }

    const hasLunch = dayMeal.lunch && dayMeal.lunch.title;
    const hasDinner = dayMeal.dinner && dayMeal.dinner.title;

    const art = (window.DAY_ART && window.DAY_ART[dayCfg.key]) || { t: dayCfg.fullLabel, e: '', p: '', img: './aurore' };
    const cover = getImgSrc(art.img);

    return `
      <article class="day" id="day-${dayCfg.key}" style="--dc:${dayCfg.color}">
        <header class="day-hero" style="--cover:url('${cover}')">
          <div class="day-top">
            <span class="day-num">Jour <b>${dayIdx + 1}</b></span>
            <span class="day-chips">
              <span class="day-chip">~${totalDayKm} km</span>
              <span class="day-chip" id="badge-day-${dayCfg.key}">${daySteps.length} arrêt(s)</span>
            </span>
          </div>
          <div class="day-ttl">
            <p class="day-date">${dayCfg.fullLabel}</p>
            <h3>${art.t}<br/><em>${art.e}</em></h3>
            <p class="day-pitch">${art.p}</p>
          </div>
        </header>

        <div class="day-body">
          ${approachTag}
          <div class="drop-zone tl" data-date="${dayCfg.key}" id="day-list-${dayCfg.key}">
            ${daySteps.map((s, idx) => {
              let distanceTag = '';
              if (idx > 0) {
                const prev = daySteps[idx - 1];
                const distKm = calculateDistance(prev.lat, prev.lng, s.lat, s.lng);
                distanceTag = `
                  <div class="leg"><span>⇣ ~${distKm} km</span></div>
                `;
              }

              const stepImg = getImgSrc(s.img);

              return `
                ${distanceTag}
                <div class="step-card" data-id="${s.id}">
                  <span class="drag-handle" title="Glisser pour réorganiser">⋮⋮</span>

                  <!-- Miniature cliquable pour Lightbox / Plein écran -->
                  <img src="${stepImg}" alt="${escapeHtml(s.name)}" onclick="openLightbox('${stepImg}', '${escAttr(s.name)}')" class="step-thumb" onerror="handleImgError(this)" title="Agrandir et zoomer" />

                  <div class="step-info">
                    <div class="step-name">${escapeHtml(s.name)}</div>
                    <div class="step-meta">
                      ${s.time ? `<span class="step-time">${escapeHtml(s.time)}</span>` : ''}
                      <span class="step-price">💶 ${escapeHtml(s.price) || 'Gratuit'}</span>
                    </div>
                    ${s.desc ? `<div class="step-desc">${escapeHtml(s.desc)}</div>` : ''}
                  </div>

                  <div class="step-actions">
                    <button onclick="centerOnCoord(${s.lat},${s.lng})" title="Voir sur carte" aria-label="Voir sur la carte">
                      <i data-lucide="eye"></i>
                    </button>
                    <button onclick="removeStep('${s.id}')" title="Retirer" aria-label="Retirer l'étape" class="del">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <p class="drop-hint">Glisser ici pour réorganiser</p>

          <div class="meals">
            <div class="meals-head">
              <span>🍽️ Menus du jour</span>
              <button onclick="openMealModal('${dayCfg.key}')"><i data-lucide="edit-3"></i> Modifier</button>
            </div>

            <div class="meal">
              <span class="meal-ico">🥪</span>
              <div>
                <small class="lunch">Midi</small>
                <p class="${hasLunch ? '' : 'empty'}">${escapeHtml(dayMeal.lunch.title) || 'À définir'}</p>
                ${dayMeal.lunch.notes ? `<em>${escapeHtml(dayMeal.lunch.notes)}</em>` : ''}
              </div>
            </div>

            <div class="meal">
              <span class="meal-ico">🍲</span>
              <div>
                <small class="dinner">Soir</small>
                <p class="${hasDinner ? '' : 'empty'}">${escapeHtml(dayMeal.dinner.title) || 'À définir'}</p>
                ${dayMeal.dinner.notes ? `<em>${escapeHtml(dayMeal.dinner.notes)}</em>` : ''}
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  lucide.createIcons();
  initSortable();
  renderTodayWidget();
}

function initSortable() {
  DAYS_CONFIG.forEach(dayCfg => {
    const el = document.getElementById(`day-list-${dayCfg.key}`);
    if (!el) return;

    const sortable = new Sortable(el, {
      group: 'itineraryDates',
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      handle: '.drag-handle',
      onEnd: async function () {
        const newStepsOrder = [];
        DAYS_CONFIG.forEach(d => {
          const dayListEl = document.getElementById(`day-list-${d.key}`);
          const items = dayListEl.querySelectorAll('.step-card');

          items.forEach(card => {
            const id = card.getAttribute('data-id');
            const existing = getSteps().find(s => s.id === id);
            if (existing) {
              newStepsOrder.push({
                ...existing,
                dateKey: d.key,
                dateLabel: d.fullLabel
              });
            }
          });
        });

        await saveSteps(newStepsOrder);
        renderPlacesList();
        recalculateMap();
      }
    });

    sortableInstances.push(sortable);
  });
}

function toggleAddPlaceForm() {
  document.getElementById("addPlaceBox").classList.toggle("hidden");
}

function saveNewPlace() {
  const name = document.getElementById("newPlaceName").value.trim();
  const time = document.getElementById("newPlaceTime").value.trim();
  const dateKey = document.getElementById("newPlaceDateKey").value;
  const dayCfg = DAYS_CONFIG.find(d => d.key === dateKey) || DAYS_CONFIG[0];
  const price = document.getElementById("newPlacePrice").value.trim() || "Gratuit";
  const lat = parseFloat(document.getElementById("newPlaceLat").value);
  const lng = parseFloat(document.getElementById("newPlaceLng").value);

  if (!name || isNaN(lat) || isNaN(lng)) {
    alert("Nom et coordonnées GPS valides requis.");
    return;
  }

  const steps = getSteps();
  steps.push({
    id: "step_" + Date.now(),
    dateKey: dateKey,
    dateLabel: dayCfg.fullLabel,
    name: name,
    time: time,
    price: price,
    lat: lat,
    lng: lng,
    desc: "Étape ajoutée au trajet.",
    img: "./seljalandsfoss"
  });

  saveSteps(steps);
  document.getElementById("newPlaceName").value = "";
  document.getElementById("newPlaceTime").value = "";
  document.getElementById("newPlacePrice").value = "";
  document.getElementById("newPlaceLat").value = "";
  document.getElementById("newPlaceLng").value = "";
  toggleAddPlaceForm();
  renderPlacesList();
  recalculateMap();
}

async function removeStep(stepId) {
  if (confirm("Supprimer cette étape ?")) {
    let steps = getSteps();
    steps = steps.filter(s => s.id !== stepId);
    saveSteps(steps);
    renderPlacesList();
    recalculateMap();

    if (supabaseClient && navigator.onLine) {
      await supabaseClient.from('iceland_steps').delete().eq('id', stepId);
    }
  }
}

function centerOnCoord(lat, lng) {
  const wait = window.openChapter ? window.openChapter('map-section') : 0;
  setTimeout(() => {
    document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
    map.invalidateSize();
    map.setView([lat, lng], 11);
  }, wait);
}
renderPlacesList();
