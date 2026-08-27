"use strict";

(() => {
  const MEASUREMENT_ID = "G-54ZYPQCDM3";
  const CONSENT_KEY = "douaaGeneratorAnalyticsConsent";
  let analyticsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.trackEvent = (eventName, parameters = {}) => {
    if (!analyticsLoaded || readConsent() !== "granted") return;
    window.gtag("event", eventName, parameters);
  };

  document.addEventListener("DOMContentLoaded", initializeAnalytics);

  function initializeAnalytics() {
    injectConsentInterface();
    const consent = readConsent();

    if (consent === "granted") {
      loadAnalytics();
    } else if (consent !== "denied") {
      showBanner();
    }
  }

  function readConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      console.warn("Préférence Analytics non enregistrée :", error);
    }
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }

  function injectConsentInterface() {
    const banner = document.createElement("section");
    banner.id = "analyticsConsentBanner";
    banner.className = "consent-banner hidden";
    banner.setAttribute("aria-label", "Préférences de confidentialité");
    banner.innerHTML = `
      <div>
        <strong>Mesure d’audience</strong>
        <p>Avec votre accord, Google Analytics nous aide à comprendre les pages consultées et à améliorer le site. Les favoris restent enregistrés uniquement sur votre appareil.</p>
      </div>
      <div class="consent-actions">
        <button type="button" class="secondary-button" data-consent="denied">Refuser</button>
        <button type="button" class="primary-button compact" data-consent="granted">Accepter</button>
      </div>`;

    const settingsButton = document.createElement("button");
    settingsButton.className = "consent-settings-button";
    settingsButton.type = "button";
    settingsButton.textContent = "Confidentialité";
    settingsButton.setAttribute("aria-controls", banner.id);
    settingsButton.addEventListener("click", showBanner);

    banner.querySelectorAll("[data-consent]").forEach((button) => {
      button.addEventListener("click", () => applyConsent(button.dataset.consent));
    });

    document.body.append(banner, settingsButton);
  }

  function applyConsent(value) {
    saveConsent(value);
    hideBanner();

    if (value === "granted") {
      loadAnalytics();
      return;
    }

    if (analyticsLoaded) {
      window.gtag("consent", "update", { analytics_storage: "denied" });
      deleteAnalyticsCookies();
    }
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      if (name === "_ga" || name.startsWith("_ga_")) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}; SameSite=Lax`;
      }
    });
  }

  function showBanner() {
    document.getElementById("analyticsConsentBanner")?.classList.remove("hidden");
  }

  function hideBanner() {
    document.getElementById("analyticsConsentBanner")?.classList.add("hidden");
  }
})();
