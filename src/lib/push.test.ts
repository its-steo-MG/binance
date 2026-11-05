// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('./api', () => ({ api: { pushConfig: vi.fn(), registerPush: vi.fn(), removePush: vi.fn() } }));
import { api } from './api';
import { enablePush, pushAvailability } from './push';
afterEach(() => vi.restoreAllMocks());
describe('phone notification permission', () => {
  it('does not prompt when TradeRiser push keys are missing', async () => {
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {} });
    Object.defineProperty(window, 'PushManager', { configurable: true, value: function() {} });
    const prompt = vi.fn();
    Object.defineProperty(window, 'Notification', { configurable: true, value: { permission: 'default', requestPermission: prompt } });
    vi.mocked(api.pushConfig).mockResolvedValue({ configured: false, public_key: '' });
    await enablePush();
    expect(prompt).not.toHaveBeenCalled();
    expect(api.registerPush).not.toHaveBeenCalled();
  });
  it('does not request permission when the browser has denied it', () => {
    Object.defineProperty(window, 'Notification', { configurable: true, value: { permission: 'denied' } });
    expect(pushAvailability()).not.toBeNull();
  });
  it('registers the /sw.js service worker when notifications are enabled', async () => {
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
    Object.defineProperty(window, 'PushManager', { configurable: true, value: function() {} });
    const prompt = vi.fn().mockResolvedValue('granted');
    Object.defineProperty(window, 'Notification', { configurable: true, value: { permission: 'default', requestPermission: prompt } });
    const subscription = { endpoint: 'https://push.example/1', toJSON: () => ({ endpoint: 'https://push.example/1' }) };
    const register = vi.fn().mockResolvedValue({
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue(subscription),
      },
    });
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register, ready: Promise.resolve({}) } });
    vi.mocked(api.pushConfig).mockResolvedValue({ configured: true, public_key: 'AAAA' });
    vi.mocked(api.registerPush).mockResolvedValue(undefined as never);
    await expect(enablePush()).resolves.toBe('Phone notifications enabled for this account.');
    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
    expect(api.registerPush).toHaveBeenCalledWith({ endpoint: 'https://push.example/1' });
  });
});
