document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("userEmail");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");

  window.toggleMenu = function () {
    document.querySelector(".nav-links").classList.toggle("active");
  };

  if (email) {
    if (loginLink) {
      loginLink.textContent = "Logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", () => {
        localStorage.removeItem("userEmail");
        alert("Logout effettuato con successo!");
        window.location.href = "index.html";
      });
    }

    if (registerLink) {
      registerLink.style.display = "none"; 
    }
  }
});