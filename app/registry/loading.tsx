import RegistryItemSkeleton from '@/components/RegistryItemSkeleton'

export default function Loading() {
  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-sky-50 via-white to-sky-50 p-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <RegistryItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
} 