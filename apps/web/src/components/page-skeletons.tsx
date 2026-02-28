import { Skeleton } from "@/components/ui/skeleton";

/**
 * 리스트 형태의 화면을 위한 스켈레톤 (코스 목록, 리더보드 등)
 */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-[3px] border-muted bg-white p-4 flex flex-col gap-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * 상세 페이지를 위한 스켈레톤 (코스 상세, 퀘스트 메인 등)
 */
export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex flex-col gap-2 pt-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-[240px] w-full border-[3px] border-muted" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full border-[3px] border-muted" />
        <Skeleton className="h-20 w-full border-[3px] border-muted" />
      </div>
      <div className="mt-auto flex h-12 gap-3">
        <Skeleton className="flex-1 h-full" />
        <Skeleton className="flex-1 h-full" />
      </div>
    </div>
  );
}

/**
 * 단순 배너/헤더 스켈레톤
 */
export function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-20 w-full border-[3px] border-muted" />
    </div>
  );
}
