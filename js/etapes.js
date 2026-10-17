// =========================================================================
// CONFIGURATION DES ÉTAPES
// =========================================================================
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 1.25);
}

const DAYS_CONFIG = [
  { key: "2027-01-26", shortLabel: "26 Jan", fullLabel: "Mardi 26 Janvier", color: "#f59e0b" },
  { key: "2027-01-27", shortLabel: "27 Jan", fullLabel: "Mercredi 27 Janvier", color: "#06b6d4" },
  { key: "2027-01-28", shortLabel: "28 Jan", fullLabel: "Jeudi 28 Janvier", color: "#3b82f6" },
  { key: "2027-01-29", shortLabel: "29 Jan", fullLabel: "Vendredi 29 Janvier", color: "#8b5cf6" },
  { key: "2027-01-30", shortLabel: "30 Jan", fullLabel: "Samedi 30 Janvier", color: "#ec4899" },
  { key: "2027-01-31", shortLabel: "31 Jan", fullLabel: "Dimanche 31 Janvier", color: "#10b981" },
  { key: "2027-02-01", shortLabel: "01 Fév", fullLabel: "Lundi 01 Février", color: "#f43f5e" }
];

const INITIAL_STEPS = [
  { id:"j1-1", dateKey:"2027-01-26", dateLabel:"Mardi 26 Janvier", name:"Aéroport Keflavík (KEF)", time:"07h50 - 09h30", lat:63.9850, lng:-22.6056, price:"Inclus vol", desc:"Atterrissage vol EJU4583, bagages & prise en charge du SUV 4x4.", img:"./keflavik-airport" },
  { id:"j1-2", dateKey:"2027-01-26", dateLabel:"Mardi 26 Janvier", name:"Pont entre 2 continents", time:"10h15 - 10h50", lat:63.8684, lng:-22.6755, price:"Gratuit (Parking & Accès)", desc:"Passerelle au-dessus du rift tectonique eurasien / nord-américain.", img:"./pont-continents" },
  { id:"j1-3", dateKey:"2027-01-26", dateLabel:"Mardi 26 Janvier", name:"Zone de Gunnuhver", time:"11h10 - 11h50", lat:63.8193, lng:-22.6846, price:"Gratuit (Parking & Accès)", desc:"Immenses fumerolles géothermiques et bassins de boue bouillonnante.", img:"./gunnuhver" },
  { id:"j1-4", dateKey:"2027-01-26", dateLabel:"Mardi 26 Janvier", name:"Tunnel Raufarhólshellir", time:"13h30 - 15h00", lat:63.9404, lng:-21.3965, price:"Visite guidée : ~132 € (2 pers)", desc:"Exploration du tunnel de lave volcanique millénaire.", img:"./raufarholshellir" },
  { id:"j1-5", dateKey:"2027-01-26", dateLabel:"Mardi 26 Janvier", name:"Nuitée : Selfoss (Bónus)", time:"16h00 - Nuit", lat:63.9377, lng:-20.9995, price:"Parking gratuit", desc:"Ravitaillement au supermarché Bónus (provisions 3 jours) & repos Nuit 1.", img:"./selfoss" },

  { id:"j2-1", dateKey:"2027-01-27", dateLabel:"Mercredi 27 Janvier", name:"Seljalandsfoss", time:"10h00 - 11h15", lat:63.6156, lng:-19.9886, price:"Parking : 6,00 € (900 ISK)", desc:"Chute de 60m (crampons fortement conseillés).", img:"./seljalandsfoss" },
  { id:"j2-2", dateKey:"2027-01-27", dateLabel:"Mercredi 27 Janvier", name:"Gljúfrabúi", time:"11h15 - 12h00", lat:63.6208, lng:-19.9865, price:"Inclus ticket Seljalandsfoss", desc:"Cascade secrète encaissée dans sa gorge rocheuse à 500m.", img:"./gljufrabui" },
  { id:"j2-3", dateKey:"2027-01-27", dateLabel:"Mercredi 27 Janvier", name:"Skógafoss", time:"12h45 - 14h00", lat:63.5321, lng:-19.5114, price:"Gratuit (Parking & Accès)", desc:"Mur d'eau titanesque de 60m et escalier panoramique.", img:"./skogafoss" },
  { id:"j2-4", dateKey:"2027-01-27", dateLabel:"Mercredi 27 Janvier", name:"Dyrhólaey", time:"14h30 - 15h15", lat:63.4022, lng:-19.1303, price:"Gratuit (Parking & Accès)", desc:"Arche marine et falaises basaltiques battues par la houle.", img:"./dyrholaey" },
  { id:"j2-5", dateKey:"2027-01-27", dateLabel:"Mercredi 27 Janvier", name:"Plage de Reynisfjara", time:"15h30 - 16h30", lat:63.4042, lng:-19.0494, price:"Parking : 6,70 € (1 000 ISK)", desc:"Colonnes de basalte au crépuscule (attention aux vagues traîtresses).", img:"./reynisfjara" },
  { id:"j2-6", dateKey:"2027-01-27", dateLabel:"Mercredi 27 Janvier", name:"Nuitée : Vík í Mýrdal", time:"17h00 - Nuit", lat:63.4186, lng:-19.0062, price:"Selon hébergement", desc:"Check-in hôtel, station N1 & restaurant au village de Vík.", img:"./vik" },

  { id:"j3-1", dateKey:"2027-01-28", dateLabel:"Jeudi 28 Janvier", name:"Grotte de Yoda (Gígjagjá)", time:"10h00 - 10h45", lat:63.4143, lng:-18.8475, price:"Gratuit (Parking & Accès)", desc:"Ouverture naturelle dans la roche volcanique de Hjörleifshöfði.", img:"./yoda-cave" },
  { id:"j3-2", dateKey:"2027-01-28", dateLabel:"Jeudi 28 Janvier", name:"Champ de lave d'Eldhraun", time:"11h30 - 12h00", lat:63.6766, lng:-18.1408, price:"Gratuit (Arrêts Route 1)", desc:"Océan de lave pétrifiée tapissé de mousse sous le givre.", img:"./eldhraun" },
  { id:"j3-3", dateKey:"2027-01-28", dateLabel:"Jeudi 28 Janvier", name:"Canyon Fjaðrárgljúfur", time:"12h30 - 14h00", lat:63.7713, lng:-18.1718, price:"Parking : 6,70 € (1 000 ISK)", desc:"Canyon serpentant vertigineux sur 2 km.", img:"./fjadrargljufur" },
  { id:"j3-4", dateKey:"2027-01-28", dateLabel:"Jeudi 28 Janvier", name:"Skaftafell & Svartifoss", time:"15h00 - 16h45", lat:64.0275, lng:-16.9753, price:"Parking : 6,70 € (1 000 ISK)", desc:"Cascade entourée d'orgues noirs au pied de la calotte glaciaire.", img:"./svartifoss" },
  { id:"j3-5", dateKey:"2027-01-28", dateLabel:"Jeudi 28 Janvier", name:"Nuitée : Skaftafell / Hof", time:"17h15 - Nuit", lat:63.9878, lng:-16.8962, price:"Selon hébergement", desc:"Nuitée au cœur du parc national Vatnajökull.", img:"./skaftafell" },

  { id:"j4-1", dateKey:"2027-01-29", dateLabel:"Vendredi 29 Janvier", name:"Diamond Beach", time:"10h00 - 11h30", lat:64.0443, lng:-16.1777, price:"Inclus ticket Jökulsárlón", desc:"Blocs de glace pure scintillants sur la plage de sable noir.", img:"./diamond-beach" },
  { id:"j4-2", dateKey:"2027-01-29", dateLabel:"Vendredi 29 Janvier", name:"Lagune de Jökulsárlón", time:"11h45 - 14h30", lat:64.0483, lng:-16.1795, price:"Parking : ~7,50 € (1 100 ISK)", desc:"Icebergs bleus géants dérivant vers l'océan et phoques sauvages.", img:"./jokulsarlon" },
  { id:"j4-3", dateKey:"2027-01-29", dateLabel:"Vendredi 29 Janvier", name:"Fjallsárlón (Lagune secrète)", time:"15h00 - 16h15", lat:64.0150, lng:-16.3680, price:"Gratuit (Parking & Accès)", desc:"Ambiance intimiste face à l'imposant front de glace de Fjallsjökull.", img:"./fjallsarlon" },
  { id:"j4-4", dateKey:"2027-01-29", dateLabel:"Vendredi 29 Janvier", name:"Nuitée : Jökulsárlón / Glaciers", time:"17h00 - Nuit", lat:64.0483, lng:-16.1795, price:"Selon hébergement", desc:"Nuitée sur place. Vous êtes à 10 min du point de rendez-vous de la grotte.", img:"./jokulsarlon" },

  { id:"j5-1", dateKey:"2027-01-30", dateLabel:"Samedi 30 Janvier", name:"Grotte de glace Vatnajökull 🎂", time:"09h30 - 13h30", lat:64.0483, lng:-16.1795, price:"Activité : ~270-330 € (2 pers)", desc:"Expédition Super Jeep 4x4 & marche sous la cathédrale de glace bleue.", img:"./ice-cave" },
  { id:"j5-2", dateKey:"2027-01-30", dateLabel:"Samedi 30 Janvier", name:"Route 1 : Repli Ouest", time:"14h00 - 17h30", lat:63.7915, lng:-18.0514, price:"Carburant N1", desc:"240 km de route retour sécurisée vers l'Ouest pour anticiper la météo.", img:"./eldhraun" },
  { id:"j5-3", dateKey:"2027-01-30", dateLabel:"Samedi 30 Janvier", name:"Nuitée : Hella / Hvolsvöllur", time:"18h00 - Nuit", lat:63.8344, lng:-20.4011, price:"Selon hébergement", desc:"Position centrale idéale pour attaquer le Cercle d'Or le lendemain.", img:"./aurore" },

  { id:"j6-1", dateKey:"2027-01-31", dateLabel:"Dimanche 31 Janvier", name:"Þingvellir (Thingvellir)", time:"10h00 - 12h00", lat:64.2559, lng:-21.1298, price:"Parking : 6,70 € (1 000 ISK)", desc:"Faille d'Almannagjá, lac gelé et parlement historique des Vikings.", img:"./thingvellir" },
  { id:"j6-2", dateKey:"2027-01-31", dateLabel:"Dimanche 31 Janvier", name:"Geysir & Strokkur", time:"12h45 - 14h00", lat:64.3138, lng:-20.3008, price:"Gratuit (Parking & Accès)", desc:"Colonne d'eau bouillante jaillissant toutes les 6 minutes à 25m.", img:"./geysir" },
  { id:"j6-3", dateKey:"2027-01-31", dateLabel:"Dimanche 31 Janvier", name:"Cascade Gullfoss", time:"14h15 - 15h30", lat:64.3271, lng:-20.1199, price:"Gratuit (Parking & Accès)", desc:"La chute d'or du Golden Circle au milieu des glaces.", img:"./gullfoss" },
  { id:"j6-4", dateKey:"2027-01-31", dateLabel:"Dimanche 31 Janvier", name:"Secret Lagoon (Flúðir)", time:"16h15 - 18h30", lat:64.1375, lng:-20.3094, price:"Bains 2 pers : 60 € (9 000 ISK)", desc:"Bains chauds naturels à 38-40°C à la nuit tombée.", img:"./secret-lagoon" },
  { id:"j6-5", dateKey:"2027-01-31", dateLabel:"Dimanche 31 Janvier", name:"Nuitée : Flúðir / Selfoss", time:"19h00 - Nuit", lat:64.1375, lng:-20.3094, price:"Selon hébergement", desc:"Nuitée reposante après les bains chauds.", img:"./selfoss" },

  { id:"j7-1", dateKey:"2027-02-01", dateLabel:"Lundi 01 Février", name:"Cratère volcanique Kerið", time:"10h00 - 11h15", lat:64.0413, lng:-20.8851, price:"Entrées 2 pers : 8 € (Parking gratuit)", desc:"Cratère volcanique rougeoyant de 3 000 ans avec son lac intérieur.", img:"./kerid" },
  { id:"j7-2", dateKey:"2027-02-01", dateLabel:"Lundi 01 Février", name:"Hallgrímskirkja & Reykjavík", time:"12h15 - 14h45", lat:64.1417, lng:-21.9266, price:"Stationnement : ~4 à 8 €", desc:"Flânerie dans le centre-ville, orgues de la cathédrale & déjeuner.", img:"./hallgrimskirkja" },
  { id:"j7-3", dateKey:"2027-02-01", dateLabel:"Lundi 01 Février", name:"Harpa Concert Hall & Port", time:"15h00 - 16h30", lat:64.1504, lng:-21.9329, price:"Accès libre", desc:"Façade en verre géométrique et coucher de soleil sur le vieux port.", img:"./harpa" },
  { id:"j7-4", dateKey:"2027-02-01", dateLabel:"Lundi 01 Février", name:"Restitution du SUV 4x4", time:"18h30 - 19h15", lat:63.9890, lng:-22.5850, price:"Plein carburant", desc:"Dernier plein d'essence N1/Orkan et retour du véhicule chez le loueur.", img:"./keflavik-airport" },
  { id:"j7-5", dateKey:"2027-02-01", dateLabel:"Lundi 01 Février", name:"Nuitée : Aéroport Keflavík", time:"19h30 - Nuit", lat:63.9980, lng:-22.5600, price:"Selon hébergement", desc:"Hôtel à l'aéroport. Aucune route le 02 au matin : dépose-bagages à 06h30.", img:"./aurore" }
];

function getSteps() {
  return JSON.parse(localStorage.getItem("iceland_custom_steps_v11") || JSON.stringify(INITIAL_STEPS));
}

async function saveSteps(steps) {
  localStorage.setItem("iceland_custom_steps_v11", JSON.stringify(steps));
  if (supabaseClient && navigator.onLine) {
    setSyncStatus(false, "Sync...");
    const payload = steps.map((s, index) => ({
      id: s.id,
      date_key: s.dateKey,
      date_label: s.dateLabel,
      name: s.name,
      time_slot: s.time || "",
      lat: s.lat,
      lng: s.lng,
      price: s.price,
      description: s.desc,
      img: s.img,
      position_order: index,
      updated_at: new Date()
    }));
    const { error } = await supabaseClient.from('iceland_steps').upsert(payload);
    if (!error) setSyncStatus(true, "Synchronisé");
  }
}

function resetDefaultSteps() {
  if (confirm("Rétablir les étapes et chemins d'images par défaut ?")) {
    localStorage.removeItem("iceland_custom_steps_v11");
    renderPlacesList();
    recalculateMap();
    if (supabaseClient && navigator.onLine) {
      saveSteps(INITIAL_STEPS);
    }
  }
}
