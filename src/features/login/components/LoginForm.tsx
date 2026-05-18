import type { FormEvent } from "react";
import { motion } from "motion/react";

type LoginFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  return (
    <form autoComplete="off" onSubmit={onSubmit}>
      <div className="mb-6">
        <label htmlFor="client-id" className="mb-1 block text-[10px] font-bold tracking-widest text-[#9ca3af] uppercase">
          Client Identification
        </label>
        <input
          id="client-id"
          name="clientId"
          type="text"
          placeholder="username"
          className="w-full rounded-2xl border border-[#f3f4f6] bg-[#f9fafb] px-5 py-4 text-sm font-semibold text-charcoal-800 transition-shadow outline-none focus:shadow-[0_0_0_2px_#055b25]"
        />
        <p className="mt-2 text-[10px] font-semibold text-[#9ca3af]">Try admin_001, staff_001, or it_001</p>
      </div>

      <div className="mb-6">
        <label htmlFor="encryption-key" className="mb-1 block text-[10px] font-bold tracking-widest text-[#9ca3af] uppercase">
          Encryption Key
        </label>
        <input
          id="encryption-key"
          name="encryptionKey"
          type="password"
          placeholder="**********"
          className="w-full rounded-2xl border border-[#f3f4f6] bg-[#f9fafb] px-5 py-4 text-sm font-semibold text-charcoal-800 transition-shadow outline-none focus:shadow-[0_0_0_2px_#055b25]"
        />
      </div>

      <motion.button
        type="submit"
        className="w-full rounded-2xl bg-tanaw-green p-5 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition hover:-translate-y-px hover:bg-[#044a1e]"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
      >
        Initialize Portal
      </motion.button>
    </form>
  );
}
