// =========================================================================
// MÉTÉO 10 JOURS
// =========================================================================
function getWeatherIcon(code) {
  if ([0].includes(code)) return "☀️";
  if ([1, 2].includes(code)) return "🌤️️";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "⛅";
}

async function fetchWeather() {
  const select = document.getElementById("weatherLocationSelect");
  const [lat, lon] = select.value.split(",");
  const loader = document.getElementById("weatherLoader");
  const grid = document.getElementById("weatherForecastGrid");

  loader.classList.remove("hidden");
  grid.classList.add("hidden");

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max,windgusts_10m_max&timezone=Atlantic%2FReykjavik&forecast_days=10`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.daily) {
      const days = data.daily.time;
      const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Atlantic/Reykjavik' });

      const kinds = days.map((d, i) => getWeatherKind(data.daily.weathercode[i]));
      const snowDays = kinds.filter(k => k === 'snow').length;
      const rainDays = kinds.filter(k => k === 'rain' || k === 'storm').length;
      const sunDays = kinds.filter(k => k === 'sun' || k === 'partly').length;
      const maxGust = Math.max(...data.daily.windgusts_10m_max.map(g => Math.round(g)));
      const coldest = Math.round(Math.min(...data.daily.temperature_2m_min));
      const summaryEl = document.getElementById("weatherSummary");
      if (summaryEl) {
        summaryEl.innerHTML = `Dix jours devant nous : <b>${snowDays}</b> de neige, <b>${rainDays}</b> de pluie, <b>${sunDays}</b> de ciel ouvert. Le thermomètre plonge à <b>${coldest}°</b>, le vent pointe à <b>${maxGust} km/h</b>${maxGust >= 50 ? ' — <span class="warn">tenez bien les portières.</span>' : ' — rien d\'effrayant.'}`;
      }

      grid.innerHTML = days.map((dateStr, i) => {
        const date = new Date(dateStr);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayNum = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
        const tMin = Math.round(data.daily.temperature_2m_min[i]);
        const tMax = Math.round(data.daily.temperature_2m_max[i]);
        const gusts = Math.round(data.daily.windgusts_10m_max[i]);
        const icon = getWeatherIcon(data.daily.weathercode[i]);
        const windAlert = gusts >= 50;

        const isToday = (dateStr === todayIso);
        const gustPct = Math.max(6, Math.min(100, Math.round(gusts / 80 * 100)));

        return `
          <div class="wx-card ${isToday ? 'is-today' : ''}" data-kind="${kinds[i]}" role="img" aria-label="${dayName} ${dayNum} ${icon} ${tMax}° / ${tMin}°, rafales ${gusts} km/h">
            ${isToday ? `<span class="wx-today-tag">Aujourd'hui</span>` : ''}
            <div class="wx-day">${dayName}</div>
            <div class="wx-date">${dayNum}</div>
            <div class="wx-art-wrap">${weatherArt(kinds[i])}</div>
            <div class="wx-temp">${tMax}°<small>${tMin}°</small></div>
            <div class="wx-wind ${windAlert ? 'alert' : ''}">
              <span class="wnd">💨</span> ${gusts} km/h
              <div class="gust-bar"><i style="--g:${gustPct}%"></i></div>
            </div>
          </div>
        `;
      }).join('');

      loader.classList.add("hidden");
      grid.classList.remove("hidden");
      const todayCard = grid.querySelector('.is-today');
      if (todayCard) grid.scrollTo({ left: Math.max(0, todayCard.offsetLeft - 16), behavior: 'auto' });
    }
  } catch (e) {
    loader.innerHTML = `<span style="color:#ff6b7d;font-size:12px">Erreur de chargement météo.</span>`;
  }
}
