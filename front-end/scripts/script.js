document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("scelta");
  const resultsContainer = document.getElementById("results");

  if (!form) return;

  // Submit form: salva preferenze e mostra ristoranti
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipoRistorante = document.querySelector('input[name="filtro"]:checked')?.value;
    const tipoRistoranteNum = tipoRistorante ? Number(tipoRistorante) : null;

    const allergie = Array.from(
      document.querySelectorAll('input[name="allergie"]:checked')
    ).map(el => el.value);

    // Salva preferenze
    try {
      const savePref = await fetch("http://localhost:3000/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoRistorante, allergie })
      });
      const saveResult = await savePref.json();
      alert(saveResult.message);
    } catch (err) {
      console.error("Errore salvataggio preferenze:", err);
      alert("Errore nel salvataggio delle preferenze.");
      return;
    }

    // Costruisci query params
    const queryParams = new URLSearchParams();
    if (tipoRistoranteNum) queryParams.append("tipo", tipoRistoranteNum);
    allergie.forEach(all => queryParams.append("allergie", all));

    // Fetch ristoranti filtrati
    try {
      const fetchRes = await fetch(`http://localhost:3000/api/restaurants?${queryParams}`);
      const restaurants = await fetchRes.json();

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

  // Clear filters button
  document.getElementById("cancellaFiltri").addEventListener("click", () => {
    document.querySelectorAll('input[name="filtro"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="allergie"]').forEach(el => el.checked = false);
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "none";
    alert("Filtri cancellati!");
  });

  // Display restaurants function
  function displayRestaurants(restaurants) {
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "grid";

    restaurants.forEach(r => {
      const card = document.createElement("div");
      card.className = "restaurant-card";

      card.innerHTML = `
        <h4>${r.Nome}</h4>
        <p><strong>Indirizzo:</strong> ${r.Indirizzo}</p>
        <p><strong>Tipo:</strong> ${r.Tipo || 'N/A'}</p>
        <p><strong>Città:</strong> ${r.Citta || 'N/A'}</p>
        <p><strong>Filtri: </strong> ${r.Filtri && r.Filtri.length ? r.Filtri.join(", ") : "Nessuno"}</p>
        <button class="fav-btn" data-nome="${r.Nome}">⭐ Aggiungi ai preferiti</button>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // Event delegation per i preferiti
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
      body: JSON.stringify({ email, restaurantName }) // usa lo stesso campo che il server si aspetta
    });

    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error(err);
    alert("Errore durante il salvataggio del preferito.");
  }
});
});