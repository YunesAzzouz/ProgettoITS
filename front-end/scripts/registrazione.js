document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("nome_registrati").value.trim();
    const cognome = document.getElementById("cognome_registrati").value.trim();
    const email = document.getElementById("mail_registrati").value.trim();
    const password = document.getElementById("password_registrati").value.trim();

    if (!name || !cognome || !email || !password) {
      alert("Compila tutti i campi!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cognome, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore durante la registrazione.");
        return;
      }

      alert("Registrazione completata con successo!");
      window.location.href = "login.html";
    } catch (err) {
      console.error("Errore registrazione:", err);
      alert("Errore di connessione al server.");
    }
  });
});