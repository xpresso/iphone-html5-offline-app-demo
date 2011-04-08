(function () {
  "use strict";

  require('require-kiss');

  var EventEmitter = require('events').EventEmitter
    , navigator = window.navigator
    , Periodic = require('periodic');

  function dummyStrategy() {
    return {
      create: function () {
        return function () {};
      }
    };
  }

  function create(options) {
    var emitter = new EventEmitter()
      , useBrowser = true
      , useNotFound = true
      , useAppCache = false
      , useFavinet = true
      , useInternet = true
      , useOrigin = true
      , strategies = {}
      , periodics = {};

    options = options || {};

    if ('undefined' === navigator.onLine) {
      emitter.status = 'online';
    } else {
      emitter.status = navigator.onLine && 'online' || 'offline';
    }
    emitter.browserStatus = emitter.status;

    // whether or not to try to load remote favicons
    if ('undefined' !== typeof options.favinet) {
      useFavinet = !!options.favinet;
    }
    if (useFavinet) {
      strategies.internet = require('amionline-favinet');
    }
    useInternet = useFavinet;

    // TODO use dummy strategies

    // Use either 404 or app-cache or none
    // If both appCache and 404 are true, appCache wins
    if ('undefined' !== typeof options.local) {
      useNotFound = !!options.local;
    }
    if ('undefined' !== typeof options.appCache) {
      useAppCache = !!options.appCache;
    }
    if (useAppCache) {
      useNotFound = false;
      strategies.origin = require('amionline-local');
    }
    if (useNotFound) {
      strategies.origin = require('amionline-app-cache');
    }
    useOrigin = useNotFound || useAppCache;


    // whether or not to use the browser detection
    if ('undefined' !== typeof options.browser) {
      useBrowser = !!options.browser;
    }


    function createPeriodicEmitter(key, Strategy, howoften) {
      var status
        , check
        , periodic;
      
      // TODO relay(err, evname)
      function relay(evname, msg) {
        if (status !== evname) {
          emitter.emit(key, evname, msg);
          status = evname;
        }
      }

      check = Strategy.create(relay);
      periodic = Periodic.create(check, howoften);
      periodic.checkNow = periodic.run;
      periodics[key] = periodic;
      return periodic;
    }

    function createBrowserEmitter() {
      var status = navigator.onLine && 'online' || 'offline';

      emitter.status = status;

      function handleWindowOnline() {
        if (status === navigator.onLine) {
          return;
        }
        emitter.emit('amionline.browser', navigator.onLine);
        status = navigator.onLine;
      }

      // window.onLine can reliably determine that the browser is offline
      // it cannot reliably determine that the browser if online
      // http://www.w3.org/TR/html5/offline.html#browser-state
      window.addEventListener('online', handleWindowOnline, false);
      window.addEventListener('offline', handleWindowOnline, false);

      // I wonder if the online event ever skips firing
      // particularly I worry about sleep / wakeup
      setInterval(handleWindowOnline, 10000);
    }

    if (useOrigin) {
      periodics.origin = createPeriodicEmitter('amionline-origin', strategies.origin, 5000);
    }

    if (useInternet) {
      periodics.internet = createPeriodicEmitter('amionline-internet', strategies.internet, 10000);
    }

    if (useBrowser) {
      createBrowserEmitter();
    }


    //
    // Interpreting the status results
    //
    /*

        | Browser |  Origin  | Internet ||   STATUS   |
        +=========+==========+==========++============+
        |   OFF!  |         ---         ||    OFF     |
        +---------+----------+----------++------------+
        |         |    OFF!  |   ---    ||    OFF     |
        +         +----------+----------++------------+
        |   ON    |    ON!   |   ---    ||    ON      |
        +         +----------+----------++------------+
        |         |         OFF         ||    OFF     |
        +---------+----------+----------++------------+

    */
    emitter.on('amionline-state', function (status) {
      // In the case that the internet is live,
      // but the site is down
      if ('offline' === emitter.originStatus) {
        status = 'offline';
      } else if ('online' === emitter.originStatus) {
        status = 'online';
      }

      // For the rare case that a request finished
      // after the browser goes into offline mode
      if ('offline' === emitter.browserStatus) {
        status = 'offline';
      }

      // If the status hasn't changed
      // don't emit anything
      if (status === emitter.status) {
        return;
      }
      emitter.status = status;

      emitter.emit(status);
    });


    // if the browser is offline, that's final
    // if the browser is online, wait for confirmation before declaring it
    emitter.on('amionline-browser', function (status) {
      if (status === emitter.browserStatus) {
        return;
      }
      emitter.browserStatus = status;

      // toggle everything off
      if ('offline' === status) {
        emitter.emit('amionline-internet', 'offline');
        emitter.emit('amionline-origin', 'offline');
        emitter.emit('amionline-state', 'offline');
      } /* else {
        emitter.emit('amionline-state', 'offline');
      } */

      emitter.emit('browser', status);
    });


    // if the site is up, it's online
    // if the site is down, it's not
    emitter.on('amionline-origin', function (status) {
      if (status === emitter.originStatus) {
        return;
      }

      if ('offline' === status || 'error' === status) {
        status = 'offline';
      }
      emitter.originStatus = status;
      emitter.emit('amionline-state', status);

      emitter.emit('origin', status);
    });


    // if the internet is reachable, that's final
    // if it isn't, wait for confirmation before declaring it
    emitter.on('amionline-internet', function (status) {
      if (status === emitter.internetStatus) {
        return;
      }

      if ('offline' === status || 'error' === status) {
        status = 'offline';
      }
      emitter.internetStatus = status;
      emitter.emit('amionline-state', status);

      emitter.emit('internet', status);
    });

    emitter.use = createPeriodicEmitter;
    emitter.periodics = periodics;
    emitter.start = function (name, interval) {
      periodics[name].start(interval);
    };
    emitter.stop = function (name) {
      periodics[name].stop();
    };
    return emitter;
  }

  exports.create = create;
  provide('amionline', exports);
}());
