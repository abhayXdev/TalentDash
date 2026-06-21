export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
      
      {/* Filter Bar Skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#EBEBEB] mb-6 flex flex-wrap gap-4">
        <div className="h-10 bg-gray-200 rounded w-full md:w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded w-full md:w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded w-full md:w-1/4"></div>
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] overflow-hidden">
        <div className="h-12 bg-gray-100 border-b border-gray-200 w-full"></div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-100 w-full flex items-center px-6">
            <div className="h-4 bg-gray-200 rounded w-1/6 mr-4"></div>
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
