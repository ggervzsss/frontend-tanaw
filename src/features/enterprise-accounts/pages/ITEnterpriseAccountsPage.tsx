import { Building2, Camera, Edit3, PlugZap, Search, TestTube2, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion, ModalPortal, stagger } from "../../../shared/components/ui";
import { enterpriseAccounts } from "../../../shared/data";
import type { CameraStatus, EnterpriseAccount, EnterpriseAccountStatus, GatewayStatus } from "../../../shared/types";

type AccountFilter = "All Statuses" | EnterpriseAccountStatus;
type GatewayFilter = "All Gateways" | GatewayStatus;

const accountFilters: AccountFilter[] = ["All Statuses", "Active", "Archived", "Suspended"];
const gatewayFilters: GatewayFilter[] = ["All Gateways", "Connected", "Sync Delayed", "Offline", "Not Linked"];

export function ITEnterpriseAccountsPage() {
  const [query, setQuery] = useState("");
  const [accountStatus, setAccountStatus] = useState<AccountFilter>("All Statuses");
  const [gatewayStatus, setGatewayStatus] = useState<GatewayFilter>("All Gateways");
  const [barangay, setBarangay] = useState("All Barangays");
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseAccount | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const barangays = useMemo(() => ["All Barangays", ...new Set(enterpriseAccounts.map((enterprise) => enterprise.barangay))], []);
  const filteredEnterprises = useMemo(
    () =>
      enterpriseAccounts.filter((enterprise) => {
        const haystack = `${enterprise.enterpriseName} ${enterprise.managerName} ${enterprise.category} ${enterprise.barangay}`.toLowerCase();
        const matchesQuery = haystack.includes(query.trim().toLowerCase());
        const matchesAccount = accountStatus === "All Statuses" || enterprise.accountStatus === accountStatus;
        const matchesGateway = gatewayStatus === "All Gateways" || enterprise.gatewayStatus === gatewayStatus;
        const matchesBarangay = barangay === "All Barangays" || enterprise.barangay === barangay;
        return matchesQuery && matchesAccount && matchesGateway && matchesBarangay;
      }),
    [accountStatus, barangay, gatewayStatus, query],
  );

  const totalCameras = enterpriseAccounts.reduce((total, enterprise) => total + enterprise.cameras.length, 0);
  const onlineCameras = enterpriseAccounts.reduce((total, enterprise) => total + enterprise.cameras.filter((camera) => camera.status === "Online").length, 0);

  return (
    <PageMotion>
      <PageHeader
        title="Enterprise Accounts"
        description="Manage establishment accounts, gateway links, and assigned camera nodes."
        action={
          <button
            onClick={() => setRegisterOpen(true)}
            className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition"
          >
            <Building2 size={16} /> Register Enterprise
          </button>
        }
      />

      <motion.section className="grid grid-cols-1 gap-4 md:grid-cols-4" variants={stagger}>
        <MetricCard label="Enterprise Accounts" value={enterpriseAccounts.length} foot="Registered entities" color="#2563eb" icon={Building2} />
        <MetricCard
          label="Connected Gateways"
          value={enterpriseAccounts.filter((enterprise) => enterprise.gatewayStatus === "Connected").length}
          foot="Ready for telemetry"
          color="#065f46"
          icon={Wifi}
        />
        <MetricCard label="Assigned Cameras" value={`${onlineCameras}/${totalCameras}`} foot="Online camera nodes" color="#10b981" icon={Camera} />
        <MetricCard
          label="Needs Attention"
          value={enterpriseAccounts.filter((enterprise) => ["Offline", "Sync Delayed"].includes(enterprise.gatewayStatus)).length}
          foot="Gateway diagnosis"
          color="#dc2626"
          footClassName="text-red-600"
          icon={PlugZap}
        />
      </motion.section>

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
          <FilterSelect value={accountStatus} onChange={(value) => setAccountStatus(value as AccountFilter)} options={accountFilters} />
          <FilterSelect value={barangay} onChange={setBarangay} options={barangays} />
          <FilterSelect value={gatewayStatus} onChange={(value) => setGatewayStatus(value as GatewayFilter)} options={gatewayFilters} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                {["Enterprise", "Contact Manager", "Barangay", "Gateway", "Cameras", "Last Sync", "Account", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => setSelectedEnterprise(enterprise)} className="flex items-center gap-3 text-left">
                        <span className="bg-tgreen-dark/10 text-tgreen-dark rounded-lg p-2">
                          <Building2 size={18} />
                        </span>
                        <span>
                          <span className="block font-bold text-gray-900">{enterprise.enterpriseName}</span>
                          <span className="text-[10px] text-gray-500">{enterprise.category}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs">{enterprise.managerName}</td>
                    <td className="px-6 py-4 text-xs text-gray-600">{enterprise.barangay}</td>
                    <td className="px-6 py-4">
                      <GatewayBadge status={enterprise.gatewayStatus} />
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-900">
                      {online}/{enterprise.cameras.length}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{enterprise.lastSync}</td>
                    <td className="px-6 py-4">
                      <EnterpriseStatusBadge status={enterprise.accountStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <IconAction label="View enterprise" onClick={() => setSelectedEnterprise(enterprise)} icon={<Building2 size={15} />} />
                        <IconAction label="Edit enterprise" onClick={() => toast.success("Enterprise update recorded in System Logs")} icon={<Edit3 size={15} />} />
                        <IconAction label="Manage cameras" onClick={() => setSelectedEnterprise(enterprise)} icon={<Camera size={15} />} />
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
        {registerOpen && <RegisterEnterpriseModal onClose={() => setRegisterOpen(false)} />}
      </AnimatePresence>
    </PageMotion>
  );
}

function EnterpriseDetailsModal({ enterprise, onClose }: { enterprise: EnterpriseAccount; onClose: () => void }) {
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
            <GatewayBadge status={enterprise.gatewayStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Detail label="Contact Manager" value={enterprise.managerName} />
          <Detail label="Contact Email" value={enterprise.email} />
          <Detail label="Contact Number" value={enterprise.contactNumber} />
          <Detail label="Barangay" value={enterprise.barangay} />
          <Detail label="Gateway ID" value={enterprise.gatewayId ?? "Not linked"} />
          <Detail label="Last Sync" value={enterprise.lastSync} />
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase">Assigned Cameras</h4>
            <button
              type="button"
              onClick={() => toast.success("Camera setup action recorded.")}
              className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white transition"
            >
              <Camera size={14} /> Add Camera
            </button>
          </div>
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
                      No cameras assigned. Link a gateway before adding camera nodes.
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
          <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Account Status</span>
          <select className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1">
            <option>Active</option>
            <option>Suspended</option>
            <option>Archived</option>
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
    "Not Linked": "bg-slate-100 text-slate-600",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${classes[status]}`}>{status}</span>;
}

function EnterpriseStatusBadge({ status }: { status: EnterpriseAccountStatus }) {
  const classes: Record<EnterpriseAccountStatus, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Archived: "bg-slate-100 text-slate-600",
    Suspended: "bg-red-50 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${classes[status]}`}>{status}</span>;
}

function CameraBadge({ status }: { status: CameraStatus }) {
  const classes: Record<CameraStatus, string> = {
    Online: "bg-emerald-50 text-emerald-700",
    Unstable: "bg-yellow-50 text-yellow-700",
    Offline: "bg-red-50 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${classes[status]}`}>{status}</span>;
}
