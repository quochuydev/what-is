# Firebase Cloud Messaging Setup

Firebase notifications are **optional**. When not configured, the app works normally and skips sending push notifications.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the wizard
3. Enable **Cloud Messaging** in Project Settings > Cloud Messaging

## 2. Generate a Service Account Key (Server-side)

1. Go to **Project Settings > Service accounts**
2. Click **Generate new private key**
3. From the downloaded JSON, extract these values for your `.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Wrap `FIREBASE_PRIVATE_KEY` in double quotes and keep the `\n` characters as-is.

## 3. Register a Web App (Client-side)

1. In Firebase Console, go to **Project Settings > General**
2. Under **Your apps**, click the web icon (`</>`) to add a web app
3. Copy the `firebaseConfig` object values into your `.env`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 4. Generate a VAPID Key

1. Go to **Project Settings > Cloud Messaging**
2. Under **Web configuration**, click **Generate key pair**
3. Copy the key:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKag...
```

## 5. Test

1. Start the dev server: `npm run dev`
2. Open `/firebase` in your browser
3. Click **Get Device Token** — this requests notification permission and retrieves your FCM token
4. Click **Send Test Notification** — this calls `POST /api/firebase/send` to deliver a push notification

## Architecture

```
Client (/firebase page)
  └─ firebase/messaging SDK → gets device token
  └─ POST /api/firebase/send → test notification

Server
  └─ src/lib/firebase.ts → firebase-admin SDK (sendNotification)
  └─ POST /api/playground/query → sends notification when deviceToken is in request body

Service Worker
  └─ public/firebase-messaging-sw.js → handles background notifications
```

## Integration with /api/playground/query

When calling the query API, include an optional `deviceToken` field in the request body:

```json
{
  "keyword": "photosynthesis",
  "deviceToken": "fcm-device-token-here"
}
```

If the token is provided and Firebase is configured, the server sends a push notification with the definition result.

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `FIREBASE_PROJECT_ID` | No | Firebase project ID (server) |
| `FIREBASE_CLIENT_EMAIL` | No | Service account email (server) |
| `FIREBASE_PRIVATE_KEY` | No | Service account private key (server) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | No | Web API key (client) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | No | Auth domain (client) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | No | Project ID (client) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | Sender ID (client) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | No | App ID (client) |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | No | VAPID key for web push (client) |
