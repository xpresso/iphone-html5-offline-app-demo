(function () {
  "use strict";

  //
  // Remote Favicon Loader Strategy
  //
  // This stragety relies on the ability to load cross-site images
  //
  // Note: When an Application Cache, this strategy will
  // only work if a NETWORK section specifies '*' or the prefix URLs
  // for each site. Using a prefix pattern will not work.

  var favilist;
  try {
    favilist = require('amionline-favinet-list').urls
  } catch(e) {
    favilist = [];
  }

  function randomize () {
    return 0.5 - Math.random();
  }

  function abort(img, i, imgs) {
    // The only way to really abort an image load
    // is with window.stop(), but this aborts any
    // ajax calls currently in progress and would
    // be a very bad idea to try here
    // http://stackoverflow.com/q/930237/151312
    // window.stop();

    // this probably doesn't do anything at all
    delete imgs[i];

    // this would have to be set to a known-good
    // cached image to have positive effect
    // img.src="";
  }

  function create(cb, options) {
    options = options || {};

    var newFavs = options.list || favilist.slice()
      , oldFavs = []
      , imgs = []
      // if two major sites don't respond, and we *are* online
      // there are probably big enough network issues that
      // it would be fair enough to say that we aren't
      , tryatonce = options.atatime || 2
      , isChecking;

    if (0 === newFavs.length) {
      throw new Error('List of favicons is empty!!!');
    }

    newFavs.sort(randomize);

    function respond(status) {
      isChecking = false;
      cb(status);
    }

    function request(favicon) {
      var img = new Image()
        , timeoutid = -1;

      img.src = favicon + "?_no_cache_=" + new Date().valueOf();

      // if any succeed, we're online
      function onLoad(ev) {
        clearTimeout(timeoutid);
        img.failed = false;
        // since we can't reliably abort images, we just
        // make the array size zero
        if (imgs.length !== tryatonce) {
          console.log('ret', imgs.length, oldFavs.length, newFavs.length);
          return;
        }
        imgs.forEach(abort);
        imgs = [];
        respond('online');
      }

      // if all fail, we're probably not online
      // if at least one succeeded, we're online
      function onError() {
        console.log('failed', favicon, imgs.length, oldFavs.length, newFavs.length);
        var allFailed = true;

        img.failed = true;

        imgs.forEach(function (img) {
          if (true !== img.failed) {
            allFailed = false;
          }
        });

        // Also: check length for the case that one fails 
        // after another has succeeded and the array 
        // has already been cleared
        if (!allFailed || imgs.length !== tryatonce) {
          return;
        }

        imgs = [];
        // If all failed, we're probably offline
        respond('offline');
      }

      function onTimeout() {
        console.log('timeout');
        onError();
      }

      img.onload = onLoad;
      img.onerror = onError;
      timeoutid = setTimeout(onTimeout, 5000);
      imgs.push(img);

      oldFavs.push(favicon);
    }

    function check() {
      var favs;

      if (true === isChecking) {
        return;
      }

      isChecking = true;

      if (newFavs.length < tryatonce) {
        newFavs = newFavs.concat(oldFavs);
        oldFavs = [];
        newFavs.sort(randomize);
      }

      favs = newFavs.splice(0, tryatonce);
      favs.forEach(request);
    }

    return check;
  }

  exports.create = create;
  provide("amionline-favinet", exports);
}());
