import { Building2, Camera, Edit3, Eye, KeyRound, PlugZap, Search, TestTube2, UserCheck, Wifi, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion, ModalPortal, stagger } from "../../../shared/components/ui";
import { enterpriseAccounts } from "../../../shared/data";
import type { CameraStatus, EnterpriseAccount, GatewayStatus } from "../../../shared/types";

type StatusFilter = "All Statuses" | GatewayStatus;
type CategoryFilter = "All Categories" | string;

const statusFilters: StatusFilter[] = ["All Statuses", "Connected", "Sync Delayed", "Offline", "Not Linked", "Closed"];

export function ITEnterpriseAccountsPage() {
  const [accounts, setAccounts] = useState<EnterpriseAccount[]>(enterpriseAccounts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All Statuses");
  const [category, setCategory] = useState<CategoryFilter>("All Categories");
  const [barangay, setBarangay] = useState("All Barangays");
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseAccount | null>(null);
  const [cameraEnterprise, setCameraEnterprise] = useState<EnterpriseAccount | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  type ActionState = {
    type: "reset" | "close_step1" | "close_step2" | "activate_step1" | "activate_step2";
    enterprise: EnterpriseAccount;
  } | null;

  const [actionState, setActionState] = useState<ActionState>(null);

  const barangays = useMemo(() => ["All Barangays", ...new Set(accounts.map((enterprise) => enterprise.barangay))], [accounts]);
  const categories = useMemo(() => {
    const dataCategories = new Set(accounts.map((enterprise) => enterprise.category));
    return ["All Categories", ...new Set(["Tourism", "Business", ...dataCategories])] satisfies CategoryFilter[];
  }, [accounts]);
  const filteredEnterprises = useMemo(
    () =>
      accounts.filter((enterprise) => {
        const haystack = `${enterprise.enterpriseName} ${enterprise.managerName} ${enterprise.category} ${enterprise.barangay}`.toLowerCase();
        const matchesQuery = haystack.includes(query.trim().toLowerCase());
        const matchesStatus = status === "All Statuses" || enterprise.gatewayStatus === status;
        const matchesCategory = category === "All Categories" || enterprise.category === category || enterprise.category.toLowerCase().includes(category.toLowerCase());
        const matchesBarangay = barangay === "All Barangays" || enterprise.barangay === barangay;
        return matchesQuery && matchesStatus && matchesCategory && matchesBarangay;
      }),
    [accounts, barangay, category, query, status],
  );

  const setEnterpriseStatus = (enterpriseId: string, gatewayStatus: GatewayStatus) => {
    setAccounts((currentAccounts) => currentAccounts.map((account) => (account.id === enterpriseId ? { ...account, gatewayStatus } : account)));
  };

  const offlineEnterprises = accounts.filter((enterprise) => enterprise.gatewayStatus === "Offline").length;
  const inactiveEnterprises = accounts.filter((enterprise) => enterprise.gatewayStatus === "Closed").length;

  return (
    <PageMotion>
      <PageHeader title="Enterprise Accounts" description="Manage establishment accounts, gateway links, and assigned camera nodes." />

      <motion.section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4" variants={stagger}>
        <MetricCard label="Enterprise Accounts" value={accounts.length} foot="Registered entities" color="#2563eb" icon={Building2} />
        <MetricCard label="Connected Enterprises" value={accounts.filter((enterprise) => enterprise.gatewayStatus === "Connected").length} foot="Live data available" color="#065f46" icon={Wifi} />
        <MetricCard label="Offline Enterprises" value={offlineEnterprises} foot="Desktop app not running" color="#dc2626" footClassName="text-red-600" icon={PlugZap} />
        <MetricCard label="Inactive Enterprises" value={inactiveEnterprises} foot="Marked closed" color="#64748b" footClassName="text-slate-600" icon={XCircle} />
      </motion.section>

      <Panel className="mt-6 overflow-hidden">
        <div className="grid grid-cols-1 gap-3 border-b border-gray-200 bg-gray-50 p-4 xl:grid-cols-[minmax(260px,1fr)_auto_auto_auto_auto]">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search enterprise, manager, category, or barangay"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <FilterSelect value={barangay} onChange={setBarangay} options={barangays} />
          <FilterSelect value={category} onChange={setCategory} options={categories} />
          <FilterSelect value={status} onChange={(value) => setStatus(value as StatusFilter)} options={statusFilters} />
          <button
            onClick={() => setRegisterOpen(true)}
            className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
          >
            <Building2 size={16} /> Register Enterprise
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-205 table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[18%]" />
              <col className="w-[17%]" />
            </colgroup>
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                {["Enterprise", "Barangay", "Status", "Cameras", "Last Sync", "Actions"].map((heading) => (
                  <th key={heading} className="px-3 py-4 whitespace-nowrap sm:px-4 lg:px-5">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredEnterprises.map((enterprise) => {
                const online = enterprise.cameras.filter((camera) => camera.status === "Online").length;
                return (
                  <tr key={enterprise.id} className="hover:bg-tgreen-dark/5 transition">
                    <td className="px-3 py-4 whitespace-nowrap sm:px-4 lg:px-5">
                      <button type="button" onClick={() => setSelectedEnterprise(enterprise)} className="flex w-full min-w-0 items-center gap-3 text-left">
                        <span className="bg-tgreen-dark/10 text-tgreen-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Building2 size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold text-gray-900">{enterprise.enterpriseName}</span>
                        </span>
                      </button>
                    </td>
                    <td className="truncate px-3 py-4 text-xs whitespace-nowrap text-gray-600 sm:px-4 lg:px-5">{enterprise.barangay}</td>
                    <td className="px-3 py-4 whitespace-nowrap sm:px-4 lg:px-5">
                      <GatewayBadge status={enterprise.gatewayStatus} />
                    </td>
                    <td className="px-3 py-4 text-xs font-bold whitespace-nowrap text-gray-900 sm:px-4 lg:px-5">
                      {online}/{enterprise.cameras.length}
                    </td>
                    <td className="truncate px-3 py-4 text-xs whitespace-nowrap text-gray-500 sm:px-4 lg:px-5">{enterprise.lastSync}</td>
                    <td className="px-3 py-4 whitespace-nowrap sm:px-4 lg:px-5">
                      <div className="flex gap-2">
                        <IconAction label="View enterprise" onClick={() => setSelectedEnterprise(enterprise)} icon={<Eye size={15} />} />
                        <IconAction label="Reset password" onClick={() => setActionState({ type: "reset", enterprise })} icon={<KeyRound size={15} />} />
                        <IconAction
                          label={enterprise.gatewayStatus === "Closed" ? "Activate enterprise" : "Deactivate enterprise"}
                          onClick={() => setActionState({ type: enterprise.gatewayStatus === "Closed" ? "activate_step1" : "close_step1", enterprise })}
                          icon={enterprise.gatewayStatus === "Closed" ? <UserCheck size={15} /> : <XCircle size={15} />}
                        />
                        <IconAction label="View assigned cameras" onClick={() => setCameraEnterprise(enterprise)} icon={<Camera size={15} />} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>
        {selectedEnterprise && <EnterpriseDetailsModal enterprise={selectedEnterprise} onClose={() => setSelectedEnterprise(null)} />}
        {cameraEnterprise && <AssignedCamerasModal enterprise={cameraEnterprise} onClose={() => setCameraEnterprise(null)} />}
        {registerOpen && <RegisterEnterpriseModal onClose={() => setRegisterOpen(false)} />}
        {actionState?.type === "reset" && <ResetEnterprisePasswordModal enterprise={actionState.enterprise} onClose={() => setActionState(null)} />}
        {actionState?.type === "close_step1" && (
          <CloseEnterpriseModalStep1
            enterprise={actionState.enterprise}
            onProceed={() => setActionState({ type: "close_step2", enterprise: actionState.enterprise })}
            onClose={() => setActionState(null)}
          />
        )}
        {actionState?.type === "close_step2" && (
          <CloseEnterpriseModalStep2 enterprise={actionState.enterprise} onConfirm={() => setEnterpriseStatus(actionState.enterprise.id, "Closed")} onClose={() => setActionState(null)} />
        )}
        {actionState?.type === "activate_step1" && (
          <ActivateEnterpriseModalStep1
            enterprise={actionState.enterprise}
            onProceed={() => setActionState({ type: "activate_step2", enterprise: actionState.enterprise })}
            onClose={() => setActionState(null)}
          />
        )}
        {actionState?.type === "activate_step2" && (
          <ActivateEnterpriseModalStep2 enterprise={actionState.enterprise} onConfirm={() => setEnterpriseStatus(actionState.enterprise.id, "Offline")} onClose={() => setActionState(null)} />
        )}
      </AnimatePresence>
    </PageMotion>
  );
}

function EnterpriseDetailsModal({ enterprise, onClose }: { enterprise: EnterpriseAccount; onClose: () => void }) {
  const handleEdit = () => {
    toast.success("Enterprise update recorded in System Logs");
  };

  return (
    <ModalFrame title="Enterprise Details" onClose={onClose}>
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-start justify-between gap-4 max-sm:flex-col">
            <div>
              <h3 className="m-0 text-xl font-bold text-gray-900">{enterprise.enterpriseName}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {enterprise.address} - {enterprise.category}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GatewayBadge status={enterprise.gatewayStatus} />
              <button
                type="button"
                onClick={handleEdit}
                className="text-tgreen-dark hover:bg-tgreen-dark/5 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold transition"
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Detail label="Registered Address" value={enterprise.address} />
          <Detail label="Enterprise Category" value={enterprise.category} />
          <Detail label="Contact Manager" value={enterprise.managerName} />
          <Detail label="Contact Email" value={enterprise.email} />
          <Detail label="Contact Number" value={enterprise.contactNumber} />
          <Detail label="Barangay" value={enterprise.barangay} />
          <Detail label="Gateway ID" value={enterprise.gatewayId ?? "Not linked"} />
          <Detail label="Last Sync" value={enterprise.lastSync} />
        </div>
      </div>
    </ModalFrame>
  );
}

function AssignedCamerasModal({ enterprise, onClose }: { enterprise: EnterpriseAccount; onClose: () => void }) {
  return (
    <ModalFrame title="Assigned Cameras" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h3 className="m-0 text-lg font-bold text-gray-900">{enterprise.enterpriseName}</h3>
          <p className="mt-1 text-sm text-gray-500">{enterprise.address}</p>
        </div>
        <section>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                <tr>
                  {["Camera", "Location", "RTSP", "ONVIF", "Health", "Last Checked", "Action"].map((heading) => (
                    <th key={heading} className="px-4 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enterprise.cameras.map((camera) => (
                  <tr key={camera.id}>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {camera.id}
                      <span className="mt-0.5 block font-normal text-gray-500">{camera.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{camera.location}</td>
                    <td className="px-4 py-3">{camera.rtspStatus}</td>
                    <td className="px-4 py-3">{camera.onvifStatus}</td>
                    <td className="px-4 py-3">
                      <CameraBadge status={camera.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{camera.lastChecked}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toast.success(`${camera.id} connection test recorded.`)}
                        className="text-tgreen-dark hover:bg-tgreen-dark/5 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-bold transition"
                      >
                        <TestTube2 size={13} /> Test
                      </button>
                    </td>
                  </tr>
                ))}
                {enterprise.cameras.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No cameras assigned to this enterprise.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ModalFrame>
  );
}

function ResetEnterprisePasswordModal({ enterprise, onClose }: { enterprise: EnterpriseAccount; onClose: () => void }) {
  const handleReset = () => {
    toast.success(`Password reset recorded for ${enterprise.email}`);
    onClose();
  };

  return (
    <ModalFrame title="Reset Enterprise Password" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You are about to reset the password for <strong>{enterprise.enterpriseName}</strong>.
        </p>
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">i</span>
          <p className="text-xs leading-relaxed text-blue-700">
            The system will automatically generate new login credentials and send them to the registered email address ({enterprise.email}) or contact number. The enterprise user will be required to
            change their password upon their next login.
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

function CloseEnterpriseModalStep1({ enterprise, onProceed, onClose }: { enterprise: EnterpriseAccount; onProceed: () => void; onClose: () => void }) {
  return (
    <ModalFrame title="Deactivate Enterprise" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You are about to mark <strong>{enterprise.enterpriseName}</strong> as <strong>Closed</strong>.
        </p>
        <div className="flex items-start gap-3 rounded-lg border border-orange-100 bg-orange-50 p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white">!</span>
          <p className="text-xs leading-relaxed text-orange-800">Closed enterprises are treated as inactive. Their account and records will remain available for historical data and record-keeping.</p>
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

function CloseEnterpriseModalStep2({ enterprise, onConfirm, onClose }: { enterprise: EnterpriseAccount; onConfirm: () => void; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "CLOSE";

  const handleCloseEnterprise = () => {
    if (confirmText === expectedText) {
      onConfirm();
      toast.success(`${enterprise.enterpriseName} marked as closed.`);
      onClose();
    }
  };

  return (
    <ModalFrame title="Confirm Enterprise Deactivation" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          To confirm that <strong>{enterprise.enterpriseName}</strong> should be marked as Closed, type <strong>{expectedText}</strong> below.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder={expectedText}
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1 focus:ring-orange-500"
        />
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleCloseEnterprise}
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

function ActivateEnterpriseModalStep1({ enterprise, onProceed, onClose }: { enterprise: EnterpriseAccount; onProceed: () => void; onClose: () => void }) {
  return (
    <ModalFrame title="Activate Enterprise" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You are about to activate <strong>{enterprise.enterpriseName}</strong> and return the account to operational status.
        </p>
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">i</span>
          <p className="text-xs leading-relaxed text-blue-700">
            Activating this enterprise restores it as an active operational account. It may still appear Offline until the desktop app starts processing data again.
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

function ActivateEnterpriseModalStep2({ enterprise, onConfirm, onClose }: { enterprise: EnterpriseAccount; onConfirm: () => void; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "ACTIVATE";

  const handleActivateEnterprise = () => {
    if (confirmText === expectedText) {
      onConfirm();
      toast.success(`${enterprise.enterpriseName} marked as active.`);
      onClose();
    }
  };

  return (
    <ModalFrame title="Confirm Enterprise Activation" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          To confirm activation for <strong>{enterprise.enterpriseName}</strong>, type <strong>{expectedText}</strong> below.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder={expectedText}
          className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1"
        />
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleActivateEnterprise}
            disabled={confirmText !== expectedText}
            className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Activation
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

function RegisterEnterpriseModal({ onClose }: { onClose: () => void }) {
  const handleSave = () => {
    toast.success("Enterprise registration recorded in System Logs.");
    onClose();
  };

  return (
    <ModalFrame title="Register Enterprise" onClose={onClose}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          "Enterprise Name",
          "Enterprise Type / Category",
          "Contact Person / Manager",
          "Contact Email",
          "Contact Number",
          "Jurisdiction / Barangay",
          "Address / Location",
          "Gateway Device Identifier",
        ].map((label) => (
          <FormField key={label} label={label} />
        ))}
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Status</span>
          <select className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1">
            <option>Connected</option>
            <option>Sync Delayed</option>
            <option>Offline</option>
            <option>Not Linked</option>
            <option>Closed</option>
          </select>
        </label>
        <button onClick={handleSave} className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg p-3 text-sm font-bold text-white transition md:col-span-2">
          Save Enterprise
        </button>
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

function GatewayBadge({ status }: { status: GatewayStatus }) {
  const classes: Record<GatewayStatus, string> = {
    Connected: "bg-emerald-50 text-emerald-700",
    "Sync Delayed": "bg-yellow-50 text-yellow-700",
    Offline: "bg-red-50 text-red-700",
    "Not Linked": "bg-gray-100 text-gray-600",
    Closed: "bg-slate-100 text-slate-600",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[status]}`}>{status}</span>;
}

function CameraBadge({ status }: { status: CameraStatus }) {
  const classes: Record<CameraStatus, string> = {
    Online: "bg-emerald-50 text-emerald-700",
    Unstable: "bg-yellow-50 text-yellow-700",
    Offline: "bg-red-50 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[status]}`}>{status}</span>;
}
