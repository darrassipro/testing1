'use client';

interface StatusBadgeProps {
  active?: boolean;
  premium?: boolean;
  verified?: boolean;
  count?: number;
  countLabel?: string;
}

export function StatusBadge({ active, premium, verified, count, countLabel }: StatusBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {active && (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          Actif
        </span>
      )}
      {premium && (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          Premium
        </span>
      )}
      {verified && (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          Vérifié
        </span>
      )}
      {count !== undefined && (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          {count} {countLabel || 'items'}
        </span>
      )}
    </div>
  );
}