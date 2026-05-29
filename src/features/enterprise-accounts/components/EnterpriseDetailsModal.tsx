import { DetailField, ModalFrame } from "@/shared/components/ui";
import type { AccountSummary } from "@/shared/services/accountManagement";

type EnterpriseDetailsModalProps = {
  enterprise: AccountSummary;
  onClose: () => void;
};

export function EnterpriseDetailsModal({ enterprise, onClose }: EnterpriseDetailsModalProps) {
  return (
    <ModalFrame title="Enterprise Details" onClose={onClose} maxWidthClassName="max-w-5xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailField label="Enterprise" value={enterprise.enterpriseName ?? enterprise.displayName} />
        <DetailField label="Registered Address" value={enterprise.address ?? "Not provided"} />
        <DetailField label="Map Location" value={enterprise.latitude !== null && enterprise.longitude !== null ? `${enterprise.latitude.toFixed(6)}, ${enterprise.longitude.toFixed(6)}` : "Not pinned"} />
        <DetailField label="Category" value={enterprise.category ?? "Not provided"} />
        <DetailField label="Contact Manager" value={enterprise.managerName ?? "Not provided"} />
        <DetailField label="Contact Email" value={enterprise.email} />
        <DetailField label="Contact Number" value={enterprise.phone ?? "Not provided"} />
        <DetailField label="Barangay" value={enterprise.barangay ?? "Not provided"} />
        <DetailField label="Enterprise ID" value={enterprise.enterpriseId ?? "Pending"} />
        <DetailField label="Account Status" value={enterprise.status} />
        <DetailField label="Must Change Password" value={enterprise.mustChangePassword ? "Yes" : "No"} />
        <DetailField label="Location Source" value={enterprise.locationSource ?? "Not provided"} />
      </div>
    </ModalFrame>
  );
}

