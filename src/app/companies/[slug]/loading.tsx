export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB] mb-8 flex justify-between items-center">
        <div>
          <div className="h-10 bg-gray-200 rounded w-64 mb-3"></div>
          <div className="flex gap-3">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB]">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB]">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-40 mt-2"></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB]">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="flex gap-2">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] overflow-hidden">
        <div className="h-12 bg-gray-100 border-b border-gray-200 w-full"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-100 w-full flex items-center px-6">
            <div className="h-4 bg-gray-200 rounded w-1/6 mr-4"></div>
            <div className="h-6 bg-gray-200 rounded-full w-12 mr-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6 mr-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-1/5"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
