import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/layout";
import { PageMotion } from "@/shared/components/ui";
import { SettingsDetailPanel, SettingsSidebar } from "../components";
import { settingSections } from "../data";

export function ITSystemSettingsPage() {
  const [activeSectionId, setActiveSectionId] = useState(settingSections[0].id);
  const selectedSection = useMemo(() => settingSections.find((section) => section.id === activeSectionId) ?? settingSections[0], [activeSectionId]);

  return (
    <PageMotion>
      <PageHeader title="System Settings" description="Configure account security, camera integration, synchronization, logs, and technical notifications." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <SettingsSidebar sections={settingSections} activeSectionId={activeSectionId} onSelectSection={setActiveSectionId} />
        <SettingsDetailPanel section={selectedSection} />
      </div>
    </PageMotion>
  );
}
