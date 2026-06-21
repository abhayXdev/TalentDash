import Link from 'next/link';

export default function CompanyNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-[#222222]">Company Not Found</h1>
      <p className="mt-4 text-[#717171]">We couldn't find salary data for this company.</p>
      <Link
        href="/salaries"
        className="mt-6 inline-block text-[#FF5A5F] font-semibold hover:underline"
      >
        ← Back to Salaries
      </Link>
    </div>
  );
}
