"use client";

import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

/** The live region always exists, so screen readers announce it when it fills in. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <div className="offline-banner" role="status">
      {online ? "" : "You’re offline. Showing what’s saved on this device. Changes sync when you reconnect."}
    </div>
  );
}
