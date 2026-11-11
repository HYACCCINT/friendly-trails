"use client";

import {
  SaveTrailButton as SharedSaveTrailButton,
  type SaveableTrail,
} from "@/components/interactive/SaveTrailButton";
import { useAuth } from "./AuthProvider";

// v1: writes go straight from the browser to Firestore. Security rules decide what's allowed,
// and latency compensation makes the button flip instantly, even offline.
export function SaveTrailButton({ trail }: { trail: SaveableTrail }) {
  const { user, ready, signIn } = useAuth();
  return <SharedSaveTrailButton trail={trail} uid={user?.uid ?? null} ready={ready} onSignIn={signIn} />;
}
