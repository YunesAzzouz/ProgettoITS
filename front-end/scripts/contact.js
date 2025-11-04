document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const modal = document.getElementById("privacyModalContact");
  const openLink = document.getElementById("openPrivacyContact");
  const closeBtn = document.querySelector(".modal .close");
  const acceptBtn = document.getElementById("acceptPrivacyContact");
  const consentCheckbox = document.getElementById("consents_contact");

  if (openLink) {
    openLink.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "block";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      consentCheckbox.checked = true;
      modal.style.display = "none";
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email_contact").value.trim();
      const messaggio = document.getElementById("messaggio_contact").value.trim();
      const consents = consentCheckbox.checked;

      if (!email || !messaggio) {
        alert("Per favore, inserisci un'email e un messaggio.");
        return;
      }

      if (!consents) {
        alert("Devi accettare la politica sulla privacy per continuare.");
        return;
      }

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, messaggio }),
        });

        if (res.ok) {
          const data = await res.json();
          alert(data.message || "Messaggio inviato con successo!");
          form.reset();
          consentCheckbox.checked = false;
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