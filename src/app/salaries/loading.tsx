export default function SalariesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-1/4 mb-6" />

      <div className="bg-white p-4 rounded-lg border border-[#EBEBEB] mb-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-7 w-16 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-[#EBEBEB] rounded-lg">
        <div className="h-11 bg-[#F7F7F7] border-b border-[#EBEBEB]" />
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-[#EBEBEB] bg-white"
          >
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="h-6 bg-gray-100 rounded w-14" />
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-8 ml-auto" />
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-6 bg-blue-100 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
