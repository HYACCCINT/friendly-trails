/** What the v3 report Server Function sends back to the form. */
export interface ReportState {
  ok: boolean;
  message: string;
}

export const MAX_NOTE_LENGTH = 140;

/** v3 lets each person send one report per minute. */
export const REPORT_COOLDOWN_MS = 60_000;
