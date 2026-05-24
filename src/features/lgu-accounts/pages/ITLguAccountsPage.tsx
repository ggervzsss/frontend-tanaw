import { Eye, KeyRound, Search, Shield, UserCheck, UserPlus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { EmptyState, ModalPortal, PageMotion } from "../../../shared/components/ui";
import {
  type AccountSummary,
  type CreateLguAccountPayload,
  createLguAccount,
  listLguAccounts,
  resetAccountPassword,
  updateAccountStatus,
} from "../../../shared/services/accountManagement";

type RoleFilter = "all" | "admin" | "it" | "staff";
type StatusFilter = "active" | "inactive";

const roleLabel: Record<string, string> = {
  admin: "Admin",
  it: "IT Personnel",
  staff: "LGU Staff",
};

export function ITLguAccountsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const accountsQuery = useQuery({ queryKey: ["lgu-accounts"], queryFn: listLguAccounts });
  const accounts = accountsQuery.data ?? [];
  const filteredAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        const haystack = `${account.displayName} ${account.email}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase()) && (role === "all" || account.role === role) && account.status === status;
      }),
    [accounts, query, role, status],
  );

  const resetMutation = useMutation({
    mutationFn: resetAccountPassword,
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["lgu-accounts"] }), queryClient.invalidateQueries({ queryKey: ["dev-deliveries"] })]);
      toast.success("Temporary credentials recorded in development inbox");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ accountId, nextStatus }: { accountId: string; nextStatus: StatusFilter }) => updateAccountStatus(accountId, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lgu-accounts"] });
      toast.success("Account status updated");
    },
  });

  return (
    <PageMotion>
      <PageHeader title="LGU Accounts" description="Create personnel accounts, issue temporary credentials, and manage access status." />

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <MetricCard label="Active Accounts" value={accounts.filter((a) => a.status === "active").length} foot="Allowed access" color="#065f46" icon={UserCheck} />
        <MetricCard label="Admin Accounts" value={accounts.filter((a) => a.role === "admin").length} foot="System administrators" color="#2563eb" icon={Shield} />
        <MetricCard label="IT Accounts" value={accounts.filter((a) => a.role === "it").length} foot="Technical operators" color="#10b981" icon={KeyRound} />
        <MetricCard label="Staff Accounts" value={accounts.filter((a) => a.role === "staff").length} foot="LGU staff members" color="#7c3aed" icon={Users} />
      </section>

      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 p-4">
          <div className="relative min-w-0 flex-1 sm:min-w-70">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or email"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <FilterSelect value={role} onChange={(value) => setRole(value as RoleFilter)} options={[["all", "All Roles"], ["admin", "Admin"], ["it", "IT Personnel"], ["staff", "LGU Staff"]] as const} />
          <FilterSelect value={status} onChange={(value) => setStatus(value as StatusFilter)} options={[["active", "Active"], ["inactive", "Inactive"]] as const} />
          <button onClick={() => setCreateOpen(true)} className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition">
            <UserPlus size={16} /> Create LGU Account
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 table-fixed text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                {["Name", "Email", "Role", "Status", "Last Login", "Actions"].map((heading) => (
                  <th key={heading} className="px-4 py-4 whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-tgreen-dark/5 transition">
                  <td className="px-4 py-3 font-bold whitespace-nowrap text-gray-900">{account.displayName}</td>
                  <td className="truncate px-4 py-3 text-xs whitespace-nowrap text-gray-600">{account.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge>{roleLabel[account.role] ?? account.role}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge tone={account.status === "active" ? "green" : "slate"}>{account.status}</Badge>
                  </td>
                  <td className="truncate px-4 py-3 text-xs whitespace-nowrap text-gray-500">{account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : "Never"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <IconAction label="View account details" onClick={() => setSelectedAccount(account)} icon={<Eye size={15} />} />
                      <IconAction label="Reset password" onClick={() => resetMutation.mutate(account.id)} icon={<KeyRound size={15} />} />
                      <IconAction
                        label={account.status === "active" ? "Deactivate account" : "Reactivate account"}
                        onClick={() => statusMutation.mutate({ accountId: account.id, nextStatus: account.status === "active" ? "inactive" : "active" })}
                        icon={<UserCheck size={15} />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={Users} title="No LGU accounts" description={accountsQuery.isLoading ? "Loading accounts..." : "Create an LGU account to generate development credentials."} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>
        {createOpen && <CreateAccountModal onClose={() => setCreateOpen(false)} />}
        {selectedAccount && <AccountDetailsModal account={selectedAccount} onClose={() => setSelectedAccount(null)} />}
      </AnimatePresence>
    </PageMotion>
  );
}

function CreateAccountModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createLguAccount,
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["lgu-accounts"] }), queryClient.invalidateQueries({ queryKey: ["dev-deliveries"] })]);
      toast.success("LGU account created");
      onClose();
    },
    onError: () => toast.error("Unable to create LGU account"),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: CreateLguAccountPayload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || undefined,
      role: String(formData.get("role") ?? "staff") as CreateLguAccountPayload["role"],
    };
    createMutation.mutate(payload);
  };

  return (
    <ModalFrame title="Create LGU Account" onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField name="firstName" label="First Name" required />
        <FormField name="lastName" label="Last Name" required />
        <FormField name="email" label="Email Address" type="email" required />
        <FormField name="phone" label="Contact Number" />
        <label className="block md:col-span-2">
          <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Role</span>
          <select name="role" className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1">
            <option value="staff">LGU Staff</option>
            <option value="it">IT Personnel</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 md:col-span-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">i</span>
          <p className="text-xs leading-relaxed text-blue-700">
            Once this account is saved, the system will automatically generate login credentials and record the development email/SMS message in Dev Log. The user will be required to change their
            password upon their first login.
          </p>
        </div>
        <button disabled={createMutation.isPending} className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg p-3 text-sm font-bold text-white transition disabled:opacity-70 md:col-span-2">
          {createMutation.isPending ? "Creating..." : "Create LGU Account"}
        </button>
      </form>
    </ModalFrame>
  );
}

function AccountDetailsModal({ account, onClose }: { account: AccountSummary; onClose: () => void }) {
  return (
    <ModalFrame title="LGU Account Details" onClose={onClose}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Detail label="Name" value={account.displayName} />
        <Detail label="Email" value={account.email} />
        <Detail label="Role" value={roleLabel[account.role] ?? account.role} />
        <Detail label="Phone" value={account.phone ?? "Not provided"} />
        <Detail label="Status" value={account.status} />
        <Detail label="Must Change Password" value={account.mustChangePassword ? "Yes" : "No"} />
      </div>
    </ModalFrame>
  );
}

function ModalFrame({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
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

function FormField({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">{label}</span>
      <input name={name} type={type} required={required} className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1" />
    </label>
  );
}

function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "slate" }) {
  const classes = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[tone]}`}>{children}</span>;
}
