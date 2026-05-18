import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
      <div>
        <h2 className="m-0 text-2xl font-bold tracking-normal text-charcoal-800">{title}</h2>
        <p className="mt-1 mb-0 text-sm text-[#6b7280]">{description}</p>
      </div>
      {action}
    </div>
  );
}
