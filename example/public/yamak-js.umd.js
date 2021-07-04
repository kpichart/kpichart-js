(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.yamak = {}));
}(this, (function (exports) { 'use strict';

  var constants = {
    EVENT: {
      PAGE_VIEWS: 'Page Views',
    },
    API_URL: 'https://app.yamak.io/collect',
    YES: 'Yes',
    NO: 'No',
    PROPS_TYPE: {
      LOCALE: 'locale',
      NONE: 'none',
      SCREEN_TYPE: 'screen-type',
      REFERRER: 'referrer',
      PATH: 'path',
      TRANSITION: 'transition',
      DURATION_INTERVAL: 'duration-interval',
      OS: 'os',
      BROWSER: 'browser'
    },
    PROPS_VALUE: {
      NOT_IN_BROWSER: '<not-in-browser>',
      NONE: '<none>',
    },
    SCREEN_TYPE: {
      XS: 'XS',
      S: 'S',
      M: 'M',
      L: 'L',
      XL: 'XL',
    }
  };

  function isBrowser() {
    return typeof window !== 'undefined'
  }

  function sendData(url, stringifyData) {
    // do not use fetch, for IE compatibility
    const request = new XMLHttpRequest();
    url = url || constants.API_URL;
    request.open('post', url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(stringifyData);
  }

  /**
   * Get the current host, including the protocol, origin and port (if any).
   *
   * Does **not** end with a trailing '/'.
   */
   function getHost() {
    return location.protocol + '//' + location.host
  }

  function isReferrerSameHost() {
    if (!isBrowser()) {
      return false
    }
    const referrer = document.referrer || '';
    const host = getHost();

    return referrer.substr(0, host.length) === host
  }

  /**
   * Get the preferred browser locale, of the form: xx, xx-YY or falsy
   */
  function getLocale() {
    let locale = typeof navigator.languages !== 'undefined' ? navigator.languages[0] : navigator.language;

    if (locale[0] === '"') {
      locale = locale.substr(1);
    }

    if (locale.length > 0 && locale[locale.length - 1] === '"') {
      locale = locale.substr(0, locale.length - 1);
    }

    if (locale && locale.length === 5 && locale[2] === '-') {
      return locale.substr(0, 3) + locale.substr(3).toLocaleUpperCase()
    }
    return locale
  }

  /**
   * Track the default locale of the current user.
   */
  function locale() {
    if (!isBrowser()) {
      return { type: constants.PROPS_TYPE.LOCALE, value: constants.PROPS_VALUE.NOT_IN_BROWSER }
    }

    const value = getLocale() || constants.PROPS_VALUE.NONE;
    return { type: constants.PROPS_TYPE.LOCALE, value }
  }

  function getScreenType() {
    const width = window.innerWidth;
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
  function screenType() {
    if (!isBrowser()) {
      return { type: constants.PROPS_TYPE.SCREEN_TYPE, value: constants.PROPS_VALUE.NOT_IN_BROWSER }
    }
    return { type: constants.PROPS_TYPE.SCREEN_TYPE, value: getScreenType() }
  }

  /**
   * Track the referrer on the current page, or `<none>` if the page has no referrer.
   */
  function referrer() {
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
  function path(hash = false, search = false) {
    if (!isBrowser()) {
      return { type: constants.PROPS_TYPE.PATH, value: constants.PROPS_VALUE.NOT_IN_BROWSER }
    }
    let value = window.location.pathname;

    const _hash = window.location.hash;
    const _search = window.location.search;
    if (hash && search) {
      // the hash contains the search
      value += _hash;
    } else if (hash) {
      value += _hash.substr(0, _hash.length - _search.length);
    } else if (search) {
      value += _search;
    }

    return { type: constants.PROPS_TYPE.PATH, value }
  }

  /**
   * Track a transition between two values.
   *
   * @param previous The previous value
   * @param next The next value
   */
  function transition(previous, next) {
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
  function durationInterval(durationMs, prefix = '') {
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
  function os() {
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
  function browser() {
    return { type: constants.PROPS_TYPE.BROWSER }
  }

  var props = /*#__PURE__*/Object.freeze({
    __proto__: null,
    locale: locale,
    screenType: screenType,
    referrer: referrer,
    path: path,
    transition: transition,
    durationInterval: durationInterval,
    os: os,
    browser: browser
  });

  /**
   * The default options.
   */
  const defaults = {};


  const App = (function () {
    function App(websiteId, options = defaults) {
      this.websiteId = websiteId;
      this.options = options;
      this.uniqueEvents = {};
      // This variables used when tracking pages
      this.metricsData = null;
      this.onPageChange = this.onPageChange.bind(this);
      this.onPageTimeSpent = this.onPageTimeSpent.bind(this);


      // Track page views. It's checks if the URL changed every so often and tracks new pages accordingly.
      if (!options.disabledPageView) {
        if (!isBrowser()) {
          return { stop: function () { } }
        }

        // Start tracking page changes
        const interval = setInterval(this.onPageChange, 2000);

        // Calculate the data
        const { hash = false, search = false } = options || {};
        this.metricsData = {
          hash: hash,
          search: search,
          path: path(hash, search).value,
          isOnFirstPage: true,
          time: Date.now(),
          result: {
            stop: function () {
              clearInterval(interval);
            },
          },
        };

        // Track the first/current page view
        this.trackSinglePage(true, this.metricsData.path);

        window.addEventListener('unload', this.onPageTimeSpent);
      }
    }




    /**
     * Track yamak events.
    */
    App.prototype.track = function (event, options) {
      if (this.options.disabledEventTrack || !isBrowser()) {
        return Promise.resolve()
      }
      if (options.unique) {
        const hashEvent = JSON.stringify({ event, options });
        if (this.uniqueEvents[hashEvent])
          return Promise.resolve();
        this.uniqueEvents[hashEvent] = true;
      }

      const body = {
        event,
        websiteId: this.websiteId,
        ignoreErrors: this.options.ignoreErrors || false
      };

      if (options.remove) {
        body.remove = true;
      }
      if (options.props) {
        body.props = options.props;
      }
      if (options.update) {
        body.update = true;
      }

      sendData(constants.API_URL, JSON.stringify(body));
    };




    App.prototype.getPreviousPage = function (first) {
      const path = this.metricsData && this.metricsData.path;
      if (!first && path) {
        return path;
      }
      if (isReferrerSameHost()) {
        return document.referrer.replace(getHost(), '')
      }
      return document.referrer;
    };




    App.prototype.onPageChange = function () {
      if (!this.metricsData) {
        return
      }

      const { hash, search } = this.metricsData;
      const newPath = path(hash, search).value;

      if (newPath !== this.metricsData.path) {
        this.trackSinglePage(false, newPath);
      }
    };




    App.prototype.trackSinglePage = function (first, path) {
      if (!this.metricsData) {
        return
      }

      this.metricsData.isOnFirstPage = first && !isReferrerSameHost();

      const { time, isOnFirstPage } = this.metricsData;
      const params = {
        path,
      };

      if (isOnFirstPage) {
        params.uniqueViews = path;
        params.referrer = referrer();
        params.locale = locale();
        params.screenType = screenType();
      }

      const previous = this.getPreviousPage(first);
      if (previous && previous !== path) {
        params.transitions = transition(previous, path);
        if (!isOnFirstPage) {
          const now = Date.now();
          this.metricsData.time = now;
          params.duration = durationInterval(now - time, previous + ' - ');
        }
      }
      this.metricsData.path = path;

      this.track(constants.EVENT.PAGE_VIEWS, {
        props: params
      });
    };




    App.prototype.onPageTimeSpent = function () {
      const time = this.metricsData && this.metricsData.time;
      if (!time || typeof navigator.sendBeacon !== 'function' || this.options.disabledEventTrack || !this.metricsData) {
        return
      }

      const { isOnFirstPage, path } = this.trackPageData;
      const params = {};

      // add the duration
      params.duration = durationInterval(Date.now() - time, path + ' - ');
      const nextUrl = (document.activeElement && document.activeElement.href) || '';
      const host = getHost();

      if (!nextUrl) {
        // user closed the window
        params.bounces = isOnFirstPage ? constants.YES : constants.NO;
      } else if (nextUrl[0] !== '/' && nextUrl.substr(0, host.length) !== getHost()) {
        // link outside of the app
        params.transitions = transition(path, nextUrl);
      }

      // polyfil for IE, this won't always work, but it's better than nothing.
      navigator.sendBeacon = navigator.sendBeacon || sendData;
      navigator.sendBeacon(constants.API_URL, JSON.stringify({
        event: constants.EVENT.PAGE_VIEWS,
        websiteId: this.websiteId,
        props: params,
        ignoreErrors: this.options.ignoreErrors || false,
        update: true
      }));
    };

    return App;

  }());

  /**
   * This file is the entry point for the `yamak-js` library.
   *
   * It contains basic methods to initialize and log events:
   * ```
   * init(websiteId, options)
   * track(event, options)
   * ```
   *
   * As well as the `props` helpers.
   */


  /**
   * The default site, or `null` if none.
   */
  exports.DEFAULT_SITE = null;

  /**
   * Initialize a default site for the given website with the given options.
   *
   * @param websiteId The website for which to initialize the library
   * @param options The options to use
   *
   * @returns The default app
   */
  function init(websiteId, options) {
    if (!isBrowser() || exports.DEFAULT_SITE) {
      return exports.DEFAULT_SITE
    }
    exports.DEFAULT_SITE = new App(websiteId, options);
    return exports.DEFAULT_SITE
  }

  /**
   * Tracks an event using the default app, you must call `init()` before calling this.
   *
   * @param event The event to track
   */
   function track(event, options) {
    if (!exports.DEFAULT_SITE || !isInBrowser()) return

    exports.DEFAULT_SITE.track(event, options);
  }

  exports.App = App;
  exports.init = init;
  exports.props = props;
  exports.track = track;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
