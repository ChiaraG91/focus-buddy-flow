// ============================================
// API Placeholder - Focus Buddy MVP
// Replace these with real API calls when backend is ready
// ============================================

export interface FocusSession {
  id: string;
  goal: string;
  duration: number;
  status: "fatto" | "bloccato" | "next-action" | "in-corso";
  tags?: string[];
  createdAt: string;
}

export interface UserInfo {
  name: string;
  email: string;
  telegramId?: string;
  plan: "free" | "pro";
}

export interface SessionTemplate {
  id: string;
  label: string;
}

// Mock data
export const mockTemplates: SessionTemplate[] = [
  { id: "t1", label: "Scrivere codice" },
  { id: "t2", label: "Studiare teoria" },
  { id: "t3", label: "Leggere documentazione" },
];

export const mockSessions: FocusSession[] = [
  { id: "s1", goal: "Scrivere codice", duration: 25, status: "fatto", tags: ["dev"], createdAt: "2026-02-23T09:00:00Z" },
  { id: "s2", goal: "Leggere documentazione", duration: 50, status: "bloccato", tags: ["studio"], createdAt: "2026-02-23T10:00:00Z" },
  { id: "s3", goal: "Studiare teoria", duration: 25, status: "fatto", tags: ["studio"], createdAt: "2026-02-22T14:00:00Z" },
  { id: "s4", goal: "Scrivere codice", duration: 50, status: "fatto", tags: ["dev"], createdAt: "2026-02-22T16:00:00Z" },
  { id: "s5", goal: "Leggere documentazione", duration: 25, status: "next-action", tags: ["studio"], createdAt: "2026-02-21T11:00:00Z" },
  { id: "s6", goal: "Scrivere codice", duration: 25, status: "fatto", tags: ["dev"], createdAt: "2026-02-20T09:00:00Z" },
  { id: "s7", goal: "Studiare teoria", duration: 50, status: "bloccato", tags: ["studio"], createdAt: "2026-02-19T15:00:00Z" },
];

export const mockUser: UserInfo = {
  name: "Marco Rossi",
  email: "marco@example.com",
  telegramId: "",
  plan: "free",
};

// Weekly mock data for chart
export const mockWeeklyData = [
  { day: "Lun", sessions: 3, blocked: 1 },
  { day: "Mar", sessions: 5, blocked: 0 },
  { day: "Mer", sessions: 2, blocked: 1 },
  { day: "Gio", sessions: 4, blocked: 2 },
  { day: "Ven", sessions: 6, blocked: 1 },
  { day: "Sab", sessions: 1, blocked: 0 },
  { day: "Dom", sessions: 0, blocked: 0 },
];

// API Placeholders
export async function createFocusSession(goalText: string, templateId: string, duration: number): Promise<FocusSession> {
  console.log("[API Placeholder] createFocusSession", { goalText, templateId, duration });
  return {
    id: `s-${Date.now()}`,
    goal: goalText,
    duration,
    status: "in-corso",
    createdAt: new Date().toISOString(),
  };
}

export async function saveSessionLog(sessionId: string, status: FocusSession["status"], tags: string[]): Promise<void> {
  console.log("[API Placeholder] saveSessionLog", { sessionId, status, tags });
}

export async function updateUserProfile(data: Partial<UserInfo>): Promise<void> {
  console.log("[API Placeholder] updateUserProfile", data);
}

export async function connectTelegram(telegramId: string): Promise<void> {
  console.log("[API Placeholder] connectTelegram", { telegramId });
}

export async function signupWithEmail(name: string, email: string, password: string): Promise<void> {
  console.log("[API Placeholder] signupWithEmail", { name, email });
}

export async function signupWithGoogle(): Promise<void> {
  console.log("[API Placeholder] signupWithGoogle");
}
