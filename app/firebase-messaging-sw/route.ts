import { getFirebaseClientConfig } from "@/lib/firebase/client";

export function GET() {
  let config;
  try {
    config = getFirebaseClientConfig();
  } catch {
    return new Response("Push is not configured.", { status: 503 });
  }
  const script = `
self.addEventListener('notificationclick', event => {
  event.stopImmediatePropagation();
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
importScripts('https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
firebase.messaging();
`;
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
    },
  });
}
