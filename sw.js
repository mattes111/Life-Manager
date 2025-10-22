// Life Manager Pro - Service Worker
const CACHE_NAME = "life-manager-pro-v1.0.0";
const STATIC_CACHE_NAME = "life-manager-static-v1.0.0";
const DYNAMIC_CACHE_NAME = "life-manager-dynamic-v1.0.0";

// Files to cache for offline functionality
const STATIC_FILES = [
  "/",
  "/index.html",
  "/script.js",
  "/style.css",
  "/manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("Service Worker: Static files cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Error caching static files", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated successfully");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log("Service Worker: Serving from cache", request.url);
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // Don't cache non-successful responses
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone the response for caching
          const responseToCache = networkResponse.clone();

          // Cache dynamic content
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            // Only cache certain file types
            if (shouldCache(request.url)) {
              cache.put(request, responseToCache);
              console.log(
                "Service Worker: Cached dynamic content",
                request.url
              );
            }
          });

          return networkResponse;
        })
        .catch((error) => {
          console.log(
            "Service Worker: Network request failed",
            request.url,
            error
          );

          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }

          // Return cached version if available for other requests
          return caches.match(request);
        });
    })
  );
});

// Helper function to determine if a URL should be cached
function shouldCache(url) {
  const urlObj = new URL(url);

  // Cache images, CSS, JS, and fonts
  const cacheableExtensions = [
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".woff",
    ".woff2",
    ".ttf",
  ];
  const hasCacheableExtension = cacheableExtensions.some((ext) =>
    urlObj.pathname.endsWith(ext)
  );

  // Cache same-origin requests
  const isSameOrigin = urlObj.origin === location.origin;

  // Cache CDN resources we use
  const isCDNResource =
    urlObj.hostname.includes("cdnjs.cloudflare.com") ||
    urlObj.hostname.includes("fonts.googleapis.com") ||
    urlObj.hostname.includes("fonts.gstatic.com");

  return hasCacheableExtension || isSameOrigin || isCDNResource;
}

// Background sync for offline data
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync tasks
      handleBackgroundSync()
    );
  }
});

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received");

  const options = {
    body: event.data
      ? event.data.text()
      : "Neue Benachrichtigung von Life Manager Pro",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Öffnen",
        icon: "/icons/icon-96x96.png",
      },
      {
        action: "close",
        title: "Schließen",
        icon: "/icons/icon-96x96.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Life Manager Pro", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event.action);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    // Get pending data from IndexedDB or localStorage
    const pendingData = await getPendingData();

    if (pendingData && pendingData.length > 0) {
      console.log(
        "Service Worker: Syncing pending data",
        pendingData.length,
        "items"
      );

      // Process pending data
      for (const item of pendingData) {
        await syncDataItem(item);
      }

      // Clear pending data after successful sync
      await clearPendingData();
    }
  } catch (error) {
    console.error("Service Worker: Background sync failed", error);
  }
}

// Get pending data from storage
async function getPendingData() {
  try {
    // This would typically use IndexedDB for more robust offline storage
    // For now, we'll use a simple approach with localStorage
    const pendingData = localStorage.getItem("pendingSyncData");
    return pendingData ? JSON.parse(pendingData) : [];
  } catch (error) {
    console.error("Service Worker: Error getting pending data", error);
    return [];
  }
}

// Sync individual data item
async function syncDataItem(item) {
  try {
    // Here you would typically send data to your server
    // For now, we'll just log it
    console.log("Service Worker: Syncing item", item);

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 100));

    return true;
  } catch (error) {
    console.error("Service Worker: Error syncing item", error);
    return false;
  }
}

// Clear pending data after successful sync
async function clearPendingData() {
  try {
    localStorage.removeItem("pendingSyncData");
    console.log("Service Worker: Cleared pending data");
  } catch (error) {
    console.error("Service Worker: Error clearing pending data", error);
  }
}

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    const urlsToCache = event.data.urls;
    event.waitUntil(
      caches
        .open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.addAll(urlsToCache);
        })
        .then(() => {
          console.log("Service Worker: URLs cached successfully");
        })
    );
  }
});

console.log("Service Worker: Loaded successfully");
