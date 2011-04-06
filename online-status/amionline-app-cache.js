(function () {
  "use strict";

  //
  // App Cache Status
  //
  // This strategy is great if you're using a cache manifest
  //
  // The cache manifest should contain the *relative* paths
  //   FALLBACK:
  //   ./online.json ./offline.json
  //
  // `online.json` must contain {"status": "online"}
  // `offline.json` must contain {"status": "offline"}
  // if online, online.json is retrieved
  // if offline, offline.json is retreived from the cache
  function create(cb, options) {
    options = options || {};

    var isChecking = false
      , waitfor = options.timeout || 2000;

    function respond(status, err) {
      isChecking = false;
      cb(status, err);
    }

    function request() {
      var xhr = new XMLHttpRequest()
        , result = 'error'
        , timeoutid = -1;

      function handleStateChange() {
        var data, msg;

        if (xhr.readyState !== 4) {
          return;
        }

        clearTimeout(timeoutid);

        if(200 !== xhr.status) {
          msg = " ";
          if (0 === xhr.status) {
            msg += "(offline.json was not found or the server could not contacted and the application cache is misconfigured)";
          }
          if (404 === xhr.status) {
            msg += "(online.json was not found)";
          }
          respond('error', new Error("HTTP Status should be 200, but was " + xhr.status + msg));
          return;
        }

        try {
          data = JSON.parse(xhr.responseText);
        } catch(e) {
          respond('error', e);
          return;
        }

        if ('online' === data.status) {
          respond(data.status);
        } else if ('offline' === data.status) {
          respond(data.status);
        } else {
          respond('error', new Error("status neither 'offline' nor 'online'"));
        }
      }

      function assumeError() {
        xhr.abort();
        respond('error', new Error("timeout after " + waitfor + "ms"));
      }

      timeoutid = setTimeout(assumeError, waitfor);

      xhr.open("GET", "online.json?_invalidate_cache_=" + new Date().valueOf(), true);
      xhr.onreadystatechange = handleStateChange;
      xhr.send();
    }

    function check() {
      if (true === isChecking) {
        return;
      }
      isChecking = true;
      request();
    }

    return check;
  }

  exports.create = create;
  provide('amionline-app-cache', exports);
}());
