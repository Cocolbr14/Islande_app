// =========================================================================
// MODULE MENUS
// =========================================================================
const DEFAULT_MEALS = {
  "2027-01-26": {
    lunch: { title: "Sandwichs sur le pouce", notes: "Achetés après le vol KEF / courses Selfoss" },
    dinner: { title: "Pâtes réconfortantes au logement", notes: "Pâtes, sauce tomate, fromage râpé, Skyr" }
  },
  "2027-01-27": {
    lunch: { title: "Pique-nique Skógafoss", notes: "Wraps thon/maïs ou sandwichs préparés le matin" },
    dinner: { title: "Restaurant / Burgers à Vík", notes: "Smidjan Brugghus ou Black Crust Pizza" }
  },
  "2027-01-28": {
    lunch: { title: "Encas chaud thermos / Fjaðrárgljúfur", notes: "Nouilles chaudes en thermos + barres d'énergie" },
    dinner: { title: "Poêlée au logement (Skaftafell)", notes: "Riz, saumon poêlé, légumes croquants" }
  },
  "2027-01-29": {
    lunch: { title: "Soupe chaude au Café Jökulsárlón", notes: "Soupe de homard / sandwich agneau face aux icebergs" },
    dinner: { title: "Dîner au chaud face aux glaciers", notes: "Plat mijoté chaud / pâtes carbonara maison" }
  },
  "2027-01-30": {
    lunch: { title: "Hot-dogs islandais (Pylsur)", notes: "Pris en station N1 après la grotte de glace" },
    dinner: { title: "Dîner d'anniversaire festif à Hella 🎂", notes: "Restaurant local ou bon repas spécial cottage" }
  },
  "2027-01-31": {
    lunch: { title: "Déjeuner Geysir Center", notes: "Buffet chaud ou soupe traditionnelle islandaise" },
    dinner: { title: "Dîner après les bains chauds Secret Lagoon", notes: "Friðheimar (soupe de tomates) ou cuisine logement" }
  },
  "2027-02-01": {
    lunch: { title: "Déjeuner street-food à Reykjavík", notes: "Célèbres hot-dogs Bæjarins Beztu ou resto du port" },
    dinner: { title: "Dernier dîner à l'aéroport Keflavík", notes: "Resto à Keflavík après avoir rendu le SUV 4x4" }
  }
};

function getMeals() {
  return JSON.parse(localStorage.getItem("iceland_meals_data_v1") || JSON.stringify(DEFAULT_MEALS));
}

function openMealModal(dateKey) {
  const meals = getMeals();
  const m = meals[dateKey] || { lunch: { title: "", notes: "" }, dinner: { title: "", notes: "" } };
  const cfg = DAYS_CONFIG.find(d => d.key === dateKey);

  document.getElementById("editMealDateKey").value = dateKey;
  document.getElementById("modalMealTitle").innerText = `Menus : ${cfg ? cfg.fullLabel : dateKey}`;
  document.getElementById("editLunchTitle").value = m.lunch ? m.lunch.title : "";
  document.getElementById("editLunchNotes").value = m.lunch ? m.lunch.notes : "";
  document.getElementById("editDinnerTitle").value = m.dinner ? m.dinner.title : "";
  document.getElementById("editDinnerNotes").value = m.dinner ? m.dinner.notes : "";

  document.getElementById("mealModal").classList.remove("hidden");
}

function closeMealModal() {
  document.getElementById("mealModal").classList.add("hidden");
}

async function saveMealData() {
  const dateKey = document.getElementById("editMealDateKey").value;
  const meals = getMeals();
  const cfg = DAYS_CONFIG.find(d => d.key === dateKey);

  const lunchTitle = document.getElementById("editLunchTitle").value.trim();
  const lunchNotes = document.getElementById("editLunchNotes").value.trim();
  const dinnerTitle = document.getElementById("editDinnerTitle").value.trim();
  const dinnerNotes = document.getElementById("editDinnerNotes").value.trim();

  meals[dateKey] = {
    lunch: { title: lunchTitle, notes: lunchNotes },
    dinner: { title: dinnerTitle, notes: dinnerNotes }
  };

  localStorage.setItem("iceland_meals_data_v1", JSON.stringify(meals));
  closeMealModal();
  renderPlacesList();

  if (supabaseClient && navigator.onLine) {
    await supabaseClient.from('iceland_meals').upsert([{
      date_key: dateKey,
      date_label: cfg ? cfg.fullLabel : dateKey,
      lunch_title: lunchTitle,
      lunch_notes: lunchNotes,
      dinner_title: dinnerTitle,
      dinner_notes: dinnerNotes,
      updated_at: new Date()
    }]);
  }
}
