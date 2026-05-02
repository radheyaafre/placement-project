type AuthLinkMessageParams = {
  error?: string | null;
  errorCode?: string | null;
  errorDescription?: string | null;
  context?: "generic" | "recovery";
};

const GENERIC_EXPIRED_MESSAGE =
  "This email link is invalid or has expired. Request a fresh one and try again.";
const RECOVERY_EXPIRED_MESSAGE =
  "This reset link is invalid or has expired. Request a fresh reset email and open the newest link.";

function normalizeMessage(value: string | null | undefined) {
  return (value || "").replace(/\+/g, " ").trim();
}

export function getAuthLinkErrorMessage({
  error,
  errorCode,
  errorDescription,
  context = "generic"
}: AuthLinkMessageParams) {
  const expiredMessage =
    context === "recovery" ? RECOVERY_EXPIRED_MESSAGE : GENERIC_EXPIRED_MESSAGE;
  const normalizedDescription = normalizeMessage(errorDescription);
  const normalizedError = normalizeMessage(error);

  if (errorCode === "otp_expired") {
    return expiredMessage;
  }

  if (
    normalizedDescription &&
    /(expired|invalid|already been used|access denied)/i.test(normalizedDescription)
  ) {
    return expiredMessage;
  }

  if (normalizedError === "access_denied") {
    return expiredMessage;
  }

  if (normalizedDescription) {
    return normalizedDescription.charAt(0).toUpperCase() + normalizedDescription.slice(1);
  }

  if (normalizedError || errorCode) {
    return expiredMessage;
  }

  return "";
}
