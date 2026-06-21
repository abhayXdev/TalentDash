interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB]">
      <p className="text-[13px] font-medium text-[#717171] mb-1">{label}</p>
      <p className="text-[32px] font-bold text-[#0369A1] leading-[1.1]">{value}</p>
      {sub && <p className="text-xs text-[#717171] mt-2">{sub}</p>}
    </div>
  );
}
