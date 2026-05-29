import { type FormEvent, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FormField, ModalFrame, SearchableDropdownField, type DropdownOption } from "@/shared/components/ui";
import { enterpriseCategories, sanPedroBarangays } from "@/shared/data/enterpriseOptions";
import { type CreateEnterpriseAccountPayload, createEnterpriseAccount, geocodeEnterpriseAddress } from "@/shared/services/accountManagement";
import type { LocationDraft } from "../types";
import { getLocationSummary } from "../utils";
import { LocationPicker } from "./LocationPicker";

type RegisterEnterpriseModalProps = {
  onClose: () => void;
};

export function RegisterEnterpriseModal({ onClose }: RegisterEnterpriseModalProps) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [location, setLocation] = useState<LocationDraft | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const createMutation = useMutation({
    mutationFn: createEnterpriseAccount,
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["enterprise-accounts"] }), queryClient.invalidateQueries({ queryKey: ["dev-deliveries"] })]);
      toast.success("Enterprise account created");
      onClose();
    },
    onError: () => toast.error("Unable to create enterprise account"),
  });
  const geocodeMutation = useMutation({
    mutationFn: geocodeEnterpriseAddress,
    onSuccess: (result) => {
      setLocation({
        latitude: result.latitude,
        longitude: result.longitude,
        source: "geocoded",
        confidence: result.confidence,
        displayAddress: result.displayAddress,
        provider: result.provider,
      });
      toast.success("Location marker placed");
    },
    onError: () => toast.error("Unable to locate this address. Place the marker manually on the map."),
  });

  const handleLocateAddress = () => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const barangay = String(formData.get("barangay") ?? "");
    const address = String(formData.get("address") ?? "").trim();

    if (!barangay || !address) {
      toast.error("Enter the address and choose a barangay before locating.");
      return;
    }

    geocodeMutation.mutate({
      enterpriseName: String(formData.get("enterpriseName") ?? "").trim() || undefined,
      barangay,
      address,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = String(formData.get("category") ?? "");
    const barangay = String(formData.get("barangay") ?? "");

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
      ...(location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            locationSource: location.source,
            locationConfidence: location.confidence ?? undefined,
            geocodedAddress: location.displayAddress,
          }
        : {}),
    };
    createMutation.mutate(payload);
  };

  return (
    <ModalFrame title="Register Enterprise" onClose={onClose} maxWidthClassName="max-w-5xl">
      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField name="enterpriseName" label="Enterprise Name" required />
        <SearchableDropdownField
          name="category"
          label="Enterprise Type / Category"
          options={enterpriseCategories.map((category): DropdownOption => [category.value, category.label])}
          value={selectedCategory}
          onChange={setSelectedCategory}
          required
        />
        <FormField name="managerName" label="Contact Person / Manager" required />
        <FormField name="email" label="Contact Email" type="email" required />
        <FormField name="contactNumber" label="Contact Number" />
        <FormField name="enterpriseId" label="Enterprise ID Seed" placeholder="Leave blank to use enterprise name" />
        <FormField name="address" label="Block / Lot / Street" required />
        <SearchableDropdownField
          name="barangay"
          label="Barangay"
          options={sanPedroBarangays.map((item): DropdownOption => [item, item])}
          value={selectedBarangay}
          onChange={setSelectedBarangay}
          required
        />
        <div className="md:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-wide text-gray-500 uppercase">Map Location</p>
              <p className="text-xs text-gray-500">{location ? getLocationSummary(location) : "No marker confirmed yet. Locate the address or click the map."}</p>
            </div>
            <button
              type="button"
              onClick={handleLocateAddress}
              disabled={geocodeMutation.isPending}
              className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-70"
            >
              <LocateFixed size={15} />
              {geocodeMutation.isPending ? "Locating..." : "Locate Address"}
            </button>
          </div>
          <LocationPicker location={location} onChange={setLocation} />
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 md:col-span-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">i</span>
          <p className="text-xs leading-relaxed text-blue-700">
            Once this enterprise is saved, the system will automatically generate login credentials and record the development email/SMS message in Dev Log. The enterprise user will be required to
            change their password upon first login. The saved address will include San Pedro, Laguna 4023 automatically. The marker location will be used in Map View.
          </p>
        </div>
        <button disabled={createMutation.isPending} className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg p-3 text-sm font-bold text-white transition disabled:opacity-70 md:col-span-2">
          {createMutation.isPending ? "Saving..." : "Save Enterprise"}
        </button>
      </form>
    </ModalFrame>
  );
}

