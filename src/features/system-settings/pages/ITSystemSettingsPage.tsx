import { Bell, Camera, FileText, RotateCcw, Save, ShieldCheck, SlidersHorizontal, Wifi } from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion } from "../../../shared/components/ui";

type SettingField =
  | {
      label: string;
      type: "select";
      value: string;
      options: string[];
    }
  | {
      label: string;
      type: "toggle";
      value: boolean;
    }
  | {
      label: string;
      type: "readonly";
      value: string;
    };

type SettingSection = {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  modified: string;
  fields: SettingField[];
};

const settingSections: SettingSection[] = [
  {
    id: "security",
    title: "Account & Security Settings",
    icon: ShieldCheck,
    modified: "May 18, 2026 by Mike Santos",
    fields: [
      { label: "Session Timeout", type: "select", value: "30 minutes", options: ["15 minutes", "30 minutes", "60 minutes"] },
      { label: "Password Reset Required", type: "toggle", value: true },
      { label: "Failed Login Threshold", type: "select", value: "5 attempts", options: ["3 attempts", "5 attempts", "10 attempts"] },
      { label: "Account Lock Duration", type: "select", value: "15 minutes", options: ["15 minutes", "30 minutes", "1 hour"] },
      { label: "Role Permissions", type: "readonly", value: "View access rules" },
    ],
  },
  {
    id: "camera",
    title: "Camera Integration Settings",
    icon: Camera,
    modified: "May 17, 2026 by Camera service",
    fields: [
      { label: "Default RTSP Timeout", type: "select", value: "8 seconds", options: ["5 seconds", "8 seconds", "12 seconds"] },
      { label: "Camera Reconnect Interval", type: "select", value: "5 minutes", options: ["3 minutes", "5 minutes", "10 minutes"] },
      { label: "ONVIF Discovery", type: "toggle", value: true },
      { label: "Camera Health Check Interval", type: "select", value: "5 minutes", options: ["5 minutes", "10 minutes", "15 minutes"] },
      { label: "Low FPS Warning Threshold", type: "select", value: "12 FPS", options: ["10 FPS", "12 FPS", "15 FPS"] },
      { label: "Low Confidence Warning Threshold", type: "select", value: "65%", options: ["60%", "65%", "70%"] },
    ],
  },
  {
    id: "sync",
    title: "Sync Settings",
    icon: Wifi,
    modified: "May 17, 2026 by Sync service",
    fields: [
      { label: "Sync Interval", type: "select", value: "10 minutes", options: ["5 minutes", "10 minutes", "15 minutes"] },
      { label: "Retry Failed Sync", type: "toggle", value: true },
      { label: "Local Cache Retention", type: "select", value: "30 days", options: ["14 days", "30 days", "60 days"] },
      { label: "Duplicate Sync Prevention", type: "toggle", value: true },
      { label: "Offline Mode", type: "toggle", value: true },
    ],
  },
  {
    id: "logs",
    title: "Log Settings",
    icon: FileText,
    modified: "May 16, 2026 by Mike Santos",
    fields: [
      { label: "Log Retention Period", type: "select", value: "180 days", options: ["90 days", "180 days", "365 days"] },
      { label: "Export Format", type: "select", value: "CSV", options: ["CSV", "PDF"] },
      { label: "Log Critical Alerts", type: "toggle", value: true },
      { label: "Log Account Changes", type: "toggle", value: true },
      { label: "Log Camera Events", type: "toggle", value: true },
    ],
  },
  {
    id: "notifications",
    title: "Notification Settings",
    icon: Bell,
    modified: "May 15, 2026 by Mike Santos",
    fields: [
      { label: "Notify Camera Offline", type: "toggle", value: true },
      { label: "Notify Gateway Offline", type: "toggle", value: true },
      { label: "Notify Sync Failed", type: "toggle", value: true },
      { label: "Notify Failed Login Threshold", type: "toggle", value: true },
    ],
  },
];

export function ITSystemSettingsPage() {
  const [activeSectionId, setActiveSectionId] = useState(settingSections[0].id);
  const selectedSection = useMemo(() => settingSections.find((section) => section.id === activeSectionId) ?? settingSections[0], [activeSectionId]);
  const Icon = selectedSection.icon;

  return (
    <PageMotion>
      <PageHeader
        title="System Settings"
        description="Configure account security, camera integration, synchronization, logs, and technical notifications."
        action={
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toast.success("Selected settings reset to defaults.")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw size={15} /> Reset Defaults
            </button>
            <button
              onClick={() => toast.success("Configuration change recorded in System Logs.")}
              className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition"
            >
              <Save size={15} /> Save Changes
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Panel className="overflow-hidden p-3">
          {settingSections.map((section) => {
            const SectionIcon = section.icon;
            const isActive = section.id === activeSectionId;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={[
                  "mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition last:mb-0",
                  isActive ? "bg-tgreen-dark/10 text-tgreen-dark" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                ].join(" ")}
              >
                <SectionIcon className="h-4 w-4" />
                {section.title}
              </button>
            );
          })}
        </Panel>

        <Panel className="overflow-hidden p-6">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-200 pb-5 max-sm:flex-col">
            <div className="flex items-start gap-4">
              <div className="bg-tgreen-dark/10 text-tgreen-dark rounded-lg p-3">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedSection.title}</h3>
                <p className="mt-1 text-sm text-gray-500">Last modified: {selectedSection.modified}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Editable
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {selectedSection.fields.map((field) => (
              <div key={field.label} className="rounded-xl border border-gray-200 bg-white p-5">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold tracking-wide text-gray-500 uppercase">{field.label}</span>
                  <SettingControl field={field} />
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h4 className="text-sm font-bold text-gray-900">Change Logging</h4>
            <p className="mt-2 text-sm text-gray-500">Saving changes creates a System Logs entry with the setting name, previous value, new value, timestamp, and IT operator.</p>
          </div>
        </Panel>
      </div>
    </PageMotion>
  );
}

function SettingControl({ field }: { field: SettingField }) {
  if (field.type === "toggle") {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-gray-700">{field.value ? "Enabled" : "Disabled"}</span>
        <input className="accent-tgreen-dark h-5 w-5" type="checkbox" defaultChecked={field.value} />
      </div>
    );
  }

  if (field.type === "readonly") {
    return (
      <button
        type="button"
        onClick={() => toast.success("Role permission matrix opened.")}
        className="text-tgreen-dark hover:bg-tgreen-dark/5 rounded-lg border border-gray-300 px-4 py-3 text-sm font-bold transition"
      >
        {field.value}
      </button>
    );
  }

  return (
    <select defaultValue={field.value} className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-1">
      {field.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
