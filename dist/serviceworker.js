(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var CACHE_NAME = 'arbiter';
// The files we want to cache
var urlsToCache = ['/', './style.css', './app-browserify.js', './polyfill.js'];

// Set the callback for the install step
self.addEventListener('install', function (event) {
  // Perform install steps
  // event.waitUntil(
  caches.open(CACHE_NAME).then(function (cache) {
    console.log('Opened cache');
    return cache.addAll(urlsToCache);
  });
});

// Set the callback when the files get fetched
self.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request).then(function (response) {
    // Cached files available, return those
    if (response) {
      return response;
    }

    // IMPORTANT: Clone the request. A request is a stream and
    // can only be consumed once. Since we are consuming this
    // once by cache and once by the browser for fetch, we need
    // to clone the response
    var fetchRequest = event.request.clone();

    // Start request again since there are no files in the cache
    return fetch(fetchRequest).then(function (response) {
      // If response is invalid, throw error
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // IMPORTANT: Clone the response. A response is a stream
      // and because we want the browser to consume the response
      // as well as the cache consuming the response, we need
      // to clone it so we have 2 stream.
      var responseToCache = response.clone();

      // Otherwise cache the downloaded files
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, responseToCache);
      });

      // And return the network response
      return response;
    });
  }));
});

},{}]},{},[1]);
