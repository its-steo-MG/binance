import { api } from "./api";
export function pushAvailability(): string | null {
  if (window.top !== window.self) return "Open the app in its own tab to enable phone notifications.";
  if (!window.isSecureContext) return "Notifications require the published HTTPS app.";
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return "This browser does not support push notifications. On iPhone, add the app to your Home Screen and open it there (iOS 16.4 or later).";
  if (Notification.permission === "denied") return "Notifications are blocked. Allow them in your browser’s site settings.";
  return null;
}
export async function enablePush(): Promise<string> {
  const unavailable = pushAvailability();
  if (unavailable) return unavailable;
  const config = await api.pushConfig();
  if (!config.configured || !config.public_key) return "Phone notifications are not configured on TradeRiser yet.";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "Notifications were not allowed. You can enable them in site settings.";
  const registration = await navigator.serviceWorker.register("/binance-push-sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const value = config.public_key.replace(/-/g, "+").replace(/_/g, "/");
  const key = Uint8Array.from(atob(value + "=".repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
  let subscription = await registration.pushManager.getSubscription();
  const created = !subscription;
  if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  try { await api.registerPush(subscription.toJSON()); }
  catch (error) { if (created) await subscription.unsubscribe(); throw error; }
  return "Phone notifications enabled for this account.";
}
export async function disablePush(): Promise<string> {
  if (!("serviceWorker" in navigator)) return "Phone notifications are not enabled on this browser.";
  const registration = await navigator.serviceWorker.getRegistration("/binance-push-sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) { await api.removePush(subscription.endpoint); await subscription.unsubscribe(); }
  return "Phone notifications disabled on this device.";
}
