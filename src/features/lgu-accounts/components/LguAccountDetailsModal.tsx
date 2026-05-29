import { DetailField, ModalFrame } from "@/shared/components/ui";
import type { AccountSummary } from "@/shared/services/accountManagement";
import { lguRoleLabel } from "../utils";

type LguAccountDetailsModalProps = {
  account: AccountSummary;
  onClose: () => void;
};

export function LguAccountDetailsModal({ account, onClose }: LguAccountDetailsModalProps) {
  return (
    <ModalFrame title="LGU Account Details" onClose={onClose}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailField label="Name" value={account.displayName} />
        <DetailField label="Email" value={account.email} />
        <DetailField label="Role" value={lguRoleLabel[account.role] ?? account.role} />
        <DetailField label="Phone" value={account.phone ?? "Not provided"} />
        <DetailField label="Status" value={account.status} />
        <DetailField label="Must Change Password" value={account.mustChangePassword ? "Yes" : "No"} />
      </div>
    </ModalFrame>
  );
}

