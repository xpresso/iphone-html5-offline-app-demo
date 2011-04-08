Am I Online?
====

`amionline` is designed to be

  * accurate
  * precise
  * informative


`amionline` can accurately provide your application with the **online status** of your user's browser.

    var amionline = require('amionline').create();
    amionline.start('internet', 10000); // check internet connectivity every 10s
    amionline.start('origin', 5000); // check origin connectivity every 5s

    console.log('Initial state is: ' + amionline.status);

    amionline.on('online', function () {
      console.log('Connection State is now online');
    });

    amionline.on('offline', function () {
      console.log('Connection State is now offline');
    });


`amionline` can also provide precise information as to the **type of connectivity**.

    amionline.on('browser', function (status) {
      // status === amionline.browserStatus;
      console.log('The browser now believes that it is: ' + status);
    });

    amionline.on('origin', function (status) {
      // status === amionline.originStatus;
      console.log('In relation to the site origin we are: ' + status);
    });

    amionline.on('internet', function (status) {
      // status === amionline.internetStatus;
      console.log('In relation to the internet we are: ' + status);
    });


`amionline` can help you infer **details** that may be important to your application.

  * If the `internet` connection is good, but the `origin` cannot be contacted
    * the server may be down, slow, or erroring

  * If the `origin` can be contacted, but the `internet` cannot
    * perhaps a firewall or proxy is blocking it
    * perhaps the `application cache` is not configured with `*` allowed in the `NETWORK:` section

Example:

    amionline.on('internet', function (status) {
      if ('online' === status && 'offline' === amionline.originStatus) {
        console.log('Oopsies! Our own site may be experiencing technical difficulties');
      }
    });


`amionline` can be used to register your own connectivity checks
(maybe you have a CORS/XHR2 peer device or a partner site)

    // TODO this is not yet implemented

    function checkPartnerX(callback) {
      $.get('http://our.partnerx.com/status' + new Date().valueOf(), function (data) {
        if ('OK' === data) {
          callback('online');
        } else {
          callback('offline');
        }
      });
    }
    amionline.use('partnerx', checkPartnerX, 10000); // run checkPartnerX every 10 seconds
    amionline.on('partnerx', function (status) {
      console.log('');
    });

Events
====

Simple high-level events

  * `online`
    * emitted the `origin` is online
    * `origin` checking is turned off, but `internet` is online
    * `origin` and `internet` checking are turned off, but `browser` is online

  * `offline`
    * the browser reports `offline`
    * the `origin` is offline
    * both `origin` and `internet` are offline

"Raw" Events that pass the either `online` or `offline` as the message

  * `browser`
    * listens to browser events
    * `offline` if in `offline mode` or OS network connections are unavailable

  * `origin`
    * either polls `/doesntexist` for a `404` or polls `./online.json` from the `applicationCache`
    * `online` if a `404` or `online.json` is retrieved
    * `offline` if a non-`404` or `offline.json` is retrieved
    * TODO `error`

  * `internet`
    * polls `favicon.ico` from several popular sites only if `origin` is not configured or is `offline`
    * `online` when `favicon.ico` can be retrieved
    * `offline` when at least two `favicon.ico`s fail to load

How is the state determined?
====

With the default settings, the online status is determined in this fashion:

      +=========+==========+==========++============+
      | Browser |  Origin  | Internet ||   STATUS   |
      +=========+==========+==========++============+
      |   OFF!  |         ---         ||    OFF     |
      +---------+----------+----------++------------+
      |         |   OFF!   |    ---   ||    OFF     |
      +         +----------+----------++------------+
      |   ON    |    ON!   |    ---   ||    ON      |
      +         +----------+----------++------------+
      |         |         OFF         ||    OFF     |
      +---------+----------+----------++------------+

Note:

  * If `origin` is not configured, then `internet` is used to determine online status.
