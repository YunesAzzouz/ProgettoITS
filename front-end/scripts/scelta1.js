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
  container.innerHTML = ""; // Clear previous results

  restaurants.forEach(r => {
    const card = document.createElement("div");
    card.className = "restaurant-card";
    card.innerHTML = `
      <h4>${r.Nome}</h4>
      <p>Indirizzo: ${r.Indirizzo}</p>
      <p>tipoRistorante: ${r.FK_Tipo}</p>
    `;
    container.appendChild(card);
  });
}