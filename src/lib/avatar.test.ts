import { describe, it, expect } from "vitest";
import { usernameInitials, avatarError } from "./profile-data";
describe("username fallback", () => {
  it("uses initials of separated username parts", () => expect(usernameInitials("stephen.samuel")).toBe("SS"));
  it("uses the first two characters of a single username", () => expect(usernameInitials("traderiser")).toBe("TR"));
});
describe("photo input validation", () => {
  it("accepts supported images", () => expect(avatarError({ type: "image/png", size: 1024 })).toBeNull());
  it("rejects non-images", () => expect(avatarError({ type: "text/html", size: 1024 })).not.toBeNull());
  it("rejects oversized photos", () => expect(avatarError({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 })).not.toBeNull());
});