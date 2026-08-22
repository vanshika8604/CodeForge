interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

const TONES: Record<string, string> = {
  neutral: "bg-[#1a2232] text-gray-300 border-[#232b3d]",
  success: "bg-green-900/30 text-green-400 border-green-900/60",
  warning: "bg-yellow-900/30 text-yellow-400 border-yellow-900/60",
  danger: "bg-red-900/30 text-red-400 border-red-900/60",
  info: "bg-blue-900/30 text-blue-400 border-blue-900/60",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs rounded-full border px-2.5 py-0.5 ${TONES[tone]}`}>
      {children}
    </span>
  );
}