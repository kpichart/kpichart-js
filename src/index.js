import * as props from "./props"
import { App } from "./App"
import { isBrowser } from "./utils"

export { props }
export { App }

/**
 * This file is the entry point for the `yamak-js` library.
 *
 * It contains basic methods to initialize and log events:
 * ```
 * init(projectId, options)
 * track(event, options)
 * ```
 *
 * As well as the `props` helpers.
 */


/**
 * The default site, or `null` if none.
 */
export let DEFAULT_APP = null

/**
 * Initialize a default site for the given website with the given options.
 *
 * @param projectId The website for which to initialize the library
 * @param options The options to use
 *
 * @returns The default app
 */
export function init(projectId, options) {
  if (!isBrowser() || DEFAULT_APP) {
    return DEFAULT_APP
  }
  DEFAULT_APP = new App(projectId, options)
  return DEFAULT_APP
}

/**
 * Tracks an event using the default app, you must call `init()` before calling this.
 *
 * @param event The event to track
 */
export function track(event, options) {
  if (!DEFAULT_APP || !isInBrowser()) return

  DEFAULT_APP.track(event, options)
}
