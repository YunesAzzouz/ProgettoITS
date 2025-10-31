document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("scelta");
  const resultsContainer = document.getElementById("results");

  if (!form) return;

  // --- CAP to city name mapping ---
  const cityMap = {
    "05100": "Terni",
    "06049": "Spoleto",
    "06121": "Perugia",
    "06059": "Todi",
    "06081": "Assisi"
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // --- Get selected filters ---
    const tipoRistorante = document.querySelector('input[name="filtro"]:checked')?.value;
    const tipoRistoranteNum = tipoRistorante ? Number(tipoRistorante) : null;

    const allergie = Array.from(
      document.querySelectorAll('input[name="allergie"]:checked')
    ).map(el => el.value);

    const selectedCittaCap = document.querySelector('input[name="citta"]:checked')?.value;
    const selectedCittaName = selectedCittaCap ? cityMap[selectedCittaCap] : null;

    // --- Debug: show selected filters ---
    console.log("🔍 Filtri selezionati:", {
      tipo: tipoRistoranteNum,
      citta: selectedCittaCap || null,
      allergie
    });

    // --- Save preferences ---
    try {
      const savePref = await fetch("http://localhost:3000/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoRistorante, allergie, citta: selectedCittaCap })
      });
      await savePref.json();
    } catch (err) {
      console.error("Errore salvataggio preferenze:", err);
      alert("Errore nel salvataggio delle preferenze.");
      return;
    }

    // --- Build query params ---
    const queryParams = new URLSearchParams();
    if (tipoRistoranteNum) queryParams.append("tipo", tipoRistoranteNum);
    if (selectedCittaCap) queryParams.append("citta", selectedCittaCap);
    allergie.forEach(all => queryParams.append("allergie", all));

    // --- Fetch restaurants ---
    try {
      const fetchRes = await fetch(`http://localhost:3000/api/restaurants?${queryParams}`);
      const restaurants = await fetchRes.json();

      // --- Debug: show fetched results ---
      console.log(`📦 Trovati ${restaurants.length} ristoranti`);
      if (restaurants.length > 0) {
        console.log(
          "📋 Esempio risultati:",
          restaurants.slice(0, 3).map(r => ({
            Nome: r.Nome,
            Indirizzo: r.Indirizzo,
            Tipo: r.Tipo,
            Citta: cityMap[r.FK_Citta] || r.Citta || "N/A",
            Filtri: r.Filtri
          }))
        );
      }

      if (!restaurants || restaurants.length === 0) {
        resultsContainer.style.display = "none";
        resultsContainer.innerHTML = "";
        alert("Nessun ristorante trovato con i filtri selezionati.");
      } else {
        displayRestaurants(restaurants);
      }
    } catch (err) {
      console.error("Errore fetch ristoranti:", err);
      alert("Errore durante la ricerca dei ristoranti.");
    }
  });

  // --- Clear filters button ---
  document.getElementById("cancellaFiltri").addEventListener("click", () => {
    document.querySelectorAll('input[name="filtro"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="allergie"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="citta"]').forEach(el => el.checked = false);
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "none";
    alert("Filtri cancellati!");
  });

  // --- Display restaurants ---
  function displayRestaurants(restaurants) {
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "grid";

    restaurants.forEach(r => {
      const cityName = cityMap[r.FK_Citta] || r.Citta || "N/A"; // friendly city name
      const card = document.createElement("div");
      card.className = "restaurant-card";

      card.innerHTML = `
        <h4>${r.Nome}</h4>
        <p><strong>Indirizzo:</strong> ${r.Indirizzo}</p>
        <p><strong>Tipo:</strong> ${r.Tipo || 'N/A'}</p>
        <p><strong>Città:</strong> ${cityName}</p>
        <p><strong>Filtri:</strong> ${r.Filtri && r.Filtri.length ? r.Filtri.join(", ") : "Nessuno"}</p>
        <button class="fav-btn" data-nome="${r.Nome}">⭐ Aggiungi ai preferiti</button>
      `;

      resultsContainer.appendChild(card);
    });
  }

  // --- Event delegation for favorites ---
  resultsContainer.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("fav-btn")) return;

    const restaurantName = e.target.getAttribute("data-nome");
    const email = localStorage.getItem("userEmail");

    if (!email) {
      alert("Devi essere loggato per aggiungere ai preferiti!");
      window.location.href = "login.html";
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/favorites/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, restaurantName })
      });

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Errore durante il salvataggio del preferito.");
    }
  });
});