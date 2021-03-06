import { isBrowser, isReferrerSameHost } from "./utils"
import constants from "./constants"

/**
 * Get the preferred browser locale, of the form: xx, xx-YY or falsy
 */
function getLocale() {
  let locale = typeof navigator.languages !== 'undefined' ? navigator.languages[0] : navigator.language

  if (locale[0] === '"') {
    locale = locale.substr(1)
  }

  if (locale.length > 0 && locale[locale.length - 1] === '"') {
    locale = locale.substr(0, locale.length - 1)
  }

  if (locale && locale.length === 5 && locale[2] === '-') {
    return locale.substr(0, 3) + locale.substr(3).toLocaleUpperCase()
  }
  return locale
}

/**
 * Track the default locale of the current user.
 */
export function locale() {
  if (!isBrowser()) {
    return { type: constants.PROPS_TYPE.LOCALE, value: constants.PROPS_VALUE.NOT_IN_BROWSER }
  }

  const value = getLocale() || constants.PROPS_VALUE.NONE
  return { type: constants.PROPS_TYPE.LOCALE, value }
}

function getScreenType() {
  const width = window.innerWidth
  if (width <= 414) return constants.SCREEN_TYPE.XS
  if (width <= 800) return constants.SCREEN_TYPE.S
  if (width <= 1200) return constants.SCREEN_TYPE.M
  if (width <= 1600) return constants.SCREEN_TYPE.L
  return constants.SCREEN_TYPE.XL
}

/**
 * Track the screen type of the current user, based on window size:
 *
 * - width <= 414: XS -> phone
 * - width <= 800: S -> tablet
 * - width <= 1200: M -> small laptop
 * - width <= 1600: L -> large laptop
 * - width > 1440: XL -> large desktop
 */
export function screenType() {
  if (!isBrowser()) {
    return { type: constants.PROPS_TYPE.SCREEN_TYPE, value: constants.PROPS_VALUE.NOT_IN_BROWSER }
  }
  return { type: constants.PROPS_TYPE.SCREEN_TYPE, value: getScreenType() }
}

/**
 * Track the referrer on the current page, or `<none>` if the page has no referrer.
 */
export function referrer() {
  if (!isBrowser()) {
    return { type: constants.PROPS_TYPE.REFERRER, value: constants.PROPS_VALUE.NOT_IN_BROWSER }
  }
  if (isReferrerSameHost()) {
    return { type: constants.PROPS_TYPE.REFERRER, value: constants.PROPS_VALUE.NONE }
  }

  return { type: constants.PROPS_TYPE.REFERRER, value: document.referrer || constants.PROPS_VALUE.NONE }
}

/**
 * Track the current path within the application.
 * By default, does not log the `location.hash` nor the `location.search`
 *
 * @param hash `true` to log the hash, `false` by default
 * @param search `true` to log the hash, `false` by default
 */
export function path(hash = false, search = false) {
  if (!isBrowser()) {
    return { type: constants.PROPS_TYPE.PATH, value: constants.PROPS_VALUE.NOT_IN_BROWSER }
  }
  let value = window.location.pathname

  const _hash = window.location.hash
  const _search = window.location.search
  if (hash && search) {
    // the hash contains the search
    value += _hash
  } else if (hash) {
    value += _hash.substr(0, _hash.length - _search.length)
  } else if (search) {
    value += _search
  }

  return { type: constants.PROPS_TYPE.PATH, value }
}

/**
 * Track a transition between two values.
 *
 * @param previous The previous value
 * @param next The next value
 */
export function transition(previous, next) {
  return { type: constants.PROPS_TYPE.TRANSITION, value: previous + '  ->  ' + next }
}

/**
 * Track a duration at several intervals:
 *
 * - < 5 seconds
 * - < 15 seconds
 * - < 30 seconds
 * - < 1 minute
 * - < 5 minutes
 * - \> 5 minutes
 *
 * @param durationMs the duration to encode, in milliseconds
 */
export function durationInterval(durationMs, prefix = '') {
  if (durationMs < 5000) {
    return { type: constants.PROPS_TYPE.DURATION_INTERVAL, value: prefix + '< 5s' }
  }
  if (durationMs < 15000) {
    return { type: constants.PROPS_TYPE.DURATION_INTERVAL, value: prefix + '< 15s' }
  }
  if (durationMs < 30000) {
    return { type: constants.PROPS_TYPE.DURATION_INTERVAL, value: prefix + '< 30s' }
  }
  if (durationMs < 60000) {
    return { type: constants.PROPS_TYPE.DURATION_INTERVAL, value: prefix + '< 1m' }
  }
  if (durationMs < 5 * 60000) {
    return { type: constants.PROPS_TYPE.DURATION_INTERVAL, value: prefix + '< 5m' }
  }

  return { type: constants.PROPS_TYPE.DURATION_INTERVAL, value: prefix + '> 5m' }
}

/**
 * Track the operating system of the user, here are the most common values:
 *
 * - Windows
 * - Mac OS X
 * - Android
 * - Linux
 * - iOS
 */
export function os() {
  return { type: constants.PROPS_TYPE.OS }
}

/**
 * Track the browser of the user, here are the most common values:
 *
 * - Chrome
 * - Firefox
 * - Safari
 * - Mobile Chrome
 * - Mobile Firefox
 * - Mobile Safari
 */
export function browser() {
  return { type: constants.PROPS_TYPE.BROWSER }
}