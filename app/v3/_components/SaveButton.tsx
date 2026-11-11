"use client";

import { SaveTrailButton, type SaveableTrail } from "@/components/interactive/SaveTrailButton";
import { useSession } from "./SessionProvider";

// v3 keeps the SPA's client write for saving: rules can guard it, so it's instant and works offline.
// The server only supplies the first frame (`initialSaved`).
export function SaveButton({ trail, initialSaved }: { trail: SaveableTrail; initialSaved: boolean }) {
  const { clientUid, ready, signIn } = useSession();
  return (
    <SaveTrailButton trail={trail} uid={clientUid} ready={ready} onSignIn={signIn} initialSaved={initialSaved} />
  );
}
