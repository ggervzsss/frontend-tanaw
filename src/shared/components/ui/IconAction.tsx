import type { ReactNode } from "react";

type IconActionProps = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

export function IconAction({ label, icon, onClick }: IconActionProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="hover:border-tgreen-dark hover:text-tgreen-dark rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition"
    >
      {icon}
    </button>
  );
}
