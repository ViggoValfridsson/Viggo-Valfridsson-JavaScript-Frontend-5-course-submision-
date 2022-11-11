"use strict";

export function setCookie(name, value, options = {}) {
  options = {
    path: "/",
    ...options,
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }
  
  if (name === "favoriteList") {
    value = value.split(",");
    value = Array.from(new Set(value));
    value = value.toString();
  }

  let cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
  for (let optionAlternative in options) {
    cookie += ";" + optionAlternative;
    let optionValue = options[optionAlternative];

    if (optionValue !== true) {
      cookie += "=" + optionValue;
    }
  }

  document.cookie = cookie;
}

export function getCookie(name) {
  let matches = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function deleteCookie(name) {
  setCookie(name, "", {
    "max-age": -1,
  });
}