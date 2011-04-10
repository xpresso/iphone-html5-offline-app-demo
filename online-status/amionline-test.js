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

  amionline.on('online', function (err) {
    console.log('ONLINE');
    document.getElementById('online-status').innerHTML = 'online';
  });

  amionline.on('offline', function (err) {
    console.log('OFFLINE');
    document.getElementById('online-status').innerHTML = 'offline';
  });



  // Precise
  window.addEventListener('load', function () {
    document.getElementById('browser-status').innerHTML = amionline.browserStatus;
  }, 'false');

  amionline.on('browser', function (err, status) {
    // status === amionline.browserStatus;
    console.log('BROWSER: ' + status);
    document.getElementById('browser-status').innerHTML = status;
  });

  amionline.on('origin', function (err, status) {
    // status === amionline.originStatus;
    console.log('ORIGIN: ' + status);
    document.getElementById('origin-status').innerHTML = status;
  });

  amionline.on('internet', function (err, status) {
    // status === amionline.internetStatus;
    console.log('INTERNET: ' + status);
    document.getElementById('internet-status').innerHTML = status;
  });



  // checkNow - use callback and feed status to callback, regardless if the status has changed
  amionline.checkNow('internet', function (err, status) {
    console.log('checkNow', 'internet', err, status);
  });
  amionline.checkNow('origin', function (err, status) {
    console.log('checkNow', 'origin', err, status);
  });



  // checkNow - emit ASAP if there has been any change
  amionline.checkNow('internet');
  amionline.checkNow('origin');


  setTimeout(function () {
    amionline.stop('internet');
    amionline.stop('origin');
    console.log('stopped checks');
  }, 20000);
}());
