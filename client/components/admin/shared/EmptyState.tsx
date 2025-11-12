'use client';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <p className="text-gray-500 text-lg mb-2">{title}</p>
      {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}