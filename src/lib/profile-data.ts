import type { Home, Profile, Wallet } from "./api";

export function accountVerification(home: Home | null) {
  const wallet = home?.primary_wallet ?? home?.wallets.find(w => w.is_primary);
  const status = wallet?.verification_status;
  return {
    verified: status === "verified",
    label: status === "verified" ? "Verified" : status === "unverified" ? "Unverified" : "Unavailable",
    tier: wallet?.account_tier?.trim() || null,
  };
}

export function profileIdentity(home: Home | null, profile: Profile | null) {
  const wallet: Wallet | undefined | null = home?.primary_wallet ?? home?.wallets.find(w => w.is_primary);
  const name = profile?.name.trim() || profile?.username.trim() || "Account";
  const initials = usernameInitials(profile?.username || name);
  return { name, initials, email: profile?.email || "", uid: wallet?.uid?.trim() || null, address: wallet?.address?.trim() || null, network: wallet?.network || null };
}
export function usernameInitials(username: string) {
  const words = username.trim().split(/[\s._-]+/).filter(Boolean);
  return words.length > 1 ? words.slice(0, 2).map(w => w[0]).join("").toUpperCase() : (words[0] || "A").slice(0, 2).toUpperCase();
}
export function avatarError(file: Pick<File, "type" | "size">) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Choose a JPG, PNG or WebP photo.";
  if (file.size > 5 * 1024 * 1024) return "Choose a photo smaller than 5 MB.";
  return null;
}