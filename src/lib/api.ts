// ============================================
// API Layer - Focus Buddy MVP
// Uses Supabase for real backend calls with mock fallbacks
// ============================================

import { supabase } from "./supabase";

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

// Mock data (used as fallback until DB tables are populated)
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

export const mockWeeklyData = [
  { day: "Lun", sessions: 3, blocked: 1 },
  { day: "Mar", sessions: 5, blocked: 0 },
  { day: "Mer", sessions: 2, blocked: 1 },
  { day: "Gio", sessions: 4, blocked: 2 },
  { day: "Ven", sessions: 6, blocked: 1 },
  { day: "Sab", sessions: 1, blocked: 0 },
  { day: "Dom", sessions: 0, blocked: 0 },
];

// API Functions — try Supabase first, fallback to mock

export async function createFocusSession(goalText: string, templateId: string, duration: number): Promise<FocusSession> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from("focus_sessions").insert({
        user_id: user.id,
        goal_text: goalText,
        template_id: templateId || null,
        duration,
        status: "in-corso",
        start_time: new Date().toISOString(),
      }).select().single();

      if (!error && data) {
        return { id: data.id, goal: data.goal_text, duration: data.duration, status: data.status, createdAt: data.created_at };
      }
    }
  } catch (e) {
    console.log("[API] Supabase fallback — using mock", e);
  }

  return { id: `s-${Date.now()}`, goal: goalText, duration, status: "in-corso", createdAt: new Date().toISOString() };
}

export async function saveSessionLog(sessionId: string, status: FocusSession["status"], tags: string[]): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("session_logs").insert({
        session_id: sessionId,
        status,
        tags,
        timestamp: new Date().toISOString(),
      });

      await supabase.from("focus_sessions").update({
        status,
        end_time: new Date().toISOString(),
      }).eq("id", sessionId);
      return;
    }
  } catch (e) {
    console.log("[API] Supabase fallback — using mock", e);
  }
}

export async function getUserProfile(): Promise<UserInfo> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
      if (!error && data) {
        return {
          name: data.name || "",
          email: data.email || user.email || "",
          telegramId: data.telegram_id || "",
          plan: data.subscription_tier === "pro" ? "pro" : "free",
        };
      }
    }
  } catch (e) {
    console.log("[API] Supabase fallback — using mock", e);
  }
  return mockUser;
}

export async function updateUserProfile(data: Partial<UserInfo>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_profiles").upsert({
        id: user.id,
        name: data.name,
        email: data.email,
        telegram_id: data.telegramId,
      });
      return;
    }
  } catch (e) {
    console.log("[API] Supabase fallback — using mock", e);
  }
}

export async function connectTelegram(telegramId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_profiles").update({ telegram_id: telegramId }).eq("id", user.id);
      return;
    }
  } catch (e) {
    console.log("[API] Supabase fallback — using mock", e);
  }
}

export async function getUserSessions(): Promise<FocusSession[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from("focus_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id,
          goal: s.goal_text,
          duration: s.duration,
          status: s.status,
          createdAt: s.created_at,
        }));
      }
    }
  } catch (e) {
    console.log("[API] Supabase fallback — using mock", e);
  }
  return mockSessions;
}
