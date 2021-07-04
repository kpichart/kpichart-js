import * as props from "./props"
import { isBrowser, isReferrerSameHost, getHost, sendData } from "./utils"
import constants from './constants'

/**
 * The default options.
 */
const defaults = {}


export const App = (function () {
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
      const interval = setInterval(this.onPageChange, 2000)

      // Calculate the data
      const { hash = false, search = false } = options || {}
      metricsData = {
        hash: hash,
        search: search,
        path: props.path(hash, search).value,
        isOnFirstPage: true,
        time: Date.now(),
        result: {
          stop: function () {
            clearInterval(interval);
          },
        },
      };

      // Track the first/current page view
      this.trackSinglePage(true, metricsData.path)

      window.addEventListener("unload", onPageTimeSpent)
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
      const hashEvent = JSON.stringify({ event, options })
      if (this.uniqueEvents[hashEvent])
        return Promise.resolve();
      this.uniqueEvents[hashEvent] = true
    }

    const body = {
      event,
      websiteId: this.websiteId,
      ignoreErrors: this.options.ignoreErrors || false
    }

    if (options.remove) {
      body.remove = true;
    }
    if (options.props) {
      body.props = options.props;
    }
    if (options.update) {
      body.update = true;
    }

    sendData(constants.API_URL, JSON.stringify(body))
  };




  App.prototype.getPreviousPage = function (first) {
    const path = this.metricsData && this.metricsData.path
    if (!first && path) {
      return path;
    }
    if (isReferrerSameHost()) {
      return document.referrer.replace(getHost(), "")
    }
    return document.referrer;
  }




  App.prototype.onPageChange = function () {
    if (!this.metricsData) {
      return
    }

    const { hash, search } = this.metricsData;
    const newPath = props.path(hash, search).value;

    if (newPath !== this.metricsData.path) {
      this.trackSinglePage(false, newPath);
    }
  };




  App.prototype.trackSinglePage = function (first, path) {
    if (!this.metricsData) {
      return
    }

    this.metricsData.isOnFirstPage = first && !isReferrerSameHost()

    const { time, isOnFirstPage } = this.metricsData
    const params = {
      path,
    }

    if (isOnFirstPage) {
      params.uniqueViews = path
      params.referrer = props.referrer()
      params.locale = props.locale()
      params.screenType = props.screenType()
    }

    const previous = this.getPreviousPage(first)
    if (previous && previous !== path) {
      params.transitions = props.transition(previous, path)
      if (!isOnFirstPage) {
        const now = Date.now();
        this.metricsData.time = now;
        params.duration = props.durationInterval(now - time, previous + " - ");
      }
    }
    this.metricsData.path = path;

    this.track('Page Views', {
      props: params
    })
  }




  App.prototype.onPageTimeSpent = function () {
    const time = this.metricsData && this.metricsData.time;
    if (!time || typeof navigator.sendBeacon !== "function" || this.options.disabledEventTrack || !this.metricsData) {
      return
    }

    const { isOnFirstPage, path } = this.trackPageData
    const params = {}

    // add the duration
    params.duration = props.durationInterval(Date.now() - time, path + ' - ')
    const nextUrl = (document.activeElement && document.activeElement.href) || ''
    const host = getHost()

    if (!nextUrl) {
      // user closed the window
      params.bounces = isOnFirstPage ? 'Yes' : 'No'
    } else if (nextUrl[0] !== '/' && nextUrl.substr(0, host.length) !== getHost()) {
      // link outside of the app
      params.transitions = props.transition(path, nextUrl);
    }

    // polyfil for IE, this won't always work, but it's better than nothing.
    navigator.sendBeacon = navigator.sendBeacon || sendData;
    navigator.sendBeacon(constants.API_URL, JSON.stringify({
      event: 'Page Views',
      websiteId: this.websiteId,
      props: params,
      ignoreErrors: this.options.ignoreErrors || false,
      update: true
    }));
  };

  return App;

}());
