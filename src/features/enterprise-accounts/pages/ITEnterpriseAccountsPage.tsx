import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PageHeader } from "@/shared/components/layout";
import { Panel } from "@/shared/components/panel";
import { PageMotion } from "@/shared/components/ui";
import { sanPedroBarangays } from "@/shared/data/enterpriseOptions";
import { type AccountSummary, listEnterpriseAccounts, resetAccountPassword, updateAccountStatus } from "@/shared/services/accountManagement";
import { EnterpriseAccountsMetrics, EnterpriseAccountsTable, EnterpriseAccountsToolbar, EnterpriseDetailsModal, RegisterEnterpriseModal } from "../components";
import type { EnterpriseStatusFilter } from "../types";
import { filterEnterpriseAccounts } from "../utils";

const EMPTY_ACCOUNTS: AccountSummary[] = [];

export function ITEnterpriseAccountsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EnterpriseStatusFilter>("all");
  const [barangay, setBarangay] = useState("All Barangays");
  const [selectedEnterprise, setSelectedEnterprise] = useState<AccountSummary | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const accountsQuery = useQuery({ queryKey: ["enterprise-accounts"], queryFn: listEnterpriseAccounts });
  const accounts = accountsQuery.data ?? EMPTY_ACCOUNTS;
  const barangays = ["All Barangays", ...sanPedroBarangays];
  const filteredEnterprises = useMemo(() => filterEnterpriseAccounts(accounts, query, status, barangay), [accounts, barangay, query, status]);

  const resetMutation = useMutation({
    mutationFn: resetAccountPassword,
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["enterprise-accounts"] }), queryClient.invalidateQueries({ queryKey: ["dev-deliveries"] })]);
      toast.success("Temporary credentials recorded in development inbox");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ accountId, nextStatus }: { accountId: string; nextStatus: "active" | "inactive" }) => updateAccountStatus(accountId, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["enterprise-accounts"] });
      toast.success("Enterprise account status updated");
    },
  });

  return (
    <PageMotion>
      <PageHeader title="Enterprise Accounts" description="Register establishments, issue temporary credentials, and manage account access." />

      <EnterpriseAccountsMetrics accounts={accounts} />

      <Panel className="mt-6 overflow-hidden">
        <EnterpriseAccountsToolbar
          query={query}
          status={status}
          barangay={barangay}
          barangays={barangays}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onBarangayChange={setBarangay}
          onRegister={() => setRegisterOpen(true)}
        />
        <EnterpriseAccountsTable
          accounts={accounts}
          filteredEnterprises={filteredEnterprises}
          isLoading={accountsQuery.isLoading}
          onSelectEnterprise={setSelectedEnterprise}
          onResetPassword={(accountId) => resetMutation.mutate(accountId)}
          onChangeStatus={(accountId, nextStatus) => statusMutation.mutate({ accountId, nextStatus })}
        />
      </Panel>

      <AnimatePresence>
        {selectedEnterprise && <EnterpriseDetailsModal enterprise={selectedEnterprise} onClose={() => setSelectedEnterprise(null)} />}
        {registerOpen && <RegisterEnterpriseModal onClose={() => setRegisterOpen(false)} />}
      </AnimatePresence>
    </PageMotion>
  );
}
