import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PageHeader } from "@/shared/components/layout";
import { Panel } from "@/shared/components/panel";
import { PageMotion } from "@/shared/components/ui";
import { type AccountSummary, listLguAccounts, resetAccountPassword, updateAccountStatus } from "@/shared/services/accountManagement";
import { CreateLguAccountModal, LguAccountDetailsModal, LguAccountsMetrics, LguAccountsTable, LguAccountsToolbar } from "../components";
import type { LguRoleFilter, LguStatusFilter } from "../types";
import { filterLguAccounts } from "../utils";

const EMPTY_ACCOUNTS: AccountSummary[] = [];

export function ITLguAccountsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<LguRoleFilter>("all");
  const [status, setStatus] = useState<LguStatusFilter>("active");
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const accountsQuery = useQuery({ queryKey: ["lgu-accounts"], queryFn: listLguAccounts });
  const accounts = accountsQuery.data ?? EMPTY_ACCOUNTS;
  const filteredAccounts = useMemo(() => filterLguAccounts(accounts, query, role, status), [accounts, query, role, status]);

  const resetMutation = useMutation({
    mutationFn: resetAccountPassword,
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["lgu-accounts"] }), queryClient.invalidateQueries({ queryKey: ["dev-deliveries"] })]);
      toast.success("Temporary credentials recorded in development inbox");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ accountId, nextStatus }: { accountId: string; nextStatus: LguStatusFilter }) => updateAccountStatus(accountId, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lgu-accounts"] });
      toast.success("Account status updated");
    },
  });

  return (
    <PageMotion>
      <PageHeader title="LGU Accounts" description="Create personnel accounts, issue temporary credentials, and manage access status." />

      <LguAccountsMetrics accounts={accounts} />

      <Panel className="mt-6 overflow-hidden">
        <LguAccountsToolbar query={query} role={role} status={status} onQueryChange={setQuery} onRoleChange={setRole} onStatusChange={setStatus} onCreate={() => setCreateOpen(true)} />
        <LguAccountsTable
          accounts={accounts}
          filteredAccounts={filteredAccounts}
          isLoading={accountsQuery.isLoading}
          onSelectAccount={setSelectedAccount}
          onResetPassword={(accountId) => resetMutation.mutate(accountId)}
          onChangeStatus={(accountId, nextStatus) => statusMutation.mutate({ accountId, nextStatus })}
        />
      </Panel>

      <AnimatePresence>
        {createOpen && <CreateLguAccountModal onClose={() => setCreateOpen(false)} />}
        {selectedAccount && <LguAccountDetailsModal account={selectedAccount} onClose={() => setSelectedAccount(null)} />}
      </AnimatePresence>
    </PageMotion>
  );
}
