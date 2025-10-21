document.getElementById("scelta").addEventListener("submit", async function (e) {
  e.preventDefault();

  const tipoRistorante = document.querySelector('input[name="filtro"]:checked')?.value;
  const tipoRistoranteNum = tipoRistorante ? Number(tipoRistorante) : null;
  console.log("Tipo selezionato:", tipoRistoranteNum);

  const allergie = Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map(el => el.value);

  // Save user preferences
  const savePref = await fetch("http://localhost:3000/api/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ tipoRistorante, allergie })
  });

  const saveResult = await savePref.json();
  alert(saveResult.message);

  // Fetch matching restaurants
  const queryParams = new URLSearchParams();
  if (tipoRistoranteNum) queryParams.append("tipo", tipoRistoranteNum);
  allergie.forEach(all => queryParams.append("allergie", all));

  const fetchRes = await fetch(`http://localhost:3000/api/restaurants?${queryParams}`);
  const restaurants = await fetchRes.json();


  // Display results (for now: log to console or alert)
  console.log("Tipo selezionato:", tipoRistorante);
  console.log("Allergie selezionate:", allergie);
  console.log("Matching restaurants:", restaurants);

  if (restaurants.length === 0) {
    alert("Nessun ristorante trovato con i filtri selezionati.");
  } else {
    displayRestaurants(restaurants);
    // OR: show them in the DOM
    // displayRestaurants(restaurants);
  }
});

function displayRestaurants(restaurants) {
  const container = document.getElementById("results");
  
  // Se non ci sono ristoranti, nascondi la sezione
  if (!restaurants || restaurants.length === 0) {
    container.style.display = "none";
    container.innerHTML = "";
    return;
  }

  // Se ci sono risultati, mostrali
  container.style.display = "grid"; // oppure "block" se preferisci
  container.innerHTML = "";

  restaurants.forEach(r => {
    const card = document.createElement("div");
    card.className = "restaurant-card";
    card.innerHTML = `
      <h4>${r.Nome}</h4>
      <p><strong>Indirizzo:</strong> ${r.Indirizzo}</p>
      <p><strong>Tipo:</strong>${r.Tipo || 'N/A'}</p>
      <p><strong>Città:</strong> ${r.Citta || 'N/A'}</p>
      <p><strong>Filtri: </strong> ${r.Filtri && r.Filtri.length ? r.Filtri.join(", ") : "Nessuno"}</p>
    `;
    container.appendChild(card);
  });
}


// ✅ Clear all filters
document.getElementById("cancellaFiltri").addEventListener("click", () => {
  // Uncheck all radio buttons (restaurant types)
  document.querySelectorAll('input[name="filtro"]').forEach(el => el.checked = false);

  // Uncheck all allergy checkboxes
  document.querySelectorAll('input[name="allergie"]').forEach(el => el.checked = false);

  // Clear results section
  const container = document.getElementById("results");
  container.innerHTML = "";

  // Doesn't show results cards if filters are deleted
  document.getElementById("results").style.display = "none";


  // Optional: show a friendly confirmation
  alert("Filtri cancellati!");
});