// =========================================================================
// WIDGET "AUJOURD'HUI" : montre direct le programme du jour, sans scroller
// =========================================================================
function renderTodayWidget() {
  const section = document.getElementById("today-section");
  const container = document.getElementById("today-widget-container");
  if (!section || !container) return;

  const todayKey = new Date().toLocaleDateString('en-CA'); // format YYYY-MM-DD
  const dayCfg = DAYS_CONFIG.find(d => d.key === todayKey);

  if (!dayCfg) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");
  const steps = getSteps().filter(s => s.dateKey === todayKey);
  const meals = getMeals()[todayKey] || { lunch: { title: "" }, dinner: { title: "" } };

  container.innerHTML = `
    <div class="today-card reveal">
      <span class="cd-label"><span class="pulse-dot"></span> Aujourd'hui</span>
      <h3>${dayCfg.fullLabel.split(' ')[0]} <em>${dayCfg.fullLabel.split(' ').slice(1).join(' ')}</em></h3>
      <div class="today-steps">
        ${steps.length ? steps.map(s => `<div class="today-step"><time>${escapeHtml(s.time) || '—'}</time><span>${escapeHtml(s.name)}</span></div>`).join('') : '<span style="font-size:12px;font-style:italic;color:var(--mist-2)">Pas d\'étape prévue aujourd\'hui.</span>'}
      </div>
      <div class="today-meals">🍽️ Midi : ${escapeHtml(meals.lunch.title) || 'À définir'} • Soir : ${escapeHtml(meals.dinner.title) || 'À définir'}</div>
    </div>
  `;
}
