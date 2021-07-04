import  { API_URL } from './constants'

export function isBrowser() {
  return typeof window !== "undefined"
}

export function sendData(url, stringifyData) {
  // do not use fetch, for IE compatibility
  const request = new XMLHttpRequest();
  url = url || API_URL;
  request.open("post", url, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(stringifyData);
}

/**
 * Get the current host, including the protocol, origin and port (if any).
 *
 * Does **not** end with a trailing "/".
 */
 export function getHost() {
  return location.protocol + "//" + location.host
}

export function isReferrerSameHost() {
  if (!isBrowser()) {
    return false
  }
  const referrer = document.referrer || ""
  const host = getHost()

  return referrer.substr(0, host.length) === host
}

export function isInIframe() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}
