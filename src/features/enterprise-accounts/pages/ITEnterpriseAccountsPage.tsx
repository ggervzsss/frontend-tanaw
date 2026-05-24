import { Building2, Eye, KeyRound, Search, UserCheck, Users, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { EmptyState, ModalPortal, PageMotion } from "../../../shared/components/ui";
import { enterpriseCategories, sanPedroBarangays } from "../../../shared/data/enterpriseOptions";
import {
  type AccountSummary,
  type CreateEnterpriseAccountPayload,
  createEnterpriseAccount,
  listEnterpriseAccounts,
  resetAccountPassword,
  updateAccountStatus,
} from "../../../shared/services/accountManagement";

type StatusFilter = "all" | "active" | "inactive";
type ChoiceOption = readonly [string, string];

export function ITEnterpriseAccountsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [barangay, setBarangay] = useState("All Barangays");
  const [selectedEnterprise, setSelectedEnterprise] = useState<AccountSummary | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const accountsQuery = useQuery({ queryKey: ["enterprise-accounts"], queryFn: listEnterpriseAccounts });
  const accounts = accountsQuery.data ?? [];
  const barangays = ["All Barangays", ...sanPedroBarangays];
  const filteredEnterprises = useMemo(
    () =>
      accounts.filter((enterprise) => {
        const haystack = `${enterprise.enterpriseName ?? enterprise.displayName} ${enterprise.managerName ?? ""} ${enterprise.category ?? ""} ${enterprise.barangay ?? ""}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase()) && (status === "all" || enterprise.status === status) && (barangay === "All Barangays" || enterprise.barangay === barangay);
      }),
    [accounts, barangay, query, status],
  );

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

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <MetricCard label="Enterprise Accounts" value={accounts.length} foot="Registered entities" color="#2563eb" icon={Building2} />
        <MetricCard label="Active Enterprises" value={accounts.filter((enterprise) => enterprise.status === "active").length} foot="Can access TANAW" color="#065f46" icon={UserCheck} />
        <MetricCard label="Inactive Enterprises" value={accounts.filter((enterprise) => enterprise.status === "inactive").length} foot="Access disabled" color="#64748b" footClassName="text-slate-600" icon={XCircle} />
        <MetricCard label="Barangays Covered" value={new Set(accounts.map((enterprise) => enterprise.barangay).filter(Boolean)).size} foot="With registered enterprises" color="#7c3aed" icon={Users} />
      </section>

      <Panel className="mt-6 overflow-hidden">
        <div className="grid grid-cols-1 gap-3 border-b border-gray-200 bg-gray-50 p-4 xl:grid-cols-[minmax(260px,1fr)_auto_auto_auto]">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search enterprise, manager, category, or barangay"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <FilterSelect value={barangay} onChange={setBarangay} options={barangays.map((item): [string, string] => [item, item])} />
          <FilterSelect value={status} onChange={(value) => setStatus(value as StatusFilter)} options={[["all", "All Statuses"], ["active", "Active"], ["inactive", "Inactive"]] as const} />
          <button onClick={() => setRegisterOpen(true)} className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition">
            <Building2 size={16} /> Register Enterprise
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-205 table-fixed text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
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
                    <button type="button" onClick={() => setSelectedEnterprise(enterprise)} className="flex w-full min-w-0 items-center gap-3 text-left">
                      <span className="bg-tgreen-dark/10 text-tgreen-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Building2 size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-gray-900">{enterprise.enterpriseName ?? enterprise.displayName}</span>
                        <span className="block truncate text-xs text-gray-500">{enterprise.category ?? "Uncategorized"}</span>
                      </span>
                    </button>
                  </td>
                  <td className="truncate px-4 py-4 text-xs whitespace-nowrap text-gray-600">{enterprise.barangay ?? "N/A"}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-gray-600">{enterprise.enterpriseId ?? "Pending"}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge tone={enterprise.status === "active" ? "green" : "slate"}>{enterprise.status}</Badge>
                  </td>
                  <td className="truncate px-4 py-4 text-xs whitespace-nowrap text-gray-500">{enterprise.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <IconAction label="View enterprise" onClick={() => setSelectedEnterprise(enterprise)} icon={<Eye size={15} />} />
                      <IconAction label="Reset password" onClick={() => resetMutation.mutate(enterprise.id)} icon={<KeyRound size={15} />} />
                      <IconAction
                        label={enterprise.status === "active" ? "Deactivate enterprise" : "Activate enterprise"}
                        onClick={() => statusMutation.mutate({ accountId: enterprise.id, nextStatus: enterprise.status === "active" ? "inactive" : "active" })}
                        icon={enterprise.status === "active" ? <XCircle size={15} /> : <UserCheck size={15} />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEnterprises.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={Building2} title="No enterprise accounts" description={accountsQuery.isLoading ? "Loading accounts..." : "Register an enterprise to generate development credentials."} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>
        {selectedEnterprise && <EnterpriseDetailsModal enterprise={selectedEnterprise} onClose={() => setSelectedEnterprise(null)} />}
        {registerOpen && <RegisterEnterpriseModal onClose={() => setRegisterOpen(false)} />}
      </AnimatePresence>
    </PageMotion>
  );
}

function RegisterEnterpriseModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createEnterpriseAccount,
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["enterprise-accounts"] }), queryClient.invalidateQueries({ queryKey: ["dev-deliveries"] })]);
      toast.success("Enterprise account created");
      onClose();
    },
    onError: () => toast.error("Unable to create enterprise account"),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = findChoiceValue(String(formData.get("category") ?? ""), enterpriseCategories.map((item): ChoiceOption => [item.value, item.label]));
    const barangay = findChoiceValue(String(formData.get("barangay") ?? ""), sanPedroBarangays.map((item): ChoiceOption => [item, item]));

    if (!category || !barangay) {
      toast.error("Choose a valid enterprise type and barangay from the list.");
      return;
    }

    const payload: CreateEnterpriseAccountPayload = {
      enterpriseName: String(formData.get("enterpriseName") ?? ""),
      category,
      managerName: String(formData.get("managerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      contactNumber: String(formData.get("contactNumber") ?? "") || undefined,
      barangay,
      address: String(formData.get("address") ?? ""),
      enterpriseId: String(formData.get("enterpriseId") ?? "") || undefined,
    };
    createMutation.mutate(payload);
  };

  return (
    <ModalFrame title="Register Enterprise" onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField name="enterpriseName" label="Enterprise Name" required />
        <SearchableChoiceField name="category" label="Enterprise Type / Category" options={enterpriseCategories.map((category): ChoiceOption => [category.value, category.label])} required />
        <FormField name="managerName" label="Contact Person / Manager" required />
        <FormField name="email" label="Contact Email" type="email" required />
        <FormField name="contactNumber" label="Contact Number" />
        <FormField name="enterpriseId" label="Enterprise ID Seed" placeholder="Leave blank to use enterprise name" />
        <FormField name="address" label="Block / Lot / Street" required />
        <SearchableChoiceField name="barangay" label="Barangay" options={sanPedroBarangays.map((item): ChoiceOption => [item, item])} required />
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 md:col-span-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">i</span>
          <p className="text-xs leading-relaxed text-blue-700">
            Once this enterprise is saved, the system will automatically generate login credentials and record the development email/SMS message in Dev Log. The enterprise user will be required to
            change their password upon first login. The saved address will include San Pedro, Laguna 4023 automatically.
          </p>
        </div>
        <button disabled={createMutation.isPending} className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg p-3 text-sm font-bold text-white transition disabled:opacity-70 md:col-span-2">
          {createMutation.isPending ? "Saving..." : "Save Enterprise"}
        </button>
      </form>
    </ModalFrame>
  );
}

function EnterpriseDetailsModal({ enterprise, onClose }: { enterprise: AccountSummary; onClose: () => void }) {
  return (
    <ModalFrame title="Enterprise Details" onClose={onClose}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Detail label="Enterprise" value={enterprise.enterpriseName ?? enterprise.displayName} />
        <Detail label="Registered Address" value={enterprise.address ?? "Not provided"} />
        <Detail label="Category" value={enterprise.category ?? "Not provided"} />
        <Detail label="Contact Manager" value={enterprise.managerName ?? "Not provided"} />
        <Detail label="Contact Email" value={enterprise.email} />
        <Detail label="Contact Number" value={enterprise.phone ?? "Not provided"} />
        <Detail label="Barangay" value={enterprise.barangay ?? "Not provided"} />
        <Detail label="Enterprise ID" value={enterprise.enterpriseId ?? "Pending"} />
        <Detail label="Account Status" value={enterprise.status} />
        <Detail label="Must Change Password" value={enterprise.mustChangePassword ? "Yes" : "No"} />
      </div>
    </ModalFrame>
  );
}

function ModalFrame({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </header>
          <div className="p-6">{children}</div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: readonly (readonly [string, string])[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none">
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

function IconAction({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className="hover:border-tgreen-dark hover:text-tgreen-dark rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition">
      {icon}
    </button>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FormField({ name, label, type = "text", required = false, placeholder }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1" />
    </label>
  );
}

function SearchableChoiceField({ name, label, options, required = false }: { name: string; label: string; options: readonly ChoiceOption[]; required?: boolean }) {
  const listId = `${name}-choices`;

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">{label}</span>
      <input
        name={name}
        list={listId}
        required={required}
        autoComplete="off"
        placeholder={`Search ${label.toLowerCase()}`}
        className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1"
      />
      <datalist id={listId}>
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={label}>
            {optionValue !== label ? optionValue : undefined}
          </option>
        ))}
      </datalist>
    </label>
  );
}

function findChoiceValue(input: string, options: readonly ChoiceOption[]) {
  const normalizedInput = input.trim().toLowerCase();
  const match = options.find(([value, label]) => value.toLowerCase() === normalizedInput || label.toLowerCase() === normalizedInput);
  return match?.[0] ?? "";
}

function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "green" | "slate" }) {
  const classes = {
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[tone]}`}>{children}</span>;
}
