"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { submitBugReportAction } from "@/app/actions";

const initialState = {
  status: "idle",
  message: ""
} as const;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send bug report"}
    </button>
  );
}

export function BugReportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(submitBugReportAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="stack bug-report-form">
      <input type="hidden" name="source" value="Public home page" />
      <div className="field">
        <label htmlFor="report">What went wrong?</label>
        <textarea
          className="textarea"
          id="report"
          name="report"
          placeholder="Example: After login, Day 2 stays locked even though today's date is correct."
          required
        />
      </div>
      {state.message ? <div className="notice">{state.message}</div> : null}
      <SubmitButton />
    </form>
  );
}
