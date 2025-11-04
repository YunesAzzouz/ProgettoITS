document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("mail_login").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Compila tutti i campi!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore durante il login.");
        return;
      }

      localStorage.setItem("userEmail", data.email);

      alert("Login effettuato con successo!");
      window.location.href = "index.html";
    } catch (err) {
      console.error("Errore login:", err);
      alert("Errore di connessione al server.");
    }
  });
});