"use strict";
let printDetails = [];
window.addEventListener("beforeprint", () => {
  printDetails = Array.from(document.querySelectorAll("details"), element => ({element, open: element.open}));
  printDetails.forEach(({element}) => { element.open = true; });
});
window.addEventListener("afterprint", () => {
  printDetails.forEach(({element, open}) => { element.open = open; });
  printDetails = [];
});
document.querySelectorAll("[data-print]").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", () => window.print());
});
