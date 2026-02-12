import { Card } from '../ui/card';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'stats' | 'chart' | 'list';
  rows?: number;
}

export default function LoadingSkeleton({ type = 'card', rows = 3 }: LoadingSkeletonProps) {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse bg-neutral-900 border-neutral-800">
            <div className="flex items-start justify-between mb-4">
              <div className="h-4 w-24 bg-neutral-800 rounded"></div>
              <div className="h-8 w-8 bg-neutral-800 rounded"></div>
            </div>
            <div className="h-8 w-32 bg-neutral-800 rounded mb-2"></div>
            <div className="h-3 w-20 bg-neutral-800 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <Card className="p-6 bg-neutral-900 border-neutral-800">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-neutral-800 rounded animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-12 flex-1 bg-neutral-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (type === 'chart') {
    return (
      <Card className="p-6 bg-neutral-900 border-neutral-800">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-neutral-800 rounded animate-pulse"></div>
          <div className="h-64 bg-neutral-800 rounded animate-pulse flex items-end justify-around p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="bg-neutral-700 rounded-t w-12 animate-pulse"
                style={{ height: `${Math.random() * 100 + 50}px` }}
              ></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse bg-neutral-900 border-neutral-800">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-neutral-800 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-neutral-800 rounded"></div>
                <div className="h-3 w-1/2 bg-neutral-700 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <Card className="p-6 animate-pulse bg-neutral-900 border-neutral-800">
      <div className="space-y-4">
        <div className="h-6 w-48 bg-neutral-800 rounded"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-neutral-800 rounded"></div>
          <div className="h-4 w-5/6 bg-neutral-700 rounded"></div>
          <div className="h-4 w-4/6 bg-neutral-700 rounded"></div>
        </div>
      </div>
    </Card>
  );
}
