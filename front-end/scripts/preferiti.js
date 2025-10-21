document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favorites-container");
  if (!container) return;

  const email = localStorage.getItem("userEmail");

  if (!email) {
    alert("Devi essere loggato per vedere i preferiti!");
    window.location.href = "login.html";
    return;
  }

  // --- Fetch preferiti dal server ---
  try {
    const res = await fetch(`http://localhost:3000/api/favorites?email=${encodeURIComponent(email)}`);
    const favorites = await res.json();

    if (!favorites || favorites.length === 0) {
      container.innerHTML = "<p>Non hai ancora aggiunto ristoranti ai preferiti.</p>";
      return;
    }

    container.innerHTML = "";
    favorites.forEach(fav => {
      const card = document.createElement("div");
      card.className = "restaurant-card";
      card.innerHTML = `
        <h4>${fav.Nome}</h4>
        <p><strong>Indirizzo:</strong> ${fav.Indirizzo}</p>
        <p><strong>Tipo:</strong> ${fav.Tipo || 'N/A'}</p>
        <p><strong>Città:</strong> ${fav.Citta || 'N/A'}</p>
        <button class="remove-btn" data-nome="${fav.Nome}">❌ Rimuovi dai preferiti</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Errore fetch preferiti:", err);
    container.innerHTML = "<p>Errore durante il caricamento dei preferiti.</p>";
  }

  // --- Event delegation per rimuovere preferiti ---
  container.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("remove-btn")) return;

    const nomeRistorante = e.target.getAttribute("data-nome");

    try {
      const res = await fetch("http://localhost:3000/api/favorites/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, restaurantId: nomeRistorante })
      });

      const data = await res.json();
      alert(data.message);

      // Rimuovi il card dal DOM
      e.target.closest(".restaurant-card").remove();
    } catch (err) {
      console.error("Errore rimozione preferito:", err);
      alert("Errore durante la rimozione del preferito.");
    }
  });
});