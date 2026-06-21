export default function CompaniesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white border border-[#EBEBEB] rounded-lg p-5">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-20 mb-4" />
            <div className="h-4 bg-blue-100 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
