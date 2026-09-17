"use strict";
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('form[role="search"]').forEach((form) => {
    const input = form.querySelector('input[type="search"]');
    if (!input) return;
    const validate = () => {
      const length = input.value.trim().length;
      input.setCustomValidity(length < 2 ? "Saisissez au moins deux caractères." : length > 120 ? "Limitez votre recherche à 120 caractères." : "");
    };
    input.addEventListener("input", validate);
    form.addEventListener("submit", (event) => {
      validate();
      if (!form.reportValidity()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  });
});
