// public/firebase-messaging-sw.js
// Ce service worker doit être servi depuis la RACINE du site (https://tonsite.com/firebase-messaging-sw.js)
// pour pouvoir recevoir les notifications même app/onglet fermé.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
   apiKey: "AIzaSyD09yHGGhd_cVP1kRYF89dxEHd7uFZxemE",
  authDomain: "huinestfood-be0f5.firebaseapp.com",
  projectId: "huinestfood-be0f5",
  storageBucket: "huinestfood-be0f5.firebasestorage.app",
  messagingSenderId: "242262794996",
  appId: "1:242262794996:web:2263878742c3af058c74a1",
});

const messaging = firebase.messaging();

// Reçu quand l'app/l'onglet est fermé ou en arrière-plan
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Nouvelle Commande 🍕', {
    body: body || 'Une nouvelle commande vient d\'arriver.',
    icon: '/assets/logo.jpeg',
    badge: '/assets/logo.jpeg',
    tag: 'huinestfood-order',
    requireInteraction: true,
  });
});

// Ouvre/focus l'app quand on clique sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/?auth=1');
    })
  );
});