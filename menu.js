"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".site-nav-links");

  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
});
