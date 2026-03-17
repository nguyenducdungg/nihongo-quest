/** Generate a short random alphanumeric string (default 8 chars) for invite codes, IDs, etc. */
export function nanoid(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
