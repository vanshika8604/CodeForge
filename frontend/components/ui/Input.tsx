import { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`bg-[#0d1119] border border-[#232b3d] rounded-lg px-3 py-2 text-sm text-gray-100
        placeholder:text-gray-600
        focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60
        transition-colors duration-150 ${props.className || ""}`}
    />
  );
}