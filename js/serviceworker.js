var CACHE_NAME = 'arbiter'
// The files we want to cache
var urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './polyfill.js',
    './babel-standalone.js',
    './worker.html',
    './serviceworker.js'
]

// Set the callback for the install step
self.addEventListener('install', (event) => {
    // console.log('installing', event)
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            // console.log(cache) ||
            cache.addAll(urlsToCache))
    )
})

// Set the callback when the files get fetched
self.addEventListener('fetch', (event) => {
    // console.log(event.request, 'being requested')
    event.respondWith(
        caches.match(event.request).then((response) => {
            // console.log(response)
            // Cached files available, return those
            if (response) {
                return response
            }

            // IMPORTANT: Clone the request. A request is a stream and
            // can only be consumed once. Since we are consuming this
            // once by cache and once by the browser for fetch, we need
            // to clone the response
            var fetchRequest = event.request.clone()

            // Start request again since there are no files in the cache
            return fetch(fetchRequest).then(
                (response) => {
                    // If response is invalid, throw error
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have 2 stream.
                    var responseToCache = response.clone()

                    // Otherwise cache the downloaded files
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache)
                        })

                    // And return the network response
                    return response
                }
            )
        })
    )
})

self.addEventListener('activate', (event) => {
    // console.log('activating', event)
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) =>
                    // cacheName !== CACHE_NAME &&
                    caches.delete(cacheName))
            )
        })
    )
})
