export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="w-full py-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-[22px] font-extrabold text-primary tracking-tight">TalentDash</span>
          <span className="text-[13px] text-on-surface-variant font-medium">
            © {new Date().getFullYear()} TalentDash. Career intelligence for technical leaders.
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-[13px] font-semibold text-on-surface-variant">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Data Integrity</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  );
}
