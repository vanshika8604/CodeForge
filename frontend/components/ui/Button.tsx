import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const VARIANTS: Record<string, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
  secondary: "bg-[#1a2232] hover:bg-[#232b3d] text-gray-100 border border-[#232b3d]",
  ghost: "bg-transparent hover:bg-[#161d2b] text-gray-300",
  danger: "bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-900",
};

export function Button({ variant = "primary", className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}