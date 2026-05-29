import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FormField, ModalFrame, SearchableDropdownField } from "@/shared/components/ui";
import { type CreateLguAccountPayload, createLguAccount } from "@/shared/services/accountManagement";

type CreateLguAccountModalProps = {
  onClose: () => void;
};

export function CreateLguAccountModal({ onClose }: CreateLguAccountModalProps) {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<CreateLguAccountPayload["role"]>("staff");
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
      role: selectedRole,
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
        <div className="md:col-span-2">
          <SearchableDropdownField
            name="role"
            label="Role"
            options={[
              ["staff", "LGU Staff"],
              ["it", "IT Personnel"],
              ["admin", "Admin"],
            ]}
            value={selectedRole}
            onChange={(value) => setSelectedRole(value as CreateLguAccountPayload["role"])}
            required
          />
        </div>
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

