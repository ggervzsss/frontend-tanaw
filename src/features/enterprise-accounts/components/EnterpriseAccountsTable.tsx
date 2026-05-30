import { Building2, Eye, KeyRound, UserCheck, XCircle } from "lucide-react";
import { EmptyState, IconAction, StatusBadge } from "@/shared/components/ui";
import type { AccountSummary } from "@/shared/services/accountManagement";

type EnterpriseAccountsTableProps = {
  accounts: AccountSummary[];
  filteredEnterprises: AccountSummary[];
  isLoading: boolean;
  onSelectEnterprise: (enterprise: AccountSummary) => void;
  onResetPassword: (accountId: string) => void;
  onChangeStatus: (accountId: string, nextStatus: "active" | "inactive") => void;
};

export function EnterpriseAccountsTable({ accounts, filteredEnterprises, isLoading, onSelectEnterprise, onResetPassword, onChangeStatus }: EnterpriseAccountsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-225 table-fixed text-left text-sm">
        <thead className="bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          <tr>
            {["Enterprise", "Barangay", "Enterprise ID", "Status", "Contact", "Actions"].map((heading) => (
              <th key={heading} className="px-4 py-4 whitespace-nowrap">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-800">
          {filteredEnterprises.map((enterprise) => (
            <tr key={enterprise.id} className="hover:bg-tgreen-dark/5 transition">
              <td className="px-4 py-4 whitespace-nowrap">
                <button type="button" onClick={() => onSelectEnterprise(enterprise)} className="flex w-full min-w-0 items-center gap-3 text-left">
                  <span className="bg-tgreen-dark/10 text-tgreen-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Building2 size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-gray-900">{enterprise.enterpriseName ?? enterprise.displayName}</span>
                    <span className="block truncate text-sm text-gray-500">{enterprise.category ?? "Uncategorized"}</span>
                  </span>
                </button>
              </td>
              <td className="truncate px-4 py-4 text-sm whitespace-nowrap text-gray-600">{enterprise.barangay ?? "N/A"}</td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="font-mono text-sm font-semibold text-gray-600">{enterprise.enterpriseId ?? "Pending"}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge tone={enterprise.status === "active" ? "green" : "slate"}>{enterprise.status}</StatusBadge>
              </td>
              <td className="truncate px-4 py-4 text-sm whitespace-nowrap text-gray-500">{enterprise.email}</td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  <IconAction label="View enterprise" onClick={() => onSelectEnterprise(enterprise)} icon={<Eye size={15} />} />
                  <IconAction label="Reset password" onClick={() => onResetPassword(enterprise.id)} icon={<KeyRound size={15} />} />
                  <IconAction
                    label={enterprise.status === "active" ? "Deactivate enterprise" : "Activate enterprise"}
                    onClick={() => onChangeStatus(enterprise.id, enterprise.status === "active" ? "inactive" : "active")}
                    icon={enterprise.status === "active" ? <XCircle size={15} /> : <UserCheck size={15} />}
                  />
                </div>
              </td>
            </tr>
          ))}
          {filteredEnterprises.length === 0 && (
            <tr>
              <td colSpan={6}>
                <EmptyState
                  icon={Building2}
                  title="No enterprise accounts"
                  description={isLoading ? "Loading accounts..." : accounts.length === 0 ? "Register an enterprise to generate development credentials." : "No enterprises match the current filters."}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

