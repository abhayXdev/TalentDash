export default function CompanyLogo({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  
  // Generate a consistent gradient based on the first letter
  const gradients: Record<string, string> = {
    'A': 'from-red-400 to-pink-500',
    'B': 'from-orange-400 to-red-500',
    'C': 'from-amber-400 to-orange-500',
    'D': 'from-emerald-400 to-green-500',
    'E': 'from-teal-400 to-emerald-500',
    'F': 'from-cyan-400 to-teal-500',
    'G': 'from-sky-400 to-cyan-500',
    'H': 'from-blue-400 to-sky-500',
    'I': 'from-indigo-400 to-blue-500',
    'J': 'from-violet-400 to-indigo-500',
    'K': 'from-purple-400 to-violet-500',
    'L': 'from-fuchsia-400 to-purple-500',
    'M': 'from-pink-400 to-rose-500',
    'N': 'from-rose-400 to-red-500',
    'O': 'from-slate-400 to-gray-500',
    'P': 'from-red-500 to-orange-500',
    'Q': 'from-orange-500 to-amber-500',
    'R': 'from-emerald-500 to-teal-500',
    'S': 'from-blue-500 to-indigo-500',
    'T': 'from-violet-500 to-purple-500',
    'U': 'from-pink-500 to-rose-500',
    'V': 'from-slate-500 to-gray-600',
    'W': 'from-red-600 to-pink-600',
    'X': 'from-indigo-600 to-blue-600',
    'Y': 'from-teal-600 to-emerald-600',
    'Z': 'from-orange-600 to-red-600',
  };

  const gradientClass = gradients[initial] || 'from-gray-400 to-gray-500';

  return (
    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-sm shadow-sm border border-white/20`}>
      {initial}
    </div>
  );
}
