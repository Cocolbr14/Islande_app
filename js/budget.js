// =========================================================================
// MODULE BUDGET : dépenses du voyage (avant + sur place)
// Stockage local à l'appareil (localStorage), pas de synchro cloud.
// Chaque ligne : { id, name, amount, cat, phase, booked, paid }
//   phase  : 'avant' (à réserver / payer avant le départ) ou 'place' (dépense sur place)
//   statut : paid => payé ; booked sans paid => réservé à régler ; sinon => reste à réserver
// =========================================================================
const BUDGET_KEY = "iceland_budget_v1";
const BUDGET_PEOPLE = 2;

const BUDGET_CATS = {
  transport:   { label: "Transport",    emoji: "✈️", color: "#7cc4ff" },
  hebergement: { label: "Hébergement",  emoji: "🌙", color: "#a290ff" },
  activite:    { label: "Activités",    emoji: "🎟️", color: "#ff7ab0" },
  voiture:     { label: "Voiture",      emoji: "🚗", color: "#ffcf6b" },
  nourriture:  { label: "Nourriture",   emoji: "🍽️", color: "#ff9a5c" },
  autre:       { label: "Autre",        emoji: "🧾", color: "#b4c4da" }
};

// Tableau d'origine (repris de ton tableur)
const BUDGET_DEFAULTS = [
  { id: "b01", name: "Vol",                 amount: 284.48, cat: "transport",   phase: "avant", booked: true,  paid: true  },
  { id: "b02", name: "Grotte Vatnajökull",  amount: 275,    cat: "activite",    phase: "avant", booked: true,  paid: false },
  { id: "b03", name: "Secret Lagoon",       amount: 62,     cat: "activite",    phase: "avant", booked: true,  paid: true  },
  { id: "b04", name: "Nuit 1 - Hella",      amount: 81,     cat: "hebergement", phase: "avant", booked: false, paid: false },
  { id: "b05", name: "Nuit 2 - Vik",        amount: 123,    cat: "hebergement", phase: "avant", booked: false, paid: false },
  { id: "b06", name: "Nuit 3 - Skaftafell", amount: 224,    cat: "hebergement", phase: "avant", booked: false, paid: false },
  { id: "b07", name: "Nuit 4 - Jökulsárlón",amount: 145,    cat: "hebergement", phase: "avant", booked: false, paid: false },
  { id: "b08", name: "Nuit 5 - Hella",      amount: 81,     cat: "hebergement", phase: "avant", booked: false, paid: false },
  { id: "b09", name: "Nuit 6 - Flúðir",     amount: 146,    cat: "hebergement", phase: "avant", booked: false, paid: false },
  { id: "b10", name: "Nuit 7 - Aéroport",   amount: 0,      cat: "hebergement", phase: "avant", booked: false, paid: false },
  { id: "b11", name: "Location voiture",    amount: 850,    cat: "voiture",     phase: "avant", booked: false, paid: false },
  { id: "b12", name: "Bus vers Paris",      amount: null,   cat: "transport",   phase: "avant", booked: false, paid: false },
  { id: "b13", name: "Nourriture valise",   amount: null,   cat: "nourriture",  phase: "avant", booked: false, paid: false },
  { id: "b14", name: "Nourriture sur place",amount: null,   cat: "nourriture",  phase: "place", booked: false, paid: false },
  { id: "b15", name: "Essence",             amount: null,   cat: "voiture",     phase: "place", booked: false, paid: false }
];

let budgetFilter = "all";

function getBudget() {
  try {
    const raw = JSON.parse(localStorage.getItem(BUDGET_KEY));
    if (Array.isArray(raw)) return raw;
  } catch (e) {}
  return BUDGET_DEFAULTS.map(x => ({ ...x }));
}
function saveBudget(list) {
  try { localStorage.setItem(BUDGET_KEY, JSON.stringify(list)); } catch (e) {}
}

const budgetEur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n || 0);
const budgetNum = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) && n >= 0 ? n : null; };
const budgetPct = (part, total) => (total > 0 ? (part / total) * 100 : 0);

// ---------- Calculs ----------
function budgetTotals(list) {
  const t = { total: 0, paid: 0, booked: 0, todo: 0, missing: 0, avant: 0, place: 0, cats: {} };
  list.forEach(i => {
    const a = Number(i.amount) || 0;
    if (i.amount === null || i.amount === undefined || i.amount === "") t.missing++;
    t.total += a;
    if (i.paid) t.paid += a; else if (i.booked) t.booked += a; else t.todo += a;
    t[i.phase === "place" ? "place" : "avant"] += a;
    t.cats[i.cat] = (t.cats[i.cat] || 0) + a;
  });
  return t;
}

// ---------- Affichage : synthèse + camembert ----------
function renderBudgetSummary(list) {
  const t = budgetTotals(list);
  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  const pp = (n) => budgetEur(n / BUDGET_PEOPLE) + " / pers.";

  set("bdTotal", budgetEur(t.total));
  set("bdPerPerson", budgetEur(t.total / BUDGET_PEOPLE));
  set("bdPaid", budgetEur(t.paid));       set("bdPaidPP", pp(t.paid));
  set("bdBooked", budgetEur(t.booked));   set("bdBookedPP", pp(t.booked));
  set("bdTodo", budgetEur(t.todo));       set("bdTodoPP", pp(t.todo));
  set("bdPhaseAvant", budgetEur(t.avant));
  set("bdPhasePlace", budgetEur(t.place));
  set("bdDonutTotal", budgetEur(t.total));

  const w = (id, v) => { const el = document.getElementById(id); if (el) el.style.width = v + "%"; };
  w("bdStackPaid", budgetPct(t.paid, t.total));
  w("bdStackBooked", budgetPct(t.booked, t.total));
  w("bdStackTodo", budgetPct(t.todo, t.total));

  const miss = document.getElementById("bdMissing");
  if (miss) {
    miss.classList.toggle("hidden", t.missing === 0);
    miss.textContent = t.missing === 1 ? "1 ligne sans montant : le total est incomplet."
                                       : `${t.missing} lignes sans montant : le total est incomplet.`;
  }

  // Camembert (conic-gradient) + légende
  const entries = Object.keys(BUDGET_CATS).map(k => ({ k, v: t.cats[k] || 0 })).filter(e => e.v > 0).sort((a, b) => b.v - a.v);
  const donut = document.getElementById("bdDonut");
  if (donut) {
    let acc = 0;
    const stops = entries.map(e => {
      const from = acc; acc += budgetPct(e.v, t.total);
      return `${BUDGET_CATS[e.k].color} ${from}% ${acc}%`;
    });
    donut.style.setProperty("--bd-conic", stops.length ? `conic-gradient(${stops.join(",")})` : "rgba(255,255,255,.08)");
  }
  const legend = document.getElementById("bdCatLegend");
  if (legend) {
    legend.innerHTML = entries.length ? entries.map(e => {
      const c = BUDGET_CATS[e.k];
      return `<div class="bd-leg"><i style="background:${c.color}"></i><span>${c.emoji} ${c.label}</span><b>${budgetEur(e.v)}</b><em>${Math.round(budgetPct(e.v, t.total))}%</em></div>`;
    }).join("") : `<p class="bd-note">Aucune dépense pour l'instant.</p>`;
  }
}

// ---------- Affichage : liste ----------
function budgetRowHtml(i) {
  const c = BUDGET_CATS[i.cat] || BUDGET_CATS.autre;
  const isPlace = i.phase === "place";
  const st = i.paid ? "st-paid" : (i.booked ? "st-booked" : "st-todo");
  const amount = (i.amount === null || i.amount === undefined) ? "" : i.amount;
  const pills = isPlace
    ? `<button class="bd-pill ${i.paid ? "on paid" : ""}" aria-pressed="${!!i.paid}" onclick="budgetToggle('${i.id}','paid')">${i.paid ? "✓ " : ""}Dépensé</button>`
    : `<button class="bd-pill ${i.booked ? "on booked" : ""}" aria-pressed="${!!i.booked}" onclick="budgetToggle('${i.id}','booked')">${i.booked ? "✓ " : ""}Réservé</button>
       <button class="bd-pill ${i.paid ? "on paid" : ""}" aria-pressed="${!!i.paid}" onclick="budgetToggle('${i.id}','paid')">${i.paid ? "✓ " : ""}Payé</button>`;
  return `
    <div class="bd-row ${st}">
      <button class="bd-ico" style="--c:${c.color}" onclick="budgetCycleCat('${i.id}')" title="Changer la catégorie" aria-label="Catégorie : ${c.label}">${c.emoji}</button>
      <div class="bd-main">
        <input class="bd-name" type="text" value="${escapeHtml(i.name)}" onchange="budgetSetName('${i.id}', this.value)" aria-label="Nom de la dépense" />
        <button class="bd-tag" onclick="budgetCyclePhase('${i.id}')" title="Basculer avant / sur place">${isPlace ? "📍 Sur place" : "🧳 Avant"} · ${c.label}</button>
      </div>
      <label class="bd-price">
        <input type="number" step="0.01" min="0" inputmode="decimal" value="${amount}" placeholder="—" oninput="budgetSetAmount('${i.id}', this.value)" aria-label="Montant en euros" />
        <span>€</span>
      </label>
      <div class="bd-actions">
        <div class="bd-pills">${pills}</div>
        <button class="btn-quiet danger bd-del" onclick="budgetRemove('${i.id}')" aria-label="Supprimer"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`;
}

function renderBudgetList(list) {
  const el = document.getElementById("bdList");
  if (!el) return;
  const groups = [
    { key: "avant", title: "🧳 Avant le voyage" },
    { key: "place", title: "📍 Sur place" }
  ].filter(g => budgetFilter === "all" || budgetFilter === g.key);

  el.innerHTML = groups.map(g => {
    const rows = list.filter(i => (i.phase === "place" ? "place" : "avant") === g.key);
    const sub = rows.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    return `
      <div class="bd-group">
        <div class="bd-group-head"><span>${g.title}</span><b>${budgetEur(sub)}</b></div>
        ${rows.length ? rows.map(budgetRowHtml).join("") : `<p class="bd-note">Rien ici pour l'instant.</p>`}
      </div>`;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

function renderBudget() {
  const list = getBudget();
  renderBudgetSummary(list);
  renderBudgetList(list);
  ["All", "Avant", "Place"].forEach(n =>
    document.getElementById("bdFilter" + n)?.classList.toggle("on", n.toLowerCase() === budgetFilter));
}

// ---------- Actions (appelées par les boutons de la page) ----------
function budgetUpdate(id, fn, rerenderList = true) {
  const list = getBudget();
  const item = list.find(i => i.id === id);
  if (!item) return;
  fn(item);
  saveBudget(list);
  renderBudgetSummary(list);
  if (rerenderList) renderBudgetList(list);
}

function budgetToggle(id, field) {
  budgetUpdate(id, (i) => {
    if (i.phase === "place") { i.paid = !i.paid; i.booked = i.paid; return; }
    if (field === "booked") { i.booked = !i.booked; if (!i.booked) i.paid = false; }
    else { i.paid = !i.paid; if (i.paid) i.booked = true; }
  });
}
// on ne redessine pas la liste pendant la frappe (sinon le clavier se ferme)
function budgetSetAmount(id, value) { budgetUpdate(id, (i) => { i.amount = value === "" ? null : budgetNum(value); }, false); }
function budgetSetName(id, value) { budgetUpdate(id, (i) => { if (value.trim()) i.name = value.trim(); }); }
function budgetCycleCat(id) {
  const keys = Object.keys(BUDGET_CATS);
  budgetUpdate(id, (i) => { i.cat = keys[(keys.indexOf(i.cat) + 1) % keys.length]; });
}
function budgetCyclePhase(id) {
  budgetUpdate(id, (i) => {
    i.phase = i.phase === "place" ? "avant" : "place";
    if (i.phase === "place") i.booked = i.paid;
  });
}
function budgetRemove(id) {
  const item = getBudget().find(i => i.id === id);
  if (!item || !confirm(`Supprimer « ${item.name} » ?`)) return;
  const list = getBudget().filter(i => i.id !== id);
  saveBudget(list);
  renderBudgetSummary(list);
  renderBudgetList(list);
}
function budgetAdd() {
  const nameEl = document.getElementById("bdNewName");
  const name = nameEl.value.trim();
  if (!name) { nameEl.focus(); return; }
  const list = getBudget();
  list.push({
    id: "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name,
    amount: budgetNum(document.getElementById("bdNewAmount").value),
    cat: document.getElementById("bdNewCat").value,
    phase: document.getElementById("bdNewPhase").value,
    booked: false, paid: false
  });
  saveBudget(list);
  nameEl.value = ""; document.getElementById("bdNewAmount").value = "";
  renderBudgetSummary(list);
  renderBudgetList(list);
}
function budgetSetFilter(f) { budgetFilter = f; renderBudget(); }
function budgetReset() {
  if (!confirm("Remettre le tableau d'origine ? Tes modifications seront perdues.")) return;
  saveBudget(BUDGET_DEFAULTS.map(x => ({ ...x })));
  renderBudget();
}

// Menu des catégories du formulaire d'ajout
const bdCatSelect = document.getElementById("bdNewCat");
if (bdCatSelect) bdCatSelect.innerHTML = Object.entries(BUDGET_CATS).map(([k, c]) => `<option value="${k}">${c.emoji} ${c.label}</option>`).join("");

renderBudget();
