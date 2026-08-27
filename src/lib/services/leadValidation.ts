export function hasRequiredLeadContact(email: unknown, phone: unknown) {
  const emailValue = typeof email === "string" ? email.trim() : "";
  const phoneValue = typeof phone === "string" ? phone.trim() : "";

  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const hasPhone = phoneValue.replace(/\D/g, "").length >= 7;

  return hasEmail || hasPhone;
}
