import constants from './constants'

export function isBrowser() {
  return typeof window !== 'undefined'
}

export function sendData(url, stringifyData, callback) {
  // do not use fetch, for IE compatibility
  const request = new XMLHttpRequest()
  url = url || constants.API_URL
  request.open('post', url, true)
  request.setRequestHeader('Content-Type', 'application/json')
  request.send(stringifyData)

  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      (typeof callback === 'function') && callback();
    }
  }
}

/**
 * Get the current host, including the protocol, origin and port (if any).
 *
 * Does **not** end with a trailing '/'.
 */
export function getHost() {
  return location.protocol + '//' + location.host
}

export function isReferrerSameHost() {
  if (!isBrowser()) {
    return false
  }
  const referrer = document.referrer || ''
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

export function isExcludePath(path) {
  return location.pathname.match(new RegExp('^' + path.trim().replace(/\*\*/g, '.*').replace(/([^\.])\*/g, '$1[^\\s\/]*') + '\/?$'))
}

export function trackOutbound(handleOutbound) {
  document.addEventListener('click', handleOutbound)
  document.addEventListener('auxclick', handleOutbound)
}
