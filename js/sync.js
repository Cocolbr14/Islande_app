// =========================================================================
// CONFIGURATION SUPABASE OFFICIELLE
// =========================================================================
const SUPABASE_URL = "https://cyosixmthqbrmqggcspw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b3NpeG10aHFicm1xZ2djc3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTQ4NDgsImV4cCI6MjA3MjgzMDg0OH0.U61AQhGqgBSvYU8WmxupQ8SnaXN2eiQBiwR6foQI7lI";

let supabaseClient = null;
if (SUPABASE_URL && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function setSyncStatus(isSynced, text) {
  const badge = document.getElementById("syncBadge");
  if (!badge) return;
  if (isSynced) {
    badge.className = "ok";
    badge.innerText = text || "Cloud OK";
  } else {
    badge.className = "";
    badge.innerText = text || "Local (Offline)";
  }
}

async function syncFromSupabase() {
  if (!supabaseClient || !navigator.onLine) {
    setSyncStatus(false, "Mode Hors-ligne");
    return;
  }

  try {
    setSyncStatus(false, "Sync...");

    // Étapes
    const { data: stepsData, error: stepsErr } = await supabaseClient
      .from('iceland_steps')
      .select('*')
      .order('date_key', { ascending: true })
      .order('position_order', { ascending: true });

    if (!stepsErr && stepsData && stepsData.length > 0) {
      const formatted = stepsData.map(s => ({
        id: s.id,
        dateKey: s.date_key,
        dateLabel: s.date_label,
        name: s.name,
        time: s.time_slot || "",
        lat: s.lat,
        lng: s.lng,
        price: s.price,
        desc: s.description,
        img: s.img
      }));
      localStorage.setItem("iceland_custom_steps_v11", JSON.stringify(formatted));
      renderPlacesList();
      recalculateMap();
    }

    // Hébergements
    const { data: lodgingsData, error: lErr } = await supabaseClient
      .from('iceland_lodgings')
      .select('*')
      .order('night', { ascending: true });

    if (!lErr && lodgingsData && lodgingsData.length > 0) {
      const formattedL = lodgingsData.map(l => ({
        night: l.night,
        date: l.date_label,
        name: l.name,
        location: l.location,
        checkin: l.checkin,
        address: l.address,
        phone: l.phone,
        notes: l.notes,
        booking_url: l.booking_url || ''
      }));
      localStorage.setItem("iceland_lodgings_data_v11", JSON.stringify(formattedL));
      renderLodgings();
    }

    // Menus
    const { data: mealsData, error: mErr } = await supabaseClient
      .from('iceland_meals')
      .select('*');

    if (!mErr && mealsData && mealsData.length > 0) {
      const mealsMap = {};
      mealsData.forEach(m => {
        mealsMap[m.date_key] = {
          lunch: { title: m.lunch_title || '', notes: m.lunch_notes || '' },
          dinner: { title: m.dinner_title || '', notes: m.dinner_notes || '' }
        };
      });
      localStorage.setItem("iceland_meals_data_v1", JSON.stringify(mealsMap));
      renderPlacesList();
    }

    await syncLuggageFromSupabase();
    await syncTransport();
    setSyncStatus(true, "Synchronisé");
  } catch (e) {
    console.warn("Échec sync cloud :", e);
    setSyncStatus(false, "Local (Hors-ligne)");
  }
}

function initSupabaseRealtime() {
  if (!supabaseClient) return;

  supabaseClient.channel('iceland-realtime-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'iceland_steps' }, async () => {
      const { data } = await supabaseClient.from('iceland_steps').select('*').order('date_key', { ascending: true }).order('position_order', { ascending: true });
      if (data) {
        const formatted = data.map(s => ({
          id: s.id,
          dateKey: s.date_key,
          dateLabel: s.date_label,
          name: s.name,
          time: s.time_slot || "",
          lat: s.lat,
          lng: s.lng,
          price: s.price,
          desc: s.description,
          img: s.img
        }));
        localStorage.setItem("iceland_custom_steps_v11", JSON.stringify(formatted));
        renderPlacesList();
        recalculateMap();
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'iceland_packing_items' }, async () => {
      await syncLuggageFromSupabase();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'iceland_meals' }, async () => {
      const { data } = await supabaseClient.from('iceland_meals').select('*');
      if (data) {
        const mealsMap = {};
        data.forEach(m => {
          mealsMap[m.date_key] = {
            lunch: { title: m.lunch_title || '', notes: m.lunch_notes || '' },
            dinner: { title: m.dinner_title || '', notes: m.dinner_notes || '' }
          };
        });
        localStorage.setItem("iceland_meals_data_v1", JSON.stringify(mealsMap));
        renderPlacesList();
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'iceland_lodgings' }, async () => {
      const { data } = await supabaseClient.from('iceland_lodgings').select('*').order('night', { ascending: true });
      if (data) {
        const formattedL = data.map(l => ({
          night: l.night,
          date: l.date_label,
          name: l.name,
          location: l.location,
          checkin: l.checkin,
          address: l.address,
          phone: l.phone,
          notes: l.notes,
          booking_url: l.booking_url || ''
        }));
        localStorage.setItem("iceland_lodgings_data_v11", JSON.stringify(formattedL));
        renderLodgings();
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'iceland_transport' }, () => syncTransport())
    .subscribe();
}


window.addEventListener('online', () => syncFromSupabase());
window.addEventListener('offline', () => setSyncStatus(false, "Hors-ligne"));
