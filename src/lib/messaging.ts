import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp, getApp } from 'firebase/app';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Requests native browser permission for notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn("Ce navigateur ne supporte pas les notifications de bureau.");
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error("Erreur lors de la demande de permission de notification :", error);
    return false;
  }
}

/**
 * Triggers a native system push notification if permission is granted
 */
export function sendLocalNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    try {
      // Use standard ServiceWorker registration if available, or fallback to new Notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/assets/logo.jpeg',
            badge: '/assets/logo.jpeg',
            tag: 'huinestfood-order',
            requireInteraction: true
          });
        }).catch(() => {
          // Fallback to simple Notification
          new Notification(title, { body, icon: '/assets/logo.jpeg' });
        });
      } else {
        new Notification(title, { body, icon: '/assets/logo.jpeg'});
      }
    } catch (e) {
      // In some sandboxed iframes, new Notification() is blocked, so we log it
      console.warn("La notification système a été bloquée par l'iframe ou le navigateur :", e);
    }
  }
}

/**
 * Initializes Firebase Cloud Messaging safely (wrapped for iframe safety)
 */
export function getFcmInstance(): Messaging | null {
  try {
    const app = getApp();
    const messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.warn("Firebase Cloud Messaging n'est pas disponible dans ce contexte (ex: iframe de prévisualisation).", error);
    return null;
  }
}

/**
 * Registers FCM and returns the FCM registration token
 */
export async function getFcmToken(vapidKey?: string): Promise<string | null> {
  const messaging = getFcmInstance();
  if (!messaging) return null;

  try {
    // Le service worker DOIT être explicitement enregistré avant getToken(),
    // sinon FCM ne peut pas recevoir les messages en arrière-plan.
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return token;
  } catch (error) {
    console.warn("Impossible d'obtenir le token FCM (vraisemblablement à cause de l'iframe de prévisualisation) :", error);
    return null;
  }
}

/**
 * Sauvegarde le token FCM d'un appareil "staff" dans Firestore, pour que la
 * Cloud Function puisse lui envoyer une vraie push à chaque nouvelle commande.
 * Appelle ça une fois que le staff est identifié comme en mode "management".
 */
export async function registerStaffDeviceForPush(vapidKey: string): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const token = await getFcmToken(vapidKey);
  if (!token) return false;

  try {
    await setDoc(doc(db, 'staffDeviceTokens', token), {
      token,
      updatedAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
    return true;
  } catch (error) {
    console.error("Erreur en sauvegardant le token FCM staff :", error);
    return false;
  }
}

/**
 * Écoute les messages FCM reçus pendant que l'app est OUVERTE au premier plan
 * (quand elle est fermée, c'est le service worker `firebase-messaging-sw.js` qui gère).
 */
export function listenForForegroundMessages(onOrderNotification: (title: string, body: string) => void) {
  const messaging = getFcmInstance();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    const { title, body } = payload.notification || {};
    onOrderNotification(title || 'Nouvelle Commande 🍕', body || '');
  });
}