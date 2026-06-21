interface BadgeProps {
  level: string;
}

export default function Badge({ level }: BadgeProps) {
  const colorMap: Record<string, string> = {
    L3: 'bg-slate-100 text-slate-800 ring-slate-600/20',
    SDE_I: 'bg-slate-100 text-slate-800 ring-slate-600/20',
    L4: 'bg-blue-100 text-blue-800 ring-blue-600/20',
    SDE_II: 'bg-blue-100 text-blue-800 ring-blue-600/20',
    L5: 'bg-indigo-100 text-indigo-800 ring-indigo-600/20',
    SDE_III: 'bg-indigo-100 text-indigo-800 ring-indigo-600/20',
    L6: 'bg-purple-100 text-purple-800 ring-purple-600/20',
    STAFF: 'bg-purple-100 text-purple-800 ring-purple-600/20',
    PRINCIPAL: 'bg-sky-950 text-white ring-sky-900/20',
    IC4: 'bg-gray-100 text-gray-800 ring-gray-600/20',
    IC5: 'bg-sky-950 text-white ring-sky-900/20',
  };

  const classes = colorMap[level] || 'bg-gray-50 text-gray-600 ring-gray-500/10';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {level.replace('_', '-')}
    </span>
  );
}
