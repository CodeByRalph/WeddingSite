'use client'

export default function RegistryItemSkeleton() {
  return (
    <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
      </div>
    </div>
  );
} 