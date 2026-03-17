import * as admin from "firebase-admin";
import { config } from "@/lib/config";

function getApp(): admin.app.App | null {
  if (
    !config.firebase.projectId ||
    !config.firebase.clientEmail ||
    !config.firebase.privateKey
  ) {
    return null;
  }

  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });
}

export async function sendNotification(
  token: string,
  title: string,
  body: string
): Promise<string | null> {
  const app = getApp();
  if (!app) {
    console.warn("[Firebase] Not configured, skipping notification");
    return null;
  }

  const message: admin.messaging.Message = {
    token,
    notification: { title, body },
  };

  const messageId = await admin.messaging(app).send(message);
  console.log("[Firebase] Notification sent:", messageId);
  return messageId;
}
