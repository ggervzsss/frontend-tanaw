import { create } from "zustand";
import { persist } from "zustand/middleware";
import { priorityAlerts as initialPriorityAlerts } from "../../shared/data";
import type { PriorityAlert, PriorityAlertStatus } from "../../shared/types";
import { useSystemLogStore } from "./systemLogStore";

type AlertState = {
  alerts: PriorityAlert[];
  updateAlertStatus: (alertId: string, status: PriorityAlertStatus, actor?: string) => void;
};

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: initialPriorityAlerts,
      updateAlertStatus: (alertId, status, actor = "Admin") => {
        const alert = get().alerts.find((item) => item.id === alertId);
        if (!alert || alert.status === status) return;

        set((state) => ({
          alerts: state.alerts.map((item) => (item.id === alertId ? { ...item, status } : item)),
        }));

        useSystemLogStore.getState().recordLog({
          category: "Admin Operation",
          severity: status === "Resolved" ? "Success" : alert.severity,
          actor,
          actorRole: "Admin",
          action: `Alert ${status}`,
          target: alert.enterprise ?? alert.requester,
          summary: `${actor} marked ${alert.id} (${alert.type}) as ${status}.`,
          sourceId: alert.id,
          metadata: {
            previousStatus: alert.status,
            newStatus: status,
            resolutionMode: alert.resolutionMode,
          },
        });
      },
    }),
    {
      name: "tanaw-alerts",
      version: 1,
    },
  ),
);
