/* eslint-disable max-len */
// functions/src/index.ts
// Déploiement : firebase deploy --only functions
// Nécessite le plan Blaze (pay-as-you-go) — le tier gratuit couvre largement un usage
// de petit resto (2M invocations/mois gratuites).

import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

export const notifyStaffOnNewOrder = onDocumentCreated("orders/{orderId}", async (event) => {
  const order = event.data?.data();
  if (!order) return;

  // On ne notifie que pour les commandes fraîchement payées / reçues
  if (order.status !== "paid" && order.status !== "received") return;

  const tokensSnap = await db.collection("staffDeviceTokens").get();
  const tokens = tokensSnap.docs.map((d) => d.id);

  if (tokens.length === 0) {
    console.log("Aucun appareil staff enregistré pour recevoir la notification.");
    return;
  }

  const message = {
    notification: {
      title: "Nouvelle Commande ! 🍕",
      body: `Commande #${event.params.orderId} de ${order.clientName} (${order.total?.toLocaleString("fr-FR")} FCFA)`,
    },
    tokens,
  };

  const response = await messaging.sendEachForMulticast(message);

  // Nettoyage des tokens invalides (appareil désinstallé, permission révoquée, etc.)
  const invalidTokens: string[] = [];
  response.responses.forEach((res, idx) => {
    if (!res.success) {
      const code = res.error?.code;
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
        invalidTokens.push(tokens[idx]);
      }
    }
  });

  await Promise.all(invalidTokens.map((t) => db.collection("staffDeviceTokens").doc(t).delete()));
});
