// =========================================================================
// TRANSPORT AÉROPORT (arrival = sortie de KEF, departure = retour vers KEF)
// =========================================================================
const TRANSPORT_KEY = "iceland_transport_v1";
function getTransport() { return JSON.parse(localStorage.getItem(TRANSPORT_KEY) || "{}"); }

function renderTransport() {
  const t = getTransport();
  ['arrival', 'departure'].forEach(id => {
    const sel = document.getElementById(`tr-${id}-mode`);
    const inp = document.getElementById(`tr-${id}-notes`);
    if (sel) sel.value = (t[id] && t[id].mode) || '';
    if (inp) inp.value = (t[id] && t[id].notes) || '';
  });
}

async function saveTransport(id) {
  const t = getTransport();
  t[id] = { mode: document.getElementById(`tr-${id}-mode`).value, notes: document.getElementById(`tr-${id}-notes`).value.trim() };
  localStorage.setItem(TRANSPORT_KEY, JSON.stringify(t));
  if (supabaseClient && navigator.onLine) {
    await supabaseClient.from('iceland_transport').upsert([{ id, mode: t[id].mode, notes: t[id].notes, updated_at: new Date() }]);
  }
}

async function syncTransport() {
  const { data, error } = await supabaseClient.from('iceland_transport').select('*');
  if (error || !data || !data.length) return;
  const t = {};
  data.forEach(r => { t[r.id] = { mode: r.mode || '', notes: r.notes || '' }; });
  localStorage.setItem(TRANSPORT_KEY, JSON.stringify(t));
  renderTransport();
}
renderTransport();
