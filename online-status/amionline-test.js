(function () {
  "use strict";

  require('require-kiss');

  var amionline = require('amionline').create();
  amionline.start('internet', 4000);
  amionline.start('origin', 4000);

  // Accurate
  console.log('Initial state is: ' + amionline.status);

  window.addEventListener('load', function () {
    document.getElementById('online-status').innerHTML = amionline.status;
  }, 'false');

  amionline.on('online', function () {
    console.log('ONLINE');
    document.getElementById('online-status').innerHTML = 'online';
  });

  amionline.on('offline', function () {
    console.log('OFFLINE');
    document.getElementById('online-status').innerHTML = 'offline';
  });



  // Precise
  window.addEventListener('load', function () {
    document.getElementById('browser-status').innerHTML = amionline.browserStatus;
  }, 'false');

  amionline.on('browser', function (status) {
    // status === amionline.browserStatus;
    console.log('BROWSER: ' + status);
    document.getElementById('browser-status').innerHTML = status;
  });

  amionline.on('origin', function (status) {
    // status === amionline.originStatus;
    console.log('ORIGIN: ' + status);
    document.getElementById('origin-status').innerHTML = status;
  });

  amionline.on('internet', function (status) {
    // status === amionline.internetStatus;
    console.log('INTERNET: ' + status);
    document.getElementById('internet-status').innerHTML = status;
  });

}());
