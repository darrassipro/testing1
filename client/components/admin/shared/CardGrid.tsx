'use client';

interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function CardGrid({ children, columns = 3 }: CardGridProps) {
  const colsClass = {
    2: 'md:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${colsClass[columns]} gap-6`}>
      {children}
    </div>
  );
}