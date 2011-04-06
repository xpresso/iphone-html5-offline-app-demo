(function () {
  "use strict";

  //
  // Local Site Status
  //
  // This strategy is simple and requires no changes for most servers
  //
  // we request a non-existing resource on the remote site
  // if the request comes back with a 404, the site is online
  // if the request comes back with < 100, the site is offline
  // if the request comes back with something else, there is an error
  function create(cb, options) {
    options = options || {};

    var isChecking;

    function respond(status) {
      isChecking = false;
      cb(status);
    }

    function request() {
      var xhr = new XMLHttpRequest()
        , url = (options.url || "/doesntexist/give-me-a-404/please") + "?_no_cache_=" + new Date().valueOf()
        , waitfor = options.timeout || 2000
        , result = 'error'
        , isChecking = false
        , timeoutid = -1;

      function handleStateChange() {
        if (xhr.readyState !== 4) {
          return;
        }

        clearTimeout(timeoutid);        

        if (404 === xhr.status) {
          result = 'online';
        } else if (xhr.status < 100) {
          result = 'offline';
        }

        // TODO add error
        respond(result);
      }

      xhr.open("GET", url, true);
      xhr.onreadystatechange = handleStateChange;
      xhr.send();

      function assumeOffline() {
        xhr.abort();
        respond('offline');
      }

      timeoutid = setTimeout(assumeOffline, waitfor);
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
  provide('amionline-local', exports);
}());
