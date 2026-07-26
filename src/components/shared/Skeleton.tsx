type SkeletonProps = {
  className?: string;
  count?: number;
};

export default function Skeleton({ className = "h-4 w-full", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-md bg-surface-muted ${className}`}
        />
      ))}
    </>
  );
}
