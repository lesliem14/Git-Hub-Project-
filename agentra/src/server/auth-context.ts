import { getSessionUser, type SessionUser } from "./auth-service";
import { resolveApiKey } from "./api-key-service";

export type AuthContext = SessionUser & { via: "session" | "api_key" };

export async function getAuthContext(request: Request): Promise<AuthContext | null> {
  const session = await getSessionUser();
  if (session) return { ...session, via: "session" };

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer agt_")) {
    const raw = auth.slice(7);
    const key = await resolveApiKey(raw);
    if (key) {
      return {
        userId: key.accountId,
        accountId: key.accountId,
        email: "api-key",
        username: "api",
        via: "api_key",
      };
    }
  }
  return null;
}
