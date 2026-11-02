"use client";
import { useEffect, useState } from "react";
import { api, auth, type Profile } from "@/lib/api";
import { usernameInitials } from "@/lib/profile-data";
export function useAccountProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setProfile(auth.profile());
    api.profile().then(p => { if (active) { setProfile(p); auth.saveProfile(p); } }).catch(() => { if (active) setError("Profile service unavailable. Your server needs the profile endpoint before photos can be saved."); });
    return () => { active = false; };
  }, []);
  return { profile, error, setProfile };
}
export function ProfileAvatar({ profile, large = false, className = "" }: { profile: Profile | null; large?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [profile?.avatar_url]);
  const initials = usernameInitials(profile?.username || "Account");
  return <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand font-semibold text-brand-fg ${large ? "size-14 border-4 border-fg text-lg" : "size-8 text-xs"} ${className}`}>
    {profile?.avatar_url && !failed ? <img src={profile.avatar_url} alt="Profile photo" className="size-full object-cover" onError={() => setFailed(true)} /> : <span aria-label="Username initials">{initials}</span>}
  </span>;
}