// =========================================================================
// MODULE VALISES
// =========================================================================
let activeBag = 'bag1';

function getStoredLuggage() {
  return JSON.parse(localStorage.getItem("iceland_luggage_v3") || JSON.stringify({
    bag1: [],
    bag2: []
  }));
}

async function syncLuggageFromSupabase() {
  if (!supabaseClient || !navigator.onLine) return;
  try {
    const { data, error } = await supabaseClient.from('iceland_packing_items').select('*');
    if (!error && data) {
      const grouped = { bag1: [], bag2: [] };
      data.forEach(item => {
        const bId = item.bag_id === 'bag2' ? 'bag2' : 'bag1';
        grouped[bId].push({
          id: item.id,
          name: item.name,
          weight: parseFloat(item.weight) || 0,
          checked: !!item.is_checked
        });
      });
      localStorage.setItem("iceland_luggage_v3", JSON.stringify(grouped));
      renderLuggage();
    }
  } catch (err) {
    console.warn("Échec récupération valise :", err);
  }
}

function saveLuggageLocal(data) {
  localStorage.setItem("iceland_luggage_v3", JSON.stringify(data));
  renderLuggage();
}

function switchBagTab(bagKey) {
  activeBag = bagKey;
  document.getElementById("btnTabBag1").className = (bagKey === 'bag1') ? 'seg-btn on' : 'seg-btn';
  document.getElementById("btnTabBag2").className = (bagKey === 'bag2') ? 'seg-btn on' : 'seg-btn';

  renderLuggage();
}

function renderLuggage() {
  const data = getStoredLuggage();
  const items = data[activeBag] || [];
  const container = document.getElementById("bag-items-list");

  const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
  const checkedCount = items.filter(i => i.checked).length;

  document.getElementById("currentBagLabel").innerText = (activeBag === 'bag1') ? "Valise 1 (Principale)" : "Valise 2 (Secondaire)";
  const weightDisplay = document.getElementById("currentBagWeightDisplay");
  weightDisplay.innerText = `${totalWeight.toFixed(1)} / 23.0 kg`;

  const progressBar = document.getElementById("currentBagProgressBar");
  const remainingDisplay = document.getElementById("currentBagRemaining");
  const pct = Math.min(100, Math.round((totalWeight / 23) * 100));

  progressBar.style.width = pct + "%";

  if (totalWeight > 23) {
    progressBar.className = "gbar over";
    weightDisplay.className = "gauge-weight over";
    remainingDisplay.innerHTML = `<span class="over-msg">⚠️ Surcharge : +${(totalWeight - 23).toFixed(1)} kg au-delà des 23 kg !</span>`;
  } else {
    progressBar.className = totalWeight >= 21 ? "gbar warn" : "gbar";
    weightDisplay.className = totalWeight >= 21 ? "gauge-weight warn" : "gauge-weight";
    remainingDisplay.innerHTML = `<span>Reste disponible : <strong>${(23 - totalWeight).toFixed(1)} kg</strong></span>`;
  }

  document.getElementById("currentBagCheckRatio").innerText = `${checkedCount}/${items.length} coché(s)`;

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-note">Cette valise est vide. Ajoute tes affaires librement ci-dessous.</div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="check-row ${item.checked ? 'done' : ''}">
      <label class="check-main">
        <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleBagItemCheck('${item.id}')" />
        <span class="check-name">${escapeHtml(item.name)}</span>
      </label>
      <div class="check-side">
        <span class="kg-tag">${parseFloat(item.weight).toFixed(1)} kg</span>
        <button onclick="removeBagItem('${item.id}')" title="Supprimer" aria-label="Supprimer" class="del">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

async function addBagItem() {
  const nameInput = document.getElementById("newItemName");
  const weightInput = document.getElementById("newItemWeight");
  const name = nameInput.value.trim();
  const weight = parseFloat(weightInput.value) || 0;

  if (!name) return;

  const newItem = {
    id: "item_" + Date.now(),
    bag_id: activeBag,
    name: name,
    weight: weight,
    checked: false
  };

  const data = getStoredLuggage();
  data[activeBag].push(newItem);
  saveLuggageLocal(data);

  nameInput.value = "";
  weightInput.value = "";

  if (supabaseClient && navigator.onLine) {
    await supabaseClient.from('iceland_packing_items').upsert([{
      id: newItem.id,
      bag_id: activeBag,
      name: newItem.name,
      weight: newItem.weight,
      is_checked: false,
      updated_at: new Date()
    }]);
  }
}

async function toggleBagItemCheck(itemId) {
  const data = getStoredLuggage();
  const item = data[activeBag].find(i => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    saveLuggageLocal(data);

    if (supabaseClient && navigator.onLine) {
      await supabaseClient.from('iceland_packing_items').update({
        is_checked: item.checked,
        updated_at: new Date()
      }).eq('id', itemId);
    }
  }
}

async function removeBagItem(itemId) {
  const data = getStoredLuggage();
  data[activeBag] = data[activeBag].filter(i => i.id !== itemId);
  saveLuggageLocal(data);

  if (supabaseClient && navigator.onLine) {
    await supabaseClient.from('iceland_packing_items').delete().eq('id', itemId);
  }
}

async function clearCurrentBag() {
  if (confirm(`Voulez-vous vider tous les éléments de la ${activeBag === 'bag1' ? 'Valise 1' : 'Valise 2'} ?`)) {
    const data = getStoredLuggage();
    const deletedIds = (data[activeBag] || []).map(i => i.id);
    data[activeBag] = [];
    saveLuggageLocal(data);

    if (supabaseClient && navigator.onLine && deletedIds.length > 0) {
      await supabaseClient.from('iceland_packing_items').delete().in('id', deletedIds);
    }
  }
}

document.getElementById("newItemName").addEventListener("keyup", function(e) {
  if (e.key === "Enter") addBagItem();
});
document.getElementById("newItemWeight").addEventListener("keyup", function(e) {
  if (e.key === "Enter") addBagItem();
});

renderLuggage();

// =========================================================================
// MODULE DOCUMENTS À NE PAS OUBLIER (liste locale, pas de synchro cloud :
// chacun a ses propres documents, pas besoin de les partager)
// =========================================================================
const DEFAULT_DOCS = ["Passeports", "Permis de conduire", "Carte bancaire", "Réservation voiture", "Réservations hôtels / vols (PDF)", "Assurance voyage", "Chargeurs & adaptateur prise"];

function getDocsChecklist() {
  const stored = localStorage.getItem("iceland_docs_checklist_v1");
  if (stored) return JSON.parse(stored);
  return DEFAULT_DOCS.map((name, i) => ({ id: "doc_" + i, name, checked: false }));
}

function saveDocsChecklist(list) {
  localStorage.setItem("iceland_docs_checklist_v1", JSON.stringify(list));
  renderDocsChecklist();
}

function renderDocsChecklist() {
  const list = getDocsChecklist();
  const container = document.getElementById("docs-checklist-list");
  if (!container) return;
  const checkedCount = list.filter(d => d.checked).length;
  document.getElementById("docsCheckRatio").innerText = `${checkedCount}/${list.length}`;
  container.innerHTML = list.map(d => `
    <label class="check-row ${d.checked ? 'done' : ''}">
      <span class="check-main">
        <input type="checkbox" ${d.checked ? 'checked' : ''} onchange="toggleDocItem('${d.id}')" />
        <span class="check-name">${escapeHtml(d.name)}</span>
      </span>
      <button onclick="removeDocItem(event, '${d.id}')" title="Supprimer" aria-label="Supprimer" class="del">
        <i data-lucide="x"></i>
      </button>
    </label>
  `).join('');
  lucide.createIcons();
}

function toggleDocItem(id) {
  const list = getDocsChecklist();
  const item = list.find(d => d.id === id);
  if (item) { item.checked = !item.checked; saveDocsChecklist(list); }
}

function removeDocItem(event, id) {
  event.preventDefault();
  saveDocsChecklist(getDocsChecklist().filter(d => d.id !== id));
}

function addDocItem() {
  const input = document.getElementById("newDocName");
  const name = input.value.trim();
  if (!name) return;
  const list = getDocsChecklist();
  list.push({ id: "doc_" + Date.now(), name, checked: false });
  saveDocsChecklist(list);
  input.value = "";
}

document.getElementById("newDocName").addEventListener("keyup", function(e) {
  if (e.key === "Enter") addDocItem();
});

renderDocsChecklist();

// =========================================================================
// SAUVEGARDE : EXPORT JSON & IMPRESSION DU PLANNING
// =========================================================================
function exportAllData() {
  const data = {
    exportedAt: new Date().toISOString(),
    steps: getSteps(),
    lodgings: getLodgings(),
    meals: getMeals(),
    luggage: getStoredLuggage(),
    documents: getDocsChecklist()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `islande-2027-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function printPlan() {
  window.print();
}
