"use client";

import { useState, type FormEvent } from "react";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { STATUS_LABEL } from "@/lib/trails/format";
import { STATUSES, type TrailStatus } from "@/lib/trails/types";
import { useAuth } from "./AuthProvider";

// v1: the browser writes the report and updates the trail itself, in one batch.
// Security rules check the shape of the write, but they can't verify the report or rate-limit it.
export function ReportConditionForm({ trailId, currentStatus }: { trailId: string; currentStatus: TrailStatus }) {
  const { user, signIn } = useAuth();
  const [status, setStatus] = useState<TrailStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

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

  const uid = user.uid;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const db = getClientDb();
    const reportRef = doc(collection(db, "reports"));
    const trimmed = note.trim();

    const batch = writeBatch(db);
    batch.set(reportRef, { trailId, status, note: trimmed, uid, createdAt: serverTimestamp() });
    batch.update(doc(db, "trails", trailId), {
      status,
      statusNote: trimmed,
      lastReportAt: serverTimestamp(),
      lastReportId: reportRef.id,
    });

    // Latency compensation: the conditions badge updates right away, before the server answers.
    setNote("");
    setMessage("Sending… You’ll see the update immediately, even offline.");
    try {
      await batch.commit();
      setMessage("Thanks! Your report is live.");
    } catch (error) {
      console.error("Report rejected", error);
      setMessage("Sorry, that report couldn’t be saved.");
    }
  }

  return (
    <form className="report-form" onSubmit={submit}>
      <fieldset className="field">
        <legend>How is the trail right now?</legend>
        <div className="chip-group">
          {STATUSES.map((option) => (
            <label key={option} className={`chip chip--${option}`}>
              <input
                type="radio"
                name="status"
                value={option}
                checked={status === option}
                onChange={() => setStatus(option)}
              />
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
          maxLength={140}
          placeholder="e.g. Muddy after the rain"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <button type="submit" className="button">
        Send report
      </button>
      <p className="form-message" role="status">
        {message}
      </p>
    </form>
  );
}
