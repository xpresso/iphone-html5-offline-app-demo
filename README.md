iPhone HTML5 Offline App Demo
====

Try it now on the [**Live Demo**](http://coolaj86.info/iphone-html5-offline-app-demo)


Please post any mistakes or notes you have on the issues page (or fork me) and I'll add the necessary information.

Apple calls these "Web Clips" (online) or "Offline Applications" (offline).

    git clone git://github.com/coolaj86/iphone-html5-offline-app-demo.git
    cd iphone-html5-offline-app-demo

**Node.JS server**

You can use any web server. I'm not doing anything special with `node` here.

You just have to make sure that `main.manifest` loads with the mime-type `text/cach-manifest`

    npm install spark
    spark

Putting an Offline App on the Home Screen
----

Let's assume the ip address of your server is `192.168.1.100` running on port `3080`.

You'll visit `http://192.168.1.100:3080` and choose one of the apps and then add it to the **Home Screen** as follows:

**iPhone**

  0. Click `[->]` icon in Safari
  0. Select "Add to Home Screen"

**Android**

  0. visit http://192.168.1.100:3080
  0. Click `menu`
  0. Click `Bookmarks`
  0. Click `Add`
  0. Exit to Home Screen
  0. Click and Hold in empty space
  0. Select `Shortcut`
  0. Select `Bookmark`
  0. Click the app
  0. Shoot yourself... users will never be able to figure out all of these steps - I can barely do it!

Try the process of adding an app to your home screen right now with [Backchannel: Offline Red Green App](http://kentbrewster.com/backchannel/bc.html)

Annotated Directory Structure of an app
----

From the document root

    public/
        index.html

        // this is a tricky beast that maks the magic happen
        main.manifest


        // iOS 4.2 allows for various sizes and looks for these files in this order
        apple-touch-icon-114x114-precomposed.png
        apple-touch-icon-114x114.png
        apple-touch-icon-72x72-precomposed.png
        apple-touch-icon-72x72.png
        apple-touch-icon-57x57-precomposed.png
        apple-touch-icon-57x57.png

        // iOS 2.0 added support for precomposed images
        apple-touch-icon-precomposed.png

        // iOS 1.1.3 added support for icons
        apple-touch-icon.png

        // iOS 3 added support for startup screens
        apple-touch-startup-image.png

        pages/
            article1.html
            article2.html

        offline-assets/
            offline.html
            libs.js
            app.js
            logo.png
            style.css

        online-assets/
            search
            db.json
            auth

Note: It might be useful to store all assets which will be available offline in a folder called "assets" and write a script to walk the directory and produce the cache manifest (always with the current datestamp) including those assets. This will save you a lot of headache.

Cache Manifest
----
call this `main.manifest`. DO NOT call it `cache.manifest` (works in Chrome, not on iPhone)

    CACHE MANIFEST
    # That must be the very first line
    # comments must be on their own line

    # version 0.0.1
    # bump the version any time you edit ANY of the CACHE assets
    # otherwise they won't get updated when the app comes back online
    
    CACHE:
    # list ALL assets which should be downloaded for offline use
    # no pattern matching is supported
    /offline-assets/offline.html
    /offline-assets/libs.js
    /offline-assets/app.js
    /offline-assets/logo.png
    /offline-assets/style.css

    FALLBACK:
    # give the offline equivalent of a 404
    # the first item is always treated as a prefix pattern
    # the second is always treated as the resource to provide
    /pages/ /offline-assets/offline.html
    / /offline.html

    NETWORK:
    # list any assets which are allowed to be fetched 
    # from an online source even after the caching is complete
    # can use * or prefix pattern matching
    /online-assets/
    http://www.google.com/api/search

Fun fact: You don't have to use `\r\n` in the Cache Manifest. `\r` and `\n` are also okay.

Notes
====

  * The cache manifest may not be named `cache.manifest`. `main.manifest` works fine.
  * If there is an error in your cache manifest, your app will not update
    * you delete a file that was listed
    * you list a new file that doesn't exist
  * The cache manifest is NOT checked by modification date. It is checked bit-for-bit
  * The cache size is limited to 5mb

Resources
====

  * [Backchannel: Source Code and Instruction](http://kentbrewster.com/backchannel/)
  * [Apple: HTML5 Offline Application Cache](http://developer.apple.com/library/safari/#documentation/iPhone/Conceptual/SafariJSDatabaseGuide/OfflineApplicationCache/OfflineApplicationCache.html)
  * [Apple: Configuring Web Applications](http://developer.apple.com/library/safari/#documentation/appleapplications/reference/safariwebcontent/ConfiguringWebApplications/ConfiguringWebApplications.html)
