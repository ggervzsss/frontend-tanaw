import type { ComponentType } from "react";
import { motion } from "motion/react";
import { fadeInDown } from "../ui/motionVariants";

type MetricCardProps = {
  label: string;
  value: string | number;
  foot: string;
  color: string;
  footClassName?: string;
  icon?: ComponentType<{ className?: string }>;
};

export function MetricCard({ label, value, foot, color, footClassName = "text-gray-500", icon: Icon }: MetricCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all"
      style={{ borderLeft: `4px solid ${color}` }}
      variants={fadeInDown}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className={`mt-1 text-xs font-medium ${footClassName}`}>{foot}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
