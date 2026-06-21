import Link from 'next/link';

interface EmptyStateProps {
  message?: string;
  clearHref?: string;
}

export default function EmptyState({
  message = 'No records found for these filters.',
  clearHref = '/salaries',
}: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={8} className="py-16 text-center">
        <p className="text-sm text-[#717171]">{message}</p>
        <Link
          href={clearHref}
          className="mt-2 inline-block text-sm text-[#FF5A5F] font-medium hover:underline"
        >
          Clear all filters →
        </Link>
      </td>
    </tr>
  );
}
