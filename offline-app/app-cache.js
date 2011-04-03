// http://www.html5rocks.com/tutorials/appcache/beginner/
var window, global = (function () { return this; }());
/*global global: true */
(function () {
  "use strict";

  require('require-kiss');

  var document = window.document
    , appCacheKey = 'application-cache-cached'
    , appCache = window.applicationCache
    , EventEmitter = require('events').EventEmitter
    , updateEmitter = new EventEmitter()
    , loadEmitter = new EventEmitter()
    , defaultUpdatePeriod = 1 * 60
    , shouldRefreshOnCleanUpdate = true
    , updateIsDownloading = false
    , alreadyChecked = false
    , primaryEmitter = loadEmitter
    , onlineStatus 
    , updateInterval;

    //  appCacheStatuses = [
    //    "UNCACHED",
    //    "IDLE",
    //    "CHECKING",
    //    "DOWNLOADING",
    //    "UPDATEREADY",
    //    "OBSOLETE"
    //  ];

  if (undefined === appCache) {
    alert("Your device is incompatible. Try iOS, Android, or Linux. Windows requires Google Chrome");
    window.location.href = "http://www.google.com/chrome";
  }

  console.log('initial status:', appCache.status);

  // for conveniece
  appCache.on = appCache.addEventListener || appCache.attachEvent;
  appCache.off = appCache.removeEventListener || appCache.detachEvent;

  // utility
  function reload() {
    appCache.swapCache();
    window.location.reload();
  }

  function isFirstRun() {
    return !localStorage.getItem(appCacheKey);
  }

  function checkOnlineStatus(cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "online.json?_invalidate_cache_=" + new Date().valueOf(), true);
    function readyHandler(data) {
      try {
        data = JSON.parse(data);
      } catch(e) {
        console.log(data);
        if (!data.status) {
          data = { status: "parse error" };
        }
      }
      onlineStatus = data.status
      cb(onlineStatus);
    }
    xhr.onreadystatechange = function (ev) {
      if (xhr.readyState == 4) {
        if(xhr.status == 200) {
          readyHandler(xhr.responseText);
        } else {
          readyHandler('{ "status": "error" }');
        }
      }
    };
    xhr.send();
  }

  function interpretError(ev, cb) {
    var result = "offline";
    // If this is the first run and there's an error, it must be an error
    // note: clearing localStorage may cause a false positive here)
    // TODO: provide a cookie stategy as well

    // If there is an error in the middle of an update, it's an error,
    // even if the browser simply went offline in the middle of it
    if (isFirstRun() || updateIsDownloading) {
      cb('error');
      return;
    }

    // if we're offline, assume no error
    // otherwise, assume an error
    checkOnlineStatus(cb);

    // TODO when appCache.status is 1, there is not an error
  }

  //
  // Initial Event
  //
  // checking     - fetching the application cache manifest and checking for updates.

  //
  // Progress Events
  //
  // downloading  - resources are being downloaded into the cache.
  // progress     - periodically throughout the download process.

  //
  // Final Events
  //
  // error        - an error occurs during the caching process.
  //              - or simply offline
  // noupdate     - there is no update to download
  // updateready  - a resource update is ready
  // cached       - caching is complete.

  //
  // States and Conditions to test
  //
  // Possible States
  // * Initial Load
  // * Update
  // * Offline
  //
  // Bad manifest
  // * incorrect mime-type
  // * missing resource
  // 

  function onInstallStart(ev) {
    console.log('start', ev, 'status', appCache.status, new Date().toISOString());
    primaryEmitter.emit('start');
  }

  function onInstallLoadStart(ev) {
    console.log('loadstart', ev, 'status', appCache.status, new Date().toISOString());
    updateIsDownloading = true;
    primaryEmitter.emit('loadstart');
  }

  function onInstallProgress(ev) {
    console.log('progress', ev, 'status', appCache.status, new Date().toISOString());
    primaryEmitter.emit('progress', ev);
  }

  function onInstallEnd(ev) {
    console.log('end', ev, 'status', appCache.status, new Date().toISOString());
    primaryEmitter.emit('end');
  }

  function onInstallError(ev) {
    console.log('error', ev, 'status', appCache.status, new Date().toISOString());
    function errorResultHandler(result) {
      console.log('######### result', result);
      if ('offline' !== result) {
        primaryEmitter.emit('error', ev);
      }
      //onInstallEnd(ev);
      //primaryEmitter.emit('end');
    }
    interpretError(ev, errorResultHandler);
  }

  function onInstallLoadEnd(ev) {
    console.log('loadend', ev, 'status', appCache.status, new Date().toISOString());
    // `cached` would only fire under a very rare condition:
    //
    //   * a cache manifest was added while the user was using the application
    //   * the user was on a page that did not include the cache manifest in the <html manifest=''>
    //   * the user opened a page that does include the cache manifest in a different tab
    //
    // It would never fire as part of an 'upgrade'
    primaryEmitter.emit('loadend');

    // should reload if the page just loaded with updates
    if ('updateready' === ev.type && !alreadyChecked) {
      setTimeout(function () {
        if (confirm('A new version of this site is available. Load it?')) {
          reload();
        }
      }, 500);
      return;
    }

    // this only happens the very first time the app is cached
    if ('cached' === ev.type) {
      localStorage.setItem('application-cache-cached', "true");
    }

    onInstallEnd(ev);
  }

  function addOnCacheLoad() {
    // start and end events always happen
    appCache.on('checking', onInstallStart, false);
    appCache.on('noupdate', onInstallEnd, false);

    appCache.on('error', onInstallError, false);

    // loadstart, progress happen only if an update is available
    appCache.on('downloading', onInstallLoadStart, false);
    appCache.on('progress', onInstallProgress, false);

    // onUpdateEnd handles loadend, error, and end
    appCache.on('updateready', onInstallLoadEnd, false);
    appCache.on('cached', onInstallLoadEnd, false);
  }

  // Check Every X Minutes
  function setUpdateInterval(period) {
    period = Number(period) || defaultUpdatePeriod;
    clearInterval(updateInterval);
    if (period < 1) {
      return;
    }

    period *= (60 * 1000);
    updateInterval = setInterval(appCache.update, period);
  }

  function setOnlineCheckInterval(period) {
    period = Number(period) || defaultUpdatePeriod;
    // TODO
    return;
  }

  // It may be possible for the update to be
  // in progress before the loading begins?
  window.addEventListener('load', addOnCacheLoad, false);

  setUpdateInterval();
  setOnlineCheckInterval();

  loadEmitter.on('end', function () {
    primaryEmitter = updateEmitter;
    alreadyChecked = true;
  });

  updateEmitter.on('end', function () {
    updateIsDownloading = false;
  });

  exports.setUpdateInterval = setUpdateInterval;
  exports.setOnlineCheckInterval = setOnlineCheckInterval;
  exports.isFirstRun = isFirstRun;
  exports.isInstalled = function () {
    !isFirstRun();
  };
  exports.load = loadEmitter;
  exports.update = updateEmitter;
  exports.checkNow = function () {
    appCache.update();
  };
  exports.reload = reload;

  provide('app-cache', exports);
}());
