document.getElementById("cancellaFiltri").addEventListener("click", () => {
  const checkboxes = document.querySelectorAll('input[name="filtro"]');
  checkboxes.forEach(cb => cb.checked = false);
});