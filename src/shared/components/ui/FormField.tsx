type FormFieldProps = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

export function FormField({ name, label, type = "text", required = false, placeholder }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-1"
      />
    </label>
  );
}
