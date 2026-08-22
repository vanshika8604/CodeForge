export function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <span
        className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-600"} ${
          connected ? "animate-pulse" : ""
        }`}
      />
      {connected ? "Connected" : "Connecting..."}
    </span>
  );
}