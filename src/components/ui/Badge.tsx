interface BadgeProps {
  level: string;
}

export default function Badge({ level }: BadgeProps) {
  const colorMap: Record<string, string> = {
    L3: 'bg-[#E0F2FE] text-[#0369A1]', // Sky
    SDE_I: 'bg-[#E0F2FE] text-[#0369A1]',
    L4: 'bg-[#DCFCE7] text-[#15803D]', // Green
    SDE_II: 'bg-[#DCFCE7] text-[#15803D]',
    L5: 'bg-[#FEF3C7] text-[#B45309]', // Yellow
    SDE_III: 'bg-[#FEF3C7] text-[#B45309]',
    L6: 'bg-[#FEE2E2] text-[#B91C1C]', // Red
    STAFF: 'bg-[#FEE2E2] text-[#B91C1C]',
    PRINCIPAL: 'bg-[#F3E8FF] text-[#7E22CE]', // Purple
    IC4: 'bg-[#F1F5F9] text-[#334155]', // Slate
    IC5: 'bg-[#F3E8FF] text-[#7E22CE]',
  };

  const classes = colorMap[level] || 'bg-gray-50 text-gray-600';

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] uppercase tracking-wide font-bold ${classes}`}
    >
      {level.replace('_', '-')}
    </span>
  );
}
