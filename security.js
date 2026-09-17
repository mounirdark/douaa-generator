"use strict";
// Production only: keep local HTTP development working.
if (location.protocol === "http:" && /^(www\.)?douaagenerator\.fr$/.test(location.hostname)) {
  location.replace(`https://douaagenerator.fr${location.pathname}${location.search}${location.hash}`);
}
