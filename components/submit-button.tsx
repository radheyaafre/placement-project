"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { LoadingSpinner } from "@/components/loading-spinner";

export function SubmitButton({
  label,
  pendingLabel,
  className = "button",
  disabled,
  icon
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button className={className} type="submit" disabled={isDisabled}>
      {pending ? <LoadingSpinner className="spinner--button" /> : icon}
      <span>{pending ? pendingLabel || label : label}</span>
    </button>
  );
}
