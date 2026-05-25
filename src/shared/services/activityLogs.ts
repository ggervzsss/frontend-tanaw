import { apiClient } from "../lib/apiClient";
import type { LogSeverity, SystemLog, SystemLogActorRole, SystemLogCategory } from "../types";

export type CreateActivityLogPayload = {
  category: SystemLogCategory;
  severity?: LogSeverity;
  actor?: string;
  actorRole?: SystemLogActorRole;
  action: string;
  target: string;
  summary: string;
  sourceId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function listActivityLogs() {
  const response = await apiClient.get<SystemLog[]>("/activity-logs");
  return response.data;
}

export async function recordActivityLog(payload: CreateActivityLogPayload) {
  const response = await apiClient.post<SystemLog>("/activity-logs", {
    actor: payload.actor ?? "TANAW User",
    actorRole: payload.actorRole ?? "System",
    severity: payload.severity ?? "Info",
    ...payload,
  });
  return response.data;
}

export function getActivityLogsWebSocketUrl(token: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
  const url = new URL("/activity-logs/ws", baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}
