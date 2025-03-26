import { Skeleton } from "@/components/ui/skeleton";

export default function NoteDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Title Skeleton */}
      <Skeleton className="h-10 w-3/4" />

      {/* URL Skeleton */}
      <Skeleton className="h-6 w-1/2" />

      {/* Tabs Skeleton */}
      <div className="space-y-2">
        <div className="flex border-b">
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24" />
        </div>
        {/* Content Area Skeleton */}
        <Skeleton className="h-64 w-full rounded-md" /> 
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex justify-end space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
