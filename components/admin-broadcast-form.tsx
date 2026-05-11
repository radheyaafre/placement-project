"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  sendAdminBroadcastAction,
  type AdminBroadcastActionState
} from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import type { AdminUserOverview } from "@/types/domain";

const initialState: AdminBroadcastActionState = {
  status: "idle",
  message: ""
};

export function AdminBroadcastForm({
  users
}: {
  users: AdminUserOverview[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    sendAdminBroadcastAction,
    initialState
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="stack admin-broadcast-form">
      <div className="field">
        <label htmlFor="admin-broadcast-subject">Email subject</label>
        <input
          className="input"
          id="admin-broadcast-subject"
          name="subject"
          type="text"
          placeholder="Example: Weekly check-in from SamyakLabs.AI"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="admin-broadcast-message">Email message</label>
        <textarea
          className="textarea"
          id="admin-broadcast-message"
          name="message"
          placeholder="Write the message you want to send to the selected students."
          required
        />
      </div>

      <div className="field">
        <label>Select profiles</label>
        <div className="admin-broadcast-grid">
          {users.map((user) => (
            <label key={user.userId} className="admin-broadcast-user">
              <input type="checkbox" name="userIds" value={user.userId} />
              <span className="admin-broadcast-user__copy">
                <strong>{user.fullName}</strong>
                <span>{user.email}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {state.message ? <div className="notice">{state.message}</div> : null}

      <SubmitButton label="Send selected email" pendingLabel="Sending email..." />
    </form>
  );
}
