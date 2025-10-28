// -----------------------------
// 📬 INVIO FORM CONTATTI
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email_contact").value.trim();
      const messaggio = document.getElementById("messaggio_contact").value.trim();
      const consents = document.getElementById("consents_contact").checked;

      // ✅ Validazione base
      if (!email || !messaggio) {
        alert("Per favore, inserisci un'email e un messaggio.");
        return;
      }

      if (!consents) {
        alert("Devi accettare la politica sulla privacy per continuare.");
        return;
      }

      try {
        // 🔹 Invio richiesta al server
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, messaggio }),
        });

        // 🔹 Gestione risposta
        if (res.ok) {
          const data = await res.json();
          alert(data.message || "Messaggio inviato con successo!");
          form.reset(); // pulisce il form
        } else {
          const err = await res.json();
          alert(err.error || "Errore durante l'invio del messaggio.");
        }
      } catch (err) {
        console.error("Errore durante l'invio:", err);
        alert("Errore di connessione al server.");
      }
    });
  }
});
