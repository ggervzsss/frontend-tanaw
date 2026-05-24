import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  minHeightClassName?: string;
};

export function EmptyState({ icon: Icon, title, description, minHeightClassName = "min-h-55" }: EmptyStateProps) {
  return (
    <div className={`flex ${minHeightClassName} flex-col items-center justify-center px-6 py-10 text-center`}>
      <span className="bg-tgreen-dark/10 text-tgreen-dark flex h-10 w-10 items-center justify-center rounded-lg">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
