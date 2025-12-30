// Simple admin authentication
// Credentials are checked against environment variables or defaults

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "mobilehub@123";

export interface AdminUser {
  username: string;
  loginTime: string;
}

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function setAdminSession(username: string): void {
  if (typeof window !== "undefined") {
    const user: AdminUser = {
      username,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem("admin_session", JSON.stringify(user));
  }
}

export function getAdminSession(): AdminUser | null {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("admin_session");
    if (session) {
      try {
        return JSON.parse(session) as AdminUser;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_session");
  }
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession() !== null;
}
