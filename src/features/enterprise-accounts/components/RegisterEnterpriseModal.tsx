import { type FormEvent, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContactNumberField, FormField, ModalFrame, SearchableDropdownField, type DropdownOption } from "@/shared/components/ui";
import { enterpriseCategories, sanPedroBarangays } from "@/shared/data/enterpriseOptions";
import { type CreateEnterpriseAccountPayload, createEnterpriseAccount, geocodeEnterpriseAddress } from "@/shared/services/accountManagement";
import { getApiErrorMessage } from "@/shared/utils/apiErrors";
import { normalizeEmail, normalizePersonName, normalizePhilippineContactNumber, validateEmail, validatePersonName, validatePhilippineContactNumber } from "@/shared/utils/accountValidation";
import type { LocationDraft } from "../types";
import { getLocationSummary } from "../utils";
import { LocationPicker } from "./LocationPicker";

type RegisterEnterpriseModalProps = {
  onClose: () => void;
};

type EnterpriseFormState = {
  enterpriseName: string;
  category: string;
  managerName: string;
  email: string;
  contactLocal: string;
  enterpriseId: string;
  address: string;
  barangay: string;
};

type EnterpriseFormErrors = Partial<Record<keyof EnterpriseFormState, string>>;

const enterpriseCategoryValues = new Set<string>(enterpriseCategories.map((category) => category.value));
const sanPedroBarangayValues = new Set<string>(sanPedroBarangays);

export function RegisterEnterpriseModal({ onClose }: RegisterEnterpriseModalProps) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [location, setLocation] = useState<LocationDraft | null>(null);
  const [form, setForm] = useState<EnterpriseFormState>({
    enterpriseName: "",
    category: "",
    managerName: "",
    email: "",
    contactLocal: "",
    enterpriseId: "",
    address: "",
    barangay: "",
  });
  const [errors, setErrors] = useState<EnterpriseFormErrors>({});
  const createMutation = useMutation({
    mutationFn: createEnterpriseAccount,
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["enterprise-accounts"] }), queryClient.invalidateQueries({ queryKey: ["dev-deliveries"] })]);
      toast.success("Enterprise account created");
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to create enterprise account")),
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

    const barangay = form.barangay;
    const address = form.address.trim();

    if (!barangay || !address) {
      toast.error("Enter the address and choose a barangay before locating.");
      return;
    }

    geocodeMutation.mutate({
      enterpriseName: form.enterpriseName.trim() || undefined,
      barangay,
      address,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateEnterpriseForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const normalizedPhone = form.contactLocal ? normalizePhilippineContactNumber(`+63${form.contactLocal}`) : "";
    const payload: CreateEnterpriseAccountPayload = {
      enterpriseName: form.enterpriseName.trim(),
      category: form.category,
      managerName: normalizePersonName(form.managerName),
      email: normalizeEmail(form.email),
      contactNumber: normalizedPhone || undefined,
      barangay: form.barangay,
      address: form.address.trim(),
      enterpriseId: form.enterpriseId.trim() || undefined,
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
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField name="enterpriseName" label="Enterprise Name" value={form.enterpriseName} onChange={(value) => updateField("enterpriseName", value)} error={errors.enterpriseName} required />
        <SearchableDropdownField
          name="category"
          label="Enterprise Type / Category"
          options={enterpriseCategories.map((category): DropdownOption => [category.value, category.label])}
          value={form.category}
          onChange={(value) => updateField("category", value)}
          error={errors.category}
          required
        />
        <FormField name="managerName" label="Contact Person / Manager" value={form.managerName} onChange={(value) => updateField("managerName", value)} error={errors.managerName} required autoComplete="name" />
        <FormField name="email" label="Contact Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} error={errors.email} required autoComplete="email" />
        <ContactNumberField name="contactNumber" label="Contact Number" value={form.contactLocal} onChange={(value) => updateField("contactLocal", value)} error={errors.contactLocal} />
        <FormField name="enterpriseId" label="Enterprise ID Seed" placeholder="Leave blank to use enterprise name" value={form.enterpriseId} onChange={(value) => updateField("enterpriseId", value)} />
        <FormField name="address" label="Block / Lot / Street" value={form.address} onChange={(value) => updateField("address", value)} error={errors.address} required />
        <SearchableDropdownField
          name="barangay"
          label="Barangay"
          options={sanPedroBarangays.map((item): DropdownOption => [item, item])}
          value={form.barangay}
          onChange={(value) => updateField("barangay", value)}
          error={errors.barangay}
          required
        />
        <div className="md:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">Map Location</p>
              <p className="text-sm text-slate-500">{location ? getLocationSummary(location) : "No marker confirmed yet. Locate the address or click the map."}</p>
            </div>
            <button
              type="button"
              onClick={handleLocateAddress}
              disabled={geocodeMutation.isPending}
              className="bg-tanaw-green hover:bg-[#044a1e] inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-70"
            >
              <LocateFixed size={15} />
              {geocodeMutation.isPending ? "Locating..." : "Locate Address"}
            </button>
          </div>
          <LocationPicker location={location} onChange={setLocation} />
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 ring-1 ring-white md:col-span-2">
          <span className="bg-tanaw-green mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white shadow-sm">i</span>
          <p className="text-sm leading-relaxed text-emerald-800">
            Once this enterprise is saved, the system will automatically generate login credentials and record the development email/SMS message in Dev Log. The enterprise user will be required to
            change their password upon first login. The saved address will include San Pedro, Laguna 4023 automatically. The marker location will be used in Map View.
          </p>
        </div>
        <button
          disabled={createMutation.isPending}
          className="bg-tanaw-green hover:bg-[#044a1e] rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(5,91,37,0.22)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70 md:col-span-2"
        >
          {createMutation.isPending ? "Saving..." : "Save Enterprise"}
        </button>
      </form>
    </ModalFrame>
  );

  function updateField<FieldName extends keyof EnterpriseFormState>(field: FieldName, value: EnterpriseFormState[FieldName]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }
}

function validateEnterpriseForm(form: EnterpriseFormState) {
  const errors: EnterpriseFormErrors = {};
  const enterpriseName = form.enterpriseName.trim();
  const emailError = validateEmail(form.email);
  const managerNameError = validatePersonName(form.managerName, "Contact person");
  const phoneError = validatePhilippineContactNumber(form.contactLocal ? `+63${form.contactLocal}` : "", false);

  if (!enterpriseName) errors.enterpriseName = "Enterprise name is required.";
  if (enterpriseName && enterpriseName.length < 2) errors.enterpriseName = "Enterprise name must be at least 2 characters.";
  if (!enterpriseCategoryValues.has(form.category)) errors.category = "Choose a valid enterprise type.";
  if (managerNameError) errors.managerName = managerNameError;
  if (emailError) errors.email = emailError;
  if (phoneError) errors.contactLocal = phoneError;
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!sanPedroBarangayValues.has(form.barangay)) errors.barangay = "Choose a valid barangay.";

  return errors;
}

