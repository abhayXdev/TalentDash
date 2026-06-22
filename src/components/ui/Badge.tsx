interface BadgeProps {
  level: string;
}

export default function Badge({ level }: BadgeProps) {
  const colorMap: Record<string, string> = {
    // Slate — entry level
    L3:        'bg-slate-100 text-slate-700',
    SDE_I:     'bg-slate-100 text-slate-700',
    IC4:       'bg-slate-100 text-slate-700',
    // Blue — mid level
    L4:        'bg-blue-100 text-blue-700',
    SDE_II:    'bg-blue-100 text-blue-700',
    // Indigo — senior
    L5:        'bg-indigo-100 text-indigo-700',
    SDE_III:   'bg-indigo-100 text-indigo-700',
    // Purple — staff
    L6:        'bg-purple-100 text-purple-700',
    STAFF:     'bg-purple-100 text-purple-700',
    // Navy — principal and above
    PRINCIPAL: 'bg-[#1e3a5f] text-white',
    IC5:       'bg-[#1e3a5f] text-white',
  };

  const classes = colorMap[level] || 'bg-slate-100 text-slate-600';

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] uppercase tracking-wide font-bold ${classes}`}
    >
      {level.replace('_', '-')}
    </span>
  );
}
