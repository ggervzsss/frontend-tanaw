import { Eye, KeyRound, Search, Shield, UserCheck, UserPlus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion, ModalPortal, stagger } from "../../../shared/components/ui";
import { lguAccounts } from "../../../shared/data";
import type { LguAccount, LguAccountRoleLabel, LguAccountStatus } from "../../../shared/types";

type RoleFilter = "All Roles" | LguAccountRoleLabel;
type StatusFilter = "Active" | "Inactive";

const roleOptions: RoleFilter[] = ["All Roles", "Admin", "IT Personnel", "LGU Staff"];
const statusOptions: StatusFilter[] = ["Active", "Inactive"];

export function ITLguAccountsPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("All Roles");
  const [status, setStatus] = useState<StatusFilter>("Active");
  const [selectedAccount, setSelectedAccount] = useState<LguAccount | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  type ActionState = {
    type: "reset" | "deactivate_step1" | "deactivate_step2" | "reactivate_step1" | "reactivate_step2";
    account: LguAccount;
  } | null;

  const [actionState, setActionState] = useState<ActionState>(null);
  const filteredAccounts = useMemo(
    () =>
      lguAccounts.filter((account) => {
        const haystack = `${account.firstName} ${account.lastName} ${account.email}`.toLowerCase();
        const matchesQuery = haystack.includes(query.trim().toLowerCase());
        const matchesRole = role === "All Roles" || account.role === role;
        const matchesStatus = account.status === status;
        return matchesQuery && matchesRole && matchesStatus;
      }),
    [query, role, status],
  );

  const isInactive = status === "Inactive";
  const metricBase = filteredAccounts;

  return (
    <PageMotion>
      <PageHeader title="LGU Accounts" description="Manage internal personnel profiles, access roles, and account recovery operations." />

      <motion.section className="grid grid-cols-1 gap-4 md:grid-cols-4" variants={stagger}>
        <MetricCard
          label={isInactive ? "Total Inactive Accounts" : "Active Accounts"}
          value={metricBase.length}
          foot={isInactive ? "Deactivated users" : "Allowed access"}
          color={isInactive ? "#64748b" : "#065f46"}
          icon={isInactive ? Users : UserCheck}
        />
        <MetricCard label="Admin Accounts" value={metricBase.filter((a) => a.role === "Admin").length} foot="System administrators" color="#2563eb" icon={Shield} />
        <MetricCard label="IT Accounts" value={metricBase.filter((a) => a.role === "IT Personnel").length} foot="Technical operators" color="#10b981" icon={KeyRound} />
        <MetricCard label="Staff Accounts" value={metricBase.filter((a) => a.role === "LGU Staff").length} foot="LGU staff members" color="#7c3aed" icon={Users} />
      </motion.section>

      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 p-4">
          <div className="relative min-w-70 flex-1">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or email"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <FilterSelect value={role} onChange={(value) => setRole(value as RoleFilter)} options={roleOptions} />
          <FilterSelect value={status} onChange={(value) => setStatus(value as StatusFilter)} options={statusOptions} />
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
          >
            <UserPlus size={16} /> Create LGU Account
          </button>
        </div>

        <div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                {["Name", "Email", "Role", "Status", "Last Login", "Actions"].map((heading) => (
                  <th key={heading} className="px-4 py-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-tgreen-dark/5 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button type="button" onClick={() => setSelectedAccount(account)} className="flex items-center gap-3 text-left">
                      <span className="bg-tgreen-dark/10 text-tgreen-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black">
                        {account.firstName[0]}
                        {account.lastName[0]}
                      </span>
                      <span>
                        <span className="block font-bold text-gray-900">
                          {account.firstName}
                          {account.lastName ? ` ${account.lastName[0]}.` : ""}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500">{account.id}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-600">{account.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RoleBadge role={account.role} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <AccountStatusBadge status={account.status} />
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">{account.lastLogin}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <IconAction label="View account details" onClick={() => setSelectedAccount(account)} icon={<Eye size={15} />} />
                      <IconAction label="Reset password" onClick={() => setActionState({ type: "reset", account })} icon={<KeyRound size={15} />} />
                      <IconAction
                        label={account.status === "Active" ? "Deactivate account" : "Reactivate account"}
                        onClick={() => setActionState({ type: account.status === "Active" ? "deactivate_step1" : "reactivate_step1", account })}
                        icon={<UserCheck size={15} />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>
        {selectedAccount && <AccountDetailsModal account={selectedAccount} onClose={() => setSelectedAccount(null)} />}
        {createOpen && <CreateAccountModal onClose={() => setCreateOpen(false)} />}

        {actionState?.type === "reset" && <ResetPasswordModal account={actionState.account} onClose={() => setActionState(null)} />}

        {actionState?.type === "deactivate_step1" && (
          <DeactivateAccountModalStep1
            account={actionState.account}
            onProceed={() => setActionState({ type: "deactivate_step2", account: actionState.account })}
            onClose={() => setActionState(null)}
          />
        )}

        {actionState?.type === "deactivate_step2" && <DeactivateAccountModalStep2 account={actionState.account} onClose={() => setActionState(null)} />}

        {actionState?.type === "reactivate_step1" && (
          <ReactivateAccountModalStep1
            account={actionState.account}
            onProceed={() => setActionState({ type: "reactivate_step2", account: actionState.account })}
            onClose={() => setActionState(null)}
          />
        )}

        {actionState?.type === "reactivate_step2" && <ReactivateAccountModalStep2 account={actionState.account} onClose={() => setActionState(null)} />}
      </AnimatePresence>
    </PageMotion>
  );
}

function AccountDetailsModal({ account, onClose }: { account: LguAccount; onClose: () => void }) {
  return (
    <ModalFrame title="LGU Account Details" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="m-0 text-xl font-bold text-gray-900">
            {account.firstName} {account.lastName}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{account.email}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Detail label="Role" value={account.role} />
          <Detail label="Status" value={account.status} />
          <Detail label="Contact Number" value={account.phone} />
          <Detail label="Last Login" value={account.lastLogin} />
          <Detail label="Created At" value={account.createdAt} />
        </div>
      </div>
    </ModalFrame>
  );
}

function CreateAccountModal({ onClose }: { onClose: () => void }) {
  const handleSave = () => {
    toast.success("LGU account creation recorded in System Logs.");
    onClose();
  };

  return (
    <ModalFrame title="Create LGU Account" onClose={onClose}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {["First Name", "Last Name", "Email Address", "Contact Number"].map((label) => (
          <FormField key={label} label={label} />
        ))}
        <label className="block md:col-span-2">
          <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Role</span>
          <select className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1">
            <option>LGU Staff</option>
            <option>IT Personnel</option>
            <option>Admin</option>
          </select>
        </label>
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 md:col-span-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">i</span>
          <p className="text-xs leading-relaxed text-blue-700">
            Once this account is saved, the system will automatically generate login credentials and send them to the registered email address or contact number provided above. The user will be
            required to change their password upon their first login.
          </p>
        </div>
        <button onClick={handleSave} className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg p-3 text-sm font-bold text-white transition md:col-span-2">
          Create LGU Account
        </button>
      </div>
    </ModalFrame>
  );
}

function ResetPasswordModal({ account, onClose }: { account: LguAccount; onClose: () => void }) {
  const handleReset = () => {
    toast.success(`Password reset recorded for ${account.email}`);
    onClose();
  };

  return (
    <ModalFrame title="Reset LGU Account Password" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You are about to reset the password for{" "}
          <strong>
            {account.firstName} {account.lastName}
          </strong>
          .
        </p>
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">i</span>
          <p className="text-xs leading-relaxed text-blue-700">
            The system will automatically generate new login credentials and send them to the registered email address ({account.email}) or contact number. The user will be required to change their
            password upon their next login.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleReset} className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg px-4 py-2 text-sm font-bold text-white transition">
            Confirm Reset
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

function DeactivateAccountModalStep1({ account, onProceed, onClose }: { account: LguAccount; onProceed: () => void; onClose: () => void }) {
  return (
    <ModalFrame title="Deactivate LGU Account" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You are about to deactivate the account for{" "}
          <strong>
            {account.firstName} {account.lastName}
          </strong>{" "}
          ({account.email}).
        </p>
        <div className="flex items-start gap-3 rounded-lg border border-orange-100 bg-orange-50 p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white">!</span>
          <p className="text-xs leading-relaxed text-orange-800">
            Deactivating this account will immediately revoke their access to the TANAW system. The user will be automatically logged out of any active sessions and will not be able to log in until
            the account is reactivated.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={onProceed} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700">
            Proceed
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

function DeactivateAccountModalStep2({ account, onClose }: { account: LguAccount; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "DEACTIVATE";

  const handleDeactivate = () => {
    if (confirmText === expectedText) {
      toast.success("Account successfully deactivated.");
      onClose();
    }
  };

  return (
    <ModalFrame title="Confirm Deactivation" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          To confirm the deactivation of <strong>{account.email}</strong>, please type <strong>{expectedText}</strong> below.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={expectedText}
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1 focus:ring-orange-500"
        />
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleDeactivate}
            disabled={confirmText !== expectedText}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Deactivation
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

function ReactivateAccountModalStep1({ account, onProceed, onClose }: { account: LguAccount; onProceed: () => void; onClose: () => void }) {
  return (
    <ModalFrame title="Reactivate LGU Account" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You are about to reactivate the account for{" "}
          <strong>
            {account.firstName} {account.lastName}
          </strong>{" "}
          ({account.email}).
        </p>
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">i</span>
          <p className="text-xs leading-relaxed text-blue-700">
            Reactivating this account will restore their access to the TANAW system based on their role ({account.role}). They will be able to log in using their existing credentials.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={onProceed} className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg px-4 py-2 text-sm font-bold text-white transition">
            Proceed
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

function ReactivateAccountModalStep2({ account, onClose }: { account: LguAccount; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "REACTIVATE";

  const handleReactivate = () => {
    if (confirmText === expectedText) {
      toast.success("Account successfully reactivated.");
      onClose();
    }
  };

  return (
    <ModalFrame title="Confirm Reactivation" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          To confirm the reactivation of <strong>{account.email}</strong>, please type <strong>{expectedText}</strong> below.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={expectedText}
          className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1"
        />
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleReactivate}
            disabled={confirmText !== expectedText}
            className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Reactivation
          </button>
        </div>
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

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none">
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function IconAction({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FormField({ label }: { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">{label}</span>
      <input className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1" />
    </label>
  );
}

function RoleBadge({ role }: { role: LguAccountRoleLabel }) {
  const classes: Record<LguAccountRoleLabel, string> = {
    Admin: "bg-blue-50 text-blue-700",
    "IT Personnel": "bg-emerald-50 text-emerald-700",
    "LGU Staff": "bg-slate-100 text-slate-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[role]}`}>{role}</span>;
}

function AccountStatusBadge({ status }: { status: LguAccountStatus }) {
  const classes: Record<LguAccountStatus, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Inactive: "bg-slate-100 text-slate-600",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[status]}`}>{status}</span>;
}
