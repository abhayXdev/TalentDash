export const metadata = {
  title: 'Compare Tech Salaries | TalentDash',
  description: 'Side-by-side comparison of software engineer salaries across top tech companies in India.',
  alternates: { canonical: 'https://talentdash.com/compare' },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
