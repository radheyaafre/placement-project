"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitBugReportAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState = {
  status: "idle",
  message: ""
} as const;

export function BugReportForm({
  source = "Public home page",
  textareaId = "report"
}: {
  source?: string;
  textareaId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(submitBugReportAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="stack bug-report-form">
      <input type="hidden" name="source" value={source} />
      <div className="field">
        <label htmlFor={textareaId}>What went wrong?</label>
        <textarea
          className="textarea"
          id={textareaId}
          name="report"
          placeholder="Example: After login, Day 2 stays locked even though today's date is correct."
          required
        />
      </div>
      {state.message ? <div className="notice">{state.message}</div> : null}
      <SubmitButton label="Send bug report" pendingLabel="Sending..." />
    </form>
  );
}
