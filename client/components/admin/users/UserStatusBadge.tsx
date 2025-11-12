'use client';

interface UserStatusBadgeProps {
  status: 'active' | 'suspended';
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = {
    active: {
      bg: 'bg-[#DFFFED]',
      text: 'text-[#027A48]',
      label: 'Active'
    },
    suspended: {
      bg: 'bg-[#FFE5E5]',
      text: 'text-[#EF4444]',
      label: 'Suspended'
    }
  };

  const { bg, text, label } = config[status];

  return (
    <div className={`inline-flex items-center justify-center px-[11.67px] py-[4.67px] gap-[11.67px] h-[28px] ${bg} rounded-full`}>
      <span className={`font-inter font-medium text-[14.0006px] leading-[19.83px] ${text}`}>
        {label}
      </span>
    </div>
  );
}
