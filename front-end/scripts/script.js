function toggleMenu() {
  console.log("Menu toggled");
  const links = document.querySelector(".nav-links");
  links.classList.toggle("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return; // Safety check

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email_contact").value;
    const messaggio = document.getElementById("messaggio_contact").value;
    const consents = document.getElementById("consents_contact").checked;

    if (!consents) {
      alert("Devi accettare la politica sulla privacy.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, messaggio })
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        form.reset();
      } else {
        alert(result.error || "Errore durante l'invio.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore del server.");
    }
  });
});