"use strict";

(() => {
  const MEASUREMENT_ID = "G-54ZYPQCDM3";
  const CONSENT_KEY = "douaaGeneratorAnalyticsConsent";
  let analyticsLoaded = false;
  const CONSENT_DURATION = 183 * 24 * 60 * 60 * 1000;
  window[`ga-disable-${MEASUREMENT_ID}`] = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  // Do not send religious intentions, search terms or invocation identifiers.
  window.trackEvent = () => {};

  document.addEventListener("DOMContentLoaded", initializeAnalytics);

  function initializeAnalytics() {
    injectConsentInterface();
    const consent = readConsent();

    if (consent === "granted") {
      loadAnalytics();
    } else {
      deleteAnalyticsCookies();
      if (consent !== "denied") showBanner();
    }
    window.addEventListener("storage", (event) => {
      if (event.key === CONSENT_KEY || event.key === null) {
        const value = readConsent();
        window[`ga-disable-${MEASUREMENT_ID}`] = value !== "granted";
        if (value === "granted") loadAnalytics();
        else {
          if (analyticsLoaded) window.gtag("consent", "update", { analytics_storage: "denied" });
          deleteAnalyticsCookies();
        }
        if (value) hideBanner(); else showBanner();
      }
    });
  }

  function readConsent() {
    try {
      const record = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return record && record.expires > Date.now() && ["granted", "denied"].includes(record.value)
        ? record.value : null;
    } catch (error) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, expires: Date.now() + CONSENT_DURATION }));
    } catch (error) {
      console.warn("Préférence Analytics non enregistrée :", error);
    }
  }

  function loadAnalytics() {
    window[`ga-disable-${MEASUREMENT_ID}`] = false;
    if (analyticsLoaded) {
      window.gtag("consent", "update", { analytics_storage: "granted" });
      return;
    }
    analyticsLoaded = true;

    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      send_page_view: false,
      cookie_expires: 60 * 60 * 24 * 183,
      cookie_update: false,
      page_location: `${location.origin}/`,
      page_referrer: "",
      page_title: "Douaa Generator",
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    // Aggregate visits only: no page path, query string, title or custom interactions.
    window.gtag("event", "page_view", {
      page_location: `${location.origin}/`, page_referrer: "", page_title: "Douaa Generator"
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
        <p>Avec votre accord, Google Analytics mesure les visites du site. Les recherches et les intentions choisies ne sont pas envoyées. Les favoris restent enregistrés uniquement sur votre appareil. <a href="/confidentialite/">Politique de confidentialité</a>. Vous pouvez changer d’avis à tout moment.</p>
      </div>
      <div class="consent-actions">
        <button type="button" class="secondary-button" data-consent="denied">Refuser</button>
        <button type="button" class="secondary-button" data-consent="granted">Accepter</button>
      </div>`;

    const settingsButton = document.createElement("button");
    settingsButton.className = "consent-settings-button";
    settingsButton.type = "button";
    settingsButton.textContent = "Cookies";
    settingsButton.setAttribute("aria-controls", banner.id);
    settingsButton.addEventListener("click", showBanner);

    banner.querySelectorAll("[data-consent]").forEach((button) => {
      button.addEventListener("click", () => applyConsent(button.dataset.consent));
    });

    document.body.append(banner, settingsButton);
  }

  function applyConsent(value) {
    window[`ga-disable-${MEASUREMENT_ID}`] = value !== "granted";
    saveConsent(value);
    hideBanner();

    if (value === "granted") {
      loadAnalytics();
      return;
    }

    if (analyticsLoaded) {
      window.gtag("consent", "update", { analytics_storage: "denied" });

    }
    deleteAnalyticsCookies();
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      if (name === "_ga" || name.startsWith("_ga_")) {
        for (const domain of new Set(["", location.hostname, "douaagenerator.fr"])) {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ""}`;
        }
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
