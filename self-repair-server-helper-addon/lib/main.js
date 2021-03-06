/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, console */

"use strict";

let prefSvc = require("sdk/preferences/service");

let {Cc, Cu} = require("chrome");

// services
let {Services} = Cu.import("resource://gre/modules/Services.jsm");

let simpleprefs = require("sdk/simple-prefs");

let httpsPref = {
  orig: null,
  pref: "browser.uitour.requireSecure",
  set: function() {
    if (this.orig === null) this.orig = prefSvc.get(this.pref);
    prefSvc.set(this.pref, false);
  },
  unset: function () {
    if (this.orig === null) return
    prefSvc.set(this.pref, this.orig);
  }
};

let data = require("sdk/self").data;

let addPerm = function (uri) {
  console.log("ADDING:", uri);
  let pageURI = Services.io.newURI(uri, null, null);
  Services.perms.add(pageURI, "uitour", Services.perms.ALLOW_ACTION);
  let good = Services.perms.testPermission(pageURI, "uitour") ===  Services.perms.ALLOW_ACTION;
  console.log("ADDED:", uri, good);
};

simpleprefs.on("uri", function () {
  addPerm(simpleprefs.prefs.uri);
});

// 07:29 <Dexter> like loadFrameScript("chrome://browser/content/content-UITour.js", true);
// ["availableTargets", "sync", "appinfo", "selectedSearchEngine"].forEach((k)=>window.Mozilla.UITour.getConfiguration(k, console.log.bind(console)))

/* set pref, open "tour" page */
exports.main = function (options) {
  let statics = options.staticArgs || {};

  httpsPref.set();
  simpleprefs.prefs.uri = "http://localhost:8000/deploy/en-US/repair/index.html?{%22phonehome%22:{%22testing%22:true},%22runner%22:{%22alwaysRun%22:true},%22personinfo%22:{%22updateChannel%22:%20%22nightly%22}}"; //data.url("tour.html");
  addPerm("http://localhost");

  if (statics.wait) {
    require("timers").setTimeout(()=>{
      require("sdk/tabs").open({
        url: simpleprefs.prefs.uri,
        inBackground: true
      })
    }, statics.wait);
  } else {
    require("sdk/tabs").open({
      url: simpleprefs.prefs.uri,
      inBackground: false
    });
  }
};


require("sdk/system/unload").when(function () {
  httpsPref.reset();
});

