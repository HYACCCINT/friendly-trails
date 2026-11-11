"use client";

import { useActionState } from "react";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { STATUS_LABEL } from "@/lib/trails/format";
import { MAX_NOTE_LENGTH, type ReportState } from "@/lib/trails/report";
import { STATUSES, type TrailStatus } from "@/lib/trails/types";
import { reportCondition } from "../actions";
import { useSession } from "./SessionProvider";

// v3: reports go through a Server Function (privileged logic), so unlike saves they need a
// connection and wait for the server. The live badge shows the result for everyone.
export function ReportForm({ trailId, currentStatus }: { trailId: string; currentStatus: TrailStatus }) {
  const { user, signIn } = useSession();
  const online = useOnlineStatus();
  const [state, formAction, pending] = useActionState<ReportState | null, FormData>(
    async (previous, formData) => {
      try {
        return await reportCondition(trailId, previous, formData);
      } catch {
        return { ok: false, message: "Couldn’t reach the server. Reports need a connection." };
      }
    },
    null,
  );

  if (!user) {
    return (
      <p className="muted">
        Out on this trail?{" "}
        <button type="button" className="link-button" onClick={signIn}>
          Sign in
        </button>{" "}
        to report conditions.
      </p>
    );
  }

  return (
    <form className="report-form" action={formAction}>
      <fieldset className="field">
        <legend>How is the trail right now?</legend>
        <div className="chip-group">
          {STATUSES.map((option) => (
            <label key={option} className={`chip chip--${option}`}>
              <input type="radio" name="status" value={option} defaultChecked={currentStatus === option} />
              <span>{STATUS_LABEL[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="report-note">Details (optional)</label>
        <textarea
          id="report-note"
          name="note"
          rows={2}
          maxLength={MAX_NOTE_LENGTH}
          placeholder="e.g. Muddy after the rain"
        />
      </div>
      <button type="submit" className="button" disabled={pending || !online}>
        {pending ? "Sending…" : "Send report"}
      </button>
      <p className="form-message" role="status">
        {online ? state?.message : "Reports go through the server, so they need a connection."}
      </p>
    </form>
  );
}
