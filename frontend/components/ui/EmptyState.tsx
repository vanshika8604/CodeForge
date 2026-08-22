interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
      {icon && <div className="text-gray-600 mb-1">{icon}</div>}
      <p className="text-sm font-medium text-gray-400">{title}</p>
      {description && <p className="text-xs text-gray-600 max-w-xs">{description}</p>}
    </div>
  );
}