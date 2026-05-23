import { Activity } from "lucide-react";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion } from "../../../shared/components/ui";

export function ITSystemLogsPage() {
  return (
    <PageMotion>
      <PageHeader title="System Activity" description="Operational activity monitoring will be configured in a future implementation." />

      <Panel className="mt-6">
        <EmptyState title="No system activity available" description="This page is ready for future activity logs, filters, metrics, and detailed audit views." />
      </Panel>
    </PageMotion>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="bg-tgreen-dark/10 text-tgreen-dark flex h-12 w-12 items-center justify-center rounded-lg">
        <Activity size={22} />
      </span>
      <h3 className="mt-4 text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
