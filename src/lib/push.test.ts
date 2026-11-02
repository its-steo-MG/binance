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
});
