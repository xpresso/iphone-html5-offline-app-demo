Offline Application
====

Currently works in Chrome and Safari.

A domReady / Cache Checking timing issue causes issues with other browsers
Will be fixed soon.

Why?

  * Easy abstractions for the most common use cases
  * Periodically checks for updates and prompts user to allow refresh
  * Reliably determines online / offline status
  * Normalizes `applicationCache` events
  * jQuery, MooTools, etc compatible

Install, Update on Startup, Update on Demand
====

Abstracts `applicationCache` to more easily handle the top 3 use cases:

  * **Install** the app on initial page load
  * **Automatically upgrade** the app on subsequent page loads
  * Gracefully **upgrade** the app **during use**
    * check for updates periodically (every hour default)
    * check for updates manually


The events can be handled in this fashion:

  * `appCache.isInstalled()` - returns true if the application is already installed
  * `appCache.load.on('EVENT', callback)` - the callback for a page-load cache check
  * `appCache.update.on('EVENT', callback)` - the callback for a periodic or forced callback
  * `appCache.checkNow()` - the same as `applicationCache.update()`

Note: Events are handled with a client-side version of Node.js's `EventEmitter`

More Intelligent Cache Events
====

  * `error`
    * smarter than `applicationCache`'s `error`
    * not emitted if the browser is offline and the cache status is in a non-error state

  * `start` - the `checking` event

  * `loadstart` - the `downloading` event

  * `progress` - the `progress` event

  * `loadend`
    * if `false === appCache.isInstalled()` this is the `cached` event
    * if `true === appCache.isInstalled()` this is the `updateready` event
    * not emitted on `error`
    * if the browser is determined to be offline, this is not called

  * `end`
    * always emitted after all other events have been successful
    * emitted in place of `noupdate`
    * not emitted on `error`

Detecting Online / Offline Status
====

Place the files `online.json` and `offline.json` in the same path as the file which includes `app-cache.js`

Edit the fallback of `main.manifest` like so

    CACHE MANIFEST

    FALLBACK:
    online.json offline.json

  * The browser is assumed to be **offline** if *any* of the following are true:
    * The contents of `offline.json` are retrieved in place of `online.js`
    * The browser is in "Offline Mode"
    * The browser is in "Online Mode", but the OS is in "Offline Mode"
    * The server is unavailable

  * The browser is assumed to be **online** if *any* of the following are true:
    * The browser can't be determined as `offline` by the metrics above
    * A request to `online.json?_no_cache_= + new Date().valueOf()` returns the contents of `online.json`
    * The server is available
    * The request to the server fails
    * The `main.manifest` `FALLBACK` is not set correctly

TODO
====

handle the problematic issue of dom loading vs not loading before cache checks
