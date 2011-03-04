iPhone HTML5 Offline App Demo
====

Please post any mistakes or notes you have on the issues page (or fork me) and I'll add the necessary information.

Apple calls these "Web Clips" (online) or "Offline Applications" (offline).

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

Annotated Directory Structure
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

        behavior.js
        db/
            flashcards.js
            ice-cream.png
            pizza.png
            soda.png
        javascripts/
            flashcards.js
            jquery.min.js

        presentation.css

Note: It might be useful to store all assets which will be available offline in a folder called "assets" and write a script to walk the directory and produce the cache manifest (always with the current datestamp) including those assets. This will save you a lot of headache.

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

  * [Apple: HTML5 Offline Application Cache](http://developer.apple.com/library/safari/#documentation/iPhone/Conceptual/SafariJSDatabaseGuide/OfflineApplicationCache/OfflineApplicationCache.html)
  * [Apple: Configuring Web Applications](http://developer.apple.com/library/safari/#documentation/appleapplications/reference/safariwebcontent/ConfiguringWebApplications/ConfiguringWebApplications.html)
  * [Red Green](http://kentbrewster.com/backchannel/)
