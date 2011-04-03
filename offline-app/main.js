(function () {
  "use strict";

  var appCache = require('app-cache')
    , getEl = function (a, b, c, d) {
        return document.getElementById(a, b, c, d);
      };

  function domListener(ev) {
    console.log('domEvent', ev, new Date().toISOString());
    if ('update-check' === ev.target.getAttribute('name')) {
      console.log('update');
      appCache.checkNow();
    }
  }

  function onDomReady() {
    console.log('domReady', new Date().toISOString());
    document.body.addEventListener('click', domListener, false);
  }
  window.addEventListener('load', onDomReady, false);

  //appCache.setUpdateInterval(1 * 60 * 60 * 1000);

  function showProgress(prefix, ev) {
    if (undefined !== ev.total) {
      document.getElementById(prefix + '-phase-total').innerHTML = 'of ' + String(ev.total);
      document.getElementById(prefix + '-progress').setAttribute('value', ev.loaded);
      document.getElementById(prefix + '-progress').setAttribute('max', ev.total);
    } else {
      document.getElementById(prefix + '-progress').innerHTML = ev.loaded;
    }
    document.getElementById(prefix + '-phase').innerHTML = ev.loaded;
  }
  
  //
  // INSTALL or UPDATE on initial page load
  //
  window.addEventListener('load', function () {
  appCache.load.on('start', function () {
    console.log('############### start');
      var msg;
      document.getElementById('installer').setAttribute('style', "display: block;");
      if (!appCache.isInstalled()) {
        msg = "Welcome For the First Time";
      } else {
        msg = "Welcome Back. Updating";
      }
      document.getElementById('inst-start').innerHTML = msg;
  });
  appCache.load.on('loadstart', function () {
    console.log('############### startload');
      // dom should (but may not be) ready by this point
      getEl('inst-loadstart').innerHTML = "started download";
  });
  appCache.load.on('progress', function (ev) {
      showProgress('inst', ev);
  });
  appCache.load.on('error', function () {
      getEl('inst-error').innerHTML = "Unexpected Error";
  });
  appCache.load.on('loadend', function () {
    getEl('inst-loadend').innerHTML = "Install Complete";
  });
  appCache.load.on('end', function () {
    getEl('inst-end').innerHTML = "The End. (ready to start application)";
  });
  });

  //
  // UPDATE
  //
  //appCache.update.on('start', showWelcomeMessage);
  appCache.update.on('error', function () {
    console.log("UPDATE ERROR");
    getEl('up-error').innerHTML = "update failed. try again later";
  });
  appCache.update.on('loadstart', function () {
    getEl('updater').setAttribute('style', '');
    getEl('up-loadstart').innerHTML = "load start";
  });
  appCache.update.on('progress', function (ev) {
    showProgress('up', ev);
  });
  appCache.update.on('loadend', function () {
    getEl('up-loadend').innerHTML = "load end";
  });
  //appCache.update.on('end', showEnd);
}());
