iPhone HTML5 Offline App Demo
====

    git clone git://github.com/coolaj86/iphone-html5-offline-app-demo.git
    cd iphone-html5-offline-app-demo

**Node.JS server**

You can use any web server. I'm not doing anything special with `node` here.

You just have to make sure that `main.manifest` loads with the mime-type `text/cach-manifest`

    npm install spark
    spark

**iPhone**

Let's assume the ip address of your server is `192.168.1.100`

  0. visit http://192.168.1.100:3080
  0. Click `[->]` icon and select "Add to Home Screen"

Notes
====

  * The cache manifest may not be named `cache.manifest`. `main.manifest` works fine.
  * If there is an error in your cache manifest, your app will not update
    * you delete a file that was listed
    * you list a new file that doesn't exist
  * The cache manifest is NOT checked by modification date. It is checked bit-for-bit

Resources
====

  * [Apple Offline Application Cache](http://developer.apple.com/library/safari/#documentation/iPhone/Conceptual/SafariJSDatabaseGuide/OfflineApplicationCache/OfflineApplicationCache.html)
  * [Red Green](http://kentbrewster.com/backchannel/)
